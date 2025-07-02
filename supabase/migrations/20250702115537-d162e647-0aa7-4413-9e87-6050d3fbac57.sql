
-- Добавляем отсутствующие элементы Sidebar
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('sidebar-main-container', 'Sidebar Main Container', 'account-sidebar-panel', 'sidebar', 'container', 'Main sidebar container panel', true),
('sidebar-background-overlay', 'Sidebar Background Overlay', 'account-sidebar-overlay', 'sidebar', 'container', 'Background overlay for sidebar', true),
('sidebar-header-section', 'Sidebar Header Section', 'account-sidebar-header', 'sidebar', 'container', 'Sidebar header section', true),
('sidebar-close-button', 'Sidebar Close Button', 'account-sidebar-close', 'sidebar', 'button', 'Close sidebar button', true),
('sidebar-content-area', 'Sidebar Content Area', 'account-sidebar-content', 'sidebar', 'container', 'Main content area of sidebar', true),
('sidebar-main-account', 'Main Account Container', 'sidebar-main-account', 'sidebar', 'container', 'Main account display container', true),
('sidebar-main-account-name', 'Main Account Name', 'sidebar-main-account-name', 'sidebar', 'text', 'Main account name text', true),
('sidebar-main-account-address', 'Main Account Address', 'sidebar-main-account-address', 'sidebar', 'text', 'Main account address text', true),
('sidebar-trading-account', 'Trading Account Container', 'sidebar-trading-account', 'sidebar', 'container', 'Trading account display container', true),
('sidebar-trading-account-name', 'Trading Account Name', 'sidebar-trading-account-name', 'sidebar', 'text', 'Trading account name text', true),
('sidebar-trading-account-address', 'Trading Account Address', 'sidebar-trading-account-address', 'sidebar', 'text', 'Trading account address text', true),
('sidebar-footer-section', 'Sidebar Footer Section', 'sidebar-footer', 'sidebar', 'container', 'Footer section with action buttons', true),
('sidebar-plus-button', 'Sidebar Plus Button', 'sidebar-plus-button', 'sidebar', 'button', 'Add new account button', true),
('sidebar-pencil-button', 'Sidebar Pencil Button', 'sidebar-pencil-button', 'sidebar', 'button', 'Edit account button', true),
('sidebar-settings-button', 'Sidebar Settings Button', 'sidebar-settings-button', 'sidebar', 'button', 'Settings button', true);

-- Добавляем отсутствующие элементы Bottom Navigation
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('nav-search-tab', 'Search Navigation Tab', 'nav-search', 'navigation', 'button', 'Search navigation tab button', true),
('nav-search-icon', 'Search Navigation Icon', 'nav-search-icon', 'navigation', 'icon', 'Search tab icon', true),
('nav-search-label', 'Search Navigation Label', 'nav-search-label', 'navigation', 'text', 'Search tab text label', true),
('bottom-nav-main-container', 'Bottom Navigation Container', 'bottom-navigation', 'navigation', 'container', 'Main bottom navigation container', true),
('nav-home-label', 'Home Navigation Label', 'nav-home-label', 'navigation', 'text', 'Home tab text label', true),
('nav-apps-label', 'Apps Navigation Label', 'nav-apps-label', 'navigation', 'text', 'Apps tab text label', true),
('nav-swap-label', 'Swap Navigation Label', 'nav-swap-label', 'navigation', 'text', 'Swap tab text label', true),
('nav-history-label', 'History Navigation Label', 'nav-history-label', 'navigation', 'text', 'History tab text label', true);

-- Обновляем существующие navigation элементы для правильной структуры
UPDATE wallet_elements 
SET selector = 'nav-home', screen = 'navigation'
WHERE id = 'nav-home-tab';

UPDATE wallet_elements 
SET selector = 'nav-apps', screen = 'navigation'
WHERE id = 'nav-apps-tab';

UPDATE wallet_elements 
SET selector = 'nav-swap', screen = 'navigation'
WHERE id = 'nav-swap-tab';

UPDATE wallet_elements 
SET selector = 'nav-history', screen = 'navigation'
WHERE id = 'nav-history-tab';
