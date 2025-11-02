-- Remove duplicate footer background mapping
-- Keep global-bottom-nav-container, remove home-footer-bg
DELETE FROM wallet_elements 
WHERE id = 'home-footer-bg';