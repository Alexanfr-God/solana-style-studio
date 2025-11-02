-- =====================================================
-- Part 1: Clean duplicates in wallet_elements
-- =====================================================

-- Step 1: Recursively clear all parent_element references
UPDATE wallet_elements
SET parent_element = NULL
WHERE parent_element IS NOT NULL;

-- Step 2: Delete duplicate entries (keep oldest)
WITH dups AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY screen, json_path ORDER BY created_at ASC) rn
  FROM wallet_elements
  WHERE COALESCE(json_path, '') <> ''
)
DELETE FROM wallet_elements
WHERE id IN (SELECT id FROM dups WHERE rn > 1);

-- =====================================================
-- Part 2: Add footer background mapping
-- =====================================================

INSERT INTO wallet_elements (
  id, 
  name, 
  selector, 
  json_path, 
  screen, 
  type, 
  customizable, 
  description
)
VALUES (
  'home-footer-bg',
  'Footer Background',
  '[data-element-id="bottom-navigation"]',
  '/homeLayer/footer/backgroundColor',
  'home',
  'container',
  true,
  'Footer background color for home screen'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Part 3: Mark elements without json_path as non-customizable
-- =====================================================

UPDATE wallet_elements
SET customizable = false
WHERE COALESCE(json_path, '') = ''
  AND customizable = true;