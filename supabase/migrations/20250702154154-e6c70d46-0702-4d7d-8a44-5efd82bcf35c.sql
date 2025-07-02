
-- ДОБАВЛЕНИЕ ВСЕХ ПРОПУЩЕННЫХ ИКОНОК (19 штук)

-- ЭТАП 1: Sidebar иконки (4 иконки)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('account-sidebar-close-icon', 'Sidebar Close Icon', 'icon', 'sidebar', 'Close X icon in account sidebar header', false, 'account-sidebar-close-icon', 'icon', 'wallet-icons/sidebar/'),
('account-sidebar-add-icon', 'Sidebar Add Account Icon', 'icon', 'sidebar', 'Plus icon to add new account in sidebar', true, 'account-sidebar-add-icon', 'icon', 'wallet-icons/sidebar/'),
('account-sidebar-edit-icon', 'Sidebar Edit Icon', 'icon', 'sidebar', 'Pencil edit icon in sidebar footer', true, 'account-sidebar-edit-icon', 'icon', 'wallet-icons/sidebar/'),
('account-sidebar-settings-icon', 'Sidebar Settings Icon', 'icon', 'sidebar', 'Settings gear icon in sidebar footer', true, 'account-sidebar-settings-icon', 'icon', 'wallet-icons/sidebar/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 2: Search иконки в разных местах (1 новая иконка)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('search-input-icon', 'Search Input Icon', 'icon', 'search', 'Search magnifying glass icon in search input field', false, 'search-input-icon', 'icon', 'wallet-icons/search/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 3: QR Code иконки для каждой сети (6 иконок)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('receive-network-qr-icon-sol', 'Solana QR Code Icon', 'icon', 'receive', 'QR code icon for Solana network', true, 'receive-network-qr-icon-sol', 'icon', 'wallet-icons/receive/'),
('receive-network-qr-icon-usdc', 'USDC QR Code Icon', 'icon', 'receive', 'QR code icon for USDC network', true, 'receive-network-qr-icon-usdc', 'icon', 'wallet-icons/receive/'),
('receive-network-qr-icon-usdt', 'USDT QR Code Icon', 'icon', 'receive', 'QR code icon for USDT network', true, 'receive-network-qr-icon-usdt', 'icon', 'wallet-icons/receive/'),
('receive-network-qr-icon-ray', 'Raydium QR Code Icon', 'icon', 'receive', 'QR code icon for Raydium network', true, 'receive-network-qr-icon-ray', 'icon', 'wallet-icons/receive/'),
('receive-network-qr-icon-jupiter', 'Jupiter QR Code Icon', 'icon', 'receive', 'QR code icon for Jupiter network', true, 'receive-network-qr-icon-jupiter', 'icon', 'wallet-icons/receive/'),
('receive-network-qr-icon-orca', 'Orca QR Code Icon', 'icon', 'receive', 'QR code icon for Orca network', true, 'receive-network-qr-icon-orca', 'icon', 'wallet-icons/receive/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 4: Copy Address иконки для каждой сети (6 иконок)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('receive-network-copy-icon-sol', 'Solana Copy Address Icon', 'icon', 'receive', 'Copy address icon for Solana network', false, 'receive-network-copy-icon-sol', 'icon', 'wallet-icons/receive/'),
('receive-network-copy-icon-usdc', 'USDC Copy Address Icon', 'icon', 'receive', 'Copy address icon for USDC network', false, 'receive-network-copy-icon-usdc', 'icon', 'wallet-icons/receive/'),
('receive-network-copy-icon-usdt', 'USDT Copy Address Icon', 'icon', 'receive', 'Copy address icon for USDT network', false, 'receive-network-copy-icon-usdt', 'icon', 'wallet-icons/receive/'),
('receive-network-copy-icon-ray', 'Raydium Copy Address Icon', 'icon', 'receive', 'Copy address icon for Raydium network', false, 'receive-network-copy-icon-ray', 'icon', 'wallet-icons/receive/'),
('receive-network-copy-icon-jupiter', 'Jupiter Copy Address Icon', 'icon', 'receive', 'Copy address icon for Jupiter network', false, 'receive-network-copy-icon-jupiter', 'icon', 'wallet-icons/receive/'),
('receive-network-copy-icon-orca', 'Orca Copy Address Icon', 'icon', 'receive', 'Copy address icon for Orca network', false, 'receive-network-copy-icon-orca', 'icon', 'wallet-icons/receive/')
ON CONFLICT (id) DO NOTHING;

-- ЭТАП 5: Dropdown Copy иконки (2 иконки)
INSERT INTO wallet_elements (id, name, type, screen, description, customizable, selector, category, asset_library_path) VALUES
('dropdown-copy-icon-1', 'Dropdown Copy Icon Primary', 'icon', 'receive', 'Copy icon in first dropdown modal', false, 'dropdown-copy-icon-1', 'icon', 'wallet-icons/dropdown/'),
('dropdown-copy-icon-2', 'Dropdown Copy Icon Secondary', 'icon', 'receive', 'Copy icon in second dropdown modal', false, 'dropdown-copy-icon-2', 'icon', 'wallet-icons/dropdown/')
ON CONFLICT (id) DO NOTHING;

-- ПРОВЕРКА: Подсчет всех иконок
-- Должно быть: 18 (предыдущие) + 19 (новые) = 37 уникальных иконок
SELECT 
  COUNT(*) as total_icons,
  COUNT(CASE WHEN customizable = true THEN 1 END) as customizable_icons,
  COUNT(CASE WHEN screen = 'navigation' THEN 1 END) as navigation_icons,
  COUNT(CASE WHEN screen = 'sidebar' THEN 1 END) as sidebar_icons,
  COUNT(CASE WHEN screen = 'receive' THEN 1 END) as receive_icons,
  COUNT(CASE WHEN screen = 'search' THEN 1 END) as search_icons
FROM wallet_elements 
WHERE category = 'icon';
