
-- Добавить уникальный constraint для (chain, wallet_address) 
ALTER TABLE public.wallet_profiles 
ADD CONSTRAINT wallet_profiles_chain_address_uidx 
UNIQUE (chain, wallet_address);

-- Создать системного пользователя для wallet аутентификации
-- Сначала вставляем запись в auth.users
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  phone_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  app_metadata,
  user_metadata,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated', 
  'wallet-system@wcc.internal',
  now(),
  now(), 
  now(),
  now(),
  '{"provider": "wallet", "system_user": true}',
  '{"system_user": true, "wallet_system": true}',
  false,
  now(),
  now(),
  null,
  '',
  '',
  null,
  '',
  0,
  null,
  '',
  null,
  false,
  null
) ON CONFLICT (id) DO NOTHING;

-- Обновить существующие wallet_profiles чтобы у них был user_id
UPDATE public.wallet_profiles 
SET user_id = '00000000-0000-0000-0000-000000000001'
WHERE user_id IS NULL;

-- Сделать user_id NOT NULL (теперь когда все записи имеют user_id)
ALTER TABLE public.wallet_profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Обновить RLS политики для работы с wallet профилями
DROP POLICY IF EXISTS "Users can view their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can create their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can update their own wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Users can delete their own wallet profiles" ON public.wallet_profiles;

-- Создать новые политики для wallet profiles
CREATE POLICY "Allow wallet system access to wallet profiles"
ON public.wallet_profiles FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001');

CREATE POLICY "Allow wallet profile read access"
ON public.wallet_profiles FOR SELECT
USING (true);

-- Обновить политики для ai_requests чтобы wallet пользователи могли создавать запросы
CREATE POLICY "Wallet users can create ai requests" 
ON public.ai_requests FOR INSERT
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');

-- Обновить политики для user_custom_icons для wallet пользователей  
CREATE POLICY "Wallet users can manage custom icons"
ON public.user_custom_icons FOR ALL
USING (user_id = '00000000-0000-0000-0000-000000000001')
WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001');
