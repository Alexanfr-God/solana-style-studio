
-- Add missing Unlock screen elements to wallet_elements table
INSERT INTO public.wallet_elements (id, name, selector, screen, type, description, customizable, position, parent_element) VALUES
('unlock-screen-container', 'Unlock Screen Background', 'unlock-screen-container', 'login', 'container', 'Main background container for the unlock screen', true, 'full', null),
('unlock-form-wrapper', 'Unlock Form Wrapper', 'unlock-form-wrapper', 'login', 'container', 'Wrapper container for the unlock form elements', true, 'bottom', 'unlock-screen-container'),
('unlock-password-field-container', 'Password Field Container', 'unlock-password-field-container', 'login', 'container', 'Container for password input field and toggle button', true, 'middle', 'unlock-form-wrapper');
