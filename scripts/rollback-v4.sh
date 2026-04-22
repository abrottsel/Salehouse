#!/usr/bin/env bash
# Полный откат /v4 до точки до любых v4-правок.
#
# Что делает:
#   1. Создаёт revert-коммит, убирающий все /v4 файлы + восстанавливающий
#      любые прод-компоненты к release-dropdown-approved.
#   2. Пушит в main → webhook катит деплой.
#   3. После деплоя: /v4 вернёт 404, прод /village/* неизменен и жив.
#
# Прод-компоненты защищены двумя способами:
#   • Никогда не менялись (всё в src/app/v4/_components/, изолировано).
#   • Есть backup на Desktop: ~/Desktop/zemplus-prod-backup-20260422-1428/
#   • Есть git tag release-dropdown-approved (коммит 1fd5ace).
#
# Использование:
#   bash scripts/rollback-v4.sh [--dry-run]
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then DRY_RUN=1; fi

echo "→ Проверяю текущее состояние"
git fetch origin
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "!! Не на main ($CURRENT_BRANCH). Переключись: git checkout main"
  exit 1
fi

# Подсказка пользователю — что именно будет удалено
V4_FILES=$(git ls-files src/app/v4 2>/dev/null | wc -l | xargs)
echo "→ v4-файлов в main: $V4_FILES"

# Проверяем что прод-компоненты ещё идентичны release-dropdown-approved
for f in src/components/HomeDistanceBadge.tsx src/components/IframeMapOverlay.tsx \
         src/components/VillageHeroSwiper.tsx src/components/Catalog.tsx; do
  if ! git diff --quiet release-dropdown-approved -- "$f"; then
    echo "!! $f отличается от release-dropdown-approved. Автоматический откат небезопасен."
    echo "   Восстанови вручную:"
    echo "     git checkout release-dropdown-approved -- $f"
    echo "   или скопируй из ~/Desktop/zemplus-prod-backup-20260422-1428/"
    exit 2
  fi
done
echo "✓ Прод-компоненты идентичны release-dropdown-approved"

# Удаляем v4
if [[ "$DRY_RUN" == "1" ]]; then
  echo "[DRY-RUN] будет выполнено: git rm -r src/app/v4"
  echo "[DRY-RUN] затем: git commit -m 'revert: /v4 (rollback via scripts/rollback-v4.sh)'"
  echo "[DRY-RUN] затем: git push origin main"
  echo "[DRY-RUN] после деплоя curl https://zem-plus.ru/v4 → 404, / → 200"
  exit 0
fi

git rm -r src/app/v4
git commit -m "$(cat <<EOF
revert: /v4 — откат по scripts/rollback-v4.sh

Полностью убираем /v4 роут. Прод (/village/[slug], /src/components/*)
не затронут — все v4-правки были изолированы в src/app/v4/.

Rollback-точка: git tag pre-v4-as-main (тот же SHA что HEAD до v4).
Бэкап прод-компонентов: ~/Desktop/zemplus-prod-backup-20260422-1428/
EOF
)"

git push origin main

echo "✓ Push выполнен. Webhook деплоит, ~3 мин."
echo "  Проверить: curl -sI https://zem-plus.ru/v4   → должно быть 404"
echo "             curl -sI https://zem-plus.ru/     → 200"
