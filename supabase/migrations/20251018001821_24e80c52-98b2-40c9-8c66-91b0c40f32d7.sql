-- Fix Footer container screen from 'global' to 'home'
UPDATE wallet_elements 
SET screen = 'home'
WHERE id = 'global-bottom-nav-container' AND screen = 'global';