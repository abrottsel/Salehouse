#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# ZemPlus deploy script — run on the server inside /var/www/zemplus
# Usage:  ./deploy/deploy.sh
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/zemplus"
APP_NAME="zemplus"

cd "$APP_DIR"

echo "▶ Pulling latest code…"
git pull --ff-only

echo "▶ Installing prod dependencies…"
npm ci --omit=dev --no-audit --no-fund

echo "▶ Building…"
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "▶ Reloading PM2…"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 reload "$APP_NAME" --update-env
else
    pm2 start ecosystem.config.cjs
    pm2 save
fi

echo "✓ Deploy complete."
pm2 status "$APP_NAME"
