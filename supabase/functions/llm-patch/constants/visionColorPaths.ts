// Строгий whitelist путей для Vision-анализа цветов
// Только replace операции, без add/remove

export interface VisionColorPaths {
  centerBackgrounds: string[];
  secondaryBackgrounds: string[];
  textColors: string[];
  accentColors: string[];
}

// Центральные фоны (эксклюзивность с backgroundImage)
const CENTER_BACKGROUNDS = [
  '/lockLayer/backgroundColor',
  '/homeLayer/backgroundColor', 
  '/receiveLayer/centerContainer/backgroundColor',
  '/sendLayer/centerContainer/backgroundColor',
  '/buyLayer/centerContainer/backgroundColor'
];

// Вторичные поверхности (прозрачные участки/карточки)
const SECONDARY_BACKGROUNDS = [
  '/homeLayer/header/backgroundColor',
  '/homeLayer/footer/backgroundColor',
  '/homeLayer/mainContainer/backgroundColor',
  '/assetCard/backgroundColor'
];

// Текстовые цвета (контраст к фону)
const TEXT_COLORS = [
  '/lockLayer/title/textColor',
  '/lockLayer/forgotPassword/textColor',
  '/lockLayer/unlockButton/textColor',
  '/homeLayer/totalBalanceLabel/textColor',
  '/homeLayer/totalBalanceValue/textColor',
  '/homeLayer/totalBalanceChange/zeroColor',
  '/homeLayer/header/textColor',
  '/homeLayer/footer/textColor',
  '/homeLayer/footer/activeTextColor',
  '/sendLayer/selectNetworkLabel/textColor',
  '/sendLayer/selectNetworkDescription/textColor',
  '/sendLayer/emptyState/textColor'
];

// Акцентные поверхности (кнопки/активные)
const ACCENT_COLORS = [
  '/homeLayer/actionButtons/receiveButton/containerColor',
  '/homeLayer/actionButtons/sendButton/containerColor',
  '/homeLayer/actionButtons/buyButton/containerColor',
  '/lockLayer/unlockButton/backgroundColor',
  '/buyLayer/buyButton/backgroundColor',
  '/sendLayer/footer/closeButton/backgroundColor',
  '/buyLayer/footer/closeButton/backgroundColor',
  '/homeLayer/footer/activeIconColor',
  '/homeLayer/footer/activeTextColor'
];

export const VISION_COLOR_PATHS: VisionColorPaths = {
  centerBackgrounds: CENTER_BACKGROUNDS,
  secondaryBackgrounds: SECONDARY_BACKGROUNDS,
  textColors: TEXT_COLORS,
  accentColors: ACCENT_COLORS
};

// Пути которые нужно проверить на наличие backgroundImage перед изменением backgroundColor
export const IMAGE_PROTECTED_PATHS = [
  '/lockLayer',
  '/homeLayer',
  '/receiveLayer/centerContainer', 
  '/sendLayer/centerContainer',
  '/buyLayer/centerContainer'
];

// Получить все разрешенные пути для Vision-анализа
export function getAllowedVisionPaths(): string[] {
  return [
    ...VISION_COLOR_PATHS.centerBackgrounds,
    ...VISION_COLOR_PATHS.secondaryBackgrounds,
    ...VISION_COLOR_PATHS.textColors,
    ...VISION_COLOR_PATHS.accentColors
  ];
}

// Проверить, разрешен ли путь для Vision-анализа
export function isAllowedVisionPath(path: string): boolean {
  return getAllowedVisionPaths().includes(path);
}