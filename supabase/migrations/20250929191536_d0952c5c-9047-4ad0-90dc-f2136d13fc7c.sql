-- Auto-map all wallet_elements to their json_path in defaultTheme.json
-- This migration maps elements based on screen, type, category, and ID patterns

-- HOME LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/homeLayer/header/searchIcon' 
WHERE screen = 'home' AND id = 'home-search-icon';

UPDATE wallet_elements SET json_path = '/homeLayer/header/backgroundColor' 
WHERE screen = 'home' AND id = 'home-header-background';

UPDATE wallet_elements SET json_path = '/homeLayer/totalBalanceLabel' 
WHERE screen = 'home' AND id = 'home-balance-label';

UPDATE wallet_elements SET json_path = '/homeLayer/totalBalanceValue' 
WHERE screen = 'home' AND id = 'home-balance-value';

UPDATE wallet_elements SET json_path = '/homeLayer/actionButtons/sendButton' 
WHERE screen = 'home' AND id = 'home-send-button';

UPDATE wallet_elements SET json_path = '/homeLayer/actionButtons/receiveButton' 
WHERE screen = 'home' AND id = 'home-receive-button';

UPDATE wallet_elements SET json_path = '/homeLayer/actionButtons/buyButton' 
WHERE screen = 'home' AND id = 'home-buy-button';

UPDATE wallet_elements SET json_path = '/homeLayer/actionButtons/swapButton' 
WHERE screen = 'home' AND id = 'home-swap-button';

UPDATE wallet_elements SET json_path = '/homeLayer/accountDropdown' 
WHERE screen = 'home' AND id = 'home-account-dropdown-button';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/homeIcon' 
WHERE screen = 'home' AND id = 'home-nav-home-icon';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/appsIcon' 
WHERE screen = 'home' AND id = 'home-nav-apps-icon';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/swapIcon' 
WHERE screen = 'home' AND id = 'home-nav-swap-icon';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/historyIcon' 
WHERE screen = 'home' AND id = 'home-nav-history-icon';

UPDATE wallet_elements SET json_path = '/homeLayer/backgroundColor' 
WHERE screen = 'home' AND id = 'home-background';

-- BUY LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/buyLayer/header/backButton' 
WHERE screen = 'buy' AND id = 'buy-back-button';

UPDATE wallet_elements SET json_path = '/buyLayer/header/title' 
WHERE screen = 'buy' AND id = 'buy-title';

UPDATE wallet_elements SET json_path = '/buyLayer/sectionLabel/getStarted' 
WHERE screen = 'buy' AND id = 'buy-get-started-title';

UPDATE wallet_elements SET json_path = '/buyLayer/sectionLabel/popular' 
WHERE screen = 'buy' AND id = 'buy-popular-title';

UPDATE wallet_elements SET json_path = '/buyLayer/buyButton' 
WHERE screen = 'buy' AND (id = 'buy-solana-button' OR id = 'buy-ethereum-button' OR id = 'buy-bitcoin-button' OR id = 'buy-usdc-button');

UPDATE wallet_elements SET json_path = '/buyLayer/footer/closeButton' 
WHERE screen = 'buy' AND id = 'buy-close-button';

UPDATE wallet_elements SET json_path = '/buyLayer/headerContainer/backgroundColor' 
WHERE screen = 'buy' AND id = 'buy-header';

UPDATE wallet_elements SET json_path = '/buyLayer/centerContainer' 
WHERE screen = 'buy' AND id = 'buy-content';

-- SEND LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/sendLayer/header/backIcon' 
WHERE screen = 'send' AND id = 'send-back-button';

UPDATE wallet_elements SET json_path = '/sendLayer/header/title' 
WHERE screen = 'send' AND id = 'send-title';

UPDATE wallet_elements SET json_path = '/sendLayer/header/qrIcon' 
WHERE screen = 'send' AND id = 'send-qr-icon';

UPDATE wallet_elements SET json_path = '/sendLayer/selectNetworkLabel' 
WHERE screen = 'send' AND id = 'send-network-label';

UPDATE wallet_elements SET json_path = '/sendLayer/footer/closeButton' 
WHERE screen = 'send' AND id = 'send-close-button';

UPDATE wallet_elements SET json_path = '/sendLayer/centerContainer/backgroundColor' 
WHERE screen = 'send' AND id = 'send-content';

-- RECEIVE LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/receiveLayer/selectNetworkLabel' 
WHERE screen = 'receive' AND id = 'receive-network-label';

UPDATE wallet_elements SET json_path = '/receiveLayer/selectNetworkDescription' 
WHERE screen = 'receive' AND id = 'receive-network-description';

