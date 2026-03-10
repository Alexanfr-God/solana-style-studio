

## Анализ цепочки Buy / Escrow / Auction — найденные баги

### Критический баг 1: `getEscrowKeypair` не экспортирован

В `supabase/functions/auction/utils/solana.ts` функция `getEscrowKeypair` объявлена как `function getEscrowKeypair()` (без `export`), но импортируется в:
- `handlers/bid.ts` (строка 13)
- `handlers/finalize.ts` (строка 9)

Это вызовет runtime ошибку при любом вызове bid или finalize.

**Исправление:** добавить `export` к `getEscrowKeypair`.

---

### Критический баг 2: Несовместимый формат парсинга `escrow_wallet`

Две функции парсят секрет `escrow_wallet` **по-разному**:

| Файл | Метод | Ожидаемый формат |
|------|-------|-----------------|
| `auction/utils/solana.ts` (строка 43) | `JSON.parse()` → `Uint8Array` | JSON массив чисел `[1,2,3...]` |
| `get-escrow-pubkey/index.ts` (строка 30) | `bs58.decode()` | Base58 строка |

Один из них **гарантированно падает** в зависимости от того, в каком формате хранится секрет.

**Исправление:** унифицировать парсинг — сначала пробовать JSON.parse, если не получилось — bs58.decode. Применить одинаковую логику во всех файлах.

---

### Критический баг 3: `fetchWithHeaders` не экспортируется из `database.ts`

В `finalize.ts` строка 170:
```typescript
const { fetchWithHeaders } = await import('../utils/database.ts');
```

Но в `database.ts` **нет функции `fetchWithHeaders`**. Все функции используют локальную переменную `headers` напрямую. Refund всех проигравших биддеров **всегда падает**.

**Исправление:** добавить экспортируемую функцию `fetchWithHeaders` в `database.ts`.

---

### Критический баг 4: `useNftEscrow` использует пустой `ESCROW_WALLET`

В `src/hooks/useNftEscrow.ts` строка 62:
```typescript
const escrowPubkey = new PublicKey(MARKETPLACE_CONFIG.ESCROW_WALLET);
```

Но `MARKETPLACE_CONFIG.ESCROW_WALLET = ''` (пустая строка). Это вызывает ошибку `Invalid public key input` при каждом вызове escrow.

Нужно использовать `ESCROW_WALLET_PUBLIC_KEY` вместо `ESCROW_WALLET`.

---

### Баг 5: `transferSOLPayment` — фиктивная функция

В `solana.ts` строки 216-221: `transferSOLPayment` НЕ отправляет реальную транзакцию, а возвращает фейковую подпись. Транзакция создается с `feePayer = winnerPubkey`, но подписывается только escrow. Winner никогда не подписывает.

Это архитектурная проблема — при аукционе SOL уже лежит в escrow (биддер перевел при размещении ставки), поэтому при финализации escrow должен распределить SOL, а не winner.

**Исправление:** переписать `transferSOLPayment` чтобы escrow (у которого есть keypair) отправлял SOL продавцу из своего баланса.

---

### Баг 6: `nft_bids` таблица — нет RLS для UPDATE

Refund-логика пытается делать `PATCH` на `nft_bids`, но RLS не позволяет UPDATE. Однако используется `service_role_key`, поэтому RLS обходится. Это ОК.

---

### План исправлений

#### Файл 1: `supabase/functions/auction/utils/solana.ts`
- Экспортировать `getEscrowKeypair`
- Унифицировать парсинг ключа (JSON + bs58 fallback)
- Переписать `transferSOLPayment`: escrow платит продавцу из своего баланса

#### Файл 2: `supabase/functions/auction/utils/database.ts`
- Добавить экспортируемую функцию `fetchWithHeaders`

#### Файл 3: `supabase/functions/get-escrow-pubkey/index.ts`
- Унифицировать парсинг ключа (JSON + bs58 fallback)

#### Файл 4: `src/hooks/useNftEscrow.ts`
- Заменить `MARKETPLACE_CONFIG.ESCROW_WALLET` на `MARKETPLACE_CONFIG.ESCROW_WALLET_PUBLIC_KEY`

#### Файл 5: `src/config/marketplace.ts`
- Удалить мертвые поля `PLATFORM_FEE_WALLET` и `ESCROW_WALLET` (пустые строки, вводят в заблуждение)

