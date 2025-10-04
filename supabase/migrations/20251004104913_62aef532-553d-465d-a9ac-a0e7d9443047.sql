-- Step 1: Временно открываем SELECT для всех (для тестирования)
DROP POLICY IF EXISTS "Users can view their own themes" ON public.user_themes;

CREATE POLICY "Temporary public read access to user_themes"
ON public.user_themes
FOR SELECT
TO public
USING (true);