-- A. БД - синхронизация слоя и селекторов для lockLayer

-- A.1. UPDATE screen='lockLayer' для всех lock-маппингов
UPDATE wallet_elements
SET screen = 'lockLayer'
WHERE screen = 'lock'
  AND json_path LIKE '/lockLayer/%';

-- A.2. Исправить селектор для placeholderColor (был неверный)
UPDATE wallet_elements
SET selector = '[data-element-id="login-password-input"]'
WHERE json_path = '/lockLayer/passwordInput/placeholderColor';

-- A.3. Добавить/обновить маппинг контейнера лок-экрана
INSERT INTO wallet_elements (id, name, selector, json_path, screen, type, customizable, description)
VALUES (
  'lock-unlock-screen-container',
  'Lock Screen Container Background',
  '[data-element-id="unlock-screen-container"]',
  '/lockLayer/backgroundColor',
  'lockLayer',
  'container',
  true,
  'Main background color for the lock screen container'
)
ON CONFLICT (id) DO UPDATE SET
  screen = EXCLUDED.screen,
  selector = EXCLUDED.selector,
  json_path = EXCLUDED.json_path,
  customizable = EXCLUDED.customizable;

-- Валидация: все lockLayer маппинги должны иметь screen='lockLayer'
DO $$
DECLARE
  wrong_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO wrong_count
  FROM wallet_elements
  WHERE json_path LIKE '/lockLayer/%'
    AND screen <> 'lockLayer';
  
  IF wrong_count > 0 THEN
    RAISE EXCEPTION 'Found % lockLayer paths with wrong screen value', wrong_count;
  END IF;
  
  RAISE NOTICE '✅ All lockLayer paths have correct screen="lockLayer"';
END $$;