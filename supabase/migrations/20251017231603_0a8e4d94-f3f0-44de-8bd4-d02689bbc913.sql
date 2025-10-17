-- Fix element IDs to follow screen-slug pattern for AI-Vision compatibility

-- 1) Rename global elements
UPDATE wallet_elements SET id = 'global-wallet-background' WHERE id = 'wallet-background';
UPDATE wallet_elements SET id = 'global-bottom-nav-container' WHERE id = 'bottom-nav-container';
UPDATE wallet_elements SET id = 'global-wallet-main-container' WHERE id = 'wallet-main-container';
UPDATE wallet_elements SET id = 'global-wallet-white-border' WHERE id = 'wallet-white-border';

-- 2) Rename navigation elements
UPDATE wallet_elements SET id = 'navigation-home' WHERE id = 'nav-home';
UPDATE wallet_elements SET id = 'navigation-history' WHERE id = 'nav-history';
UPDATE wallet_elements SET id = 'navigation-apps' WHERE id = 'nav-apps';
UPDATE wallet_elements SET id = 'navigation-swap' WHERE id = 'nav-swap';
UPDATE wallet_elements SET id = 'navigation-search' WHERE id = 'nav-search';

-- 3) Rename home icons
UPDATE wallet_elements SET id = 'home-action-buy-icon' WHERE id = 'action-buy-icon';
UPDATE wallet_elements SET id = 'home-action-send-icon' WHERE id = 'action-send-icon';
UPDATE wallet_elements SET id = 'home-action-receive-icon' WHERE id = 'action-receive-icon';
UPDATE wallet_elements SET id = 'home-action-swap-main' WHERE id = 'action-swap-main';
UPDATE wallet_elements SET id = 'home-header-menu-icon' WHERE id = 'header-menu-icon';
UPDATE wallet_elements SET id = 'home-header-search-icon' WHERE id = 'header-search-icon';

-- 4) Rename sidebar elements
UPDATE wallet_elements SET id = 'sidebar-account-sidebar-content' WHERE id = 'account-sidebar-content';
UPDATE wallet_elements SET id = 'sidebar-account-sidebar-header' WHERE id = 'account-sidebar-header';
UPDATE wallet_elements SET id = 'sidebar-account-sidebar-overlay' WHERE id = 'account-sidebar-overlay';
UPDATE wallet_elements SET id = 'sidebar-account-sidebar-panel' WHERE id = 'account-sidebar-panel';
UPDATE wallet_elements SET id = 'sidebar-account-menu-copy' WHERE id = 'account-menu-copy';
UPDATE wallet_elements SET id = 'sidebar-account-menu-disconnect' WHERE id = 'account-menu-disconnect';
UPDATE wallet_elements SET id = 'sidebar-account-menu-explorer' WHERE id = 'account-menu-explorer';
UPDATE wallet_elements SET id = 'sidebar-account-menu-settings' WHERE id = 'account-menu-settings';
UPDATE wallet_elements SET id = 'sidebar-account-menu-item' WHERE id = 'account-menu-item';

-- 5) Rename lock screen elements
UPDATE wallet_elements SET id = 'lock-unlock-screen-background-image' WHERE id = 'unlock-screen-background-image';
UPDATE wallet_elements SET id = 'lock-unlock-screen-container' WHERE id = 'unlock-screen-container';

-- 6) Rename global nav tabs & labels
UPDATE wallet_elements SET id = 'global-nav-apps-tab' WHERE id = 'nav-apps-tab';
UPDATE wallet_elements SET id = 'global-nav-apps-label' WHERE id = 'nav-apps-label';
UPDATE wallet_elements SET id = 'global-nav-history-tab' WHERE id = 'nav-history-tab';
UPDATE wallet_elements SET id = 'global-nav-history-label' WHERE id = 'nav-history-label';
UPDATE wallet_elements SET id = 'global-nav-home-tab' WHERE id = 'nav-home-tab';
UPDATE wallet_elements SET id = 'global-nav-home-label' WHERE id = 'nav-home-label';
UPDATE wallet_elements SET id = 'global-nav-swap-tab' WHERE id = 'nav-swap-tab';
UPDATE wallet_elements SET id = 'global-nav-swap-label' WHERE id = 'nav-swap-label';