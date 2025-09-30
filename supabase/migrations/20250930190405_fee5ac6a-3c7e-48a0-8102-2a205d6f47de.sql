-- Unified Asset Card Mapping: HOME, SEARCH, BUY layers
-- Map all asset text elements to /assetCard/* paths

-- HOME Layer: Base asset elements
UPDATE public.wallet_elements 
SET json_path = '/assetCard/title'
WHERE screen = 'home' AND name = 'Asset Name';

UPDATE public.wallet_elements 
SET json_path = '/assetCard/description'
WHERE screen = 'home' AND name = 'Asset Symbol';

UPDATE public.wallet_elements 
SET json_path = '/assetCard/value'
WHERE screen = 'home' AND name = 'Asset Value';

UPDATE public.wallet_elements 
SET json_path = '/assetCard/percent'
WHERE screen = 'home' AND name = 'Asset Balance';

-- SEARCH Layer: Add missing Symbol mappings
UPDATE public.wallet_elements 
SET json_path = '/assetCard/description'
WHERE screen = 'search' AND name IN ('Bitcoin Symbol', 'Ethereum Symbol', 'Solana Symbol');

-- BUY Layer: Map Buy asset names and descriptions
UPDATE public.wallet_elements 
SET json_path = '/assetCard/title'
WHERE screen = 'buy' AND name IN ('Buy Bitcoin Name', 'Buy Ethereum Name');

UPDATE public.wallet_elements 
SET json_path = '/assetCard/description'
WHERE screen = 'buy' AND name IN ('Buy Bitcoin Description', 'Buy Ethereum Description');