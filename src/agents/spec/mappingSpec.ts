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
  'home-asset-item': '/assetCard/backgroundColor',
  'home-asset-name': '/assetCard/title/textColor',
  'home-asset-symbol': '/assetCard/description/textColor',
  'home-asset-value': '/assetCard/value/textColor',
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
  'home-swap-label': '/homeLayer/actionButtons/swapButton/labelColor'
};

export const mappingSpec: Record<'lock' | 'home', Record<string, string>> = {
  lock: LOCK_SCREEN_SPEC,
  home: HOME_SCREEN_SPEC
};
