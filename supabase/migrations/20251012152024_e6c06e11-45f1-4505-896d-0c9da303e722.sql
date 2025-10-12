-- Phase 4: Исправление json_path для критичных элементов
-- ВАЖНО: Все пути должны указывать на СКАЛЯРНЫЕ значения (не объекты)

-- 1) home-asset-item: контейнер карточки (фон)
UPDATE wallet_elements 
SET json_path = '/assetCard/backgroundColor',
    updated_at = NOW()
WHERE id = 'home-asset-item';

-- 2) home-send-icon: иконка внутри кнопки Send
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/sendButton/iconColor',
    updated_at = NOW()
WHERE id = 'home-send-icon';

-- 3) home-receive-icon: иконка внутри кнопки Receive
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/receiveButton/iconColor',
    updated_at = NOW()
WHERE id = 'home-receive-icon';

-- 4) home-buy-icon: иконка внутри кнопки Buy
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/buyButton/iconColor',
    updated_at = NOW()
WHERE id = 'home-buy-icon';

-- 5) home-swap-icon: иконка внутри кнопки Swap
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/swapButton/iconColor',
    updated_at = NOW()
WHERE id = 'home-swap-icon';

-- 6) home-send-button: контейнер кнопки Send (фон)
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/sendButton/containerColor',
    updated_at = NOW()
WHERE id = 'home-send-button';

-- 7) home-receive-button: контейнер кнопки Receive (фон)
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/receiveButton/containerColor',
    updated_at = NOW()
WHERE id = 'home-receive-button';

-- 8) home-buy-button: контейнер кнопки Buy (фон)
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/buyButton/containerColor',
    updated_at = NOW()
WHERE id = 'home-buy-button';

-- 9) home-swap-button: контейнер кнопки Swap (фон)
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/swapButton/containerColor',
    updated_at = NOW()
WHERE id = 'home-swap-button';

-- 10) home-send-label: текст лейбла кнопки Send
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/sendButton/labelColor',
    updated_at = NOW()
WHERE id = 'home-send-label';

-- 11) home-receive-label: текст лейбла кнопки Receive
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/receiveButton/labelColor',
    updated_at = NOW()
WHERE id = 'home-receive-label';

-- 12) home-buy-label: текст лейбла кнопки Buy
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/buyButton/labelColor',
    updated_at = NOW()
WHERE id = 'home-buy-label';

-- 13) home-swap-label: текст лейбла кнопки Swap
UPDATE wallet_elements 
SET json_path = '/homeLayer/actionButtons/swapButton/labelColor',
    updated_at = NOW()
WHERE id = 'home-swap-label';