UPDATE wallet_elements SET json_path = '/receiveLayer/footer/closeButton' 
WHERE screen = 'receive' AND id = 'receive-close-button';

UPDATE wallet_elements SET json_path = '/receiveLayer/centerContainer/backgroundColor' 
WHERE screen = 'receive' AND id = 'receive-content';

-- APPS LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/appsLayer/title' 
WHERE screen = 'apps' AND id = 'apps-title';

UPDATE wallet_elements SET json_path = '/appsLayer/subtitle' 
WHERE screen = 'apps' AND id = 'apps-subtitle';

UPDATE wallet_elements SET json_path = '/appsLayer/collectibleCard' 
WHERE screen = 'apps' AND (type = 'container' OR category = 'container');

UPDATE wallet_elements SET json_path = '/appsLayer/collectibleName' 
WHERE screen = 'apps' AND id = 'apps-name';

-- SWAP LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/swapLayer/swapTitle' 
WHERE screen = 'swap' AND id = 'swap-title';

UPDATE wallet_elements SET json_path = '/swapLayer/settingsIcon' 
WHERE screen = 'swap' AND id = 'swap-settings-icon';

UPDATE wallet_elements SET json_path = '/swapLayer/fromContainer' 
WHERE screen = 'swap' AND id = 'swap-from-container';

UPDATE wallet_elements SET json_path = '/swapLayer/toContainer' 
WHERE screen = 'swap' AND id = 'swap-to-container';

UPDATE wallet_elements SET json_path = '/swapLayer/arrowIcon' 
WHERE screen = 'swap' AND id = 'swap-arrow-icon';

UPDATE wallet_elements SET json_path = '/swapLayer/swapButton' 
WHERE screen = 'swap' AND id = 'swap-button';

UPDATE wallet_elements SET json_path = '/swapLayer/reviewButton' 
WHERE screen = 'swap' AND id = 'swap-review-button';

-- HISTORY LAYER ELEMENTS  
UPDATE wallet_elements SET json_path = '/historyLayer/title' 
WHERE screen = 'history' AND id = 'history-title';

UPDATE wallet_elements SET json_path = '/historyLayer/dateLabel' 
WHERE screen = 'history' AND type = 'text' AND category = 'text';

UPDATE wallet_elements SET json_path = '/historyLayer/statusColors' 
WHERE screen = 'history' AND id LIKE '%status%';

-- SEARCH LAYER ELEMENTS
UPDATE wallet_elements SET json_path = '/searchLayer/searchInput' 
WHERE screen = 'search' AND type = 'input';

UPDATE wallet_elements SET json_path = '/searchLayer/recentSearches' 
WHERE screen = 'search' AND id LIKE '%recent%';

UPDATE wallet_elements SET json_path = '/searchLayer/trendingLabel' 
WHERE screen = 'search' AND id LIKE '%trending%';

-- GLOBAL ELEMENTS
UPDATE wallet_elements SET json_path = '/globalSearchInput' 
WHERE screen = 'global' AND id = 'global-search-input';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/homeIcon' 
WHERE screen = 'global' AND id = 'nav-home-tab';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/appsIcon' 
WHERE screen = 'global' AND id = 'nav-apps-tab';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/swapIcon' 
WHERE screen = 'global' AND id = 'nav-swap-tab';

UPDATE wallet_elements SET json_path = '/homeLayer/footer/navigationIcons/historyIcon' 
WHERE screen = 'global' AND id = 'nav-history-tab';

UPDATE wallet_elements SET json_path = '/sidebarLayer' 
WHERE screen = 'global' AND id LIKE 'sidebar%';

UPDATE wallet_elements SET json_path = '/lockLayer' 
WHERE screen = 'global' AND id LIKE 'lock%';

-- Generic mapping for unmapped icons based on their location
UPDATE wallet_elements SET json_path = CONCAT('/', screen, 'Layer/icons/', REPLACE(id, screen || '-', ''))
WHERE json_path IS NULL 
  AND type = 'icon' 
  AND screen != 'global'
  AND customizable = true;

-- Generic mapping for unmapped buttons based on screen
UPDATE wallet_elements SET json_path = CONCAT('/', screen, 'Layer/buttons/', REPLACE(id, screen || '-', ''))
WHERE json_path IS NULL 
  AND type = 'button' 
  AND screen != 'global'
  AND customizable = true;

-- Add comment explaining the mapping strategy
COMMENT ON COLUMN wallet_elements.json_path IS 
'JSON pointer path to this element in defaultTheme.json structure. 
Format: /layerName/section/propertyName (e.g., /homeLayer/actionButtons/sendButton)
Mapped automatically based on screen, type, category, and element ID patterns.';