-- Table to persist extension bridge snapshots
CREATE TABLE public.extension_bridge_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extension_id TEXT NOT NULL,
  screen TEXT DEFAULT 'unknown',
  snapshot JSONB NOT NULL,
  elements_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups of latest snapshot
CREATE INDEX idx_extension_bridge_latest ON public.extension_bridge_snapshots (extension_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.extension_bridge_snapshots ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for bridge (no auth required)
CREATE POLICY "Allow public read" ON public.extension_bridge_snapshots FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.extension_bridge_snapshots FOR INSERT WITH CHECK (true);

-- Cleanup old snapshots (keep last 100)
CREATE OR REPLACE FUNCTION public.cleanup_old_bridge_snapshots()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.extension_bridge_snapshots 
  WHERE id NOT IN (
    SELECT id FROM public.extension_bridge_snapshots 
    ORDER BY created_at DESC 
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_bridge_snapshots_trigger
AFTER INSERT ON public.extension_bridge_snapshots
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_bridge_snapshots();