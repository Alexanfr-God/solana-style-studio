-- Stage 1: Lock Layer - Password Input Field
UPDATE public.wallet_elements 
SET json_path = '/lockLayer/passwordInput'
WHERE screen = 'login' AND name = 'Password Input Field';

-- Stage 2: Global paths for asset elements across all layers
-- Asset Names (Bitcoin, Ethereum, Solana, Cardano)
UPDATE public.wallet_elements 
SET json_path = '/assetCard/title'
WHERE name IN ('Bitcoin Name', 'Ethereum Name', 'Solana Name', 'Cardano Name', 'Bitcoin', 'Ethereum', 'Solana', 'Cardano')
  AND type IN ('text', 'label')
  AND screen IN ('search', 'receive', 'send', 'buy');

-- Asset Prices
UPDATE public.wallet_elements 
SET json_path = '/assetCard/value'
WHERE name IN ('Bitcoin Price', 'Ethereum Price', 'Solana Price', 'Cardano Price')
  AND screen IN ('search', 'receive', 'send', 'buy');

-- Asset Change Percentages
UPDATE public.wallet_elements 
SET json_path = '/assetCard/percent'
WHERE name IN ('Bitcoin Change', 'Ethereum Change', 'Solana Change', 'Cardano Change')
  AND screen IN ('search', 'receive', 'send', 'buy');

-- Stage 3: Search Input for all layers
UPDATE public.wallet_elements 
SET json_path = '/searchLayer/searchInput'
WHERE name ILIKE '%search input%' 
  AND screen IN ('search', 'send', 'buy');

-- Stage 4: Crypto buttons
UPDATE public.wallet_elements 
SET json_path = '/searchLayer/tokenTag'
WHERE name IN ('Bitcoin Button', 'Ethereum Button', 'Solana Button', 'USDC Button', 'Bitcoin', 'Ethereum', 'Solana', 'USDC')
  AND type = 'button'
  AND screen IN ('search', 'send', 'buy');