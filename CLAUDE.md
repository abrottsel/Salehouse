@AGENTS.md

## 🚨🚨 ПРОТОКОЛ «НЕ ВСЛЕПУЮ» — ОБЯЗАТЕЛЕН ПЕРЕД КАЖДЫМ ДЕПЛОЕМ

Причина: повторялись поломки прода (ломал «Дорогу к мечте», маршрут, не проверял мобайл, угадывал, делал лишнее). Эти правила — жёсткие, не отступать.

1. **Проверка в реальной среде ДО коммита, а не после.** Открыть изменённый экран на **реальной странице** в **нужной теме (светлая/тёмная)** и **на мобайле И на ПК** (gstack browse / preview, скриншот). «tsc прошёл + curl 200» — НЕ доказательство. Деплой только после визуальной сверки.
2. **Защищённые зоны не трогать и не перекрывать:** «Дорога к мечте» (HomeDistanceBadge/IframeMapOverlay), «Спутник» (iframe Земекс), карты/маршрут, любой ЭТАЛОН. Если правка рядом — изолировать (отдельный слой `pointer-events-none`, не пересекать их область), показать скрин до/после, катить только по явному «ок». Проверять, что защищённый элемент **кликается** (реальный клик/elementFromPoint), на мобайле тоже.
3. **Ровно то, что просят.** Ничего сверх запроса (лишний текст, иконки, фичи). Сомнение — ОДИН короткий вопрос (AskUserQuestion), не догадка. Не убирать/не добавлять, если не просили.
4. **Коротко.** Минимум «букв», по делу. Пользователь не читает длинные простыни.
5. **Не отмахиваться** «это не мои ошибки» — все коммиты = мои (см. memory git_authorship). Сначала воспроизвести в той же среде, где видит пользователь, потом диагноз.

См. также memory: `do_exactly_what_asked.md`, `feedback_grid_unification_misread.md`.

## 🚨 Работа с утверждёнными прод-компонентами — ЖЁСТКИЙ ПРОТОКОЛ

Применяется к любому компоненту с git tag вида `release-*-approved`, к файлам помеченным «ЭТАЛОН» в этом CLAUDE.md, и к любому UI выстраданному итерациями (см. memory-файлы с пометкой «утверждено»).

**НИКОГДА:**
- Не работать в working copy на `main` — ВСЕГДА отдельная ветка: `git checkout -b feature/<scope>`
- Не делать массовую замену импортов через `sed` или batch-edit
- Не доверять «`tsc` чистый + curl 200» как доказательству работоспособности
- Не катить подмену прод-компонента без визуальной сверки скриншотами
- Не игнорировать правила позиционирования/стилей из этого CLAUDE.md и memory — 3,5ч итераций не повторяются
- Не доверять агенту слепо: любой код агента > 100 строк — прогоняется построчным diff перед запуском

**ВСЕГДА перед заменой утверждённого компонента:**
1. `git checkout -b feature/<name>` — изолированная ветка
2. A/B через query-флаг (`?v2=1`, `?variant=new`) на **одной реальной прод-странице**, а не на preview-стенде
3. Скриншот прод-версии + скриншот новой версии той же страницы (через Claude_Preview MCP)
4. Построчный `git diff <old> <new>` с объяснением каждого изменения
5. Показать пользователю оба скриншота + diff
6. Катить только по явному «да» от пользователя
7. Резервная копия на Desktop (как уже делаем) + git tag перед релизом

**Preview-стенд ≠ прод.** Изолированный демо с моком карты не валидирует работу на `/village/[slug]` с живым iframe, hero swiper, hydration, z-index слоями. Сверка только на реальной прод-странице.

**Массовая подмена импортов через `sed` ЗАПРЕЩЕНА.** Только ручная подмена одного файла → проверка → следующий.

## HomeDistanceBadge — «Дорога к мечте» (ЭТАЛОН, не менять без явной просьбы)

Утверждённый релиз: коммит `1fd5ace`, tag `release-dropdown-approved`.
Файлы: `src/components/HomeDistanceBadge.tsx`, `src/components/IframeMapOverlay.tsx`.

**Откат:** `git checkout release-dropdown-approved -- src/components/HomeDistanceBadge.tsx src/components/IframeMapOverlay.tsx`

### Где используется
- **Hero посёлка** (`variant=hero`) — anchor к `[data-hero-pills-row]`, dropdown под рядом пилюль.
- **Поверх iframe карты** (`variant=frame`) — кнопка top-right в `[data-frame-overlay]`, dropdown под кнопкой.

### Дизайн «Пушка» (liquid glass) — эталон для всех overlay-панелей
```tsx
className="rounded-[22px] text-white [&_*]:drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] hd-glass-tile"
style={{
  backdropFilter: "blur(1px) saturate(2)",
  background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
  boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.35), inset 0 -0.5px 0 rgba(255,255,255,0.12), 0 8px 32px -4px rgba(0,0,0,0.25)",
}}
```
Rainbow conic `::before` рамка — см. `.hero-glass-tile-wide` в `src/components/HeroTiles.tsx`.

### Жёсткие правила (НЕ отступать без явной просьбы)
1. **Размеры:** mobile (<640px) = 260px (НЕ 86vw), desktop ≥640px = 280–320px.
2. **Позиция hero:** `top = pillsRow.bottom + 8`, `left` anchor к левому краю row, не к button.
3. **Позиция frame:** dropdown под кнопкой (anchor к button.left/bottom) — не перекрывает легенду цен слева.
4. **Clamp:** `left = Math.max(8, Math.min(desiredLeft, vw - dropdownWidth - 8))`.
5. **Mobile frame:** `desiredLeft = r.right - dropdownWidth + 8`, input `bg-black/40 ring-white/50 placeholder:text-white/90`.
6. **Mac hero input:** `bg-white/15 ring-white/40 placeholder:text-white/70`.
7. **Поиск:** DaData-first → Nominatim fallback, ≥2 символа, debounce 180ms.
8. **iOS guard:** не закрывать при scroll если `document.activeElement` внутри panel.
9. **`createPortal` в body.**

### Запрещено
- `overflow: hidden` на родителе (ломает rainbow border).
- Плотный белый фон (rgba > 0.10) — теряется стекло.
- Тёмный текст без drop-shadow — не читается.
- `position: fixed` без recompute on scroll.
- `top-full mt-2` у inline-block — позиция скачет.

### Preview-страницы — АРХИВ/РЕФЕРЕНС (НЕ ТЗ!)
⚠️ **Эти страницы = архив того, что УЖЕ реализовано и стоит на проде.** Не путать с задачами на разработку. Трогать прод НЕЛЬЗЯ. Использовать только как визуальный референс / для отката.

- `/preview-home-distance/frame-glass` — **эталон того, что сейчас на проде** (liquid-glass dropdown над iframe)
- `/preview-home-distance` — сравнительная (V1 glass pill / V1a empty / V2 solid / V3 mini / V4; каталог C1/C2/C3)
- `/preview-home-distance/hero` — hero-размещение (архив)
- `/preview-home-distance/frame` — frame-размещение (архив)
- `/preview-home-distance/modal`, `/preview-home-distance/sheet` — архив модалки и bottom-sheet

### Активная задача
- `/preview-route-modal-flow-10` — **актуальный флоу** ввода адреса (10 вариантов). Выбираем один для реализации. НЕ архив.

См. полные правила: `~/.claude/projects/-Users-abrottsel-------------/memory/` → `dropdown_release_approved.md`, `dropdown_position_rules.md`, `design_pushka.md`.
