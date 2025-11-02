-- Add home-header-bg mapping if not exists
INSERT INTO wallet_elements (id, name, selector, json_path, screen, type, customizable, description)
VALUES (
  'home-header-bg',
  'Header Background',
  '[data-element-id="home-header"]',
  '/homeLayer/header/backgroundColor',
  'home',
  'container',
  true,
  'Header background color for home screen'
)
ON CONFLICT (id) DO NOTHING;

-- Note: Duplicate cleanup skipped due to FK constraints
-- Manual cleanup via SQL Editor recommended if needed