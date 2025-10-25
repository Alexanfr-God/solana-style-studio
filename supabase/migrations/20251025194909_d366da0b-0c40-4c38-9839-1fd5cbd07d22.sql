-- Create table for storing minted NFT themes
CREATE TABLE public.minted_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Blockchain data
  network text NOT NULL DEFAULT 'devnet',
  tx_sig text NOT NULL,
  mint_address text NOT NULL UNIQUE,
  owner_address text NOT NULL,
  
  -- Metadata
  metadata_uri text NOT NULL,
  theme_name text,
  image_url text,
  
  -- Optional: link to authenticated user
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for fast queries
CREATE INDEX idx_minted_themes_created_at ON public.minted_themes (created_at DESC);
CREATE INDEX idx_minted_themes_owner ON public.minted_themes (owner_address);
CREATE INDEX idx_minted_themes_mint ON public.minted_themes (mint_address);
CREATE INDEX idx_minted_themes_network ON public.minted_themes (network);

-- Enable RLS
ALTER TABLE public.minted_themes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read (public gallery)
CREATE POLICY "Allow public read access to minted themes"
  ON public.minted_themes
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert minted themes"
  ON public.minted_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to insert (for anonymous minting)
CREATE POLICY "Allow anonymous insert minted themes"
  ON public.minted_themes
  FOR INSERT
  TO anon
  WITH CHECK (true);