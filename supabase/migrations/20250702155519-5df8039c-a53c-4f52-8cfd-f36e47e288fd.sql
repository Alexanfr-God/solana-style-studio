
-- ЭТАП 1: Обновление структуры для Storage интеграции

-- Добавляем новые поля к существующей таблице wallet_elements
ALTER TABLE wallet_elements 
ADD COLUMN IF NOT EXISTS storage_file_name TEXT,
ADD COLUMN IF NOT EXISTS icon_group TEXT,
ADD COLUMN IF NOT EXISTS is_customizable_icon BOOLEAN DEFAULT false;

-- Создаем таблицу для группировки дублирующихся иконок
CREATE TABLE IF NOT EXISTS icon_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  storage_file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  element_ids TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем таблицу для пользовательских иконок
CREATE TABLE IF NOT EXISTS user_custom_icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  element_id TEXT NOT NULL,
  original_storage_path TEXT NOT NULL,
  custom_storage_path TEXT NOT NULL,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Обновляем существующие записи с правильными Storage путями
UPDATE wallet_elements SET 
  storage_file_name = CASE 
    -- Navigation иконки
    WHEN id = 'nav-home-icon' THEN 'home.svg'
    WHEN id = 'nav-apps-icon' THEN 'apps.svg'
    WHEN id = 'nav-swap-icon' THEN 'swap.svg'
    WHEN id = 'nav-history-icon' THEN 'history.svg'
    WHEN id = 'nav-search-icon' THEN 'search.svg'
    
    -- Action иконки
    WHEN id = 'action-send-icon' THEN 'send.svg'
    WHEN id = 'action-receive-icon' THEN 'receive.svg'
    WHEN id = 'action-buy-icon' THEN 'buy.svg'
    WHEN id = 'action-swap-main' THEN 'swap.svg'
    
    -- Sidebar иконки
    WHEN id = 'account-sidebar-close-icon' THEN 'close.svg'
    WHEN id = 'account-sidebar-add-icon' THEN 'add.svg'
    WHEN id = 'account-sidebar-edit-icon' THEN 'edit.svg'
    WHEN id = 'account-sidebar-settings-icon' THEN 'settings.svg'
    
    -- Search иконки
    WHEN id = 'search-magnify-icon' THEN 'magnify.svg'
    WHEN id = 'search-input-icon' THEN 'magnify.svg'
    WHEN id = 'search-recent-icon' THEN 'recent.svg'
    WHEN id = 'search-trending-icon' THEN 'trending.svg'
    
    -- System иконки
    WHEN id = 'header-search-icon' THEN 'header-search.svg'
    WHEN id = 'header-menu-icon' THEN 'header-menu.svg'
    WHEN id = 'swap-settings-icon' THEN 'swap-settings.svg'
    WHEN id = 'swap-arrow-main' THEN 'swap-arrow.svg'
    WHEN id = 'receive-qr-main' THEN 'qr-main.svg'
    WHEN id = 'receive-copy-icon' THEN 'copy.svg'
    
    -- Receive Network QR иконки
    WHEN id = 'receive-network-qr-icon-sol' THEN 'qr-sol.svg'
    WHEN id = 'receive-network-qr-icon-usdc' THEN 'qr-usdc.svg'
    WHEN id = 'receive-network-qr-icon-usdt' THEN 'qr-usdt.svg'
    WHEN id = 'receive-network-qr-icon-ray' THEN 'qr-ray.svg'
    WHEN id = 'receive-network-qr-icon-jupiter' THEN 'qr-jupiter.svg'
    WHEN id = 'receive-network-qr-icon-orca' THEN 'qr-orca.svg'
    
    -- Receive Network Copy иконки
    WHEN id = 'receive-network-copy-icon-sol' THEN 'copy-sol.svg'
    WHEN id = 'receive-network-copy-icon-usdc' THEN 'copy-usdc.svg'
    WHEN id = 'receive-network-copy-icon-usdt' THEN 'copy-usdt.svg'
    WHEN id = 'receive-network-copy-icon-ray' THEN 'copy-ray.svg'
    WHEN id = 'receive-network-copy-icon-jupiter' THEN 'copy-jupiter.svg'
    WHEN id = 'receive-network-copy-icon-orca' THEN 'copy-orca.svg'
    
    -- Dropdown иконки
    WHEN id = 'dropdown-copy-icon-1' THEN 'copy-1.svg'
    WHEN id = 'dropdown-copy-icon-2' THEN 'copy-2.svg'
    
    ELSE 'default.svg'
  END,
  
  icon_group = CASE 
    -- Группировка дублирующихся иконок
    WHEN id IN ('search-magnify-icon', 'search-input-icon') THEN 'search'
    WHEN id IN ('nav-swap-icon', 'action-swap-main') THEN 'swap'
    WHEN id LIKE 'receive-network-qr-icon-%' OR id = 'receive-qr-main' THEN 'qr'
    WHEN id LIKE 'receive-network-copy-icon-%' OR id = 'receive-copy-icon' OR id LIKE 'dropdown-copy-icon-%' THEN 'copy'
    ELSE NULL
  END,
  
  is_customizable_icon = true,
  
  asset_library_path = CASE 
    WHEN screen = 'navigation' THEN 'wallet-icons/navigation/'
    WHEN screen = 'sidebar' THEN 'wallet-icons/sidebar/'
    WHEN screen = 'search' THEN 'wallet-icons/search/'
    WHEN screen = 'receive' THEN 'wallet-icons/receive/'
    WHEN id LIKE '%action%' THEN 'wallet-icons/actions/'
    WHEN id LIKE 'header-%' OR id LIKE 'swap-%' THEN 'wallet-icons/system/'
    WHEN id LIKE 'dropdown-%' THEN 'wallet-icons/dropdown/'
    ELSE asset_library_path
  END
  
