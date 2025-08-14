
-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create themes table
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  schema_version TEXT NOT NULL DEFAULT '1.0.0',
  base_theme JSONB NOT NULL,
  current_theme JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patches table
CREATE TABLE public.patches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  ops JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_by UUID REFERENCES auth.users(id)
);

-- Create presets table
CREATE TABLE public.presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sample_context JSONB,
  sample_patch JSONB,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schema_versions table
CREATE TABLE public.schema_versions (
  version TEXT PRIMARY KEY,
  schema JSONB NOT NULL
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_themes_project_id ON public.themes(project_id);
CREATE INDEX idx_themes_current_theme ON public.themes USING gin(current_theme jsonb_path_ops);
CREATE INDEX idx_patches_theme_id ON public.patches(theme_id);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patches ENABLE ROW LEVEL SECURITY;

-- RLS policies for projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for themes
CREATE POLICY "Users can view themes of their projects" 
  ON public.themes 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = themes.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create themes for their projects" 
  ON public.themes 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = themes.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update themes of their projects" 
  ON public.themes 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = themes.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete themes of their projects" 
  ON public.themes 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = themes.project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS policies for patches
CREATE POLICY "Users can view patches of their themes" 
  ON public.patches 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.themes t
    JOIN public.projects p ON p.id = t.project_id
    WHERE t.id = patches.theme_id 
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Users can create patches for their themes" 
  ON public.patches 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.themes t
    JOIN public.projects p ON p.id = t.project_id
    WHERE t.id = patches.theme_id 
    AND p.user_id = auth.uid()
  ));

-- Allow public read access to presets and schema_versions
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schema_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to presets" 
  ON public.presets 
  FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow public read access to schema_versions" 
  ON public.schema_versions 
  FOR SELECT 
  TO public 
  USING (true);

-- Trigger to update updated_at on themes
CREATE OR REPLACE FUNCTION update_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW
  EXECUTE FUNCTION update_themes_updated_at();
