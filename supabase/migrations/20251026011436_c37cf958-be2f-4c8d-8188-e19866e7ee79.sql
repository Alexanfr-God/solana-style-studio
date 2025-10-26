-- Fix Lock Layer selectors to match actual DOM structure
-- Update selectors from lock-* to login-*/unlock-* prefixes

-- Lock Screen Container
UPDATE wallet_elements 
SET selector = '[data-element-id="unlock-screen-container"]'
WHERE id = 'lock-unlock-screen-container';

-- Password Title
UPDATE wallet_elements 
SET selector = '[data-element-id="login-password-title"]'
WHERE id = 'lock-title-text';

-- Password Input Background
UPDATE wallet_elements 
SET selector = '[data-element-id="login-password-input"]'
WHERE id = 'lock-password-input-bg';

-- Password Input Text
UPDATE wallet_elements 
SET selector = '[data-element-id="login-password-input"]'
WHERE id = 'lock-password-input-text';

-- Eye Icon (Show/Hide Password)
UPDATE wallet_elements 
SET selector = '[data-element-id="login-show-password"]'
WHERE id = 'lock-password-input-icon-eye';

-- Forgot Password Link
UPDATE wallet_elements 
SET selector = '[data-element-id="login-forgot-password"]'
WHERE id = 'lock-forgot-password-text';

-- Unlock Button Background
UPDATE wallet_elements 
SET selector = '[data-element-id="login-unlock-button"]'
WHERE id = 'lock-unlock-button-bg';

-- Unlock Button Text
UPDATE wallet_elements 
SET selector = '[data-element-id="login-unlock-button"]'
WHERE id = 'lock-unlock-button-text';