## Проблема (диагноз)

Твой свежий минт **есть в БД и финализирован на Solana devnet**, но не виден в gallery, потому что:

1. `MintedGallerySection` фильтрует строго `is_verified=true` (это защита от фантомных НФТ).
2. В `ExportToIpfsButton.tsx` поле `is_verified` ставится в `true` **только** после успешного `connection.confirmTransaction(...)` в браузере. Этот вызов часто таймаутит на публичном RPC devnet, даже когда tx реально проходит.
3. Сейчас в БД: `mint_address: 4jGVoY5kC3b4cLZ5E6NnKq3WtqgoQF9EHKe7N7s5qSbY`, `theme_name: "My Custom Theme"`, `tx_sig: 3D16H2gz...`, `is_verified=false`.
4. Проверка через RPC: tx статус `Ok`, `confirmationStatus: finalized`. Значит минт прошёл, БД просто не дообновилась.

Дополнительно: сейчас нет способа отличить "WCC-скин на Solana" от "Phantom-нативный скин" — все Solana-минты в БД одинаковы, поэтому на карточке всегда WCC-логотип.

## Что делаем

### 1. Миграция БД
- Верифицировать застрявшую запись текущего минта (`UPDATE is_verified=true` для `mint_address = '4jGVoY5kC3b4cLZ5E6NnKq3WtqgoQF9EHKe7N7s5qSbY'`).
- Добавить колонку `skin_kind text` в `minted_themes` со значениями `'wcc' | 'phantom'`, default `'wcc'` (чтобы все существующие НФТ остались с WCC-значком как сейчас).
- Для текущего минта проставить `skin_kind = 'phantom'`.

### 2. Mint flow (`src/components/wallet/ExportToIpfsButton.tsx`)
- При INSERT записи передавать `skin_kind` (из контекста кнопки минта — для Phantom-скинов будет `'phantom'`, для остальных `'wcc'`). Точное место определения типа скина уточнится при реализации (по тому, какой JSON загружен / какой store активен).
- В блоке после `confirmTransaction`: если confirm упал по таймауту — НЕ молча выходить, а сделать polling `getSignatureStatuses` (до 10 попыток × 3 сек). Если статус `finalized` без ошибки → всё равно выполнять `UPDATE is_verified=true`.

### 3. Self-healing в gallery (`src/components/wallet/MintedGallerySection.tsx`)
- При загрузке gallery: дополнительно фетчить записи `is_verified=false` старше 60 сек (но не старше 24 ч, чтобы не зацикливаться на безнадёжных).
- Для каждой такой записи делать `getSignatureStatuses([tx_sig])` через Solana RPC.
- Если `Ok + finalized` → `UPDATE is_verified=true` → запись автоматически попадает в видимый список после следующего рефетча (realtime-подписка на `minted_themes` уже есть и сама подхватит).

### 4. Карточка НФТ
- Заменить статичный WCC-логотип в нижнем-левом углу на условный значок:
  - `skin_kind === 'phantom'` → лого Phantom (`@/assets/phantom-logo.svg`)
  - иначе → WCC (как сейчас)
- Фильтр сверху "All / Phantom / MetaMask" остаётся, но логику фильтра Phantom расширить: показывать записи, у которых `skin_kind='phantom'` ИЛИ (в режиме совместимости) `blockchain='solana'`. Уточнится при реализации — возможно, лучше переключить чисто на `skin_kind`.

### 5. TypeScript fix (предусловие)
В прошлом ответе остались build-ошибки в `src/stores/phantomThemeStore.ts` (отсутствуют поля `shadow`, `filter`, `transform`, `letter_spacing`, `fontFamily`, `textTransform`, `textShadow`, `lineHeight` в типах). Нужно расширить типы, чтобы билд снова собирался.

## Тест после имплементации

1. Открыть gallery → твой минт `4jGVoY5kC3b4cLZ5E6NnKq3WtqgoQF9EHKe7N7s5qSbY` появляется со значком **Phantom**.
2. Фильтр "Phantom" в баре над сеткой показывает его (и любые будущие phantom-скины).
3. Сделать новый Phantom-минт → даже если confirm в браузере таймаутит, через ~30 сек запись авто-верифицируется и появляется в gallery.

## Технические детали

- Миграция: `ALTER TABLE public.minted_themes ADD COLUMN skin_kind text NOT NULL DEFAULT 'wcc' CHECK (skin_kind IN ('wcc','phantom'));` + два UPDATE.
- Polling: `connection.getSignatureStatuses([sig], { searchTransactionHistory: true })`, проверка `value[0].confirmationStatus === 'finalized' && value[0].err === null`.
- Self-healing вызывается из `useEffect` один раз на mount, без блокировки UI.
- Никаких изменений в edge-функциях не нужно — вся логика на клиенте.
