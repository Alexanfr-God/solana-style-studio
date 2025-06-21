
-- Step 1: Create wallet providers table for external APIs
CREATE TABLE public.wallet_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  api_endpoint TEXT,
  api_key_required BOOLEAN DEFAULT false,
  supported_wallets TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create universal wallet element registry
CREATE TABLE public.wallet_element_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_type TEXT NOT NULL,
  screen_type TEXT NOT NULL,
  element_name TEXT NOT NULL,
  element_type TEXT NOT NULL,
  position JSONB NOT NULL,
  properties JSONB DEFAULT '{}',
  safe_zone JSONB,
  is_interactive BOOLEAN DEFAULT false,
  parent_element_id UUID REFERENCES public.wallet_element_registry(id),
  provider_id UUID REFERENCES public.wallet_providers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(wallet_type, screen_type, element_name)
);

-- Step 3: Create wallet instances table for dynamic switching
CREATE TABLE public.wallet_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name TEXT NOT NULL,
  wallet_type TEXT NOT NULL,
  provider_id UUID REFERENCES public.wallet_providers(id),
  structure_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 4: Create collaboration sessions table
CREATE TABLE public.collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  external_api_url TEXT,
  wallet_data JSONB,
  analysis_result JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 5: Add indexes for performance
CREATE INDEX idx_wallet_element_registry_wallet_type ON public.wallet_element_registry(wallet_type);
CREATE INDEX idx_wallet_element_registry_screen_type ON public.wallet_element_registry(screen_type);
CREATE INDEX idx_wallet_instances_wallet_type ON public.wallet_instances(wallet_type);
CREATE INDEX idx_wallet_instances_active ON public.wallet_instances(is_active);
CREATE INDEX idx_collaboration_sessions_status ON public.collaboration_sessions(status);

-- Step 6: Enable RLS on new tables
ALTER TABLE public.wallet_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_element_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (permissive for now, can be tightened later)
CREATE POLICY "Allow public read access to wallet_providers" 
  ON public.wallet_providers FOR SELECT 
  USING (true);

CREATE POLICY "Allow public read access to wallet_element_registry" 
  ON public.wallet_element_registry FOR SELECT 
  USING (true);

CREATE POLICY "Allow public access to wallet_instances" 
  ON public.wallet_instances FOR ALL 
  USING (true);

CREATE POLICY "Allow public access to collaboration_sessions" 
  ON public.collaboration_sessions FOR ALL 
  USING (true);

-- Step 8: Insert default wallet providers (fixed empty array casting)
INSERT INTO public.wallet_providers (name, supported_wallets, metadata) VALUES
  ('phantom', ARRAY['phantom'], '{"description": "Phantom Wallet", "version": "1.0"}'),
  ('solflare', ARRAY['solflare'], '{"description": "Solflare Wallet", "version": "1.0"}'),
  ('backpack', ARRAY['backpack'], '{"description": "Backpack Wallet", "version": "1.0"}'),
  ('external_api', ARRAY[]::TEXT[], '{"description": "External API Provider", "version": "1.0"}');

-- Step 9: Create trigger for updated_at
CREATE TRIGGER update_wallet_providers_updated_at BEFORE UPDATE ON public.wallet_providers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_element_registry_updated_at BEFORE UPDATE ON public.wallet_element_registry 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_instances_updated_at BEFORE UPDATE ON public.wallet_instances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaboration_sessions_updated_at BEFORE UPDATE ON public.collaboration_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
