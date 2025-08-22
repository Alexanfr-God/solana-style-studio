
-- Create user_themes table for storing personalized themes
CREATE TABLE public.user_themes (
  user_id TEXT NOT NULL,
  theme_data JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_themes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access to their own themes
CREATE POLICY "Users can view their own themes" 
  ON public.user_themes 
  FOR SELECT 
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can insert their own themes" 
  ON public.user_themes 
  FOR INSERT 
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can update their own themes" 
  ON public.user_themes 
  FOR UPDATE 
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'))
  WITH CHECK (user_id = COALESCE(auth.uid()::text, 'anonymous'));

CREATE POLICY "Users can delete their own themes" 
  ON public.user_themes 
  FOR DELETE 
  USING (user_id = COALESCE(auth.uid()::text, 'anonymous'));

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_themes_updated_at
  BEFORE UPDATE ON public.user_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_themes_updated_at();
