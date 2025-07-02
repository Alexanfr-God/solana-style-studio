
-- ЭТАП 1: Добавление отсутствующих иконок в навигации
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('nav-search-icon', 'Search Navigation Icon', 'icon', 'navigation', 'Search icon in bottom navigation', true, 'nav-search-icon', 'icon', 'wallet-icons/navigation/'),
('nav-home-icon', 'Home Navigation Icon', 'icon', 'navigation', 'Home icon in bottom navigation', true, 'nav-home-icon', 'icon', 'wallet-icons/navigation/'),
('nav-apps-icon', 'Apps Navigation Icon', 'icon', 'navigation', 'Apps icon in bottom navigation', true, 'nav-apps-icon', 'icon', 'wallet-icons/navigation/'),
('nav-swap-icon', 'Swap Navigation Icon', 'icon', 'navigation', 'Swap icon in bottom navigation', true, 'nav-swap-icon', 'icon', 'wallet-icons/navigation/'),
('nav-history-icon', 'History Navigation Icon', 'icon', 'navigation', 'History icon in bottom navigation', true, 'nav-history-icon', 'icon', 'wallet-icons/navigation/');

-- ЭТАП 2: Добавление иконок действий (Action Buttons)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('action-receive-icon', 'Receive Action Icon', 'icon', 'home', 'Receive icon in action buttons', true, 'action-receive-icon', 'icon', 'wallet-icons/actions/'),
('action-send-icon', 'Send Action Icon', 'icon', 'home', 'Send icon in action buttons', true, 'action-send-icon', 'icon', 'wallet-icons/actions/'),
('action-swap-icon', 'Swap Action Icon', 'icon', 'home', 'Swap icon in action buttons', true, 'action-swap-icon', 'icon', 'wallet-icons/actions/'),
('action-buy-icon', 'Buy Action Icon', 'icon', 'home', 'Buy icon in action buttons', true, 'action-buy-icon', 'icon', 'wallet-icons/actions/');

-- ЭТАП 3: Добавление иконок в Search
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('search-input-icon', 'Search Input Icon', 'icon', 'search', 'Search magnifying glass icon in input field', false, 'search-input-icon', 'icon', 'wallet-icons/'),
('search-clear-icon', 'Search Clear Icon', 'icon', 'search', 'Clear/X icon in search input', false, 'search-clear-icon', 'icon', 'wallet-icons/'),
('search-recent-icon', 'Search Recent Icon', 'icon', 'search', 'Clock icon for recent searches', true, 'search-recent-icon', 'icon', 'wallet-icons/'),
('search-trending-icon', 'Search Trending Icon', 'icon', 'search', 'Trending up arrow icon', true, 'search-trending-icon', 'icon', 'wallet-icons/');

-- ЭТАП 4: Добавление иконок в Header
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('header-search-icon', 'Header Search Icon', 'icon', 'home', 'Search icon in header right corner', true, 'header-search-icon', 'icon', 'wallet-icons/'),
('header-menu-icon', 'Header Menu Icon', 'icon', 'home', 'Menu/hamburger icon in header', true, 'header-menu-icon', 'icon', 'wallet-icons/');

-- ЭТАП 5: Добавление иконок в History
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('history-menu-icon', 'History Menu Icon', 'icon', 'history', 'Three dots menu icon in history', false, 'history-menu-icon', 'icon', 'wallet-icons/');

-- ЭТАП 6: Добавление иконок в Receive
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('receive-qr-icon', 'Receive QR Icon', 'icon', 'receive', 'QR code icon in receive screen', true, 'receive-qr-icon', 'icon', 'wallet-icons/'),
('receive-copy-icon', 'Receive Copy Icon', 'icon', 'receive', 'Copy icon for address copying', false, 'receive-copy-icon', 'icon', 'wallet-icons/');

-- ЭТАП 7: Добавление иконок в Sidebar
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('sidebar-close-icon', 'Sidebar Close Icon', 'icon', 'sidebar', 'Close X icon in sidebar', false, 'sidebar-close-icon', 'icon', 'wallet-icons/'),
('sidebar-add-icon', 'Sidebar Add Icon', 'icon', 'sidebar', 'Plus icon in sidebar bottom', true, 'sidebar-add-icon', 'icon', 'wallet-icons/'),
('sidebar-edit-icon', 'Sidebar Edit Icon', 'icon', 'sidebar', 'Pencil edit icon in sidebar bottom', true, 'sidebar-edit-icon', 'icon', 'wallet-icons/'),
('sidebar-settings-icon', 'Sidebar Settings Icon', 'icon', 'sidebar', 'Settings gear icon in sidebar bottom', true, 'sidebar-settings-icon', 'icon', 'wallet-icons/');

-- ЭТАП 8: Добавление иконок в Swap
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('swap-settings-icon', 'Swap Settings Icon', 'icon', 'swap', 'Settings icon in swap screen', true, 'swap-settings-icon', 'icon', 'wallet-icons/'),
('swap-arrow-icon', 'Swap Arrow Icon', 'icon', 'swap', 'Up/down arrow icon for swapping', true, 'swap-arrow-icon', 'icon', 'wallet-icons/'),
('swap-rate-icon', 'Swap Rate Icon', 'icon', 'swap', 'Rate information icon near swap rate', true, 'swap-rate-icon', 'icon', 'wallet-icons/');

-- ЭТАП 9: Исправление существующих элементов - изменение категории с 'image' на 'icon'
UPDATE wallet_elements 
SET category = 'icon', 
    type = 'icon',
    asset_library_path = 'wallet-icons/'
WHERE id = 'receive-qr-code';

-- ЭТАП 10: Исправление неправильной категоризации контейнеров на иконки
UPDATE wallet_elements 
SET category = 'icon', 
    type = 'icon',
    name = 'Swap Arrow Icon',
    description = 'Up/down arrow icon for token swapping',
    asset_library_path = 'wallet-icons/'
WHERE id = 'swap-arrow-container';

-- ЭТАП 11: Обновление существующих иконок для правильной группировки
UPDATE wallet_elements 
SET category = 'icon',
    asset_library_path = CASE 
        WHEN screen = 'navigation' THEN 'wallet-icons/navigation/'
        WHEN name ILIKE '%action%' OR name ILIKE '%send%' OR name ILIKE '%receive%' OR name ILIKE '%swap%' OR name ILIKE '%buy%' THEN 'wallet-icons/actions/'
        ELSE 'wallet-icons/'
    END
WHERE type = 'icon' AND (category IS NULL OR category != 'icon');
