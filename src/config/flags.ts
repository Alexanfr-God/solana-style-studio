
import { FLAGS, isAssetsEnabled, isIconLibEnabled, isAiLogsEnabled } from './featureFlags';

// Сохраняем существующие флаги
export const THEME_SOT_IS_ZUSTAND = true;

// Экспорт для обратной совместимости с устаревшими импортами
export const ASSETS_ENABLED = FLAGS.ASSETS_ENABLED;
export const ICON_LIB_ENABLED = FLAGS.ICON_LIB_ENABLED;

// Реэкспорт из единого источника для обратной совместимости
export { FLAGS, isAssetsEnabled, isIconLibEnabled, isAiLogsEnabled };
