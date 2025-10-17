-- Migration: Auto-fill json_path with SQL heuristics and protect from overwrites
-- Author: AI-Vision System
-- Date: 2025-01-18

-- ============================================================================
-- Part 1: Helper Functions for JSON Path Computation
-- ============================================================================

-- Function to strip screen- prefix from element id
CREATE OR REPLACE FUNCTION public.strip_screen_prefix(_id text, _screen text)
RETURNS text 
LANGUAGE sql 
IMMUTABLE 
AS $$
  SELECT regexp_replace(_id, '^' || coalesce(_screen, '') || '-?', '', 'i');
$$;

-- Main function to compute json_path based on element type and id
CREATE OR REPLACE FUNCTION public.compute_json_path(
  _id text, 
  _type text, 
  _screen text, 
  _icon_group text, 
  _category text
) 
RETURNS text 
LANGUAGE plpgsql 
IMMUTABLE 
AS $$
DECLARE
  slug text := public.strip_screen_prefix(_id, _screen);
  layer_name text := _screen || 'Layer';
BEGIN
  -- Skip non-scalar types (containers, overlays, etc.)
  IF _type IN ('container','overlay','panel','grid','list') THEN 
    RETURN NULL; 
  END IF;

  -- Buttons: navigation buttons and regular buttons
  IF _type = 'button' THEN
    IF _id LIKE 'nav-%' THEN
      RETURN '/' || layer_name || '/footer/navigationIcons/' || slug || '/color';
    END IF;
    RETURN '/' || layer_name || '/buttons/' || slug || '/backgroundColor';
  END IF;

  -- Text: titles, names, descriptions
  IF _type = 'text' THEN
    IF _id LIKE '%-title' THEN
      RETURN '/' || layer_name || '/header/title/textColor';
    ELSIF _id LIKE '%-name' THEN
      RETURN '/' || layer_name || '/collectibleName/textColor';
    ELSIF _id LIKE '%-description' THEN
      RETURN '/assetCard/description/textColor';
    END IF;
    RETURN '/' || layer_name || '/text/' || slug || '/textColor';
  END IF;

  -- Icons
  IF _type = 'icon' THEN
    RETURN '/' || layer_name || '/icons/' || slug;
  END IF;

  -- Inputs
  IF _type = 'input' THEN
    RETURN '/searchLayer/searchInput';
  END IF;

  -- Default: no automatic mapping
  RETURN NULL;
END;
$$;

-- ============================================================================
-- Part 2: Preview View (Read-only, for testing)
-- ============================================================================

CREATE OR REPLACE VIEW public.wallet_elements_autofill_preview AS
SELECT
  id,
  screen,
  type,
  name,
  json_path as current_json_path,
  public.compute_json_path(id, type, screen, icon_group, category) as proposed_json_path
FROM public.wallet_elements
WHERE (json_path IS NULL OR json_path = '')
  AND public.compute_json_path(id, type, screen, icon_group, category) IS NOT NULL;

-- ============================================================================
-- Part 3: Safe UPDATE - Only fill empty json_path entries
-- ============================================================================

WITH staged AS (
  SELECT 
    id, 
    public.compute_json_path(id, type, screen, icon_group, category) as computed_path
  FROM public.wallet_elements
  WHERE (json_path IS NULL OR json_path = '')
)
UPDATE public.wallet_elements w
SET json_path = s.computed_path
FROM staged s
WHERE w.id = s.id
  AND s.computed_path IS NOT NULL
  AND (w.json_path IS NULL OR w.json_path = '');

-- ============================================================================
-- Part 4: Immutability Trigger - Prevent json_path overwrites
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_json_path_overwrite()
RETURNS trigger 
LANGUAGE plpgsql 
AS $$
BEGIN
  -- Only prevent changes if old json_path is not empty
  IF NEW.json_path IS DISTINCT FROM OLD.json_path
     AND (OLD.json_path IS NOT NULL AND OLD.json_path != '') THEN
    RAISE EXCEPTION 'json_path is immutable for id=%', OLD.id
      USING HINT = 'Set to NULL first if you need to change.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_json_path_overwrite ON public.wallet_elements;

CREATE TRIGGER trg_prevent_json_path_overwrite
BEFORE UPDATE ON public.wallet_elements
FOR EACH ROW
WHEN (OLD.json_path IS NOT NULL AND OLD.json_path != '')
EXECUTE FUNCTION public.prevent_json_path_overwrite();

-- ============================================================================
-- Part 5: RPC Function for AI-Vision to upsert mappings
-- ============================================================================

CREATE OR REPLACE FUNCTION public.upsert_ai_vision_mappings(
  element_ids text[],
  json_paths text[]
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer := 0;
  i integer;
BEGIN
  -- Validate input arrays have same length
  IF array_length(element_ids, 1) != array_length(json_paths, 1) THEN
    RAISE EXCEPTION 'element_ids and json_paths arrays must have same length';
  END IF;

  -- Update only elements with empty json_path
  FOR i IN 1..array_length(element_ids, 1)
  LOOP
    UPDATE public.wallet_elements
    SET json_path = json_paths[i]
    WHERE id = element_ids[i]
      AND (json_path IS NULL OR json_path = '');
    
    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;

  RETURN updated_count;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_ai_vision_mappings(text[], text[]) TO anon;
GRANT EXECUTE ON FUNCTION public.upsert_ai_vision_mappings(text[], text[]) TO authenticated;