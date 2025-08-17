
-- Migration: Enable RLS protection for wallet_profiles table
-- Date: 2025-01-17
-- Purpose: Fix MISSING_RLS_PROTECTION vulnerability

-- Step 1: Check if user_id column exists and add if missing
DO $$
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'wallet_profiles' 
        AND column_name = 'user_id'
    ) THEN
        -- Add user_id column as nullable first
        ALTER TABLE public.wallet_profiles 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Note: In production, you would need to populate user_id for existing rows
        -- before making it NOT NULL. For now, we'll add a constraint after data migration.
        RAISE NOTICE 'Added user_id column. You need to populate existing rows before making it NOT NULL.';
    END IF;
END $$;

-- Step 2: Create unique index to prevent duplicate wallet addresses per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_profiles_user_address 
ON public.wallet_profiles (user_id, wallet_address);

-- Step 3: Enable Row Level Security
ALTER TABLE public.wallet_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies

-- Policy for SELECT: Users can only see their own profiles
CREATE POLICY "Users can view their own wallet profiles"
ON public.wallet_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT: Users can only create profiles for themselves
CREATE POLICY "Users can create their own wallet profiles"
ON public.wallet_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE: Users can only update their own profiles
CREATE POLICY "Users can update their own wallet profiles"
ON public.wallet_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE: Users can only delete their own profiles
CREATE POLICY "Users can delete their own wallet profiles"
ON public.wallet_profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 5: Add comment for documentation
COMMENT ON TABLE public.wallet_profiles IS 'Wallet profiles with RLS protection enabled. Each user can only access their own profiles.';

-- Step 6: After data migration, make user_id NOT NULL
-- Uncomment this after populating existing rows:
-- ALTER TABLE public.wallet_profiles ALTER COLUMN user_id SET NOT NULL;
