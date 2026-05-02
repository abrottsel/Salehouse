'use strict';

/*
 * ZemPlus MAX bot — переписан 2026-04-28 после spam-инцидента.
 *
 * Why these fixes (по пунктам):
 *
 * 1. Динамическое определение BOT_USER_ID через GET /me на старте.
 *    Старый код хардкодил 262876217, реальный id бота — 276091335. Из-за этого
 *    проверка `userId === BOT_USER_ID` никогда не срабатывала, бот реагировал
 *    на собственные исходящие сообщения, эхо-петля росла каждый цикл, каждое
 *    "новое" сообщение форвардилось в TG-чат админа → сотни уведомлений в минуту.
 *    Теперь bootstrap-вызов /me; если он падает — exit(1), без узнанного id
 *    стартовать нельзя.
 *
 * 2. Persist marker на диск (bot/.max-marker).
 *    Без этого после рестарта бот переигрывает всю очередь обновлений MAX
 *    (включая собственные эхо-сообщения) и петля воскресает. Записываем
 *    атомарно через tmp+rename, читаем при старте.
 *
 * 3. Handler на /start и /menu как отдельный кейс.
 *    Раньше команда падала в catch-all и форвардилась админу — теперь
 *    показывает главное меню как обычный 'menu' callback.
 *
 * 4. УБРАН catch-all forward в TG для нераспознанного текста.
 *    Это был основной источник спама: любая строка вне известных режимов
 *    шла админу. Теперь нераспознанный текст → ответ "не понял, выберите
 *    из меню" + клавиатура. Форвард в TG остаётся только для booking-flow
 *    (контактные данные) и режима write_question.
 *
 * 5. Дополнительная echo-loop защита: msg.sender?.is_bot.
 *    Пояс + подтяжки. Если MAX в payload передаёт is_bot: true — игнорим
 *    сразу, даже если по какой-то причине user_id совпадение не отработало.
 *
 * 6. Rate limiter per-user (Map<userId, timestamps[]>).
 *    Если от одного пользователя >5 событий за 10 секунд — игнорим
 *    остальное окно. Safety net: если что-то ещё пойдёт не так и петля
 *    каким-то путём начнётся — она не сможет разрастись.
 */

const fs = require('fs');
const path = require('path');

const MAX_TOKEN = process.env.MAX_BOT_TOKEN;
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TG_CHAT_ID;

const MAX_API = 'https://platform-api.max.ru';
const SITE_URL = process.env.SITE_URL || 'https://zem.plus';

const MARKER_PATH = path.join(__dirname, '.max-marker');

if (!MAX_TOKEN) { console.error('MAX_BOT_TOKEN is not set'); process.exit(1); }
if (!TG_BOT_TOKEN || !ADMIN_CHAT_ID) { console.error('TG_BOT_TOKEN / TG_CHAT_ID not set'); process.exit(1); }

// Bot user id — определяется при старте через /me, до этого null.
let botUserId = null;

// ---- Village data ----
const villages = [
  { name: 'Фаворит', direction: 'Каширское шоссе', distance: 30, priceFrom: 490000, areaFrom: 6, areaTo: 20 },
  { name: 'Лесной Остров', direction: 'Каширское шоссе', distance: 36, priceFrom: 625000, areaFrom: 6, areaTo: 15 },
  { name: 'Новое Сонино', direction: 'Каширское шоссе', distance: 37, priceFrom: 355000, areaFrom: 6, areaTo: 25 },
  { name: 'Дачная Практика-2', direction: 'Каширское шоссе', distance: 42, priceFrom: 180000, areaFrom: 6, areaTo: 30 },
  { name: 'Регата', direction: 'Симферопольское шоссе', distance: 45, priceFrom: 190000, areaFrom: 6, areaTo: 20 },
  { name: 'Есенино', direction: 'Симферопольское шоссе', distance: 50, priceFrom: 220000, areaFrom: 8, areaTo: 25 },
  { name: 'Каретный Ряд', direction: 'Дмитровское шоссе', distance: 42, priceFrom: 350000, areaFrom: 6, areaTo: 15 },
  { name: 'Триумфальный', direction: 'Дмитровское шоссе', distance: 48, priceFrom: 250000, areaFrom: 8, areaTo: 20 },
];

// ---- Session store ----
const sessions = new Map();

function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {});
  }
  return sessions.get(userId);
}

function clearSession(userId) {
  sessions.set(userId, {});
}

