-- Fix Header Container selector and json_path
UPDATE wallet_elements 
SET 
  selector = '[data-element-id="home-header"]',
  json_path = '/homeLayer/header/backgroundColor'
WHERE id = 'home-header';

-- Insert or update Footer Container
INSERT INTO wallet_elements (
  id,
  screen,
  name,
  type,
  description,
  selector,
  json_path,
  customizable
) VALUES (
  'global-bottom-nav-container',
  'home',
  'Bottom Navigation Container',
  'container',
  'Background container for bottom navigation bar',
  '[data-element-id="bottom-navigation"]',
  '/homeLayer/footer/backgroundColor',
  true
)
ON CONFLICT (id) DO UPDATE SET
  selector = '[data-element-id="bottom-navigation"]',
  json_path = '/homeLayer/footer/backgroundColor',
  customizable = true;