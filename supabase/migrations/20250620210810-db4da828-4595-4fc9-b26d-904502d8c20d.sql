
-- Create a public storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Create policies for the generated-images bucket
-- Allow public read access to all images
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own generated images"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a table to store metadata about generated images
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  prompt TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  generation_mode TEXT NOT NULL, -- 'dalle' or 'replicate'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on generated_images table
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own generated images
CREATE POLICY "Users can view their own generated images"
ON public.generated_images FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to insert their own generated images
CREATE POLICY "Users can insert their own generated images"
ON public.generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);
