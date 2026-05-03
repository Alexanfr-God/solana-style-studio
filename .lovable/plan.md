## Goal

В секцию **Choose Your Theme** (`ThemeSelectorCoverflow`) добавить toggle-переключатель **WCC ↔ Phantom**. В режиме Phantom показывать ту же coverflow-карусель из 20 карточек:
- **#1 — "Original"**: текущая Phantom-тема, которая сейчас на макете (built-in baseline).
- **#2–#20**: плейсхолдеры "Coming soon" (некликабельные, серые).

Клик по Original применяет эту built-in Phantom-тему через `usePhantomThemeStore.setPhantomTheme(...)` — `WalletPreviewContainer` уже автоматически переключится в Phantom-режим.

## Изменения (только UI)

### 1. Новый файл `src/data/phantomBuiltInThemes.ts`
- Экспортирует `PHANTOM_BUILTIN_ORIGINAL: WCCOverlayV3` — это «дефолтная» Phantom-тема (background gradient + минимальные `elements` для всех ключей из `buildThemeOverrides`, чтобы превью выглядело как сейчас по умолчанию). Возьму текущие визуальные дефолты из `phantom-layout.json` + safe-палитру.
- Экспортирует массив `PHANTOM_PRESETS: Array<{ id, name, description, coverUrl, themeData?: WCCOverlayV3, isPlaceholder: boolean }>` длиной **20**:
  - первый — `{ id: 'phantom-original', name: 'Original', themeData: PHANTOM_BUILTIN_ORIGINAL, isPlaceholder: false }`;
  - остальные 19 — `{ id: 'phantom-soon-N', name: 'Coming Soon', isPlaceholder: true, coverUrl: '/placeholder.svg' }`.

### 2. `src/components/customization/ThemeSelectorCoverflow.tsx`
- Добавить локальный стейт `kind: 'wcc' | 'phantom'` (default `'wcc'`).
- Справа от заголовка `Choose Your Theme` — новый компонент-toggle (две круглые иконки/пилюлька): `[WCC] [Phantom]`. Реализую inline через `Button` + tailwind (semantic tokens, без новых цветов).
- Если `kind === 'wcc'` — отрисовываем существующую карусель и логику без изменений.
- Если `kind === 'phantom'` — отрисовываем ту же визуальную карусель Embla, но source = `PHANTOM_PRESETS`. `activeThemeId` для этой ветки берём из локального стейта `phantomActiveId` (default `'phantom-original'`).
- Клик по Phantom-карточке:
  - если `isPlaceholder` → `toast.info('Coming soon')`, ничего не применяем;
  - иначе → `usePhantomThemeStore.getState().setPhantomTheme(theme.themeData)` + `setPhantomActiveId(theme.id)` + `toast.success(...)`. Никаких записей в `user_themes` (это built-in превью, не пользовательский WCC-слот).
- Плейсхолдер-карточки рендерим с opacity 0.4, бейджем "Soon", `cursor-not-allowed`.
- Подпись "Active: ..." и dots под каруселью используют активный список (WCC или Phantom) в зависимости от `kind`.

### 3. Что НЕ трогаем
- `useThemeSelector`, `useThemeStore`, `usePresetsLoader` — без изменений.
- БД, edge-функции, минт-флоу, `MintedGallerySection` — без изменений.
- `WalletPreviewContainer` — без изменений; он уже сам реагирует на `phantomTheme` (есть `useEffect` switch на 'phantom').

## Edge cases
- При первом переключении на Phantom без клика по Original — превью не меняется (никакой авто-apply, только когда юзер кликнул карточку).
- Возврат на WCC: визуально просто меняется содержимое карусели, активная WCC-тема в макете остаётся та же (если пользователь до этого её менял в Phantom-режиме — `phantomTheme` остаётся в сторе, и превью продолжает показывать Phantom; чтобы вернуться к WCC, юзер кликает WCC-карточку — это поведение `WalletPreviewModeSelector` уже есть отдельно).

## Verification
1. Открыть customization-страницу → секция "Choose Your Theme" → справа от заголовка появился toggle WCC/Phantom.
2. Клик Phantom → карусель показывает 20 карточек, первая "Original" подсвечена.
3. Клик Original → Phantom-макет в превью обновился, тост "Applied: Original".
4. Клик любой "Coming Soon" → тост "Coming soon", макет не меняется.
5. Клик WCC → карусель вернулась к старому списку без регрессий.
