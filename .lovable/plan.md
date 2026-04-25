# Исправление ошибки разрешения `@solana/spl-token` в Vite

## Проблема
Vite dev server падает с ошибкой `Failed to resolve import "@solana/spl-token"` при импорте из файла `src/hooks/useNftEscrow.ts`. Пакет установлен (`node_modules/@solana/spl-token`), но не предоптимизирован Vite, поэтому ESM-exports не разрешаются корректно.

## Решение

### Шаг 1 — Добавить пакет в `optimizeDeps.include`
В `vite.config.ts` добавить `@solana/spl-token` в список `include` в секции `optimizeDeps`, чтобы Vite заранее собрал и разрешил модуль:

```ts
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'zustand',
    'use-sync-external-store',
    '@tanstack/react-query',
    '@solana/wallet-adapter-react',
    '@solana/wallet-adapter-base',
    '@solana/web3.js',
    '@solana/spl-token',        // <-- ДОБАВИТЬ
    'buffer',
    'process',
  ],
  // ... остальное без изменений
}
```

### Шаг 2 — Очистить кеш Vite и перезапустить dev server
Удалить `.vite` кеш и перезапустить dev server, чтобы Vite пересобрал зависимости с новым `include`:

```bash
rm -rf node_modules/.vite
```

### Шаг 3 — Проверить разрешение импорта
После перезапуска импорт в `src/hooks/useNftEscrow.ts` должен разрешаться без ошибок:

```ts
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from "@solana/spl-token";
```

## Файлы для изменения
- `vite.config.ts` — добавить `@solana/spl-token` в `optimizeDeps.include`

## Проверка после фикса
- Оверлей ошибки Vite исчезает
- Приложение загружается корректно
- Навигация на страницы, использующие `useNftEscrow`, работает без сборочных ошибок