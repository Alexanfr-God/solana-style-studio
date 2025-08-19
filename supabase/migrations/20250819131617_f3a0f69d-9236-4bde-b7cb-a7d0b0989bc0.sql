
-- Добавляем недостающие колонки в таблицу presets
ALTER TABLE presets ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE presets ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Конвертируем tags в jsonb для большей гибкости
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='presets' AND column_name='tags' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE presets ALTER COLUMN tags TYPE jsonb USING to_jsonb(tags);
  END IF;
END$$;

-- Мигрируем существующие sample_context и sample_patch в payload (если есть данные)
UPDATE presets 
SET payload = COALESCE(payload, '{}'::jsonb) || jsonb_build_object(
  'sample_context', COALESCE(sample_context, ''),
  'patch', COALESCE(sample_patch, '[]'::jsonb)
)
WHERE sample_context IS NOT NULL OR sample_patch IS NOT NULL;

-- Настраиваем RLS для публичного чтения пресетов
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Разрешаем всем читать пресеты (они публичные)
DROP POLICY IF EXISTS "presets read public" ON presets;
CREATE POLICY "presets read public" ON presets 
FOR SELECT USING (true);

-- Ограничиваем модификацию только для админов через service role
DROP POLICY IF EXISTS "presets admin only" ON presets;
CREATE POLICY "presets admin only" ON presets 
FOR ALL USING (false) WITH CHECK (false);
