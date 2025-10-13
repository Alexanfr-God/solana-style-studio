-- ============================================
-- LOCK SCREEN MAPPINGS - FULL SCALAR PATHS
-- ============================================

-- Удалить старые записи (если есть)
DELETE FROM wallet_elements WHERE screen = 'lock' OR screen = 'login';

-- Добавить новые записи с правильными скалярными путями и data-element-id селекторами
INSERT INTO wallet_elements (id, screen, name, type, description, json_path, selector, customizable) VALUES

-- 🔐 Lock Screen Background
('unlock-screen-container', 'lock', 'Lock Screen Background Color', 'container', 'Background color of lock screen', '/lockLayer/backgroundColor', '[data-element-id="unlock-screen-container"]', true),
('unlock-screen-background-image', 'lock', 'Lock Screen Background Image', 'image', 'Background image of lock screen', '/lockLayer/backgroundImage', '[data-element-id="unlock-screen-container"]', true),

-- 🔤 Title: "Enter your password"
('lock-title-text', 'lock', 'Lock Screen Title', 'text', 'Title text color', '/lockLayer/title/textColor', '[data-element-id="lock-title-text"]', true),

-- 🔑 Password Input Container
('lock-password-input-bg', 'lock', 'Password Input Background', 'input', 'Password input background color', '/lockLayer/passwordInput/backgroundColor', '[data-element-id="lock-password-input-bg"]', true),
('lock-password-input-text', 'lock', 'Password Input Text', 'input', 'Password input text color', '/lockLayer/passwordInput/textColor', '[data-element-id="lock-password-input-text"]', true),

-- 👁️ Show/Hide Password Icon
('lock-password-input-icon-eye', 'lock', 'Password Eye Icon', 'icon', 'Show/Hide password icon color', '/lockLayer/passwordInput/iconEyeColor', '[data-element-id="lock-password-input-icon-eye"]', true),

-- 🔗 Forgot Password Link
('lock-forgot-password-text', 'lock', 'Forgot Password Link', 'text', 'Forgot password link color', '/lockLayer/forgotPassword/textColor', '[data-element-id="lock-forgot-password-text"]', true),

-- 🔓 Unlock Button Container
('lock-unlock-button-bg', 'lock', 'Unlock Button Background', 'button', 'Unlock button background color', '/lockLayer/unlockButton/backgroundColor', '[data-element-id="lock-unlock-button-bg"]', true),

-- 📝 Unlock Button Text
('lock-unlock-button-text', 'lock', 'Unlock Button Text', 'text', 'Unlock button text color', '/lockLayer/unlockButton/textColor', '[data-element-id="lock-unlock-button-text"]', true)

ON CONFLICT (id) DO UPDATE SET
  screen = EXCLUDED.screen,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  json_path = EXCLUDED.json_path,
  selector = EXCLUDED.selector,
  customizable = EXCLUDED.customizable;