## Цель

1. В коверфлоу **Phantom Themes** карточка **"Original"** показывает `placeholder.svg` — заменить на реальный скриншот текущего Phantom-макета.
2. Добавить недавно отминченный NFT (`Phantom Preset 1` / mint `GzS4v8H6...`) **первым** пресетом перед "Original" с обложкой = его `image_url` (Lighthouse IPFS).
3. Разобраться, почему этот минт не виден в Minted Gallery, и починить.

## Почему минт не показан в галерее

Запрос в `MintedGallerySection.fetchMints()` фильтрует `is_verified=true`. Запись `GzS4v8H6yn57XU1ryg2NR5nAtLt4a1DdnqmZkKK6FF2z` имеет `is_verified=false`. Self-heal-блок проверяет on-chain статус только для записей **старше 60 секунд и младше 24 часов**, но он мог не запуститься или RPC не подтвердил вовремя. Минт реально совершён — выставим `is_verified=true` миграцией и оставим self-heal как есть (он подхватит будущие случаи).

## План

### Шаг 1 — Миграция: верифицировать минт

```sql
UPDATE public.minted_themes
SET is_verified = true
WHERE mint_address = 'GzS4v8H6yn57XU1ryg2NR5nAtLt4a1DdnqmZkKK6FF2z';
```

После этого NFT появится в Minted Gallery автоматически (real-time подписка).

### Шаг 2 — Сгенерировать обложку "Original"

- Сгенерировать через `imagegen` карточный кавер 768×1024, имитирующий текущий Phantom UI: фиолетовый градиент `#1a1625 → #2d1b4e`, glass-карточки, баланс SOL, кнопки Buy/Send в стиле Phantom (как описано в `PHANTOM_BUILTIN_ORIGINAL` в `src/data/phantomBuiltInThemes.ts`).
- Сохранить в `src/assets/phantom-original-cover.jpg`.

### Шаг 3 — Обновить `src/data/phantomBuiltInThemes.ts`

- Импортировать новую обложку `phantomOriginalCover`.
- Поменять `coverUrl` пресета `phantom-original` на эту обложку.
- **Добавить новый первый пресет** `phantom-gold-btc`:
  - `id: 'phantom-gold-btc'`
  - `name: 'Gold BTC'`
  - `description: 'Recently minted Phantom skin'`
  - `coverUrl: 'https://gateway.lighthouse.storage/ipfs/QmefA7pxFkmWXLhwhTC35SEuXJBN7EfnWY8t8zcoVnEb44'`
  - `themeData`: загружаем из IPFS metadata при клике (или сейчас встраиваем константой `null` + специальная ветка) — **проще**: оставить статичную копию `theme_data` из БД. Получу её отдельным `read_query` и захардкожу как объект `WCCOverlayV3`.
  - `isPlaceholder: false`
- Уменьшить количество "Coming Soon" плейсхолдеров с 19 до 18, чтобы общий размер коверфлоу не увеличился.

### Шаг 4 — Проверка

- Запустить `dependency_scan` не нужно; визуально проверить превью: Phantom toggle → видна Gold BTC слева, Original справа со своей картинкой.
- Открыть Minted Gallery — убедиться что Phantom Preset 1 теперь показывается.

## Технические детали

- Файлы: `src/data/phantomBuiltInThemes.ts`, новый ассет `src/assets/phantom-original-cover.jpg`, миграция `supabase/migrations/*_verify_phantom_preset_1.sql`.
- Никаких изменений в логике `ThemeSelectorCoverflow.tsx` не требуется — она уже умеет рендерить любые `PhantomPresetCard`.
- `theme_data` для Gold BTC заинлайним в файл, чтобы клик мгновенно применял скин без сетевого запроса.