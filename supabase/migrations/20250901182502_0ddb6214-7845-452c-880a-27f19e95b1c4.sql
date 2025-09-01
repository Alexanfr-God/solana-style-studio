
-- Убрать foreign key constraint который блокирует создание wallet профилей
ALTER TABLE public.wallet_profiles 
DROP CONSTRAINT IF EXISTS wallet_profiles_user_id_fkey;

-- Сделать user_id nullable для wallet профилей  
ALTER TABLE public.wallet_profiles 
ALTER COLUMN user_id DROP NOT NULL;

-- Убрать системного пользователя из auth.users (он не нужен)
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- Очистить старые политики
DROP POLICY IF EXISTS "Allow wallet system access to wallet profiles" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Allow wallet profile read access" ON public.wallet_profiles;
DROP POLICY IF EXISTS "Wallet users can create ai requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Wallet users can manage custom icons" ON public.user_custom_icons;

-- Создать простые политики для wallet профилей
CREATE POLICY "Anyone can read wallet profiles"
ON public.wallet_profiles FOR SELECT
USING (true);

CREATE POLICY "Anyone can create wallet profiles"
ON public.wallet_profiles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update wallet profiles by address"
ON public.wallet_profiles FOR UPDATE
USING (true);

-- Политики для ai_requests - разрешить создание без user_id
CREATE POLICY "Allow ai requests without user_id"
ON public.ai_requests FOR INSERT
WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow reading ai requests without user_id"
ON public.ai_requests FOR SELECT
USING (user_id IS NULL);

-- Политики для user_custom_icons - разрешить для wallet адресов
CREATE POLICY "Allow custom icons without user_id"
ON public.user_custom_icons FOR ALL
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);