// ---- Rate limiter (fix #6) ----
const rateBuckets = new Map(); // userId -> number[] (timestamps ms)
const RATE_WINDOW_MS = 10_000;
const RATE_MAX = 5;

function rateLimited(userId) {
  const now = Date.now();
  const arr = rateBuckets.get(userId) || [];
  // drop old
  const fresh = arr.filter(t => now - t < RATE_WINDOW_MS);
  fresh.push(now);
  rateBuckets.set(userId, fresh);
  if (fresh.length > RATE_MAX) {
    console.warn(`[rate-limit] user ${userId}: ${fresh.length} events in ${RATE_WINDOW_MS}ms — dropping`);
    return true;
  }
  return false;
}

// ---- Marker persistence (fix #2) ----
function loadMarker() {
  try {
    if (fs.existsSync(MARKER_PATH)) {
      const raw = fs.readFileSync(MARKER_PATH, 'utf8').trim();
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n)) {
          console.log(`[marker] loaded from disk: ${n}`);
          return n;
        }
      }
    }
  } catch (e) {
    console.error('[marker] load error:', e.message);
  }
  return null;
}

function saveMarker(value) {
  if (value == null) return;
  try {
    const tmp = MARKER_PATH + '.tmp';
    fs.writeFileSync(tmp, String(value));
    fs.renameSync(tmp, MARKER_PATH);
  } catch (e) {
    console.error('[marker] save error:', e.message);
  }
}

// ---- MAX API ----
async function maxGet(p) {
  const res = await fetch(`${MAX_API}${p}`, {
    headers: { Authorization: MAX_TOKEN },
  });
  if (!res.ok) throw new Error(`MAX GET ${p}: HTTP ${res.status}`);
  return res.json();
}

async function maxPost(p, body) {
  const res = await fetch(`${MAX_API}${p}`, {
    method: 'POST',
    headers: { Authorization: MAX_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`MAX POST ${p}: HTTP ${res.status}`);
  return res.json();
}

// Why: MAX API требует buttons обёрнуты в `payload`, и каждая callback-кнопка
// имеет {type:'callback', text, payload:'data'} вместо {text, callback_data:'data'}.
// Преобразуем «удобный» внутренний формат в API-формат на лету.
function normalizeKeyboard(kb) {
  if (!kb || kb.type !== 'inline_keyboard') return kb;
  // Уже в новом формате (есть payload-обёртка) — не трогаем
  if (kb.payload && Array.isArray(kb.payload.buttons)) return kb;
  // Старый формат с buttons на верхнем уровне — нормализуем
  const buttons = (kb.buttons || []).map(row =>
    row.map(btn => {
      if (btn.url) {
        return { type: 'link', text: btn.text, url: btn.url };
      }
      // По умолчанию callback
      return {
        type: 'callback',
        text: btn.text,
        payload: btn.callback_data || btn.payload || '',
      };
    }),
  );
  return { type: 'inline_keyboard', payload: { buttons } };
}

function sendToMax(userId, text, keyboard = null) {
  // Why: MAX API ждёт user_id в query string, не в body recipient.
  // Старый формат `recipient: {user_id}` возвращал HTTP 400 / "Unknown recipient".
  // См. https://dev.max.ru/docs-api/methods/POST/messages
  const payload = { text, notify: true };
  if (keyboard) {
    payload.attachments = [normalizeKeyboard(keyboard)];
  }
  return maxPost(`/messages?user_id=${encodeURIComponent(userId)}`, payload);
}

// ---- Inline keyboard builder (MAX format) ----
function mainMenuKeyboard() {
  return {
    type: 'inline_keyboard',
    buttons: [
      [
        { text: '🏠 Подобрать участок', callback_data: 'select_plot' },
        { text: '💰 Цены и рассрочка', callback_data: 'prices' },
      ],
      [
        { text: '📍 Посёлки и направления', callback_data: 'villages' },
        { text: '🏢 Ипотека от 6.5%', callback_data: 'mortgage' },
      ],
      [
        { text: '📋 Как купить участок', callback_data: 'how_to_buy' },
        { text: '❓ Частые вопросы', callback_data: 'faq' },
      ],
      [
        { text: '✏️ Написать вопрос', callback_data: 'write_question' },
      ],
    ],
  };
}

// ---- Helpers ----
function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function timestamp() {
  return new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
}

function senderLabel(sender) {
  const name = sender?.name || 'Неизвестный';
  const un = sender?.username ? ` (@${sender.username})` : '';
  return `${name}${un}`;
}

function notifyTgAdmin(text) {
  return fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' }),
  }).catch(err => console.error('TG notify error:', err.message));
}

