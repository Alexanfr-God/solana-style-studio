
-- Migration: Hardening RLS protection for wallet_profiles table
-- Date: 2025-01-17
-- Purpose: Complete security hardening - FORCE RLS, NOT NULL user_id, deny-by-default permissions

-- Step 1: Check and populate NULL user_id values
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    -- Count records with NULL user_id
    SELECT COUNT(*) INTO null_count 
    FROM public.wallet_profiles 
    WHERE user_id IS NULL;
    
    IF null_count > 0 THEN
        RAISE NOTICE 'Found % records with NULL user_id. These need manual data migration before applying NOT NULL constraint.', null_count;
        
        -- Option 1: Delete orphaned records (uncomment if acceptable)
        -- DELETE FROM public.wallet_profiles WHERE user_id IS NULL;
        -- RAISE NOTICE 'Deleted % orphaned records with NULL user_id', null_count;
        
        -- Option 2: Assign to a system user (create one if needed)
        -- UPDATE public.wallet_profiles 
        -- SET user_id = '00000000-0000-0000-0000-000000000000'::uuid 
        -- WHERE user_id IS NULL;
        
        -- For now, we'll halt the migration if there are NULL values
        IF null_count > 0 THEN
            RAISE EXCEPTION 'Cannot proceed: % records have NULL user_id. Please migrate data first.', null_count;
        END IF;
    END IF;
END $$;

-- Step 2: Make user_id NOT NULL (only if no NULL values exist)
ALTER TABLE public.wallet_profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Enable FORCE ROW LEVEL SECURITY (stricter than regular RLS)
ALTER TABLE public.wallet_profiles FORCE ROW LEVEL SECURITY;

-- Step 4: Implement deny-by-default permission model
-- Revoke all existing permissions
REVOKE ALL ON TABLE public.wallet_profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.wallet_profiles FROM anon;
REVOKE ALL ON TABLE public.wallet_profiles FROM authenticated;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_profiles TO authenticated;

-- Step 5: Verify existing RLS policies are still active
-- (The policies created in previous migration should still be active)
-- If needed, recreate them:

DROP POLICY IF EXISTS "Users can view their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can create their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can update their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can delete their own wallet profiles" ON public.wallet_profiles;

-- Recreate policies with stricter validation
CREATE POLICY "Users can view their own wallet profiles"
ON public.wallet_profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet profiles"
ON public.wallet_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet profiles"
ON public.wallet_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallet profiles"
ON public.wallet_profiles
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Step 6: Add security documentation
COMMENT ON TABLE public.wallet_profiles IS 'Wallet profiles with FORCE RLS enabled. Deny-by-default permissions. Only authenticated users can access their own profiles (user_id = auth.uid()).';

-- Step 7: Create verification view for admins (optional)
CREATE OR REPLACE VIEW admin.wallet_profiles_security_status AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    -- Note: relforcerowsecurity requires direct system catalog query
    (SELECT relforcerowsecurity FROM pg_class WHERE relname = 'wallet_profiles') as force_rls_enabled,
    (SELECT COUNT(*) FROM public.wallet_profiles WHERE user_id IS NULL) as null_user_id_count
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'wallet_profiles';
