
-- Исправляем селекторы в базе данных - убираем точки в начале
UPDATE wallet_elements 
SET selector = LTRIM(selector, '.')
WHERE selector LIKE '.%';

-- Добавляем недостающие элементы для Home Content
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('home-content-main', 'Home Content Main', 'home-content', 'home', 'container', 'Main home screen content area', true),
('home-balance-display', 'Balance Display', 'home-balance-section', 'home', 'container', 'Balance display section', true),
('home-actions-container', 'Actions Container', 'home-actions-row', 'home', 'container', 'Action buttons container', true);

-- Добавляем недостающие элементы для History Content  
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('history-content-main', 'History Content Main', 'history-content', 'history', 'container', 'Transaction history content area', true),
('history-list-container', 'History List Container', 'history-list', 'history', 'container', 'Transaction list container', true),
('history-transaction-item', 'Transaction Item', 'history-item', 'history', 'container', 'Individual transaction item', true);

-- Добавляем недостающие элементы для Swap Content
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('swap-content-main', 'Swap Content Main', 'swap-content', 'swap', 'container', 'Swap interface content area', true),
('swap-from-section', 'From Token Section', 'swap-from-token', 'swap', 'container', 'Source token selection section', true),
('swap-to-section', 'To Token Section', 'swap-to-token', 'swap', 'container', 'Destination token selection section', true);

-- Добавляем недостающие элементы для Search Content
INSERT INTO wallet_elements (id, name, selector, screen, type, description, customizable) VALUES
('search-content-main', 'Search Content Main', 'search-content', 'search', 'container', 'Search interface content area', true),
('search-input-field', 'Search Input Field', 'search-input', 'search', 'input', 'Search query input field', true),
('search-results-container', 'Search Results Container', 'search-results', 'search', 'container', 'Search results display area', true);
