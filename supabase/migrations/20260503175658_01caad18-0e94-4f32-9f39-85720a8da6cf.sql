
-- wallet_profiles: drop all public-role rules. wallet-auth edge function uses service role.
DROP POLICY IF EXISTS "Anyone can read wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Anyone can create wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Anyone can update wallet profiles by address" ON public.wallet_profiles;

-- extension_bridge_snapshots: drop public read; keep public insert for the browser extension.
DROP POLICY IF EXISTS "Allow public read" ON public.extension_bridge_snapshots;
