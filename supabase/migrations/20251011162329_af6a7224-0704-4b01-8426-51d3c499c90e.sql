-- Phase 1: Fill missing json_path for critical elements
-- Home Screen (15 elements)
UPDATE wallet_elements SET json_path = '/assetCard/container' WHERE id = 'home-asset-item';
UPDATE wallet_elements SET json_path = '/header/container' WHERE id = 'home-header-container';
UPDATE wallet_elements SET json_path = '/balance/primary' WHERE id = 'home-balance';
UPDATE wallet_elements SET json_path = '/balance/secondary' WHERE id = 'home-sol-amount';
UPDATE wallet_elements SET json_path = '/sendButton/label' WHERE id = 'home-send-label';
UPDATE wallet_elements SET json_path = '/receiveButton/label' WHERE id = 'home-receive-label';
UPDATE wallet_elements SET json_path = '/swapButton/label' WHERE id = 'home-swap-label';
UPDATE wallet_elements SET json_path = '/buyButton/label' WHERE id = 'home-buy-label';
UPDATE wallet_elements SET json_path = '/assetCard/title' WHERE id = 'home-asset-name';
UPDATE wallet_elements SET json_path = '/assetCard/value' WHERE id = 'home-asset-value';
UPDATE wallet_elements SET json_path = '/assetCard/subtitle' WHERE id = 'home-asset-amount';
UPDATE wallet_elements SET json_path = '/header/avatar/border' WHERE id = 'home-user-avatar';
UPDATE wallet_elements SET json_path = '/actionButtons/container' WHERE id = 'home-action-buttons';
UPDATE wallet_elements SET json_path = '/assetList/divider' WHERE id = 'home-asset-divider';
UPDATE wallet_elements SET json_path = '/header/searchIcon' WHERE id = 'home-search-icon';

-- Receive Screen (7 elements)
UPDATE wallet_elements SET json_path = '/receive/container' WHERE id = 'receive-address-container';
UPDATE wallet_elements SET json_path = '/receive/addressText' WHERE id = 'receive-address';
UPDATE wallet_elements SET json_path = '/receive/title' WHERE id = 'receive-title';
UPDATE wallet_elements SET json_path = '/receive/qrContainer' WHERE id = 'receive-qr-container';
UPDATE wallet_elements SET json_path = '/receive/copyButton/container' WHERE id = 'receive-copy-button';
UPDATE wallet_elements SET json_path = '/receive/copyButton/icon' WHERE id = 'receive-copy-icon';
UPDATE wallet_elements SET json_path = '/receive/copyButton/label' WHERE id = 'receive-copy-label';

-- Buy Screen (12 elements)
UPDATE wallet_elements SET json_path = '/buy/container' WHERE id = 'buy-container';
UPDATE wallet_elements SET json_path = '/buy/search/input' WHERE id = 'buy-search';
UPDATE wallet_elements SET json_path = '/buy/popular/container' WHERE id = 'buy-popular-container';
UPDATE wallet_elements SET json_path = '/buy/popular/title' WHERE id = 'buy-popular-title';
UPDATE wallet_elements SET json_path = '/buy/assetItem/container' WHERE id = 'buy-asset-item';
UPDATE wallet_elements SET json_path = '/buy/assetItem/name' WHERE id = 'buy-asset-name';
UPDATE wallet_elements SET json_path = '/buy/assetItem/price' WHERE id = 'buy-asset-price';
UPDATE wallet_elements SET json_path = '/buy/assetItem/change' WHERE id = 'buy-asset-change';
UPDATE wallet_elements SET json_path = '/buy/assetItem/icon' WHERE id = 'buy-asset-icon';
UPDATE wallet_elements SET json_path = '/buy/list/container' WHERE id = 'buy-list-container';
UPDATE wallet_elements SET json_path = '/buy/search/icon' WHERE id = 'buy-search-icon';
UPDATE wallet_elements SET json_path = '/buy/assetItem/divider' WHERE id = 'buy-asset-divider';

-- Swap Screen (4 elements)
UPDATE wallet_elements SET json_path = '/swap/container' WHERE id = 'swap-container';
UPDATE wallet_elements SET json_path = '/swap/fromToken/container' WHERE id = 'swap-from-container';
UPDATE wallet_elements SET json_path = '/swap/toToken/container' WHERE id = 'swap-to-container';
UPDATE wallet_elements SET json_path = '/swap/button/container' WHERE id = 'swap-button';

-- Send Screen (4 elements)
UPDATE wallet_elements SET json_path = '/send/container' WHERE id = 'send-container';
UPDATE wallet_elements SET json_path = '/send/input/container' WHERE id = 'send-input-container';
UPDATE wallet_elements SET json_path = '/send/amount/container' WHERE id = 'send-amount-container';
UPDATE wallet_elements SET json_path = '/send/button/container' WHERE id = 'send-button';

-- Update timestamps
UPDATE wallet_elements SET updated_at = now() WHERE json_path IS NOT NULL AND id IN (
  'home-asset-item', 'home-header-container', 'home-balance', 'home-sol-amount',
  'home-send-label', 'home-receive-label', 'home-swap-label', 'home-buy-label',
  'home-asset-name', 'home-asset-value', 'home-asset-amount', 'home-user-avatar',
  'home-action-buttons', 'home-asset-divider', 'home-search-icon',
  'receive-address-container', 'receive-address', 'receive-title', 'receive-qr-container',
  'receive-copy-button', 'receive-copy-icon', 'receive-copy-label',
  'buy-container', 'buy-search', 'buy-popular-container', 'buy-popular-title',
  'buy-asset-item', 'buy-asset-name', 'buy-asset-price', 'buy-asset-change',
  'buy-asset-icon', 'buy-list-container', 'buy-search-icon', 'buy-asset-divider',
  'swap-container', 'swap-from-container', 'swap-to-container', 'swap-button',
  'send-container', 'send-input-container', 'send-amount-container', 'send-button'
);