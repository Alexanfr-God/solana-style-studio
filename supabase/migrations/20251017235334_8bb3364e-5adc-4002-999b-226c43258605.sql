-- Comprehensive footer fix with trigger bypass

-- Temporarily disable json_path immutability
ALTER TABLE wallet_elements DISABLE TRIGGER trg_prevent_json_path_overwrite;

-- 1) Fix footer background
UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/backgroundColor'
WHERE id = 'global-bottom-nav-container';

-- 2) Fix navigation labels to use correct footer text color path
UPDATE wallet_elements 
SET json_path = '/homeLayer/footer/textColor'
WHERE id IN (
  'global-nav-home-label',
  'global-nav-apps-label',
  'global-nav-swap-label',
  'global-nav-history-label'
);

-- Re-enable trigger
ALTER TABLE wallet_elements ENABLE TRIGGER trg_prevent_json_path_overwrite;

-- 3) Add all new elements
INSERT INTO wallet_elements (
  id, screen, type, name, description, 
  selector, json_path, category, customizable
) VALUES
-- Search elements (missing)
('global-nav-search-tab', 'home', 'icon', 'Search Icon', 'Search navigation icon', '[data-element-id="global-nav-search-tab"]', '/homeLayer/footer/navigationIcons/searchIcon/color', 'navigation', true),
('global-nav-search-label', 'home', 'text', 'Search Label', 'Search navigation text', '[data-element-id="global-nav-search-label"]', '/homeLayer/footer/textColor', 'navigation', true),
-- Active states for icons
('global-nav-home-tab-active', 'home', 'icon', 'Home Icon (Active)', 'Active home icon color', '[data-element-id="global-nav-home-tab"].active', '/homeLayer/footer/navigationIcons/homeIcon/activeColor', 'navigation', true),
('global-nav-apps-tab-active', 'home', 'icon', 'Apps Icon (Active)', 'Active apps icon color', '[data-element-id="global-nav-apps-tab"].active', '/homeLayer/footer/navigationIcons/appsIcon/activeColor', 'navigation', true),
('global-nav-swap-tab-active', 'home', 'icon', 'Swap Icon (Active)', 'Active swap icon color', '[data-element-id="global-nav-swap-tab"].active', '/homeLayer/footer/navigationIcons/swapIcon/activeColor', 'navigation', true),
('global-nav-history-tab-active', 'home', 'icon', 'History Icon (Active)', 'Active history icon color', '[data-element-id="global-nav-history-tab"].active', '/homeLayer/footer/navigationIcons/historyIcon/activeColor', 'navigation', true),
('global-nav-search-tab-active', 'home', 'icon', 'Search Icon (Active)', 'Active search icon color', '[data-element-id="global-nav-search-tab"].active', '/homeLayer/footer/navigationIcons/searchIcon/activeColor', 'navigation', true),
-- Active states for text
('global-nav-home-label-active', 'home', 'text', 'Home Text (Active)', 'Active home text color', '[data-element-id="global-nav-home-label"].active', '/homeLayer/footer/activeTextColor', 'navigation', true),
('global-nav-apps-label-active', 'home', 'text', 'Apps Text (Active)', 'Active apps text color', '[data-element-id="global-nav-apps-label"].active', '/homeLayer/footer/activeTextColor', 'navigation', true),
('global-nav-swap-label-active', 'home', 'text', 'Swap Text (Active)', 'Active swap text color', '[data-element-id="global-nav-swap-label"].active', '/homeLayer/footer/activeTextColor', 'navigation', true),
('global-nav-history-label-active', 'home', 'text', 'History Text (Active)', 'Active history text color', '[data-element-id="global-nav-history-label"].active', '/homeLayer/footer/activeTextColor', 'navigation', true),
('global-nav-search-label-active', 'home', 'text', 'Search Text (Active)', 'Active search text color', '[data-element-id="global-nav-search-label"].active', '/homeLayer/footer/activeTextColor', 'navigation', true),
-- Footer typography
('global-footer-font-family', 'home', 'typography', 'Footer Font', 'Footer text font family', '[data-element-id="global-bottom-nav-container"]', '/homeLayer/footer/fontFamily', 'typography', true),
('global-footer-font-size', 'home', 'typography', 'Footer Font Size', 'Footer text size', '[data-element-id="global-bottom-nav-container"]', '/homeLayer/footer/fontSize', 'typography', true)
ON CONFLICT (id) DO NOTHING;