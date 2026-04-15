#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# ZemPlus deploy script — runs on the server inside /var/www/zemplus
#
# Invoked by `src/app/api/deploy/route.ts` after a signed POST from
# the GitHub Actions workflow, or manually by an operator via SSH.
#
# Flow:
#   1. Download the main branch tarball from GitHub (public repo,
#      no auth). Fall back to a deterministic commit SHA if passed
#      via DEPLOY_SHA.
#   2. Extract into a temp dir, rsync into APP_DIR preserving
#      node_modules, .next, .env.local, public/villages, logs, backups.
#   3. npm ci --omit=dev  (prod deps only).
#   4. next build with a 1.5 GB heap cap so we don't OOM on the 4 GB box.
#   5. pm2 reload zemplus  (zero-downtime reload).
#   6. Health check http://localhost:3001/  — fail the deploy if != 200.
#   7. Telegram notification (success or failure).
#
# All output goes to DEPLOY_LOG (default /var/www/zemplus/logs/deploy.log)
# which the API route exposes via GET /api/deploy for CI polling.
# ──────────────────────────────────────────────────────────────────
set -uo pipefail

APP_DIR="/var/www/zemplus"
APP_NAME="zemplus"
REPO_OWNER="abrottsel"
REPO_NAME="Salehouse"
START_TS=$(date +%s)

DEPLOY_LOG="${DEPLOY_LOG:-$APP_DIR/logs/deploy.log}"
DEPLOY_REF="${DEPLOY_REF:-main}"
DEPLOY_SHA="${DEPLOY_SHA:-}"
DEPLOY_ACTOR="${DEPLOY_ACTOR:-manual}"

mkdir -p "$(dirname "$DEPLOY_LOG")"
# Reset the log for this run — GET /api/deploy returns the tail, so we
# only want the current run's output.
: > "$DEPLOY_LOG"
exec >>"$DEPLOY_LOG" 2>&1

log() {
    echo "[$(date +'%H:%M:%S')] $*"
}

