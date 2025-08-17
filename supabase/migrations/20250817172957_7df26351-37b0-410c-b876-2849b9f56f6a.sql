-- Migration: Secure auth_nonces table from token theft attacks
-- Date: 2025-01-17  
-- Purpose: Fix AUTHENTICATION_TOKENS_EXPOSED vulnerability by enabling RLS protection

-- Enable Row Level Security on auth_nonces table
ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

-- Implement strict security model: only Edge Functions (service_role) should access this table
-- Deny all access to anon and authenticated users since this is internal authentication infrastructure

-- Revoke all permissions from public roles
REVOKE ALL ON TABLE public.auth_nonces FROM PUBLIC;
REVOKE ALL ON TABLE public.auth_nonces FROM anon;
REVOKE ALL ON TABLE public.auth_nonces FROM authenticated;

-- Edge Functions use service_role which has superuser privileges and can bypass RLS
-- But we'll create policies for documentation and additional security layers

-- Policy 1: Deny all access to anon users (extra protection)
CREATE POLICY "Deny anon access to auth nonces"
ON public.auth_nonces
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Policy 2: Deny all access to authenticated users (nonces are pre-authentication)
CREATE POLICY "Deny authenticated access to auth nonces" 
ON public.auth_nonces
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Add security documentation
COMMENT ON TABLE public.auth_nonces IS 'Authentication nonces table with strict RLS protection. Only accessible by Edge Functions via service_role. Contains sensitive temporary tokens for wallet authentication flow.';

-- Create cleanup function for expired nonces (security best practice)
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.auth_nonces 
  WHERE expires_at < now() OR used = true;
END;
$$;

-- Add comment to cleanup function
COMMENT ON FUNCTION public.cleanup_expired_nonces() IS 'Removes expired and used nonces to minimize attack surface. Should be called periodically.';

-- Create index for efficient cleanup and nonce lookup
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at ON public.auth_nonces (expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_nonces_address_nonce ON public.auth_nonces (address, nonce);

-- Add trigger to automatically clean up expired nonces on each INSERT
CREATE OR REPLACE FUNCTION public.trigger_cleanup_expired_nonces()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired nonces on each insert to keep table lean
  DELETE FROM public.auth_nonces 
  WHERE expires_at < now() OR used = true;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER cleanup_nonces_on_insert
AFTER INSERT ON public.auth_nonces
FOR EACH STATEMENT
EXECUTE FUNCTION public.trigger_cleanup_expired_nonces();