// ---- Update handler ----
async function handleUpdate(update) {
  // message_callback — нажатие inline-кнопки. Юзер сидит в update.callback.user.user_id,
  // нажатые данные — в update.callback.payload (это то что мы клали в кнопку).
  if (update.update_type === 'message_callback') {
    const cb = update.callback;
    if (!cb || !cb.user) return;
    const userId = cb.user.user_id;
    if (botUserId != null && userId === botUserId) return;
    if (cb.user.is_bot === true) return;
    if (rateLimited(userId)) return;
    const data = cb.payload || '';
    if (!data) return;
    return handleCallback(userId, data);
  }

  if (update.update_type !== 'message_created') return;

  const msg = update.message;
  if (!msg || !msg.sender) return;

  const userId = msg.sender.user_id;

  // fix #1 + #5: never react to our own messages or any bot
  if (botUserId != null && userId === botUserId) return;
  if (msg.sender.is_bot === true) return;

  // fix #6: rate limit per user
  if (rateLimited(userId)) return;

  const text = (msg.body?.text || '').trim();

  // Check if this is a callback (callback_data trigger from button press)
  if (msg.body?.callback_data) {
    return handleCallback(userId, msg.body.callback_data);
  }

  if (!text) return;

  // fix #3: /start, /menu commands → main menu (не падают в catch-all)
  const lower = text.toLowerCase();
  if (lower === '/start' || lower === '/menu' || lower === 'start' || lower === 'menu') {
    return handleCallback(userId, 'menu');
  }

  // Regular text message
  const session = getSession(userId);
  const label = senderLabel(msg.sender);

  // ---- Booking flow: waiting for name ----
  if (session.booking && session.booking.step === 'name') {
    session.booking.name = text;
    session.booking.step = 'phone';
    await sendToMax(userId, '📞 Ваш номер телефона?');
    return;
  }

  // ---- Booking flow: waiting for phone ----
  if (session.booking && session.booking.step === 'phone') {
    session.booking.phone = text;
    await notifyTgAdmin(
      `📱 <b>Новая заявка на просмотр (MAX)</b>\n\n` +
      `👤 Имя: ${session.booking.name}\n` +
      `📞 Телефон: ${session.booking.phone}\n` +
      `👤 MAX: ${label} [MAX_ID: ${userId}]\n` +
      `📅 Дата: ${timestamp()}\n` +
      `📍 Источник: MAX мессенджер`,
    );
    await sendToMax(userId, '✅ Заявка принята! Менеджер свяжется с вами в ближайшее время.\n📞 Наш телефон: +7 (985) 905-25-55', mainMenuKeyboard());
    clearSession(userId);
    return;
  }

  // ---- Write question mode ----
  if (session.mode === 'write_question') {
    await notifyTgAdmin(
      `❓ <b>Вопрос от клиента (MAX)</b>\n\n` +
      `👤 ${label} [MAX_ID: ${userId}]\n` +
      `📅 ${timestamp()}\n\n` +
      `💬 ${text}`,
    );
    await sendToMax(userId, '✅ Спасибо! Ваш вопрос передан менеджеру. Ответим в ближайшее время.', mainMenuKeyboard());
    clearSession(userId);
    return;
  }

  // ---- Unrecognized text (fix #4): NO forward to TG, only reply with menu ----
  await sendToMax(
    userId,
    'Не понял сообщение 🤔 Выберите интересующий пункт из меню:',
    mainMenuKeyboard(),
  );
}

