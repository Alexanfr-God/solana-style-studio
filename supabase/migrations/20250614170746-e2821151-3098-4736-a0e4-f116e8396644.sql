-- Create storage bucket for wallet images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wallet-images', 'wallet-images', true);

-- RLS policies for wallet images storage
CREATE POLICY "Anyone can view wallet images" ON storage.objects
FOR SELECT USING (bucket_id = 'wallet-images');

CREATE POLICY "Anyone can upload wallet images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'wallet-images');

CREATE POLICY "Anyone can update wallet images" ON storage.objects
FOR UPDATE USING (bucket_id = 'wallet-images');

CREATE POLICY "Anyone can delete wallet images" ON storage.objects
FOR DELETE USING (bucket_id = 'wallet-images');