WHERE category = 'icon';

-- Заполняем таблицу icon_variants для группировки дублирующихся иконок
INSERT INTO icon_variants (group_name, storage_file_name, storage_path, element_ids) VALUES
('search', 'magnify.svg', 'wallet-icons/search/magnify.svg', ARRAY['search-magnify-icon', 'search-input-icon']),
('swap', 'swap.svg', 'wallet-icons/actions/swap.svg', ARRAY['nav-swap-icon', 'action-swap-main']),
('qr', 'qr-main.svg', 'wallet-icons/receive/qr-main.svg', ARRAY['receive-qr-main', 'receive-network-qr-icon-sol', 'receive-network-qr-icon-usdc', 'receive-network-qr-icon-usdt', 'receive-network-qr-icon-ray', 'receive-network-qr-icon-jupiter', 'receive-network-qr-icon-orca']),
('copy', 'copy.svg', 'wallet-icons/receive/copy.svg', ARRAY['receive-copy-icon', 'receive-network-copy-icon-sol', 'receive-network-copy-icon-usdc', 'receive-network-copy-icon-usdt', 'receive-network-copy-icon-ray', 'receive-network-copy-icon-jupiter', 'receive-network-copy-icon-orca', 'dropdown-copy-icon-1', 'dropdown-copy-icon-2'])
ON CONFLICT DO NOTHING;

-- Включаем RLS для новых таблиц
ALTER TABLE icon_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_icons ENABLE ROW LEVEL SECURITY;

-- Политики для icon_variants (публичное чтение)
CREATE POLICY "Anyone can view icon variants" ON icon_variants FOR SELECT USING (true);

-- Политики для user_custom_icons (пользователи могут управлять своими иконками)
CREATE POLICY "Users can view their custom icons" ON user_custom_icons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their custom icons" ON user_custom_icons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their custom icons" ON user_custom_icons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their custom icons" ON user_custom_icons FOR DELETE USING (auth.uid() = user_id);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_wallet_elements_icon_group ON wallet_elements(icon_group) WHERE icon_group IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wallet_elements_storage_file ON wallet_elements(storage_file_name) WHERE storage_file_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_custom_icons_user_element ON user_custom_icons(user_id, element_id);
CREATE INDEX IF NOT EXISTS idx_icon_variants_group ON icon_variants(group_name);

-- Функция для получения финальной иконки (пользовательская или дефолтная)
CREATE OR REPLACE FUNCTION get_final_icon_path(p_element_id TEXT, p_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  custom_path TEXT;
  default_path TEXT;
BEGIN
  -- Проверяем есть ли пользовательская иконка
  IF p_user_id IS NOT NULL THEN
    SELECT custom_storage_path INTO custom_path
    FROM user_custom_icons 
    WHERE element_id = p_element_id AND user_id = p_user_id AND is_active = true
    ORDER BY upload_timestamp DESC
    LIMIT 1;
    
    IF custom_path IS NOT NULL THEN
      RETURN custom_path;
    END IF;
  END IF;
  
  -- Возвращаем дефолтный путь
  SELECT CONCAT(asset_library_path, storage_file_name) INTO default_path
  FROM wallet_elements 
  WHERE id = p_element_id;
  
  RETURN COALESCE(default_path, 'wallet-icons/default.svg');
END;
$$;

-- Проверка результатов
SELECT 
  'Icons with storage paths' as check_type,
  COUNT(*) as count
FROM wallet_elements 
WHERE category = 'icon' AND storage_file_name IS NOT NULL
UNION ALL
SELECT 
  'Icon variants groups' as check_type,
  COUNT(*) as count
FROM icon_variants
UNION ALL
SELECT 
  'Icons by group' as check_type,
  COUNT(*) as count
FROM wallet_elements 
WHERE category = 'icon' AND icon_group IS NOT NULL;
