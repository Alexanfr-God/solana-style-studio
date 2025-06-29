
-- Добавляем новые поля в таблицу wallet_elements
ALTER TABLE public.wallet_elements 
ADD COLUMN parent_element TEXT REFERENCES wallet_elements(id),
ADD COLUMN z_index INTEGER DEFAULT 0,
ADD COLUMN responsive_settings JSONB DEFAULT '{}';

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_wallet_elements_parent ON public.wallet_elements(parent_element);
CREATE INDEX idx_wallet_elements_z_index ON public.wallet_elements(z_index);

-- Обновляем существующие записи с дефолтными значениями z_index основываясь на позиции
UPDATE public.wallet_elements 
SET z_index = CASE 
  WHEN position = 'header' THEN 100
  WHEN position = 'content' THEN 50
  WHEN position = 'footer' THEN 10
  ELSE 1
END
WHERE z_index = 0;
