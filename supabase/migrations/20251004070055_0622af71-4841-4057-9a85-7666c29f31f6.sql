-- ============================================
-- Migration: Native Supabase Web3 Auth
-- ============================================

-- 1. Add unique constraint on wallet_profiles (wallet_address, chain)
-- This prevents duplicate wallet entries
ALTER TABLE public.wallet_profiles 
  ADD CONSTRAINT wallet_profiles_wallet_chain_unique 
  UNIQUE (wallet_address, chain);

-- 2. Add foreign key to auth.users
-- Note: user_id is already nullable, which allows existing records
ALTER TABLE public.wallet_profiles 
  ADD CONSTRAINT wallet_profiles_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 3. Create trigger function to auto-create wallet_profiles
-- When a Web3 user signs in, automatically create/update their profile
CREATE OR REPLACE FUNCTION public.handle_web3_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_addr TEXT;
  chain_type TEXT;
  identity_data JSONB;
BEGIN
  -- Extract wallet info from the first identity (Web3 identity)
  SELECT 
    i.identity_data->>'wallet_address',
    i.identity_data->>'chain',
    i.identity_data
  INTO wallet_addr, chain_type, identity_data
  FROM auth.identities i
  WHERE i.user_id = NEW.id
    AND i.provider IN ('solana', 'ethereum')
  LIMIT 1;

  -- If no Web3 identity found, check raw_user_meta_data (fallback)
  IF wallet_addr IS NULL THEN
    wallet_addr := NEW.raw_user_meta_data->>'wallet_address';
    chain_type := NEW.raw_user_meta_data->>'chain';
    identity_data := NEW.raw_user_meta_data;
  END IF;

  -- Only proceed if wallet_address exists
  IF wallet_addr IS NOT NULL THEN
    -- Upsert wallet_profiles
    INSERT INTO public.wallet_profiles (
      user_id,
      wallet_address,
      chain,
      last_login_at,
      metadata
    )
    VALUES (
      NEW.id,
      wallet_addr,
      COALESCE(chain_type, 'ethereum'),
      NOW(),
      COALESCE(identity_data, '{}'::jsonb)
    )
    ON CONFLICT (wallet_address, chain) 
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      last_login_at = NOW(),
      metadata = EXCLUDED.metadata,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Create trigger on auth.users
CREATE TRIGGER on_web3_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_web3_user();

-- 5. Create trigger for existing user logins (update last_login_at)
CREATE OR REPLACE FUNCTION public.handle_web3_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_addr TEXT;
  chain_type TEXT;
BEGIN
  -- Get wallet info from identities
  SELECT 
    i.identity_data->>'wallet_address',
    i.identity_data->>'chain'
  INTO wallet_addr, chain_type
  FROM auth.identities i
  WHERE i.user_id = NEW.id
    AND i.provider IN ('solana', 'ethereum')
  LIMIT 1;

  -- Update last_login_at for existing profiles
  IF wallet_addr IS NOT NULL THEN
    UPDATE public.wallet_profiles
    SET last_login_at = NOW(),
        updated_at = NOW()
    WHERE wallet_address = wallet_addr
      AND chain = COALESCE(chain_type, 'ethereum');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_web3_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.handle_web3_user_login();

-- 6. Drop auth_nonces table (no longer needed)
DROP TABLE IF EXISTS public.auth_nonces CASCADE;