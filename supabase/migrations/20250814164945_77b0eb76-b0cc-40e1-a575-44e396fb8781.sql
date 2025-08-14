
-- Create private storage bucket for theme exports
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false);

-- Create RLS policy for exports bucket - users can only access their own files
CREATE POLICY "Users can insert their own exports" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can select their own exports" ON storage.objects
FOR SELECT USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own exports" ON storage.objects
FOR UPDATE USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own exports" ON storage.objects
FOR DELETE USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);
