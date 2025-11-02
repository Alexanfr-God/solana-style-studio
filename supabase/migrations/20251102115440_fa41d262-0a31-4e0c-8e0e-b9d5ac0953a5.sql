-- Align screen field with currentLayer used in frontend
-- Change 'lock' to 'lockLayer' for all lockLayer JSON paths
UPDATE wallet_elements
SET screen = 'lockLayer'
WHERE screen = 'lock'
  AND json_path LIKE '/lockLayer/%';

-- Verify the update
-- Expected: 4 rows updated (password input bg/text, unlock button bg/text)