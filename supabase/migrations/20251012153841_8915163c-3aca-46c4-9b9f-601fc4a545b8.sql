-- Comprehensive JSON Path Fix: Convert ALL object paths to scalar paths
-- Phase 4 Extended: Fix all remaining wallet_elements to use scalar json_path values
-- Reference: docs/json-path-validation-report.md

-- ============================================================================
-- APPS LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/appsLayer/collectibleCard/backgroundColor',
    updated_at = NOW()
WHERE id = 'apps-content';

UPDATE wallet_elements 
SET json_path = '/appsLayer/collectibleCard/backgroundColor',
    updated_at = NOW()
WHERE id = 'apps-grid';

UPDATE wallet_elements 
SET json_path = '/appsLayer/collectibleCard/backgroundColor',
    updated_at = NOW()
WHERE id = 'apps-item';

UPDATE wallet_elements 
SET json_path = '/appsLayer/collectibleName/textColor',
    updated_at = NOW()
WHERE id = 'apps-name';

-- ============================================================================
-- BUY LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/buyLayer/header/backButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-back-button';

UPDATE wallet_elements 
SET json_path = '/assetCard/description/textColor',
    updated_at = NOW()
WHERE id = 'buy-bitcoin-description';

UPDATE wallet_elements 
SET json_path = '/assetCard/title/textColor',
    updated_at = NOW()
WHERE id = 'buy-bitcoin-name';

UPDATE wallet_elements 
SET json_path = '/assetCard/description/textColor',
    updated_at = NOW()
WHERE id = 'buy-ethereum-description';

UPDATE wallet_elements 
SET json_path = '/assetCard/title/textColor',
    updated_at = NOW()
WHERE id = 'buy-ethereum-name';

UPDATE wallet_elements 
SET json_path = '/buyLayer/sectionLabel/getStarted/textColor',
    updated_at = NOW()
WHERE id = 'buy-get-started-title';

UPDATE wallet_elements 
SET json_path = '/buyLayer/centerContainer/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-content';

UPDATE wallet_elements 
SET json_path = '/buyLayer/buyButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-bitcoin-button';

UPDATE wallet_elements 
SET json_path = '/buyLayer/buyButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-ethereum-button';

UPDATE wallet_elements 
SET json_path = '/buyLayer/buyButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-solana-button';

UPDATE wallet_elements 
SET json_path = '/buyLayer/buyButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'buy-usdc-button';

UPDATE wallet_elements 
SET json_path = '/buyLayer/header/title/textColor',
    updated_at = NOW()
WHERE id = 'buy-title';

-- ============================================================================
-- NAVIGATION TABS
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/navigationIcons/appsIcon/color',
    updated_at = NOW()
WHERE id = 'nav-apps-tab';

UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/navigationIcons/historyIcon/color',
    updated_at = NOW()
WHERE id = 'nav-history-tab';

UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/navigationIcons/homeIcon/color',
    updated_at = NOW()
WHERE id = 'nav-home-tab';

UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/navigationIcons/swapIcon/color',
    updated_at = NOW()
WHERE id = 'nav-swap-tab';

-- ============================================================================
-- HISTORY LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/historyLayer/activityDate/textColor',
    updated_at = NOW()
WHERE id = 'history-transaction-date';

UPDATE wallet_elements 
SET json_path = '/historyLayer/activityStatus/successColor',
    updated_at = NOW()
WHERE id = 'history-transaction-status';

-- Note: history-transaction-amount uses same as date for now
UPDATE wallet_elements 
SET json_path = '/historyLayer/activityDate/textColor',
    updated_at = NOW()
WHERE id = 'history-transaction-amount';

-- ============================================================================
-- HOME LAYER (if not already fixed)
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/assetCard/title/textColor',
    updated_at = NOW()
WHERE id = 'home-asset-name' AND json_path != '/assetCard/title/textColor';

UPDATE wallet_elements 
SET json_path = '/assetCard/description/textColor',
    updated_at = NOW()
WHERE id = 'home-asset-symbol' AND json_path != '/assetCard/description/textColor';

UPDATE wallet_elements 
SET json_path = '/assetCard/value/textColor',
    updated_at = NOW()
WHERE id = 'home-asset-value' AND json_path != '/assetCard/value/textColor';

UPDATE wallet_elements 
SET json_path = '/homeLayer/totalBalanceChange/positiveColor',
    updated_at = NOW()
WHERE id = 'home-balance-change' AND json_path != '/homeLayer/totalBalanceChange/positiveColor';

UPDATE wallet_elements 
SET json_path = '/homeLayer/totalBalanceLabel/textColor',
    updated_at = NOW()
WHERE id = 'home-balance-label' AND json_path != '/homeLayer/totalBalanceLabel/textColor';

UPDATE wallet_elements 
SET json_path = '/homeLayer/totalBalanceValue/textColor',
    updated_at = NOW()
WHERE id = 'home-balance-value' AND json_path != '/homeLayer/totalBalanceValue/textColor';

UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/backgroundColor',
    updated_at = NOW()
WHERE id = 'home-footer' AND json_path != '/homeLayer/footer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/homeLayer/header/backgroundColor',
    updated_at = NOW()
WHERE id = 'home-header' AND json_path != '/homeLayer/header/backgroundColor';

-- ============================================================================
-- LOCK LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/lockLayer/backgroundColor',
    updated_at = NOW()
WHERE id = 'lock-background' AND json_path != '/lockLayer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/lockLayer/forgotPassword/textColor',
    updated_at = NOW()
WHERE id = 'lock-forgot-password' AND json_path != '/lockLayer/forgotPassword/textColor';

