# ZemPlus — первоначальная установка на VPS

Эти шаги выполняются ОДИН РАЗ при первом деплое. Дальше для обновлений
используйте `./deploy/deploy.sh`.

Предполагается Ubuntu 22.04+ / Debian 12+, пользователь с sudo, проект
будет жить в `/var/www/zemplus`.

---

## 1. Зависимости системы (≈ 3 мин)

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git rsync
sudo npm install -g pm2

# Если RAM < 2 ГБ — добавьте swap, иначе билд упадёт по OOM
free -h
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Проверка:
```bash
node -v        # v22.x.x
nginx -v
pm2 -v
```

---

## 2. Клонировать проект

```bash
sudo mkdir -p /var/www && sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/abrottsel/Salehouse.git zemplus
cd zemplus
mkdir -p logs
```

Если репо приватный — используйте deploy key (рекомендуется) или PAT.

---

## 3. Залить фотографии посёлков

`public/villages/` (~470 МБ) исключены из git. Заливаем их с локальной
машины через `rsync`. Запускать с локального компа, **не из SSH**.

```bash
# на локальной машине
cd "/Users/abrottsel/Проект сайта"
rsync -avz --progress \
  public/villages/ \
  user@SERVER_IP:/var/www/zemplus/public/villages/
```

Замените `user@SERVER_IP` на свои данные. Первая заливка займёт
несколько минут в зависимости от скорости канала.

---

## 4. Установить зависимости и собрать

```bash
cd /var/www/zemplus
npm ci --omit=dev --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

Билд занимает 1–3 минуты, ест ~1.2 ГБ RAM пиково.

---

## 5. Запустить через PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# pm2 напечатает команду вида `sudo env PATH=... pm2 startup ...`
# скопируйте и выполните её, чтобы PM2 поднимался при перезагрузке сервера
```

Проверка:
```bash
pm2 status
curl -I http://localhost:3001    # должно быть HTTP/1.1 200 OK
pm2 logs zemplus --lines 50
```

---

## 6. Настроить Nginx

```bash
sudo cp /var/www/zemplus/deploy/nginx.zemplus.conf /etc/nginx/sites-available/zemplus
sudo ln -s /etc/nginx/sites-available/zemplus /etc/nginx/sites-enabled/

# Если на сервере крутится другой сайт и нужен default — НЕ удаляйте default!
# Если ZemPlus — единственный сайт, можно удалить дефолт:
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Открыть файрвол

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx HTTP'
sudo ufw enable
```

---

## 8. Проверить

Откройте в браузере:
```
http://SERVER_IP
```

Должна загрузиться главная ЗемПлюс. Если нет:
```bash
pm2 logs zemplus --lines 100         # ошибки приложения
sudo tail -f /var/log/nginx/error.log # ошибки nginx
```

---

## Обновления (после первого деплоя)

```bash
ssh user@SERVER_IP
cd /var/www/zemplus
./deploy/deploy.sh
```

Скрипт сделает `git pull → npm ci → npm run build → pm2 reload`.

Если фотографии менялись — отдельно на локальной машине:
```bash
rsync -avz --delete public/villages/ user@SERVER_IP:/var/www/zemplus/public/villages/
```

---

## Когда подключим домен

```bash
sudo apt install -y certbot python3-certbot-nginx
# В nginx-конфиге заменить `server_name _;` на свой домен
sudo nano /etc/nginx/sites-available/zemplus
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN
```

Certbot сам выпустит SSL и перепишет конфиг. Auto-renew настраивается
через systemd timer автоматически.

---

## Полезные команды

```bash
pm2 status                   # что крутится
pm2 logs zemplus             # хвост логов
pm2 restart zemplus          # рестарт
pm2 monit                    # tui-мониторинг
sudo nginx -t                # проверка конфига
sudo systemctl reload nginx  # применить новый конфиг
df -h /                      # сколько диска
free -h                      # сколько RAM
htop                         # процессы
```
