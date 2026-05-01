CREATE POLICY "Anyone can verify minted themes"
  ON public.minted_themes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);