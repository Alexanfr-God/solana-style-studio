ALTER TABLE public.minted_themes
  ADD COLUMN IF NOT EXISTS skin_kind text NOT NULL DEFAULT 'wcc'
  CHECK (skin_kind IN ('wcc','phantom'));

UPDATE public.minted_themes
  SET is_verified = true, skin_kind = 'phantom'
  WHERE mint_address = '4jGVoY5kC3b4cLZ5E6NnKq3WtqgoQF9EHKe7N7s5qSbY';