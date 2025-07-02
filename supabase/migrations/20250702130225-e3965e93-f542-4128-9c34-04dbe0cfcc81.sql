
-- Добавляем новые поля в таблицу wallet_elements
ALTER TABLE wallet_elements 
ADD COLUMN category VARCHAR(50),
ADD COLUMN asset_library_path TEXT;

-- Создаем таблицу для настроек категорий элементов
CREATE TABLE element_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  customization_types JSONB DEFAULT '[]'::jsonb,
  default_library_path TEXT,
  icon_color VARCHAR(7) DEFAULT '#9945FF',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS для element_categories
ALTER TABLE element_categories ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения категорий (публичный доступ)
CREATE POLICY "Allow public read access to element categories"
ON element_categories FOR SELECT
USING (true);

-- Заполняем базовые категории
INSERT INTO element_categories (id, name, description, customization_types, default_library_path, sort_order) VALUES
('text', 'Text Elements', 'All text-based elements like labels, headings, values', '["font", "color", "size"]', 'wallet-fonts/', 1),
('icon', 'Icons', 'All icon elements including navigation and action icons', '["icon", "color", "size"]', 'wallet-icons/', 2),
('button', 'Buttons', 'All interactive button elements', '["background", "border", "text", "icon"]', 'wallet-icons/buttons/', 3),
('container', 'Containers', 'Layout containers and wrapper elements', '["background", "border", "spacing"]', 'wallet-assets/containers/', 4),
('input', 'Input Fields', 'All input and form elements', '["border", "background", "text"]', 'wallet-assets/inputs/', 5),
('navigation', 'Navigation', 'Navigation tabs and menu elements', '["background", "icon", "text"]', 'wallet-icons/navigation/', 6),
('balance', 'Balance Display', 'Balance and financial value displays', '["font", "color", "format"]', 'wallet-fonts/balance/', 7),
('asset', 'Asset Items', 'Token and asset list items', '["icon", "background", "text"]', 'wallet-icons/tokens/', 8);

-- Обновляем существующие элементы с категориями на основе их типа
UPDATE wallet_elements SET category = 
  CASE 
    WHEN type = 'text' THEN 'text'
    WHEN type = 'icon' THEN 'icon'
    WHEN type = 'button' THEN 'button'
    WHEN type = 'container' THEN 'container'
    WHEN type = 'input' THEN 'input'
    WHEN screen = 'navigation' OR name ILIKE '%nav%' THEN 'navigation'
    WHEN name ILIKE '%balance%' OR name ILIKE '%amount%' OR name ILIKE '%value%' THEN 'balance'
    WHEN name ILIKE '%asset%' OR name ILIKE '%token%' OR name ILIKE '%coin%' THEN 'asset'
    ELSE type
  END;

-- Создаем Storage buckets для ресурсов
INSERT INTO storage.buckets (id, name, public) VALUES 
('wallet-icons', 'wallet-icons', true),
('wallet-fonts', 'wallet-fonts', true),
('wallet-assets', 'wallet-assets', true);

-- Создаем политики для Storage buckets (публичный доступ для чтения)
CREATE POLICY "Public read access for wallet-icons" ON storage.objects 
FOR SELECT USING (bucket_id = 'wallet-icons');

CREATE POLICY "Public read access for wallet-fonts" ON storage.objects 
FOR SELECT USING (bucket_id = 'wallet-fonts');

CREATE POLICY "Public read access for wallet-assets" ON storage.objects 
FOR SELECT USING (bucket_id = 'wallet-assets');

-- Политики для загрузки (для аутентифицированных пользователей)
CREATE POLICY "Authenticated users can upload to wallet-icons" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'wallet-icons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload to wallet-fonts" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'wallet-fonts' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload to wallet-assets" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'wallet-assets' AND auth.role() = 'authenticated');

-- Добавляем триггер для обновления updated_at в element_categories
CREATE TRIGGER update_element_categories_updated_at 
BEFORE UPDATE ON element_categories 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
