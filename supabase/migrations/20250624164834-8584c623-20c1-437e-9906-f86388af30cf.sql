
-- Заполняем таблицу wallet_element_registry данными из WALLET_ELEMENTS_REGISTRY
-- Сначала очищаем существующие данные для кошелька WalletAlivePlayground
DELETE FROM public.wallet_element_registry WHERE wallet_type = 'phantom';

-- Добавляем все элементы из WalletElementsRegistry.tsx
INSERT INTO public.wallet_element_registry (wallet_type, screen_type, element_name, element_type, position, properties, is_interactive) VALUES
-- Header Elements
('phantom', 'home', 'Header Container', 'container', '{"selector": ".wallet-header"}', '{"category": "Header", "description": "Main header section", "customizable": true}', false),
('phantom', 'home', 'Header Background', 'background', '{"selector": ".wallet-header-bg"}', '{"category": "Header", "description": "Header background color/image", "customizable": true}', false),
('phantom', 'home', 'Wallet Logo', 'image', '{"selector": ".wallet-logo"}', '{"category": "Header", "description": "Main wallet logo/icon", "customizable": true}', false),
('phantom', 'home', 'Wallet Title', 'text', '{"selector": ".wallet-title"}', '{"category": "Header", "description": "Wallet application title", "customizable": true}', false),
('phantom', 'home', 'Account Selector', 'dropdown', '{"selector": ".account-selector"}', '{"category": "Header", "description": "Account selection dropdown", "customizable": true}', true),
('phantom', 'home', 'Settings Button', 'button', '{"selector": ".settings-btn"}', '{"category": "Header", "description": "Settings/menu button", "customizable": true}', true),

-- Balance Section
('phantom', 'home', 'Balance Container', 'container', '{"selector": ".balance-container"}', '{"category": "Balance", "description": "Main balance display area", "customizable": true}', false),
('phantom', 'home', 'Total Balance', 'text', '{"selector": ".total-balance"}', '{"category": "Balance", "description": "Main balance number", "customizable": true}', false),
('phantom', 'home', 'Balance Currency', 'text', '{"selector": ".balance-currency"}', '{"category": "Balance", "description": "Currency symbol (SOL/USD)", "customizable": true}', false),
('phantom', 'home', 'Balance Label', 'text', '{"selector": ".balance-label"}', '{"category": "Balance", "description": "Total Balance text label", "customizable": true}', false),
('phantom', 'home', 'USD Value', 'text', '{"selector": ".usd-value"}', '{"category": "Balance", "description": "USD equivalent display", "customizable": true}', false),

-- Action Buttons
('phantom', 'home', 'Send Button', 'button', '{"selector": ".send-btn"}', '{"category": "Actions", "description": "Send crypto button", "customizable": true}', true),
('phantom', 'home', 'Receive Button', 'button', '{"selector": ".receive-btn"}', '{"category": "Actions", "description": "Receive crypto button", "customizable": true}', true),
('phantom', 'home', 'Swap Button', 'button', '{"selector": ".swap-btn"}', '{"category": "Actions", "description": "Swap tokens button", "customizable": true}', true),
('phantom', 'home', 'Buy Button', 'button', '{"selector": ".buy-btn"}', '{"category": "Actions", "description": "Buy crypto button", "customizable": true}', true),
('phantom', 'home', 'Action Icons', 'icon', '{"selector": ".action-icon"}', '{"category": "Actions", "description": "Icons on action buttons", "customizable": true}', false),
('phantom', 'home', 'Action Labels', 'text', '{"selector": ".action-label"}', '{"category": "Actions", "description": "Text labels on action buttons", "customizable": true}', false),

-- Content Areas
('phantom', 'home', 'Home Content', 'container', '{"selector": ".home-content"}', '{"category": "Content", "description": "Main home screen content", "customizable": true}', false),
('phantom', 'home', 'Assets List', 'list', '{"selector": ".assets-list"}', '{"category": "Content", "description": "List of user assets/tokens", "customizable": true}', true),
('phantom', 'home', 'Transaction History', 'list', '{"selector": ".transaction-history"}', '{"category": "Content", "description": "Recent transactions list", "customizable": true}', true),
('phantom', 'home', 'Asset Item', 'list-item', '{"selector": ".asset-item"}', '{"category": "Content", "description": "Individual asset list item", "customizable": true}', true),
('phantom', 'home', 'Transaction Item', 'list-item', '{"selector": ".transaction-item"}', '{"category": "Content", "description": "Individual transaction item", "customizable": true}', true),

-- Navigation
('phantom', 'home', 'Bottom Navigation', 'navigation', '{"selector": ".bottom-nav"}', '{"category": "Navigation", "description": "Bottom navigation bar", "customizable": true}', true),
('phantom', 'home', 'Home Tab', 'nav-item', '{"selector": ".nav-home"}', '{"category": "Navigation", "description": "Home navigation tab", "customizable": true}', true),
('phantom', 'home', 'Apps Tab', 'nav-item', '{"selector": ".nav-apps"}', '{"category": "Navigation", "description": "Apps navigation tab", "customizable": true}', true),
('phantom', 'home', 'Swap Tab', 'nav-item', '{"selector": ".nav-swap"}', '{"category": "Navigation", "description": "Swap navigation tab", "customizable": true}', true),
('phantom', 'home', 'History Tab', 'nav-item', '{"selector": ".nav-history"}', '{"category": "Navigation", "description": "History navigation tab", "customizable": true}', true),
('phantom', 'home', 'Search Tab', 'nav-item', '{"selector": ".nav-search"}', '{"category": "Navigation", "description": "Search navigation tab", "customizable": true}', true),
('phantom', 'home', 'Navigation Icons', 'icon', '{"selector": ".nav-icon"}', '{"category": "Navigation", "description": "Icons in navigation tabs", "customizable": true}', false),
('phantom', 'home', 'Navigation Labels', 'text', '{"selector": ".nav-label"}', '{"category": "Navigation", "description": "Text labels in navigation", "customizable": true}', false),

