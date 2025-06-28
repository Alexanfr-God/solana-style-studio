
-- Создаем таблицу wallet_elements для кастомизации элементов кошелька
CREATE TABLE public.wallet_elements (
  id TEXT PRIMARY KEY,
  screen TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  customizable BOOLEAN NOT NULL DEFAULT true,
  custom_props JSONB NOT NULL DEFAULT '[]'::jsonb,
  position TEXT,
  selector TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_wallet_elements_screen ON public.wallet_elements(screen);
CREATE INDEX idx_wallet_elements_type ON public.wallet_elements(type);
CREATE INDEX idx_wallet_elements_customizable ON public.wallet_elements(customizable);

-- Включаем RLS (Row Level Security)
ALTER TABLE public.wallet_elements ENABLE ROW LEVEL SECURITY;

-- Создаем политику для публичного чтения (поскольку это базовые элементы кошелька)
CREATE POLICY "Allow public read access to wallet elements" 
  ON public.wallet_elements 
  FOR SELECT 
  USING (true);

-- Политика для админов на изменение (можно будет настроить позже)
CREATE POLICY "Allow admin access to wallet elements" 
  ON public.wallet_elements 
  FOR ALL 
  USING (false); -- пока запрещаем изменения

-- Добавляем триггер для обновления updated_at
CREATE TRIGGER update_wallet_elements_updated_at
  BEFORE UPDATE ON public.wallet_elements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Заполняем таблицу данными из DetailedWalletElementsRegistry.tsx
INSERT INTO public.wallet_elements (id, screen, name, type, description, customizable, custom_props, position, selector) VALUES

-- ========== WALLET CONTAINER & BORDERS ==========
('wallet-main-container', 'global', 'Main Wallet Container', 'container', 'Main wallet container with white borders (361x601px)', true, '["bgColor", "border", "shadow", "radius"]', null, '.wallet-container'),
('wallet-white-border', 'global', 'White Border', 'container', 'White border around wallet (1px solid white)', true, '["border", "color", "width"]', null, '.wallet-border'),
('wallet-background', 'global', 'Wallet Background', 'background', 'Main wallet background area', true, '["bgColor", "backgroundImage", "gradient"]', null, '.wallet-bg'),

-- ========== LOGIN LAYER ==========
('login-header-container', 'login', 'Login Header Container', 'container', 'Header section of login screen (58px height)', true, '["bgColor", "border", "shadow", "radius"]', 'header', '.login-header'),
('login-phantom-logo-text', 'login', 'Phantom Logo Text', 'text', 'Phantom text logo in header', true, '["color", "font", "fontSize"]', 'header', '.login-logo-text'),
('login-help-icon', 'login', 'Help Icon', 'icon', 'Help circle icon in header', true, '["color", "image", "size"]', 'header', '.login-help-icon'),
('login-transition-strip', 'login', 'Transition Strip', 'container', 'Thin divider between header and content (1px)', true, '["bgColor", "border", "height"]', null, '.login-transition-strip'),
('login-main-content', 'login', 'Login Main Content', 'container', 'Main content area of login screen (541px height)', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.login-main-content'),
('login-password-title', 'login', 'Password Title', 'text', 'Enter your password text', true, '["color", "font", "fontSize"]', 'content', '.login-password-title'),
('login-password-input', 'login', 'Password Input Field', 'input', 'Password input field with placeholder', true, '["bgColor", "color", "border", "radius", "font", "placeholder"]', 'content', '.login-password-input'),
('login-show-password-button', 'login', 'Show/Hide Password Button', 'button', 'Eye icon to toggle password visibility', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.login-show-password'),
('login-forgot-password-link', 'login', 'Forgot Password Link', 'button', 'Forgot password clickable text', true, '["color", "font", "fontSize"]', 'content', '.login-forgot-password'),
('login-unlock-button', 'login', 'Unlock Button', 'button', 'Main unlock button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.login-unlock-button'),

-- ========== HOME LAYER HEADER ==========
('home-header-container', 'home', 'Home Header Container', 'container', 'Header section with account info and search', true, '["bgColor", "border", "shadow", "radius"]', 'header', '.home-header'),
('home-user-avatar', 'home', 'User Avatar', 'image', 'Round user avatar (40x40px)', true, '["border", "radius", "size"]', 'header', '.home-user-avatar'),
('home-account-dropdown-button', 'home', 'Account Dropdown Button', 'button', 'Account selector with name and address', true, '["bgColor", "color", "radius", "font", "icon"]', 'header', '.home-account-dropdown'),
('home-account-name', 'home', 'Account Name', 'text', 'Display name of current account', true, '["color", "font", "fontSize"]', 'header', '.home-account-name'),
('home-account-address', 'home', 'Account Address', 'text', 'Shortened wallet address', true, '["color", "font", "fontSize"]', 'header', '.home-account-address'),
('home-dropdown-chevron', 'home', 'Dropdown Chevron', 'icon', 'Chevron down icon for dropdown', true, '["color", "image", "size"]', 'header', '.home-dropdown-chevron'),
('home-search-button', 'home', 'Search Button', 'button', 'Search icon button in header', true, '["bgColor", "color", "radius", "font", "icon"]', 'header', '.home-search-button'),

-- ========== HOME CONTENT AREA ==========
('home-content-container', 'home', 'Home Content Container', 'container', 'Main content area for home screen', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-content'),
('home-balance-section', 'home', 'Balance Section', 'container', 'Total balance display area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-balance-section'),
('home-total-balance-label', 'home', 'Total Balance Label', 'text', 'Total Balance text label', true, '["color", "font", "fontSize"]', 'content', '.home-balance-label'),
('home-sol-amount', 'home', 'SOL Amount', 'text', 'Main SOL balance number', true, '["color", "font", "fontSize"]', 'content', '.home-sol-amount'),
('home-usd-value', 'home', 'USD Value', 'text', 'USD equivalent of balance', true, '["color", "font", "fontSize"]', 'content', '.home-usd-value'),

-- ========== ACTION BUTTONS ROW ==========
('home-actions-row', 'home', 'Action Buttons Row', 'container', 'Row container for action buttons', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-actions-row'),
('home-send-button', 'home', 'Send Button', 'button', 'Send crypto action button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.home-send-button'),
('home-send-icon', 'home', 'Send Icon', 'icon', 'Send arrow icon', true, '["color", "image", "size"]', 'content', '.home-send-icon'),
('home-send-label', 'home', 'Send Label', 'text', 'Send button text label', true, '["color", "font", "fontSize"]', 'content', '.home-send-label'),
('home-receive-button', 'home', 'Receive Button', 'button', 'Receive crypto action button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.home-receive-button'),
('home-receive-icon', 'home', 'Receive Icon', 'icon', 'Receive arrow icon', true, '["color", "image", "size"]', 'content', '.home-receive-icon'),
('home-receive-label', 'home', 'Receive Label', 'text', 'Receive button text label', true, '["color", "font", "fontSize"]', 'content', '.home-receive-label'),
('home-buy-button', 'home', 'Buy Button', 'button', 'Buy crypto action button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.home-buy-button'),
('home-buy-icon', 'home', 'Buy Icon', 'icon', 'Buy plus icon', true, '["color", "image", "size"]', 'content', '.home-buy-icon'),
('home-buy-label', 'home', 'Buy Label', 'text', 'Buy button text label', true, '["color", "font", "fontSize"]', 'content', '.home-buy-label'),
('home-swap-button', 'home', 'Swap Button', 'button', 'Swap tokens action button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.home-swap-button'),
('home-swap-icon', 'home', 'Swap Icon', 'icon', 'Swap arrows icon', true, '["color", "image", "size"]', 'content', '.home-swap-icon'),
('home-swap-label', 'home', 'Swap Label', 'text', 'Swap button text label', true, '["color", "font", "fontSize"]', 'content', '.home-swap-label'),

-- ========== ASSETS SECTION ==========
('home-assets-section', 'home', 'Assets Section', 'container', 'Assets list section container', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-assets-section'),
('home-assets-header', 'home', 'Assets Header', 'container', 'Assets section header row', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-assets-header'),
('home-assets-title', 'home', 'Assets Title', 'text', 'Assets section title', true, '["color", "font", "fontSize"]', 'content', '.home-assets-title'),
('home-see-all-button', 'home', 'See All Button', 'button', 'See all link button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.home-see-all'),
('home-assets-list', 'home', 'Assets List', 'container', 'Container for asset items', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-assets-list'),
('home-asset-item', 'home', 'Asset Item', 'container', 'Individual asset list item', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.home-asset-item'),
('home-asset-icon', 'home', 'Asset Icon', 'icon', 'Cryptocurrency icon', true, '["color", "image", "size"]', 'content', '.home-asset-icon'),
('home-asset-name', 'home', 'Asset Name', 'text', 'Asset full name', true, '["color", "font", "fontSize"]', 'content', '.home-asset-name'),
('home-asset-symbol', 'home', 'Asset Symbol', 'text', 'Asset ticker symbol', true, '["color", "font", "fontSize"]', 'content', '.home-asset-symbol'),
('home-asset-balance', 'home', 'Asset Balance', 'text', 'Asset quantity owned', true, '["color", "font", "fontSize"]', 'content', '.home-asset-balance'),
('home-asset-value', 'home', 'Asset Value', 'text', 'Asset USD value', true, '["color", "font", "fontSize"]', 'content', '.home-asset-value'),

-- ========== BOTTOM NAVIGATION ==========
('bottom-nav-container', 'global', 'Bottom Navigation Container', 'container', 'Bottom navigation bar container', true, '["bgColor", "border", "shadow", "radius"]', 'footer', '.bottom-nav'),
('nav-home-tab', 'global', 'Home Tab', 'button', 'Home navigation tab', true, '["bgColor", "color", "radius", "font", "icon"]', 'footer', '.nav-home'),
('nav-home-icon', 'global', 'Home Icon', 'icon', 'Home tab icon', true, '["color", "image", "size"]', 'footer', '.nav-home-icon'),
('nav-home-label', 'global', 'Home Label', 'text', 'Home tab text label', true, '["color", "font", "fontSize"]', 'footer', '.nav-home-label'),
('nav-swap-tab', 'global', 'Swap Tab', 'button', 'Swap navigation tab', true, '["bgColor", "color", "radius", "font", "icon"]', 'footer', '.nav-swap'),
('nav-swap-icon', 'global', 'Swap Icon', 'icon', 'Swap tab icon', true, '["color", "image", "size"]', 'footer', '.nav-swap-icon'),
('nav-swap-label', 'global', 'Swap Label', 'text', 'Swap tab text label', true, '["color", "font", "fontSize"]', 'footer', '.nav-swap-label'),
('nav-apps-tab', 'global', 'Apps Tab', 'button', 'Apps navigation tab', true, '["bgColor", "color", "radius", "font", "icon"]', 'footer', '.nav-apps'),
('nav-apps-icon', 'global', 'Apps Icon', 'icon', 'Apps tab icon', true, '["color", "image", "size"]', 'footer', '.nav-apps-icon'),
('nav-apps-label', 'global', 'Apps Label', 'text', 'Apps tab text label', true, '["color", "font", "fontSize"]', 'footer', '.nav-apps-label'),
('nav-history-tab', 'global', 'History Tab', 'button', 'History navigation tab', true, '["bgColor", "color", "radius", "font", "icon"]', 'footer', '.nav-history'),
('nav-history-icon', 'global', 'History Icon', 'icon', 'History tab icon', true, '["color", "image", "size"]', 'footer', '.nav-history-icon'),
('nav-history-label', 'global', 'History Label', 'text', 'History tab text label', true, '["color", "font", "fontSize"]', 'footer', '.nav-history-label'),

-- ========== SEND LAYER ==========
('send-header', 'send', 'Send Header', 'container', 'Send screen header with back button', true, '["bgColor", "border", "shadow", "radius"]', 'header', '.send-header'),
('send-back-button', 'send', 'Send Back Button', 'button', 'Back arrow button', true, '["bgColor", "color", "radius", "font", "icon"]', 'header', '.send-back-button'),
('send-title', 'send', 'Send Title', 'text', 'Send page title', true, '["color", "font", "fontSize"]', 'header', '.send-title'),
('send-content', 'send', 'Send Content', 'container', 'Send form content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.send-content'),
('send-recipient-input', 'send', 'Recipient Input', 'input', 'Recipient address input field', true, '["bgColor", "color", "border", "radius", "font", "placeholder"]', 'content', '.send-recipient-input'),
('send-amount-input', 'send', 'Amount Input', 'input', 'Amount to send input field', true, '["bgColor", "color", "border", "radius", "font", "placeholder"]', 'content', '.send-amount-input'),
('send-confirm-button', 'send', 'Send Confirm Button', 'button', 'Confirm send transaction button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.send-confirm-button'),

-- ========== RECEIVE LAYER ==========
('receive-header', 'receive', 'Receive Header', 'container', 'Receive screen header with back button', true, '["bgColor", "border", "shadow", "radius"]', 'header', '.receive-header'),
('receive-back-button', 'receive', 'Receive Back Button', 'button', 'Back arrow button', true, '["bgColor", "color", "radius", "font", "icon"]', 'header', '.receive-back-button'),
('receive-title', 'receive', 'Receive Title', 'text', 'Receive page title', true, '["color", "font", "fontSize"]', 'header', '.receive-title'),
('receive-content', 'receive', 'Receive Content', 'container', 'Receive screen content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.receive-content'),
('receive-qr-code', 'receive', 'QR Code', 'image', 'Wallet address QR code', true, '["border", "radius", "size"]', 'content', '.receive-qr-code'),
('receive-address-display', 'receive', 'Address Display', 'text', 'Wallet address text display', true, '["color", "font", "fontSize"]', 'content', '.receive-address-display'),
('receive-copy-button', 'receive', 'Copy Address Button', 'button', 'Copy address to clipboard button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.receive-copy-button'),

-- ========== BUY LAYER ==========
('buy-header', 'buy', 'Buy Header', 'container', 'Buy screen header with back button', true, '["bgColor", "border", "shadow", "radius"]', 'header', '.buy-header'),
('buy-back-button', 'buy', 'Buy Back Button', 'button', 'Back arrow button', true, '["bgColor", "color", "radius", "font", "icon"]', 'header', '.buy-back-button'),
('buy-title', 'buy', 'Buy Title', 'text', 'Buy page title', true, '["color", "font", "fontSize"]', 'header', '.buy-title'),
('buy-content', 'buy', 'Buy Content', 'container', 'Buy options content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.buy-content'),

-- ========== SWAP CONTENT ==========
('swap-content', 'swap', 'Swap Content', 'container', 'Swap interface content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.swap-content'),
('swap-from-token', 'swap', 'From Token Selector', 'button', 'Source token selection', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.swap-from-token'),
('swap-to-token', 'swap', 'To Token Selector', 'button', 'Destination token selection', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.swap-to-token'),
('swap-switch-button', 'swap', 'Switch Tokens Button', 'button', 'Switch from/to tokens button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.swap-switch-button'),
('swap-amount-input', 'swap', 'Swap Amount Input', 'input', 'Amount to swap input field', true, '["bgColor", "color", "border", "radius", "font", "placeholder"]', 'content', '.swap-amount-input'),
('swap-confirm-button', 'swap', 'Swap Confirm Button', 'button', 'Confirm swap transaction button', true, '["bgColor", "color", "radius", "font", "icon"]', 'content', '.swap-confirm-button'),

-- ========== APPS CONTENT ==========
('apps-content', 'apps', 'Apps Content', 'container', 'DApps and applications content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.apps-content'),
('apps-grid', 'apps', 'Apps Grid', 'container', 'Grid layout for app icons', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.apps-grid'),
('apps-item', 'apps', 'App Item', 'container', 'Individual app item', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.apps-item'),
('apps-icon', 'apps', 'App Icon', 'icon', 'Application icon', true, '["color", "image", "size"]', 'content', '.apps-icon'),
('apps-name', 'apps', 'App Name', 'text', 'Application name', true, '["color", "font", "fontSize"]', 'content', '.apps-name'),

-- ========== HISTORY CONTENT ==========
('history-content', 'history', 'History Content', 'container', 'Transaction history content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.history-content'),
('history-list', 'history', 'History List', 'container', 'Transaction list container', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.history-list'),
('history-item', 'history', 'History Item', 'container', 'Individual transaction item', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.history-item'),
('history-transaction-type', 'history', 'Transaction Type', 'text', 'Type of transaction', true, '["color", "font", "fontSize"]', 'content', '.history-transaction-type'),
('history-transaction-amount', 'history', 'Transaction Amount', 'text', 'Transaction amount', true, '["color", "font", "fontSize"]', 'content', '.history-transaction-amount'),
('history-transaction-date', 'history', 'Transaction Date', 'text', 'Transaction timestamp', true, '["color", "font", "fontSize"]', 'content', '.history-transaction-date'),

-- ========== SEARCH CONTENT ==========
('search-content', 'search', 'Search Content', 'container', 'Search interface content area', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.search-content'),
('search-input', 'search', 'Search Input', 'input', 'Search query input field', true, '["bgColor", "color", "border", "radius", "font", "placeholder"]', 'content', '.search-input'),
('search-results', 'search', 'Search Results', 'container', 'Search results container', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.search-results'),
('search-result-item', 'search', 'Search Result Item', 'container', 'Individual search result', true, '["bgColor", "border", "shadow", "radius"]', 'content', '.search-result-item'),

-- ========== ACCOUNT DROPDOWN ==========
('account-dropdown-overlay', 'overlay', 'Account Dropdown Overlay', 'container', 'Account dropdown overlay container', true, '["bgColor", "border", "shadow", "radius"]', 'overlay', '.account-dropdown-overlay'),
('account-dropdown-menu', 'overlay', 'Account Dropdown Menu', 'container', 'Account dropdown menu content', true, '["bgColor", "border", "shadow", "radius"]', 'overlay', '.account-dropdown-menu'),
('account-dropdown-item', 'overlay', 'Account Dropdown Item', 'button', 'Individual account in dropdown', true, '["bgColor", "color", "radius", "font", "icon"]', 'overlay', '.account-dropdown-item'),

-- ========== ACCOUNT SIDEBAR ==========
('account-sidebar-overlay', 'sidebar', 'Account Sidebar Overlay', 'container', 'Account sidebar overlay background', true, '["bgColor", "border", "shadow", "radius"]', 'overlay', '.account-sidebar-overlay'),
('account-sidebar-panel', 'sidebar', 'Account Sidebar Panel', 'container', 'Account sidebar sliding panel', true, '["bgColor", "border", "shadow", "radius"]', 'sidebar', '.account-sidebar-panel'),
('account-sidebar-header', 'sidebar', 'Account Sidebar Header', 'container', 'Account sidebar header section', true, '["bgColor", "border", "shadow", "radius"]', 'sidebar', '.account-sidebar-header'),
('account-sidebar-close-button', 'sidebar', 'Sidebar Close Button', 'button', 'Close sidebar button', true, '["bgColor", "color", "radius", "font", "icon"]', 'sidebar', '.account-sidebar-close'),
('account-sidebar-content', 'sidebar', 'Account Sidebar Content', 'container', 'Account sidebar main content', true, '["bgColor", "border", "shadow", "radius"]', 'sidebar', '.account-sidebar-content');
