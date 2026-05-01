## Проблема

При минте Phantom-скина в `minted_themes` сохраняется не картинка фона, а 1×1 пиксель placeholder (растягивается как зелёный/однотонный фон). Заодно edge function `upload-to-ipfs` иногда падает с "Failed upload image" — потому что:

1. **`resolvePreviewImageUrl`** в `ExportToIpfsButton.tsx` ищет фон только в **WCC-структуре** (`theme.lockLayer.backgroundImage`, `homeLayer.backgroundImage` и т.д.).
2. У **Phantom-темы совершенно другая структура** — фон лежит в `phantomTheme.global.background.url` (из `usePhantomThemeStore`).
3. В минт-флоу всегда берётся `useThemeStore.getState().theme` (WCC), и Phantom-стор вообще не опрашивается на предмет картинки. Для Phantom-минтов мы передаём WCC-тему + WCC-фон (или placeholder).
4. Deno `fetch()` на `data:image/png;base64,...` URL отдаёт нестабильный результат → "Failed to download preview image" в логах edge function.
5. В БД `image_url` записывается тот же placeholder → в Minted Gallery видно зелёный/однотонный фон.

## Что делаем

### 1. `src/components/wallet/ExportToIpfsButton.tsx`

- Определять `skinKind` **в начале** Solana-флоу (а не только перед insert).
- Если `skinKind === 'phantom'`:
  - брать тему из `usePhantomThemeStore.getState().phantomTheme` (а не из WCC store);
  - резолвить `previewImageUrl` из `phantomTheme.global.background.url`;
  - если в `global.background` нет `url` (только gradient/color) — ничего не выдумываем, передаём `null` и пропускаем шаг загрузки картинки в IPFS (см. п.2), а в БД пишем `image_url: null`, чтобы галерея не показывала растянутый placeholder.
- Добавить отдельный `resolvePhantomPreviewImageUrl(phantomTheme)`.
- В `themeData`, который уходит и в IPFS, и в metadata, для Phantom-минтов передавать **phantom-тему**, а не WCC.
- Логировать `[ExportToIpfs] skinKind / previewImageUrl / source` для диагностики.

### 2. `supabase/functions/upload-to-ipfs/index.ts`

- Сделать `previewImageUrl` опциональным:
  - если он отсутствует / является data: URL 1×1 / fetch упал — не падаем всем минтом, а возвращаем `imageCid: null` и в metadata кладём пустой `image: ""` (или дефолтную WCC-обложку, которая лежит в Lighthouse — TBD, спросим у юзера, ниже один вопрос об этом).
- Перестать пытаться `fetch()` на `data:` URL: если строка начинается с `data:`, декодировать base64 локально и заливать байты напрямую в Lighthouse.
- Чёткое сообщение об ошибке в `message`, а не общее "Failed upload image".

### 3. Minted Gallery (`MintedGallerySection.tsx`)

- Если `image_url` пустой / совпадает с известным placeholder (1×1 PNG) — показывать **рендер превью из `metadata_uri`** (загружаем JSON, берём `properties.files[0]` или сам `image`) вместо однотонного фона.
- Fallback: нейтральная плашка "No preview" с иконкой Phantom/WCC, а не зелёный градиент.

### 4. Self-healing для уже залитого Phantom-NFT

- Тот конкретный mint, который сейчас показывает зелёный фон, имеет корректный `metadata_uri` на IPFS. Сделаем разовый UPDATE: после деплоя кода галерея сама подтянет картинку из metadata; **миграция БД не требуется**, но если хочешь — можно дополнительно перезаписать `image_url` из metadata через одноразовый скрипт в галерее (для всех записей с placeholder image_url).

## Технические детали

```ts
// resolvePhantomPreviewImageUrl
function resolvePhantomPreviewImageUrl(pt: PhantomTheme | null): string | null {
  const url = pt?.global?.background?.url;
  if (!url) return null;
  // отсечь 1×1 placeholder
  if (url.startsWith('data:image/png;base64,iVBORw0KGgo')) return null;
  return url;
}
```

```ts
// в Solana-флоу
const phantomTheme = usePhantomThemeStore.getState().phantomTheme;
const skinKind: 'wcc' | 'phantom' = phantomTheme ? 'phantom' : 'wcc';
const themeForMint = skinKind === 'phantom' ? phantomTheme : useThemeStore.getState().theme;
const previewImageUrl = skinKind === 'phantom'
  ? resolvePhantomPreviewImageUrl(phantomTheme)
  : resolvePreviewImageUrl(themeForMint);
```

```ts
// edge function: data: URL handling
if (previewImageUrl?.startsWith('data:')) {
  const [, b64] = previewImageUrl.split(',');
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  imageBlob = new Blob([bytes], { type: 'image/png' });
} else if (previewImageUrl) {
  const r = await fetch(previewImageUrl);
  if (!r.ok) { /* graceful fallback, не throw */ }
  imageBlob = await r.blob();
}
```

## Один вопрос перед стартом

Нужно решить, что показывать в галерее, если у Phantom-скина в `global.background` вообще нет картинки (только gradient/color) — это валидный случай.