-- Cards & Containers
('phantom', 'home', 'Wallet Card', 'container', '{"selector": ".wallet-card"}', '{"category": "Containers", "description": "Main wallet card container", "customizable": true}', false),
('phantom', 'home', 'Content Cards', 'container', '{"selector": ".content-card"}', '{"category": "Containers", "description": "Content area cards", "customizable": true}', false),
('phantom', 'home', 'Modal Overlays', 'overlay', '{"selector": ".modal-overlay"}', '{"category": "Containers", "description": "Modal dialog overlays", "customizable": true}', true),

-- Background & Layout
('phantom', 'home', 'Main Background', 'background', '{"selector": ".main-bg"}', '{"category": "Background", "description": "Main application background", "customizable": true}', false),
('phantom', 'home', 'Gradient Overlays', 'background', '{"selector": ".gradient-overlay"}', '{"category": "Background", "description": "Gradient overlay effects", "customizable": true}', false),
('phantom', 'home', 'Container Backgrounds', 'background', '{"selector": ".container-bg"}', '{"category": "Background", "description": "Individual container backgrounds", "customizable": true}', false),

-- Typography
('phantom', 'home', 'Heading Fonts', 'typography', '{"selector": "h1, h2, h3"}', '{"category": "Typography", "description": "Main heading typography", "customizable": true}', false),
('phantom', 'home', 'Body Fonts', 'typography', '{"selector": "p, span"}', '{"category": "Typography", "description": "Body text typography", "customizable": true}', false),
('phantom', 'home', 'Button Fonts', 'typography', '{"selector": "button"}', '{"category": "Typography", "description": "Button text typography", "customizable": true}', false),
('phantom', 'home', 'Label Fonts', 'typography', '{"selector": ".label"}', '{"category": "Typography", "description": "Label text typography", "customizable": true}', false),

-- Colors & Effects
('phantom', 'home', 'Primary Colors', 'color', '{"selector": ".primary"}', '{"category": "Colors", "description": "Primary brand colors", "customizable": true}', false),
('phantom', 'home', 'Accent Colors', 'color', '{"selector": ".accent"}', '{"category": "Colors", "description": "Accent/highlight colors", "customizable": true}', false),
('phantom', 'home', 'Text Colors', 'color', '{"selector": ".text"}', '{"category": "Colors", "description": "Text color scheme", "customizable": true}', false),
('phantom', 'home', 'Border Colors', 'color', '{"selector": ".border"}', '{"category": "Colors", "description": "Border and outline colors", "customizable": true}', false),
('phantom', 'home', 'Shadow Effects', 'effect', '{"selector": ".shadow"}', '{"category": "Effects", "description": "Drop shadows and glows", "customizable": true}', false),
('phantom', 'home', 'Border Radius', 'effect', '{"selector": ".rounded"}', '{"category": "Effects", "description": "Rounded corners and borders", "customizable": true}', false),

-- Interactive Elements
('phantom', 'home', 'Hover Effects', 'effect', '{"selector": ":hover"}', '{"category": "Interactive", "description": "Button and link hover states", "customizable": true}', false),
('phantom', 'home', 'Active States', 'effect', '{"selector": ":active"}', '{"category": "Interactive", "description": "Active/pressed button states", "customizable": true}', false),
('phantom', 'home', 'Focus States', 'effect', '{"selector": ":focus"}', '{"category": "Interactive", "description": "Focus indicators", "customizable": true}', false),
('phantom', 'home', 'Loading States', 'animation', '{"selector": ".loading"}', '{"category": "Interactive", "description": "Loading animations and spinners", "customizable": true}', false),

-- AI Pet Integration
('phantom', 'home', 'AI Pet Container', 'container', '{"selector": ".ai-pet"}', '{"category": "AI Pet", "description": "AI pet display area", "customizable": true}', false),
('phantom', 'home', 'AI Pet Eyes', 'component', '{"selector": ".ai-pet-eyes"}', '{"category": "AI Pet", "description": "AI pet eye elements", "customizable": true}', false),
('phantom', 'home', 'AI Pet Mouth', 'component', '{"selector": ".ai-pet-mouth"}', '{"category": "AI Pet", "description": "AI pet mouth element", "customizable": true}', false),
('phantom', 'home', 'AI Pet Body', 'component', '{"selector": ".ai-pet-body"}', '{"category": "AI Pet", "description": "AI pet body/shape", "customizable": true}', false);

-- Создаем новую запись для кошелька WalletAlivePlayground
INSERT INTO public.wallet_instances (instance_name, wallet_type, structure_data, is_active) VALUES
('WalletAlivePlayground Demo', 'phantom', 
'{
  "totalElements": 50,
  "categories": ["Header", "Balance", "Actions", "Content", "Navigation", "Containers", "Background", "Typography", "Colors", "Effects", "Interactive", "AI Pet"],
  "screens": ["home", "send", "receive", "buy", "swap", "apps", "history", "search"],
  "features": {
    "hasAiPet": true,
    "hasBottomNavigation": true,
    "hasBalanceDisplay": true,
    "hasActionButtons": true,
    "hasTransactionHistory": true,
    "hasAssetsList": true,
    "supportsDarkMode": true,
    "supportsCustomBackgrounds": true
  }
}', true);
