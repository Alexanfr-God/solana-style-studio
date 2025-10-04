-- Restore auth_nonces table for Ethereum authentication
CREATE TABLE IF NOT EXISTS public.auth_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain text NOT NULL DEFAULT 'ethereum',
  nonce text NOT NULL,
  used boolean NOT NULL DEFAULT false,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_auth_nonces_wallet ON public.auth_nonces(wallet_address, chain);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires ON public.auth_nonces(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_used ON public.auth_nonces(used) WHERE used = false;

-- Enable RLS
ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

-- Service role can manage all nonces (used by Edge Function)
CREATE POLICY "Service role can manage nonces"
  ON public.auth_nonces
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recreate validation trigger (uses existing function validate_auth_nonce_expiry)
DROP TRIGGER IF EXISTS validate_nonce_expiry ON public.auth_nonces;
CREATE TRIGGER validate_nonce_expiry
  BEFORE INSERT OR UPDATE ON public.auth_nonces
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_auth_nonce_expiry();

-- Recreate cleanup trigger (uses existing function trigger_cleanup_expired_nonces)
DROP TRIGGER IF EXISTS cleanup_nonces_on_insert ON public.auth_nonces;
CREATE TRIGGER cleanup_nonces_on_insert
  AFTER INSERT ON public.auth_nonces
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_cleanup_expired_nonces();