# Load .env.local so Telegram creds + any per-env knobs are in scope.
if [ -f "$APP_DIR/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$APP_DIR/.env.local"
    set +a
fi

notify_tg() {
    local text=$1
    local token=${TG_BOT_TOKEN:-}
    local chat=${TG_CHAT_ID:-}
    if [ -z "$token" ] || [ -z "$chat" ]; then
        return 0
    fi
    curl -s --max-time 5 \
        -X POST "https://api.telegram.org/bot${token}/sendMessage" \
        -d chat_id="$chat" \
        -d parse_mode=HTML \
        --data-urlencode text="$text" >/dev/null 2>&1 || true
}

on_failure() {
    local step=$1
    local dur=$(( $(date +%s) - START_TS ))
    log "✗ FAILED at: $step ($dur s)"
    notify_tg "❌ <b>Deploy failed</b>
Шаг: ${step}
Ref: <code>${DEPLOY_REF}</code>
SHA: <code>${DEPLOY_SHA:0:7}</code>
Кто: ${DEPLOY_ACTOR}
Время: ${dur}с
Лог: <code>tail -50 ${DEPLOY_LOG}</code>"
    exit 1
}

log "▶ Deploy started — ref=$DEPLOY_REF sha=${DEPLOY_SHA:0:7} actor=$DEPLOY_ACTOR"

# ── 1. Download tarball ────────────────────────────────────────────
TMP_DIR="$(mktemp -d -t zemplus-deploy-XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [ -n "$DEPLOY_SHA" ]; then
    TARBALL_URL="https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/${DEPLOY_SHA}"
else
    TARBALL_URL="https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/refs/heads/${DEPLOY_REF}"
fi

log "▶ Downloading $TARBALL_URL"
curl -fsSL --max-time 120 "$TARBALL_URL" -o "$TMP_DIR/source.tar.gz" \
    || on_failure "tarball download"

log "▶ Extracting tarball"
tar -xzf "$TMP_DIR/source.tar.gz" -C "$TMP_DIR" \
    || on_failure "tar extract"

# GitHub tarballs extract into a single top-level directory named
# "{repo}-{ref_or_sha}". We don't want to hard-code the name, so just
# grab the first entry.
SRC_DIR="$(find "$TMP_DIR" -maxdepth 1 -mindepth 1 -type d | head -n 1)"
if [ -z "$SRC_DIR" ] || [ ! -d "$SRC_DIR" ]; then
    on_failure "locate extracted source dir"
fi
log "▶ Source tree: $SRC_DIR"

# ── 2. Rsync into APP_DIR ──────────────────────────────────────────
log "▶ Syncing into $APP_DIR"
rsync -a --delete \
    --exclude='.env.local' \
    --exclude='node_modules/' \
    --exclude='.next/' \
    --exclude='public/villages/' \
    --exclude='logs/' \
    --exclude='backups/' \
    --exclude='.git/' \
    "$SRC_DIR/" "$APP_DIR/" \
    || on_failure "rsync"

# Ensure deploy.sh stays executable after the sync.
chmod +x "$APP_DIR/deploy/deploy.sh" 2>/dev/null || true

cd "$APP_DIR" || on_failure "cd app dir"

# ── 3. Full deps install ───────────────────────────────────────────
# Full `npm ci` including devDeps — we need @tailwindcss/postcss,
# tailwindcss, typescript, @types/* at build time. The 4 GB box
# handles this fine (~500 MB peak during install).
#
# NODE_ENV is forced to "development" for this step because npm
# silently switches to production mode (omitting devDeps) when it
# detects NODE_ENV=production in the environment, even with an
# explicit --include=dev. Forcing the env here is the only reliable
# way to guarantee a complete install across fresh boxes.
log "▶ npm ci (with devDeps)"
NODE_ENV=development npm ci --include=dev --no-audit --no-fund \
    || on_failure "npm ci"

# ── 3b. Prisma client ──────────────────────────────────────────────
# Generate the Prisma client from schema.prisma — Next picks up the
# generated types when building the /api/leads route. Safe to run even
# when the DB is unreachable: `generate` only touches the filesystem.
if [ -f "$APP_DIR/prisma/schema.prisma" ]; then
    log "▶ prisma generate"
    npx prisma generate \
        || on_failure "prisma generate"

    # Apply pending migrations only if DATABASE_URL is set. Missing DB
    # is not fatal here — the runtime code degrades gracefully when
    # Prisma can't connect, falling back to Telegram-only lead delivery.
    if [ -n "${DATABASE_URL:-}" ]; then
        log "▶ prisma migrate deploy"
        npx prisma migrate deploy \
            || log "⚠ prisma migrate deploy failed — continuing without DB schema update"
    else
        log "⚠ DATABASE_URL is not set — skipping prisma migrate deploy"
    fi
fi

# ── 4. Build ───────────────────────────────────────────────────────
# Wipe the old .next/ so the new build doesn't inherit stale turbopack
# artifacts that reference long-gone node_modules paths. This was the
# root cause of the "Cannot find module '@tailwindcss/postcss'" errors.
log "▶ rm -rf .next"
rm -rf "$APP_DIR/.next"

log "▶ next build"
NODE_OPTIONS="--max-old-space-size=1536" npm run build \
    || on_failure "next build"

# ── 5. Reload PM2 ──────────────────────────────────────────────────
log "▶ pm2 reload $APP_NAME"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 reload "$APP_NAME" --update-env || on_failure "pm2 reload"
else
    pm2 start ecosystem.config.cjs || on_failure "pm2 start"
    pm2 save
fi

# ── 6. Health check ────────────────────────────────────────────────
# Give Next.js a moment to bind — `pm2 reload` is zero-downtime, but
# on a cold cache the new worker may take a few seconds to warm up.
sleep 3
HTTP=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 http://localhost:3001/ || echo "000")
if [ "$HTTP" != "200" ]; then
    on_failure "health check (HTTP $HTTP)"
fi

# ── 7. Done ────────────────────────────────────────────────────────
DURATION=$(( $(date +%s) - START_TS ))
MEM=$(free -h | awk '/^Mem:/ {print $3"/"$2}')
DISK=$(df -h / | awk 'NR==2 {print $5" used"}')

log "✓ Deploy complete in ${DURATION}s — HTTP $HTTP — mem $MEM — disk $DISK"
pm2 status "$APP_NAME"

notify_tg "✅ <b>Deploy готов</b>
Ref: <code>${DEPLOY_REF}</code>
SHA: <code>${DEPLOY_SHA:0:7}</code>
Кто: ${DEPLOY_ACTOR}
HTTP <b>${HTTP}</b> · ${DURATION}с
💾 ${MEM} · 🗄 ${DISK}"