UPDATE wallet_elements 
SET json_path = '/lockLayer/passwordInput/backgroundColor',
    updated_at = NOW()
WHERE id = 'lock-password-input' AND json_path != '/lockLayer/passwordInput/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/lockLayer/title/textColor',
    updated_at = NOW()
WHERE id = 'lock-title' AND json_path != '/lockLayer/title/textColor';

UPDATE wallet_elements 
SET json_path = '/lockLayer/unlockButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'lock-unlock-button' AND json_path != '/lockLayer/unlockButton/backgroundColor';

-- ============================================================================
-- SEARCH LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/searchLayer/searchInput/backgroundColor',
    updated_at = NOW()
WHERE id = 'search-input' AND json_path != '/searchLayer/searchInput/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/searchLayer/recentSearchesLabel/textColor',
    updated_at = NOW()
WHERE id = 'search-recent-label' AND json_path != '/searchLayer/recentSearchesLabel/textColor';

UPDATE wallet_elements 
SET json_path = '/searchLayer/trendingLabel/textColor',
    updated_at = NOW()
WHERE id = 'search-trending-label' AND json_path != '/searchLayer/trendingLabel/textColor';

-- ============================================================================
-- SEND LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/sendLayer/header/backIcon/color',
    updated_at = NOW()
WHERE id = 'send-back-button' AND json_path != '/sendLayer/header/backIcon/color';

UPDATE wallet_elements 
SET json_path = '/sendLayer/footer/closeButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'send-close-button' AND json_path != '/sendLayer/footer/closeButton/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/sendLayer/header/qrIcon/color',
    updated_at = NOW()
WHERE id = 'send-qr-icon' AND json_path != '/sendLayer/header/qrIcon/color';

UPDATE wallet_elements 
SET json_path = '/sendLayer/header/title/textColor',
    updated_at = NOW()
WHERE id = 'send-title' AND json_path != '/sendLayer/header/title/textColor';

-- ============================================================================
-- SIDEBAR LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/center/accountList/accountAddress/textColor',
    updated_at = NOW()
WHERE id = 'sidebar-account-address' AND json_path != '/sidebarLayer/center/accountList/accountAddress/textColor';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/center/accountList/accountName/textColor',
    updated_at = NOW()
WHERE id = 'sidebar-account-name' AND json_path != '/sidebarLayer/center/accountList/accountName/textColor';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/center/accountList/avatar/backgroundColor',
    updated_at = NOW()
WHERE id = 'sidebar-avatar' AND json_path != '/sidebarLayer/center/accountList/avatar/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/header/closeIcon/color',
    updated_at = NOW()
WHERE id = 'sidebar-close-icon' AND json_path != '/sidebarLayer/header/closeIcon/color';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/footer/footerIcons/editIcon/color',
    updated_at = NOW()
WHERE id = 'sidebar-edit-icon' AND json_path != '/sidebarLayer/footer/footerIcons/editIcon/color';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/footer/backgroundColor',
    updated_at = NOW()
WHERE id = 'sidebar-footer' AND json_path != '/sidebarLayer/footer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/header/backgroundColor',
    updated_at = NOW()
WHERE id = 'sidebar-header' AND json_path != '/sidebarLayer/header/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/footer/footerIcons/settingsIcon/color',
    updated_at = NOW()
WHERE id = 'sidebar-settings-icon' AND json_path != '/sidebarLayer/footer/footerIcons/settingsIcon/color';

UPDATE wallet_elements 
SET json_path = '/sidebarLayer/header/accountTitle/textColor',
    updated_at = NOW()
WHERE id = 'sidebar-title' AND json_path != '/sidebarLayer/header/accountTitle/textColor';

-- ============================================================================
-- SWAP LAYER
-- ============================================================================

UPDATE wallet_elements 
SET json_path = '/swapLayer/arrowIcon/color',
    updated_at = NOW()
WHERE id = 'swap-arrow-icon' AND json_path != '/swapLayer/arrowIcon/color';

UPDATE wallet_elements 
SET json_path = '/swapLayer/swapActionButton/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-button' AND json_path != '/swapLayer/swapActionButton/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/mainContainer/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-container' AND json_path != '/swapLayer/mainContainer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/fromBalance/textColor',
    updated_at = NOW()
WHERE id = 'swap-from-balance' AND json_path != '/swapLayer/fromBalance/textColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/fromCoinTag/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-from-coin' AND json_path != '/swapLayer/fromCoinTag/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/fromContainer/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-from-container' AND json_path != '/swapLayer/fromContainer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/fromLabel/textColor',
    updated_at = NOW()
WHERE id = 'swap-from-label' AND json_path != '/swapLayer/fromLabel/textColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/settingsIcon/color',
    updated_at = NOW()
WHERE id = 'swap-settings-icon' AND json_path != '/swapLayer/settingsIcon/color';

UPDATE wallet_elements 
SET json_path = '/swapLayer/swapTitle/textColor',
    updated_at = NOW()
WHERE id = 'swap-title' AND json_path != '/swapLayer/swapTitle/textColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/toBalance/textColor',
    updated_at = NOW()
WHERE id = 'swap-to-balance' AND json_path != '/swapLayer/toBalance/textColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/toCoinTag/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-to-coin' AND json_path != '/swapLayer/toCoinTag/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/toContainer/backgroundColor',
    updated_at = NOW()
WHERE id = 'swap-to-container' AND json_path != '/swapLayer/toContainer/backgroundColor';

UPDATE wallet_elements 
SET json_path = '/swapLayer/toLabel/textColor',
    updated_at = NOW()
WHERE id = 'swap-to-label' AND json_path != '/swapLayer/toLabel/textColor';