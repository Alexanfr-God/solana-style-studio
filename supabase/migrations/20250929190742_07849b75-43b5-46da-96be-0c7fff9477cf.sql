-- Add json_path column to wallet_elements for AI element-to-JSON mapping
ALTER TABLE wallet_elements 
ADD COLUMN json_path TEXT;

-- Create index for faster lookups by screen and json_path
CREATE INDEX idx_wallet_elements_screen_json_path 
ON wallet_elements(screen, json_path) 
WHERE json_path IS NOT NULL;

-- Add comment explaining the purpose
COMMENT ON COLUMN wallet_elements.json_path IS 'JSON pointer path to this element in the theme JSON structure (e.g., /pages/homeLayer/components/accountDropdown)';

-- Populate json_path for key Home Layer elements (top 10 most used)
UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/accountDropdown' 
WHERE id = 'account-dropdown' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/actionButtons/send' 
WHERE id = 'send-button' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/actionButtons/receive' 
WHERE id = 'receive-button' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/actionButtons/buy' 
WHERE id = 'buy-button' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/assetsList' 
WHERE id = 'assets-list' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/balanceDisplay' 
WHERE id = 'balance-display' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/bottomNavigation' 
WHERE id = 'bottom-navigation' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/styles/backgroundColor' 
WHERE id = 'home-background' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/styles/primaryColor' 
WHERE id = 'home-primary-color' AND screen = 'home';

UPDATE wallet_elements SET json_path = '/pages/homeLayer/components/header' 
WHERE id = 'home-header' AND screen = 'home';