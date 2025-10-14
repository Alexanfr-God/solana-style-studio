-- Update Lock Layer elements with correct selectors and json_paths (with descriptions)

-- Background container (supports both color and image)
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('unlock-screen-container', 'lock', 'Lock Background Color', 'container', 
   'Lock screen background color', '[data-element-id="unlock-screen-container"]', '/lockLayer/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('unlock-screen-background-image', 'lock', 'Lock Background Image', 'image',
   'Lock screen background image', '[data-element-id="unlock-screen-container"]', '/lockLayer/backgroundImage', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Title text
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-title-text', 'lock', 'Lock Title Text Color', 'text',
   'Lock screen title text color', '[data-element-id="lock-title-text"]', '/lockLayer/title/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Forgot password link
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-forgot-password-text', 'lock', 'Lock Forgot Password Text Color', 'text',
   'Lock screen forgot password link color', '[data-element-id="lock-forgot-password-text"]', '/lockLayer/forgotPassword/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Unlock button background
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-unlock-button-bg', 'lock', 'Lock Unlock Button Background', 'button',
   'Lock screen unlock button background color', '[data-element-id="lock-unlock-button-bg"]', '/lockLayer/unlockButton/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Unlock button text
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-unlock-button-text', 'lock', 'Lock Unlock Button Text Color', 'text',
   'Lock screen unlock button text color', '[data-element-id="lock-unlock-button-text"]', '/lockLayer/unlockButton/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input background
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-password-input-bg', 'lock', 'Lock Password Input Background', 'input',
   'Lock screen password input background color', '[data-element-id="lock-password-input-bg"]', '/lockLayer/passwordInput/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input text color
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-password-input-text', 'lock', 'Lock Password Input Text Color', 'input',
   'Lock screen password input text color', '[data-element-id="lock-password-input-text"]', '/lockLayer/passwordInput/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input placeholder color
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-password-input-placeholder', 'lock', 'Lock Password Input Placeholder Color', 'input',
   'Lock screen password input placeholder color', '[data-element-id="lock-password-input-text"]', '/lockLayer/passwordInput/placeholderColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Eye icon color
INSERT INTO wallet_elements (id, screen, name, type, description, selector, json_path, customizable)
VALUES
  ('lock-password-input-icon-eye', 'lock', 'Lock Password Eye Icon Color', 'icon',
   'Lock screen password eye icon color', '[data-element-id="lock-password-input-icon-eye"]', '/lockLayer/passwordInput/iconEyeColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;