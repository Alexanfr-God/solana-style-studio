/**
 * Mapping Specification: data-element-id → SCALAR json_path
 * 
 * ONE-PATH MODE: Each element maps to exactly ONE scalar value in Theme JSON.
 * Runtime engine (runtimeMappingEngine.ts) applies these values automatically.
 */

export const LOCK_SCREEN_SPEC: Record<string, string> = {
  'unlock-screen-container': '/lockLayer/backgroundColor',
  'unlock-screen-background-image': '/lockLayer/backgroundImage',
  'lock-title-text': '/lockLayer/title/textColor',
  'lock-password-input-bg': '/lockLayer/passwordInput/backgroundColor',
  'lock-password-input-text': '/lockLayer/passwordInput/textColor',
  'lock-password-input-icon-eye': '/lockLayer/passwordInput/iconEyeColor',
  'lock-forgot-password-text': '/lockLayer/forgotPassword/textColor',
  'lock-unlock-button-bg': '/lockLayer/unlockButton/backgroundColor',
  'lock-unlock-button-text': '/lockLayer/unlockButton/textColor'
};

export const HOME_SCREEN_SPEC: Record<string, string> = {
  // --- Action buttons: containers, icons, labels ---
  'home-send-button': '/homeLayer/actionButtons/sendButton/containerColor',
  'home-send-icon': '/homeLayer/actionButtons/sendButton/iconColor',
  'home-send-label': '/homeLayer/actionButtons/sendButton/labelColor',

  'home-receive-button': '/homeLayer/actionButtons/receiveButton/containerColor',
  'home-receive-icon': '/homeLayer/actionButtons/receiveButton/iconColor',
  'home-receive-label': '/homeLayer/actionButtons/receiveButton/labelColor',

  'home-buy-button': '/homeLayer/actionButtons/buyButton/containerColor',
  'home-buy-icon': '/homeLayer/actionButtons/buyButton/iconColor',
  'home-buy-label': '/homeLayer/actionButtons/buyButton/labelColor',

  'home-swap-button': '/homeLayer/actionButtons/swapButton/containerColor',
  'home-swap-icon': '/homeLayer/actionButtons/swapButton/iconColor',
  'home-swap-label': '/homeLayer/actionButtons/swapButton/labelColor',

  // --- Алиасы для тех же иконок с префиксом action-* (DOM может содержать оба варианта) ---
  'action-send-icon': '/homeLayer/actionButtons/sendButton/iconColor',
  'action-receive-icon': '/homeLayer/actionButtons/receiveButton/iconColor',
  'action-buy-icon': '/homeLayer/actionButtons/buyButton/iconColor',
  'action-swap-main': '/homeLayer/actionButtons/swapButton/iconColor',

  // --- Header & main ---
  'home-header-container': '/homeLayer/header/backgroundColor',
  'header-search-icon': '/homeLayer/header/searchIcon/color',

  // --- Totals ---
  'home-total-balance-label': '/homeLayer/totalBalanceLabel/textColor',
  'home-usd-value': '/homeLayer/totalBalanceValue/textColor',
  'home-sol-amount': '/homeLayer/totalBalanceValue/textColor',

  // --- Assets / карточки ---
  'home-asset-item': '/assetCard/backgroundColor',
  'home-asset-name': '/assetCard/title/textColor',
  'home-asset-symbol': '/assetCard/description/textColor',
  'home-asset-value': '/assetCard/value/textColor',
  'home-asset-icon': '/assetCard/icon/color',

  // --- See all ---
  'home-see-all-button': '/homeLayer/seeAll/textColor',

  // --- Контейнеры контента ---
  'home-content-container': '/homeLayer/mainContainer/backgroundColor',

  // --- Account dropdown (только scalar) ---
  'home-account-dropdown-button': '/homeLayer/accountDropdown/containerBackgroundColor',
  
  // --- Search button (header icon) ---
  'home-search-button': '/homeLayer/header/searchIcon/color'
};

export const mappingSpec: Record<'lock' | 'home', Record<string, string>> = {
  lock: LOCK_SCREEN_SPEC,
  home: HOME_SCREEN_SPEC
};
