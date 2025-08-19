
// Единый источник правды для фичефлагов (клиент + сервер)
// Читает переменные окружения и возвращает валидированные boolean значения

// Определяем среду выполнения
const isServer = typeof Deno !== 'undefined';
const isClient = typeof window !== 'undefined';

// Функция для безопасного чтения переменных окружения
const getEnvFlag = (clientKey: string, serverKey: string, defaultValue: boolean = false): boolean => {
  if (isServer) {
    // Серверная среда (Deno/Edge Functions)
    const value = Deno.env.get(serverKey);
    return value === 'true';
  } else if (isClient) {
    // Клиентская среда (Vite)
    const value = import.meta.env[clientKey];
    return value === 'true';
  }
  return defaultValue;
};

// Экспорт централизованных флагов
export const FLAGS = {
  ASSETS_ENABLED: getEnvFlag('VITE_ASSETS_ENABLED', 'ASSETS_ENABLED', false),
  ICON_LIB_ENABLED: getEnvFlag('VITE_ICON_LIB_ENABLED', 'ICON_LIB_ENABLED', false),
  AI_LOGS_ENABLED: getEnvFlag('VITE_AI_LOGS_ENABLED', 'AI_LOGS_ENABLED', false)
} as const;

// Типы для TypeScript
export type FeatureFlags = typeof FLAGS;

// Утилиты для проверки флагов
export const isAssetsEnabled = (): boolean => FLAGS.ASSETS_ENABLED;
export const isIconLibEnabled = (): boolean => FLAGS.ICON_LIB_ENABLED;
export const isAiLogsEnabled = (): boolean => FLAGS.AI_LOGS_ENABLED;

// Логирование состояния флагов (только в dev режиме)
if (isClient && import.meta.env.DEV) {
  console.log('🎛️ Feature Flags:', FLAGS);
}

// Экспорт для обратной совместимости
export const THEME_SOT_IS_ZUSTAND = true;