// ---- Callback handler (button presses) ----
async function handleCallback(userId, data) {
  const session = getSession(userId);

  // ---- Main menu ----
  if (data === 'menu') {
    clearSession(userId);
    await sendToMax(userId, '👋 Добрый день! Я — ассистент ЗемПлюс.\nПомогу подобрать земельный участок в Подмосковье.\n\nВыберите интересующий раздел:', mainMenuKeyboard());
    return;
  }

  // ==== SELECT PLOT FUNNEL ====
  if (data === 'select_plot') {
    session.funnel = { step: 'direction' };
    await sendToMax(userId, '🚗 Какое направление вас интересует?', {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: 'Каширское шоссе', callback_data: 'dir_kashir' },
          { text: 'Симферопольское шоссе', callback_data: 'dir_simfer' },
        ],
        [
          { text: 'Дмитровское шоссе', callback_data: 'dir_dmitrov' },
          { text: 'Новорижское шоссе', callback_data: 'dir_novorig' },
        ],
        [
          { text: 'Любое направление', callback_data: 'dir_any' },
        ],
      ],
    });
    return;
  }

  // ---- Direction selected ----
  if (data.startsWith('dir_')) {
    const dirMap = {
      dir_kashir: 'Каширское шоссе',
      dir_simfer: 'Симферопольское шоссе',
      dir_dmitrov: 'Дмитровское шоссе',
      dir_novorig: 'Новорижское шоссе',
      dir_any: 'any',
    };
    session.funnel = session.funnel || {};
    session.funnel.direction = dirMap[data] || 'any';
    session.funnel.step = 'budget';
    await sendToMax(userId, '💵 Какой бюджет за сотку?', {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: 'до 300 000 ₽', callback_data: 'price_300' },
          { text: '300–500 000 ₽', callback_data: 'price_500' },
        ],
        [
          { text: '500 000 – 1 млн ₽', callback_data: 'price_1m' },
          { text: 'от 1 млн ₽', callback_data: 'price_1m_plus' },
        ],
      ],
    });
    return;
  }

  // ---- Budget selected ----
  if (data.startsWith('price_')) {
    const budgetMap = {
      price_300: { min: 0, max: 300000 },
      price_500: { min: 300000, max: 500000 },
      price_1m: { min: 500000, max: 1000000 },
      price_1m_plus: { min: 1000000, max: Infinity },
    };
    session.funnel = session.funnel || {};
    session.funnel.budget = budgetMap[data] || { min: 0, max: Infinity };
    session.funnel.step = 'area';
    await sendToMax(userId, '📐 Какая площадь участка?', {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '6–8 соток', callback_data: 'area_6_8' },
          { text: '8–12 соток', callback_data: 'area_8_12' },
        ],
        [
          { text: '12–20 соток', callback_data: 'area_12_20' },
          { text: 'от 20 соток', callback_data: 'area_20_plus' },
        ],
      ],
    });
    return;
  }

  // ---- Area selected — show results ----
  if (data.startsWith('area_')) {
    const areaMap = {
      area_6_8: { min: 6, max: 8 },
      area_8_12: { min: 8, max: 12 },
      area_12_20: { min: 12, max: 20 },
      area_20_plus: { min: 20, max: 100 },
    };
    const area = areaMap[data] || { min: 6, max: 100 };
    session.funnel = session.funnel || {};
    const { direction, budget } = session.funnel;
    const budgetRange = budget || { min: 0, max: Infinity };

    let results = villages.filter((v) => {
      if (direction && direction !== 'any' && v.direction !== direction) return false;
      if (v.priceFrom > budgetRange.max) return false;
      if (budgetRange.min > 0 && v.priceFrom < budgetRange.min * 0.5) return false;
      if (v.areaTo < area.min) return false;
      if (v.areaFrom > area.max) return false;
      return true;
    });

    if (results.length === 0) {
      results = villages.filter((v) => {
        if (direction && direction !== 'any' && v.direction !== direction) return false;
        return true;
      });
    }

    results = results.slice(0, 3);

    if (results.length === 0) {
      await sendToMax(userId, 'К сожалению, точных совпадений не найдено. Наш менеджер поможет подобрать подходящий вариант!\n\n📞 Записаться на бесплатный просмотр?', {
        type: 'inline_keyboard',
        buttons: [
          [
            { text: '✅ Да', callback_data: 'book_yes' },
            { text: '◀️ В меню', callback_data: 'menu' },
          ],
        ],
      });
      return;
    }

    let text = '🏠 Подходящие посёлки:\n\n';
    results.forEach((v, i) => {
      text += `${i + 1}. ${v.name}\n`;
      text += `   🚗 ${v.direction}, ${v.distance} км от МКАД\n`;
      text += `   💰 от ${formatPrice(v.priceFrom)} ₽/сотка\n`;
      text += `   📐 ${v.areaFrom}–${v.areaTo} соток\n\n`;
    });
    text += `📞 Записаться на бесплатный просмотр?`;

    await sendToMax(userId, text, {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '✅ Да', callback_data: 'book_yes' },
          { text: '◀️ В меню', callback_data: 'menu' },
        ],
      ],
    });
    return;
  }

  // ==== BOOKING FLOW ====
  if (data === 'book_yes' || data === 'book_viewing') {
    session.booking = { step: 'name' };
    session.funnel = null;
    await sendToMax(userId, '📝 Как вас зовут?');
    return;
  }

  // ==== PRICES ====
  if (data === 'prices') {
    clearSession(userId);
    const text =
      '💰 Цены на участки ЗемПлюс\n\n' +
      '📊 Стоимость за сотку:\n' +
      '• Каширское шоссе — от 180 000 ₽\n' +
      '• Симферопольское шоссе — от 190 000 ₽\n' +
      '• Дмитровское шоссе — от 250 000 ₽\n' +
      '• Новорижское шоссе — от 350 000 ₽\n\n' +
      '💳 Рассрочка:\n' +
      '• До 12 месяцев без переплат\n' +
      '• Первый взнос от 50 000 ₽\n' +
      '• Без справок и одобрений\n\n' +
      '🏢 Ипотека от 6.5% — нажмите кнопку ниже';
    await sendToMax(userId, text, {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '🏢 Подробнее об ипотеке', callback_data: 'mortgage' },
          { text: '🏠 Подобрать участок', callback_data: 'select_plot' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    });
    return;
  }

  // ==== VILLAGES ====
  if (data === 'villages') {
    clearSession(userId);
    const text =
      '📍 Наши посёлки в Подмосковье\n\n' +
      'Мы работаем в 4 направлениях:\n\n' +
      '🚗 Каширское шоссе (30-50 км от МКАД)\n' +
      'Фаворит, Лесной Остров, Новое Сонино, Дачная Практика-2 и др.\n\n' +
      '🚗 Симферопольское шоссе (35-60 км)\n' +
      'Регата, Есенино, Ильинское и др.\n\n' +
      '🚗 Дмитровское шоссе (40-55 км)\n' +
      'Каретный Ряд, Триумфальный и др.\n\n' +
      '🚗 Новорижское шоссе (45-70 км)\n' +
      'Премиальные посёлки с лесом\n\n' +
      'Всего 31 посёлок, 2800+ участков';
    await sendToMax(userId, text, {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '🏠 Подобрать участок', callback_data: 'select_plot' },
          { text: '📞 Записаться на просмотр', callback_data: 'book_viewing' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    });
    return;
  }

  // ==== MORTGAGE ====
  if (data === 'mortgage') {
    clearSession(userId);
    const text =
      '🏢 Ипотека на земельный участок\n\n' +
      'Работаем с 6 ведущими банками:\n\n' +
      '• ВТБ — от 6.5%\n' +
      '• Сбер — от 7.0%\n' +
      '• Альфа-Банк — от 6.9%\n' +
      '• Газпромбанк — от 7.2%\n' +
      '• Россельхозбанк — от 6.8%\n' +
      '• Т-Банк — от 7.5%\n\n' +
      '📋 Что нужно:\n' +
      '• Паспорт РФ\n' +
      '• Справка о доходах (или по форме банка)\n' +
      '• Первый взнос от 15%\n\n' +
      '⏱️ Одобрение за 1-3 дня';
    await sendToMax(userId, text, {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '💰 Рассчитать платёж', callback_data: 'prices' },
          { text: '📞 Консультация по ипотеке', callback_data: 'book_viewing' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    });
    return;
  }

  // ==== HOW TO BUY ====
  if (data === 'how_to_buy') {
    clearSession(userId);
    const text =
      '📋 6 шагов до вашего участка\n\n' +
      '1️⃣ Звонок или заявка (5 мин)\n' +
      'Оставьте заявку — мы подберём варианты\n\n' +
      '2️⃣ Бесплатный просмотр (1-2 часа)\n' +
      'Покажем посёлки, инфраструктуру, участки\n\n' +
      '3️⃣ Выбор участка\n' +
      'Поможем выбрать лучший по расположению и цене\n\n' +
      '4️⃣ Бронирование (1 день)\n' +
      'Фиксируем цену, вносим минимальный залог\n\n' +
      '5️⃣ Оформление документов (5-7 дней)\n' +
      'Договор, проверка юр. чистоты, регистрация\n\n' +
      '6️⃣ Получение документов\n' +
      'Выписка из ЕГРН — участок ваш!\n\n' +
      '⚖️ 100% юридическая чистота гарантирована по договору';
    await sendToMax(userId, text, {
      type: 'inline_keyboard',
      buttons: [
        [
          { text: '📞 Записаться на просмотр', callback_data: 'book_viewing' },
          { text: '🏠 Подобрать участок', callback_data: 'select_plot' },
        ],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    });
    return;
  }

  // ==== FAQ ====
  if (data === 'faq') {
    clearSession(userId);
    await sendToMax(userId, '❓ Частые вопросы\n\nВыберите интересующий вопрос:', {
      type: 'inline_keyboard',
      buttons: [
        [{ text: 'Какая категория земли?', callback_data: 'faq_category' }],
        [{ text: 'Можно ли прописаться?', callback_data: 'faq_propiska' }],
        [{ text: 'Есть ли коммуникации?', callback_data: 'faq_comm' }],
        [{ text: 'Какие документы нужны?', callback_data: 'faq_docs' }],
        [{ text: 'Есть ли рассрочка?', callback_data: 'faq_rassrochka' }],
        [{ text: '◀️ Главное меню', callback_data: 'menu' }],
      ],
    });
    return;
  }

  // FAQ answers
  if (data === 'faq_category') {
    await sendToMax(userId, '📋 Все участки — ИЖС (индивидуальное жилищное строительство) или СНТ (садоводческое некоммерческое товарищество).\n\nЭто позволяет строить дома, коттеджи, хозпостройки.\n\n✅ Все участки чистые, без обременений.');
    return;
  }
  if (data === 'faq_propiska') {
    await sendToMax(userId, '✅ Да! Прописаться можно на участке ИЖС (если это основное место жительства).\n\nДля СНТ нужно проверить устав товарищества — обычно прописка недопустима.');
    return;
  }
  if (data === 'faq_comm') {
    await sendToMax(userId, '🔌 В большинстве посёлков есть:\n• Центральное водоснабжение или скважины\n• Электричество (380В)\n• Газ (магистральный или баллонный)\n• Асфальтированные дороги\n\nПроверяем наличие коммуникаций для каждого участка.');
    return;
  }
  if (data === 'faq_docs') {
    await sendToMax(userId, '📄 Для покупки нужны:\n• Паспорт РФ\n• Для физлиц — ИНН (опционально)\n• Для бизнеса — учредительные документы\n\nОстальные документы подготавливаются при оформлении. Мы помогаем со всем процессом.');
    return;
  }
  if (data === 'faq_rassrochka') {
    await sendToMax(userId, '💳 Да! Предлагаем:\n• Рассрочку до 12 месяцев без переплат\n• Первый взнос от 50 000 ₽\n• Ипотеку от 6 ведущих банков (от 6.5%)\n\nПодробнее — нажмите кнопку "Цены и рассрочка" в меню.');
    return;
  }

  // ==== Write question ====
  if (data === 'write_question') {
    // Why: clearSession() заменяет объект в Map целиком, но локальная переменная
    // `session` (из getSession() выше) указывает на ПРЕЖНИЙ объект. Установка
    // session.mode после clearSession не попадает в Map → следующее сообщение
    // юзера не видит mode='write_question' и падает в catch-all «Не понял».
    // Атомарно записываем новый объект сразу с нужным mode.
    sessions.set(userId, { mode: 'write_question' });
    await sendToMax(userId, '✏️ Напишите ваш вопрос — я передам его менеджеру:');
    return;
  }
}

