#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# ZemPlus deploy script — run on the server inside /var/www/zemplus
# Usage:  ./deploy/deploy.sh
# ──────────────────────────────────────────────────────────────────
set -uo pipefail

APP_DIR="/var/www/zemplus"
APP_NAME="zemplus"
START_TS=$(date +%s)

# Load TG_BOT_TOKEN / TG_CHAT_ID from .env.local if present
if [ -f "$APP_DIR/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$APP_DIR/.env.local"
    set +a
fi

notify_tg() {
    local status=$1
    local text=$2
    local token=${TG_BOT_TOKEN:-}
    local chat=${TG_CHAT_ID:-}
    [ -z "$token" ] || [ -z "$chat" ] && return 0
    curl -s --max-time 5 \
        -X POST "https://api.telegram.org/bot${token}/sendMessage" \
        -d chat_id="$chat" \
        -d parse_mode=HTML \
        --data-urlencode text="$text" >/dev/null 2>&1 || true
}

on_failure() {
    local step=$1
    local dur=$(( $(date +%s) - START_TS ))
    notify_tg error "❌ <b>Deploy failed</b>
Шаг: ${step}
Время: ${dur}с
Хост: $(hostname)"
    exit 1
}

cd "$APP_DIR" || on_failure "cd"

echo "▶ Pulling latest code…"
git pull --ff-only || on_failure "git pull"

echo "▶ Installing prod dependencies…"
npm ci --omit=dev --no-audit --no-fund || on_failure "npm ci"

echo "▶ Building…"
NODE_OPTIONS="--max-old-space-size=1536" npm run build || on_failure "npm run build"

echo "▶ Reloading PM2…"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 reload "$APP_NAME" --update-env || on_failure "pm2 reload"
else
    pm2 start ecosystem.config.cjs || on_failure "pm2 start"
    pm2 save
fi

# Health check after reload
sleep 2
HTTP=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://localhost:3001/ || echo "000")
if [ "$HTTP" != "200" ]; then
    on_failure "health check (HTTP $HTTP)"
fi

DURATION=$(( $(date +%s) - START_TS ))
MEM=$(free -h | awk '/^Mem:/ {print $3"/"$2}')
DISK=$(df -h / | awk 'NR==2 {print $5" used"}')

echo "✓ Deploy complete in ${DURATION}s."
pm2 status "$APP_NAME"

notify_tg ok "✅ <b>Deploy готов</b>
HTTP <b>${HTTP}</b> · ${DURATION}с
💾 ${MEM} · 🗄 ${DISK}"
