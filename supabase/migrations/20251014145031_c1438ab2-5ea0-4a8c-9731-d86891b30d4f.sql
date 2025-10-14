-- Update Lock Layer elements with correct selectors, json_paths, and descriptions

-- Background container (supports both color and image)
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('unlock-screen-container', 'lock', 'Lock Background Color', 'Background color for the lock screen', 'container',
   '[data-element-id="unlock-screen-container"]', '/lockLayer/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('unlock-screen-background-image', 'lock', 'Lock Background Image', 'Background image for the lock screen', 'image',
   '[data-element-id="unlock-screen-container"]', '/lockLayer/backgroundImage', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Title text
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-title-text', 'lock', 'Lock Title Text Color', 'Text color for lock screen title', 'text',
   '[data-element-id="lock-title-text"]', '/lockLayer/title/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Forgot password link
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-forgot-password-text', 'lock', 'Lock Forgot Password Text Color', 'Text color for forgot password link', 'text',
   '[data-element-id="lock-forgot-password-text"]', '/lockLayer/forgotPassword/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Unlock button background
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-unlock-button-bg', 'lock', 'Lock Unlock Button Background', 'Background color for unlock button', 'button',
   '[data-element-id="lock-unlock-button-bg"]', '/lockLayer/unlockButton/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Unlock button text
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-unlock-button-text', 'lock', 'Lock Unlock Button Text Color', 'Text color for unlock button', 'text',
   '[data-element-id="lock-unlock-button-text"]', '/lockLayer/unlockButton/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input background
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-password-input-bg', 'lock', 'Lock Password Input Background', 'Background color for password input', 'input',
   '[data-element-id="lock-password-input-bg"]', '/lockLayer/passwordInput/backgroundColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input text color
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-password-input-text', 'lock', 'Lock Password Input Text Color', 'Text color for password input', 'input',
   '[data-element-id="lock-password-input-text"]', '/lockLayer/passwordInput/textColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Password input placeholder color
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-password-input-placeholder', 'lock', 'Lock Password Input Placeholder Color', 'Placeholder text color for password input', 'input',
   '[data-element-id="lock-password-input-text"]', '/lockLayer/passwordInput/placeholderColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;

-- Eye icon color
INSERT INTO wallet_elements (id, screen, name, description, type, selector, json_path, customizable)
VALUES
  ('lock-password-input-icon-eye', 'lock', 'Lock Password Eye Icon Color', 'Color for password visibility toggle icon', 'icon',
   '[data-element-id="lock-password-input-icon-eye"]', '/lockLayer/passwordInput/iconEyeColor', true)
ON CONFLICT (id) DO UPDATE SET 
  selector = EXCLUDED.selector, 
  json_path = EXCLUDED.json_path,
  description = EXCLUDED.description;