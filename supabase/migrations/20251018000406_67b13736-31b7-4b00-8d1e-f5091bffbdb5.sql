-- Clean up and fix footer navigation elements

-- Step 1: Delete old incorrect entries
DELETE FROM wallet_elements 
WHERE id IN (
  'nav-home-icon', 
  'nav-apps-icon', 
  'nav-swap-icon', 
  'nav-history-icon', 
  'nav-search-icon'
)
AND json_path = '/navigation/item';

-- Step 2: Update selectors for global navigation elements to match data-element-id
UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-home-tab"]'
WHERE id = 'global-nav-home-tab';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-apps-tab"]'
WHERE id = 'global-nav-apps-tab';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-swap-tab"]'
WHERE id = 'global-nav-swap-tab';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-history-tab"]'
WHERE id = 'global-nav-history-tab';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-search-tab"]'
WHERE id = 'global-nav-search-tab';

-- Step 3: Update label selectors
UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-home-label"]'
WHERE id = 'global-nav-home-label';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-apps-label"]'
WHERE id = 'global-nav-apps-label';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-swap-label"]'
WHERE id = 'global-nav-swap-label';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-history-label"]'
WHERE id = 'global-nav-history-label';

UPDATE wallet_elements 
SET selector = '[data-element-id="global-nav-search-label"]'
WHERE id = 'global-nav-search-label';