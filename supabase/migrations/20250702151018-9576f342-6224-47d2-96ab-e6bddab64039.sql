
-- ЭТАП 1: Удаляем все дублирующиеся и проблемные записи
DELETE FROM wallet_elements WHERE id IN (
  'nav-search-icon', 'nav-home-icon', 'nav-apps-icon', 'nav-swap-icon', 'nav-history-icon',
  'action-receive-icon', 'action-send-icon', 'action-swap-icon', 'action-buy-icon',
  'search-input-icon', 'search-clear-icon', 'search-recent-icon', 'search-trending-icon',
  'header-search-icon', 'header-menu-icon', 'history-menu-icon',
  'receive-qr-icon', 'receive-copy-icon', 'sidebar-close-icon', 'sidebar-add-icon',
  'sidebar-edit-icon', 'sidebar-settings-icon', 'swap-settings-icon', 
  'swap-arrow-icon', 'swap-rate-icon'
);

-- ЭТАП 2: Исправляем существующие записи, которые должны быть иконками
UPDATE wallet_elements 
SET category = 'icon', type = 'icon', asset_library_path = 'wallet-icons/'
WHERE id IN ('receive-qr-code', 'swap-arrow-container');

-- ЭТАП 3: Добавляем только УНИКАЛЬНЫЕ иконки навигации (5 иконок)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('nav-home-icon', 'Home Navigation Icon', 'icon', 'navigation', 'Home icon in bottom navigation', true, 'nav-home-icon', 'icon', 'wallet-icons/navigation/'),
('nav-apps-icon', 'Apps Navigation Icon', 'icon', 'navigation', 'Apps icon in bottom navigation', true, 'nav-apps-icon', 'icon', 'wallet-icons/navigation/'),
('nav-swap-icon', 'Swap Navigation Icon', 'icon', 'navigation', 'Swap icon in bottom navigation', true, 'nav-swap-icon', 'icon', 'wallet-icons/navigation/'),
('nav-history-icon', 'History Navigation Icon', 'icon', 'navigation', 'History icon in bottom navigation', true, 'nav-history-icon', 'icon', 'wallet-icons/navigation/'),
('nav-search-icon', 'Search Navigation Icon', 'icon', 'navigation', 'Search icon in bottom navigation', true, 'nav-search-icon', 'icon', 'wallet-icons/navigation/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 4: Добавляем иконки действий (4 иконки)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('action-send-icon', 'Send Action Icon', 'icon', 'home', 'Send icon in action buttons', true, 'action-send-icon', 'icon', 'wallet-icons/actions/'),
('action-receive-icon', 'Receive Action Icon', 'icon', 'home', 'Receive icon in action buttons', true, 'action-receive-icon', 'icon', 'wallet-icons/actions/'),
('action-buy-icon', 'Buy Action Icon', 'icon', 'home', 'Buy icon in action buttons', true, 'action-buy-icon', 'icon', 'wallet-icons/actions/'),
('action-swap-main', 'Main Swap Action Icon', 'icon', 'home', 'Main swap icon in action buttons', true, 'action-swap-main', 'icon', 'wallet-icons/actions/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 5: Добавляем системные иконки (6 иконок)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('header-search-icon', 'Header Search Icon', 'icon', 'home', 'Search icon in header', true, 'header-search-icon', 'icon', 'wallet-icons/'),
('header-menu-icon', 'Header Menu Icon', 'icon', 'home', 'Menu hamburger icon in header', true, 'header-menu-icon', 'icon', 'wallet-icons/'),
('swap-settings-icon', 'Swap Settings Icon', 'icon', 'swap', 'Settings gear icon in swap', true, 'swap-settings-icon', 'icon', 'wallet-icons/'),
('swap-arrow-main', 'Swap Arrow Icon', 'icon', 'swap', 'Main swap arrow icon', true, 'swap-arrow-main', 'icon', 'wallet-icons/'),
('receive-qr-main', 'QR Code Icon', 'icon', 'receive', 'QR code display icon', true, 'receive-qr-main', 'icon', 'wallet-icons/'),
('receive-copy-icon', 'Copy Address Icon', 'icon', 'receive', 'Copy address icon', false, 'receive-copy-icon', 'icon', 'wallet-icons/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 6: Добавляем функциональные иконки поиска (3 иконки)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('search-magnify-icon', 'Search Magnifying Glass', 'icon', 'search', 'Main search magnifying glass icon', false, 'search-magnify-icon', 'icon', 'wallet-icons/'),
('search-recent-icon', 'Recent Search Icon', 'icon', 'search', 'Recent searches clock icon', true, 'search-recent-icon', 'icon', 'wallet-icons/'),
('search-trending-icon', 'Trending Search Icon', 'icon', 'search', 'Trending searches arrow icon', true, 'search-trending-icon', 'icon', 'wallet-icons/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 7: Очистка неправильных записей
UPDATE wallet_elements 
SET category = 'icon'
WHERE type = 'icon' AND category != 'icon';

-- ЭТАП 8: Подсчет для проверки
-- Должно быть: 5 навигационных + 4 действий + 6 системных + 3 поиск = 18 уникальных иконок