// ---- Long polling ----
let marker = null;

async function bootstrap() {
  // fix #1: resolve our own user_id from /me
  try {
    const me = await maxGet('/me');
    if (!me || typeof me.user_id !== 'number') {
      throw new Error(`/me returned no user_id: ${JSON.stringify(me)}`);
    }
    botUserId = me.user_id;
    console.log(`[bootstrap] bot user_id = ${botUserId}, name = ${me.name || me.first_name || '?'}`);
  } catch (err) {
    console.error('[bootstrap] /me failed:', err.message);
    process.exit(1);
  }

  // fix #2: load marker from disk
  marker = loadMarker();
}

async function poll() {
  await bootstrap();
  console.log('MAX bot started, polling...');
  while (true) {
    try {
      const p = marker
        // types= нужен чтобы получать ОБА типа: message_created и message_callback (нажатия кнопок)
        ? `/updates?timeout=25&marker=${marker}&types=message_created,message_callback`
        : '/updates?timeout=25&types=message_created,message_callback';
      const data = await maxGet(p);
      for (const update of data.updates || []) {
        try {
          await handleUpdate(update);
        } catch (innerErr) {
          console.error('handleUpdate error:', innerErr.message);
        }
      }
      if (data.marker != null) {
        marker = data.marker;
        saveMarker(marker); // fix #2: persist after each successful poll
      }
    } catch (err) {
      console.error('MAX poll error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

poll();
