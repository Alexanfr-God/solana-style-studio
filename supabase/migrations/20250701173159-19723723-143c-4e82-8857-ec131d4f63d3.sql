
-- Add only the missing wallet screen elements (avoiding duplicates)
-- First, let's add the elements that don't exist yet

-- RECEIVE LAYER ELEMENTS (only new ones)
INSERT INTO public.wallet_elements (id, name, selector, screen, type, description, customizable, position, parent_element) 
SELECT * FROM (VALUES
-- Network selection
('receive-network-tabs', 'Network Tabs Container', 'receive-network-tabs', 'receive', 'container', 'Container for network selection tabs', true, 'top', null),
('receive-solana-tab', 'Solana Tab', 'receive-solana-tab', 'receive', 'button', 'Solana network tab', true, 'left', 'receive-network-tabs'),
('receive-ethereum-tab', 'Ethereum Tab', 'receive-ethereum-tab', 'receive', 'button', 'Ethereum network tab', true, 'right', 'receive-network-tabs'),

-- Address display
('receive-address-container', 'Address Container', 'receive-address-container', 'receive', 'container', 'Container for wallet address display', true, 'middle', null),
('receive-qr-code', 'QR Code', 'receive-qr-code', 'receive', 'image', 'QR code for wallet address', true, 'center', 'receive-address-container'),
('receive-address-text', 'Address Text', 'receive-address-text', 'receive', 'text', 'Wallet address text', true, 'bottom', 'receive-address-container'),
('receive-copy-button', 'Copy Address Button', 'receive-copy-button', 'receive', 'button', 'Button to copy wallet address', true, 'bottom', 'receive-address-container'),

-- Instructions
('receive-instructions', 'Instructions Container', 'receive-instructions', 'receive', 'container', 'Container for receive instructions', true, 'bottom', null),
('receive-warning-text', 'Warning Text', 'receive-warning-text', 'receive', 'text', 'Warning about network compatibility', true, 'bottom', 'receive-instructions'),

-- SEND LAYER ELEMENTS
-- Search and selection
('send-search-container', 'Search Container', 'send-search-container', 'send', 'container', 'Container for search functionality', true, 'top', null),
('send-search-input', 'Search Input', 'send-search-input', 'send', 'input', 'Search input field', true, 'center', 'send-search-container'),
('send-search-icon', 'Search Icon', 'send-search-icon', 'send', 'icon', 'Search icon', true, 'left', 'send-search-container'),

-- Token list
('send-token-list', 'Token List Container', 'send-token-list', 'send', 'container', 'Container for token selection list', true, 'middle', null),
('send-solana-item', 'Solana Item', 'send-solana-item', 'send', 'item', 'Solana token item', true, 'top', 'send-token-list'),
('send-solana-icon', 'Solana Icon', 'send-solana-icon', 'send', 'icon', 'Solana token icon', true, 'left', 'send-solana-item'),
('send-solana-name', 'Solana Name', 'send-solana-name', 'send', 'text', 'Solana token name', true, 'center', 'send-solana-item'),
('send-solana-balance', 'Solana Balance', 'send-solana-balance', 'send', 'text', 'Solana token balance', true, 'right', 'send-solana-item'),
('send-solana-price', 'Solana Price', 'send-solana-price', 'send', 'text', 'Solana token price', true, 'right', 'send-solana-item'),

('send-ethereum-item', 'Ethereum Item', 'send-ethereum-item', 'send', 'item', 'Ethereum token item', true, 'middle', 'send-token-list'),
('send-ethereum-icon', 'Ethereum Icon', 'send-ethereum-icon', 'send', 'icon', 'Ethereum token icon', true, 'left', 'send-ethereum-item'),
('send-ethereum-name', 'Ethereum Name', 'send-ethereum-name', 'send', 'text', 'Ethereum token name', true, 'center', 'send-ethereum-item'),
('send-ethereum-balance', 'Ethereum Balance', 'send-ethereum-balance', 'send', 'text', 'Ethereum token balance', true, 'right', 'send-ethereum-item'),
('send-ethereum-price', 'Ethereum Price', 'send-ethereum-price', 'send', 'text', 'Ethereum token price', true, 'right', 'send-ethereum-item'),

-- SWAP CONTENT ELEMENTS
('swap-container', 'Swap Container', 'swap-container', 'swap', 'container', 'Main container for swap interface', true, 'full', null),
('swap-settings-icon', 'Settings Icon', 'swap-settings-icon', 'swap', 'icon', 'Settings gear icon', true, 'top-right', 'swap-container'),

-- From section
('swap-from-container', 'From Container', 'swap-from-container', 'swap', 'container', 'Container for from token selection', true, 'top', 'swap-container'),
('swap-from-label', 'From Label', 'swap-from-label', 'swap', 'text', 'From label text', true, 'top-left', 'swap-from-container'),
('swap-from-input', 'From Input', 'swap-from-input', 'swap', 'input', 'From amount input field', true, 'center', 'swap-from-container'),
('swap-from-balance', 'From Balance', 'swap-from-balance', 'swap', 'text', 'From token balance display', true, 'bottom-right', 'swap-from-container'),

-- Swap arrow
('swap-arrow-container', 'Swap Arrow Container', 'swap-arrow-container', 'swap', 'container', 'Container for swap direction arrow', true, 'center', 'swap-container'),
('swap-arrow-icon', 'Swap Arrow Icon', 'swap-arrow-icon', 'swap', 'icon', 'Swap direction arrow icon', true, 'center', 'swap-arrow-container'),

-- To section
('swap-to-container', 'To Container', 'swap-to-container', 'swap', 'container', 'Container for to token selection', true, 'bottom', 'swap-container'),
('swap-to-label', 'To Label', 'swap-to-label', 'swap', 'text', 'To label text', true, 'top-left', 'swap-to-container'),
('swap-to-input', 'To Input', 'swap-to-input', 'swap', 'input', 'To amount input field', true, 'center', 'swap-to-container'),
('swap-to-balance', 'To Balance', 'swap-to-balance', 'swap', 'text', 'To token balance display', true, 'bottom-right', 'swap-to-container'),

-- Rate info
('swap-rate-container', 'Rate Container', 'swap-rate-container', 'swap', 'container', 'Container for exchange rate information', true, 'bottom', 'swap-container'),
('swap-rate-icon', 'Rate Icon', 'swap-rate-icon', 'swap', 'icon', 'Rate information icon', true, 'left', 'swap-rate-container'),
('swap-rate-text', 'Rate Text', 'swap-rate-text', 'swap', 'text', 'Exchange rate text', true, 'center', 'swap-rate-container'),

-- HISTORY CONTENT ELEMENTS
('history-container', 'History Container', 'history-container', 'history', 'container', 'Main container for transaction history', true, 'full', null),
('history-transaction-item', 'Transaction Item', 'history-transaction-item', 'history', 'item', 'Individual transaction item', true, 'middle', 'history-container'),
('history-transaction-to', 'Transaction To', 'history-transaction-to', 'history', 'text', 'Transaction recipient address', true, 'top', 'history-transaction-item'),
('history-transaction-service', 'Transaction Service', 'history-transaction-service', 'history', 'text', 'Transaction service name', true, 'middle', 'history-transaction-item'),
('history-transaction-amount', 'Transaction Amount', 'history-transaction-amount', 'history', 'text', 'Transaction amount', true, 'right', 'history-transaction-item'),
('history-transaction-token', 'Transaction Token', 'history-transaction-token', 'history', 'text', 'Transaction token symbol', true, 'right', 'history-transaction-item'),
('history-transaction-status', 'Transaction Status', 'history-transaction-status', 'history', 'text', 'Transaction status', true, 'bottom', 'history-transaction-item'),
('history-transaction-error', 'Transaction Error', 'history-transaction-error', 'history', 'text', 'Transaction error message', true, 'bottom', 'history-transaction-item'),

-- SEARCH CONTENT ELEMENTS
('search-container', 'Search Container', 'search-container', 'search', 'container', 'Main container for search interface', true, 'full', null),
('search-input-container', 'Search Input Container', 'search-input-container', 'search', 'container', 'Container for search input', true, 'top', 'search-container'),
('search-input', 'Search Input', 'search-input', 'search', 'input', 'Main search input field', true, 'center', 'search-input-container'),

-- Recent searches
('search-recent-container', 'Recent Container', 'search-recent-container', 'search', 'container', 'Container for recent searches', true, 'top', 'search-container'),
('search-recent-title', 'Recent Title', 'search-recent-title', 'search', 'text', 'Recent searches title', true, 'top', 'search-recent-container'),
('search-recent-bitcoin', 'Recent Bitcoin', 'search-recent-bitcoin', 'search', 'text', 'Bitcoin recent search', true, 'middle', 'search-recent-container'),
('search-recent-ethereum', 'Recent Ethereum', 'search-recent-ethereum', 'search', 'text', 'Ethereum recent search', true, 'middle', 'search-recent-container'),
('search-recent-solana', 'Recent Solana', 'search-recent-solana', 'search', 'text', 'Solana recent search', true, 'middle', 'search-recent-container'),
('search-recent-usdc', 'Recent USDC', 'search-recent-usdc', 'search', 'text', 'USDC recent search', true, 'middle', 'search-recent-container'),

-- Trending section
('search-trending-container', 'Trending Container', 'search-trending-container', 'search', 'container', 'Container for trending tokens', true, 'bottom', 'search-container'),
('search-trending-title', 'Trending Title', 'search-trending-title', 'search', 'text', 'Trending section title', true, 'top', 'search-trending-container'),

-- Token items
('search-bitcoin-item', 'Bitcoin Item', 'search-bitcoin-item', 'search', 'item', 'Bitcoin search result item', true, 'middle', 'search-trending-container'),
('search-bitcoin-icon', 'Bitcoin Icon', 'search-bitcoin-icon', 'search', 'icon', 'Bitcoin icon', true, 'left', 'search-bitcoin-item'),
('search-bitcoin-name', 'Bitcoin Name', 'search-bitcoin-name', 'search', 'text', 'Bitcoin name', true, 'center', 'search-bitcoin-item'),
('search-bitcoin-symbol', 'Bitcoin Symbol', 'search-bitcoin-symbol', 'search', 'text', 'Bitcoin symbol', true, 'center', 'search-bitcoin-item'),
('search-bitcoin-price', 'Bitcoin Price', 'search-bitcoin-price', 'search', 'text', 'Bitcoin price', true, 'right', 'search-bitcoin-item'),
('search-bitcoin-change', 'Bitcoin Change', 'search-bitcoin-change', 'search', 'text', 'Bitcoin price change', true, 'right', 'search-bitcoin-item'),

('search-ethereum-item', 'Ethereum Item', 'search-ethereum-item', 'search', 'item', 'Ethereum search result item', true, 'middle', 'search-trending-container'),
('search-ethereum-icon', 'Ethereum Icon', 'search-ethereum-icon', 'search', 'icon', 'Ethereum icon', true, 'left', 'search-ethereum-item'),
('search-ethereum-name', 'Ethereum Name', 'search-ethereum-name', 'search', 'text', 'Ethereum name', true, 'center', 'search-ethereum-item'),
('search-ethereum-symbol', 'Ethereum Symbol', 'search-ethereum-symbol', 'search', 'text', 'Ethereum symbol', true, 'center', 'search-ethereum-item'),
('search-ethereum-price', 'Ethereum Price', 'search-ethereum-price', 'search', 'text', 'Ethereum price', true, 'right', 'search-ethereum-item'),
('search-ethereum-change', 'Ethereum Change', 'search-ethereum-change', 'search', 'text', 'Ethereum price change', true, 'right', 'search-ethereum-item'),

('search-solana-item', 'Solana Item', 'search-solana-item', 'search', 'item', 'Solana search result item', true, 'middle', 'search-trending-container'),
('search-solana-icon', 'Solana Icon', 'search-solana-icon', 'search', 'icon', 'Solana icon', true, 'left', 'search-solana-item'),
('search-solana-name', 'Solana Name', 'search-solana-name', 'search', 'text', 'Solana name', true, 'center', 'search-solana-item'),
('search-solana-symbol', 'Solana Symbol', 'search-solana-symbol', 'search', 'text', 'Solana symbol', true, 'center', 'search-solana-item'),
('search-solana-price', 'Solana Price', 'search-solana-price', 'search', 'text', 'Solana price', true, 'right', 'search-solana-item'),
('search-solana-change', 'Solana Change', 'search-solana-change', 'search', 'text', 'Solana price change', true, 'right', 'search-solana-item'),

('search-cardano-item', 'Cardano Item', 'search-cardano-item', 'search', 'item', 'Cardano search result item', true, 'middle', 'search-trending-container'),
('search-cardano-icon', 'Cardano Icon', 'search-cardano-icon', 'search', 'icon', 'Cardano icon', true, 'left', 'search-cardano-item'),
('search-cardano-name', 'Cardano Name', 'search-cardano-name', 'search', 'text', 'Cardano name', true, 'center', 'search-cardano-item'),
('search-cardano-symbol', 'Cardano Symbol', 'search-cardano-symbol', 'search', 'text', 'Cardano symbol', true, 'center', 'search-cardano-item'),
('search-cardano-price', 'Cardano Price', 'search-cardano-price', 'search', 'text', 'Cardano price', true, 'right', 'search-cardano-item'),

-- BUY LAYER ELEMENTS
('buy-container', 'Buy Container', 'buy-container', 'buy', 'container', 'Main container for buy interface', true, 'full', null),
('buy-search-container', 'Buy Search Container', 'buy-search-container', 'buy', 'container', 'Container for buy search', true, 'top', 'buy-container'),
('buy-search-input', 'Buy Search Input', 'buy-search-input', 'buy', 'input', 'Buy search input field', true, 'center', 'buy-search-container'),
('buy-search-icon', 'Buy Search Icon', 'buy-search-icon', 'buy', 'icon', 'Buy search icon', true, 'left', 'buy-search-container'),

-- Get started section
('buy-get-started-container', 'Get Started Container', 'buy-get-started-container', 'buy', 'container', 'Container for get started section', true, 'middle', 'buy-container'),
('buy-get-started-title', 'Get Started Title', 'buy-get-started-title', 'buy', 'text', 'Get started section title', true, 'top', 'buy-get-started-container'),

-- Token items
('buy-solana-item', 'Buy Solana Item', 'buy-solana-item', 'buy', 'item', 'Solana buy item', true, 'middle', 'buy-get-started-container'),
('buy-solana-icon', 'Buy Solana Icon', 'buy-solana-icon', 'buy', 'icon', 'Solana icon', true, 'left', 'buy-solana-item'),
('buy-solana-name', 'Buy Solana Name', 'buy-solana-name', 'buy', 'text', 'Solana name', true, 'center', 'buy-solana-item'),
('buy-solana-description', 'Buy Solana Description', 'buy-solana-description', 'buy', 'text', 'Solana description', true, 'center', 'buy-solana-item'),
('buy-solana-button', 'Buy Solana Button', 'buy-solana-button', 'buy', 'button', 'Solana buy button', true, 'right', 'buy-solana-item'),

('buy-usdc-item', 'Buy USDC Item', 'buy-usdc-item', 'buy', 'item', 'USDC buy item', true, 'middle', 'buy-get-started-container'),
('buy-usdc-icon', 'Buy USDC Icon', 'buy-usdc-icon', 'buy', 'icon', 'USDC icon', true, 'left', 'buy-usdc-item'),
('buy-usdc-name', 'Buy USDC Name', 'buy-usdc-name', 'buy', 'text', 'USDC name', true, 'center', 'buy-usdc-item'),
('buy-usdc-description', 'Buy USDC Description', 'buy-usdc-description', 'buy', 'text', 'USDC description', true, 'center', 'buy-usdc-item'),
('buy-usdc-button', 'Buy USDC Button', 'buy-usdc-button', 'buy', 'button', 'USDC buy button', true, 'right', 'buy-usdc-item'),

-- Popular section
('buy-popular-container', 'Popular Container', 'buy-popular-container', 'buy', 'container', 'Container for popular tokens', true, 'bottom', 'buy-container'),
('buy-popular-title', 'Popular Title', 'buy-popular-title', 'buy', 'text', 'Popular section title', true, 'top', 'buy-popular-container'),

('buy-ethereum-item', 'Buy Ethereum Item', 'buy-ethereum-item', 'buy', 'item', 'Ethereum buy item', true, 'middle', 'buy-popular-container'),
('buy-ethereum-icon', 'Buy Ethereum Icon', 'buy-ethereum-icon', 'buy', 'icon', 'Ethereum icon', true, 'left', 'buy-ethereum-item'),
('buy-ethereum-name', 'Buy Ethereum Name', 'buy-ethereum-name', 'buy', 'text', 'Ethereum name', true, 'center', 'buy-ethereum-item'),
('buy-ethereum-description', 'Buy Ethereum Description', 'buy-ethereum-description', 'buy', 'text', 'Ethereum description', true, 'center', 'buy-ethereum-item'),
('buy-ethereum-button', 'Buy Ethereum Button', 'buy-ethereum-button', 'buy', 'button', 'Ethereum buy button', true, 'right', 'buy-ethereum-item'),

('buy-bitcoin-item', 'Buy Bitcoin Item', 'buy-bitcoin-item', 'buy', 'item', 'Bitcoin buy item', true, 'middle', 'buy-popular-container'),
('buy-bitcoin-icon', 'Buy Bitcoin Icon', 'buy-bitcoin-icon', 'buy', 'icon', 'Bitcoin icon', true, 'left', 'buy-bitcoin-item'),
('buy-bitcoin-name', 'Buy Bitcoin Name', 'buy-bitcoin-name', 'buy', 'text', 'Bitcoin name', true, 'center', 'buy-bitcoin-item'),
('buy-bitcoin-description', 'Buy Bitcoin Description', 'buy-bitcoin-description', 'buy', 'text', 'Bitcoin description', true, 'center', 'buy-bitcoin-item'),
('buy-bitcoin-button', 'Buy Bitcoin Button', 'buy-bitcoin-button', 'buy', 'button', 'Bitcoin buy button', true, 'right', 'buy-bitcoin-item')
) AS new_elements(id, name, selector, screen, type, description, customizable, position, parent_element)
WHERE NOT EXISTS (
    SELECT 1 FROM public.wallet_elements WHERE wallet_elements.id = new_elements.id
);
