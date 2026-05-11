## Rename "Wallet Coast Customs" → "Wacocu" (display-only)

Заменяем бренд в UI/тексте. Никакой логики, ID, env, БД, контрактов и переменных не трогаем.

### Что меняем

**1. Header (главная) — `src/components/layout/Header.tsx`**
- Строка 29: `Wallet Coast Customs` → `Wacocu`

**2. Footer — `src/components/layout/Footer.tsx`**
- Строки 71 и 86: `Wallet Coast Customs` → `Wacocu`

**3. Editor header — `src/components/editor/EditorHeader.tsx`**
- Строка 9: `Wallet Coast Customs ✨` → `Wacocu ✨`

**4. Mask upload подсказка — `src/components/editor/mask/mask-dialog/MaskUploadSection.tsx`**
- Строка 58: `Wallet Coast masks` → `Wacocu masks`

**5. Documentation — `src/pages/Documentation.tsx`**
- Заголовок и первый абзац: `Wallet Coast Customs (WCC)` оставляем как есть **один раз** в техническом описании, потому что аббревиатура WCC используется по всему коду. Меняем только заголовок секции `🌴 About Wallet Coast Customs` → `🌴 About Wacocu` и первое упоминание во фразе на `Wacocu (WCC)`.

**6. SEO теги — `index.html`**
- `<title>` → `Wacocu`
- `og:title`, `twitter:title`, `author` meta → `Wacocu`
- `og:description` / `twitter:description` оставляем (там Phantom).

### Что НЕ трогаем (потенциально критично)

- `src/lib/appkit.ts` (`name: 'Wallet Coast Customs'`) — это metadata для **WalletConnect/AppKit**, отображается в модалке кошелька при подключении и используется в pairing-сессиях. Менять рискованно: может поломать существующие сессии у пользователей и кэш WC. Оставляем.
- `supabase/functions/upload-to-ipfs/index.ts` (default description для NFT metadata) — пишется в он-чейн/IPFS метаданные минтов. Уже заминченные NFT не затронуты, но для консистентности истории оставляем. Не критично, но не UI.
- `src/components/wallet/ExportToIpfsButton.tsx` — те же default-описания для IPFS-аплоада тем/нфт. Оставляем по той же причине (попадает в metadata минтов).
- `src/utils/imageExport.ts` — default description при экспорте картинки темы (попадает в metadata). Оставляем.
- `README.md` — техдока репозитория, не UI. Оставляем.
- Аббревиатура **WCC** везде в коде/типах/компонентах (`WCCOverlay`, `WCCClient`, `wcc-bridge` и т.д.) — это идентификаторы, не трогаем.

### Проверка после изменений

- Визуально: главная (Header), футер, страница редактора (EditorHeader), Documentation, диалог Mask Upload.
- Заголовок вкладки браузера должен стать `Wacocu`.
- Подключение кошелька через AppKit должно по-прежнему показывать `Wallet Coast Customs` (намеренно).
