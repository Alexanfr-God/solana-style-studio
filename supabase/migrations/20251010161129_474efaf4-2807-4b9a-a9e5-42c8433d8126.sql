-- Insert wallet_elements for lockLayer
INSERT INTO public.wallet_elements (
  id, 
  screen, 
  name, 
  type, 
  description, 
  selector, 
  json_path, 
  category, 
  customizable
) VALUES
  (
    'lock-title-text',
    'lock',
    'Lock Screen Title',
    'text',
    'Text color of the lock screen title',
    '.lock-title',
    '/lockLayer/title/textColor',
    'text',
    true
  ),
  (
    'lock-password-input-bg',
    'lock',
    'Password Input Background',
    'input',
    'Background color of the password input field',
    '.password-input',
    '/lockLayer/passwordInput/backgroundColor',
    'background',
    true
  ),
  (
    'lock-password-input-text',
    'lock',
    'Password Input Text',
    'input',
    'Text color of the password input field',
    '.password-input',
    '/lockLayer/passwordInput/textColor',
    'text',
    true
  ),
  (
    'lock-password-input-placeholder',
    'lock',
    'Password Input Placeholder',
    'input',
    'Placeholder text color of the password input',
    '.password-input',
    '/lockLayer/passwordInput/placeholderColor',
    'text',
    true
  ),
  (
    'lock-password-input-icon-eye',
    'lock',
    'Password Eye Icon',
    'icon',
    'Color of the password visibility toggle icon',
    '.password-input .icon-eye',
    '/lockLayer/passwordInput/iconEyeColor',
    'icon',
    true
  ),
  (
    'lock-forgot-password-text',
    'lock',
    'Forgot Password Link',
    'text',
    'Text color of the forgot password link',
    '.forgot-password-link',
    '/lockLayer/forgotPassword/textColor',
    'text',
    true
  ),
  (
    'lock-unlock-button-bg',
    'lock',
    'Unlock Button Background',
    'button',
    'Background color of the unlock button',
    '.unlock-button',
    '/lockLayer/unlockButton/backgroundColor',
    'background',
    true
  ),
  (
    'lock-unlock-button-text',
    'lock',
    'Unlock Button Text',
    'button',
    'Text color of the unlock button',
    '.unlock-button',
    '/lockLayer/unlockButton/textColor',
    'text',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  selector = EXCLUDED.selector,
  json_path = EXCLUDED.json_path,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = now();