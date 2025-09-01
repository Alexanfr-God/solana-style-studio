
-- Удаляем старую политику если существует
DROP POLICY IF EXISTS "Authenticated users can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to user-uploads folder" ON storage.objects;

-- Создаем новую политику для INSERT с ограничением по папке
CREATE POLICY "Public upload to user-uploads folder" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'generated-images' AND 
    (name LIKE 'user-uploads/%' OR auth.role() = 'authenticated')
  );

-- Убеждаемся что есть политика для SELECT (чтение публичных файлов)
CREATE POLICY IF NOT EXISTS "Allow public read access" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'generated-images');
