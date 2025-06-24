
import React from 'react';

// Полный реестр всех элементов кошелька из WalletAlivePlayground
export interface WalletElement {
  id: string;
  name: string;
  category: string;
  description: string;
  selector: string;
  customizable: boolean;
}

export const WALLET_ELEMENTS_REGISTRY: WalletElement[] = [
  // Header Elements
  { id: 'header-container', name: 'Header Container', category: 'Header', description: 'Main header section', selector: '.wallet-header', customizable: true },
  { id: 'header-background', name: 'Header Background', category: 'Header', description: 'Header background color/image', selector: '.wallet-header-bg', customizable: true },
  { id: 'wallet-logo', name: 'Wallet Logo', category: 'Header', description: 'Main wallet logo/icon', selector: '.wallet-logo', customizable: true },
  { id: 'wallet-title', name: 'Wallet Title', category: 'Header', description: 'Wallet application title', selector: '.wallet-title', customizable: true },
  { id: 'account-selector', name: 'Account Selector', category: 'Header', description: 'Account selection dropdown', selector: '.account-selector', customizable: true },
  { id: 'settings-button', name: 'Settings Button', category: 'Header', description: 'Settings/menu button', selector: '.settings-btn', customizable: true },
  
  // Balance Section
  { id: 'balance-container', name: 'Balance Container', category: 'Balance', description: 'Main balance display area', selector: '.balance-container', customizable: true },
  { id: 'total-balance', name: 'Total Balance', category: 'Balance', description: 'Main balance number', selector: '.total-balance', customizable: true },
  { id: 'balance-currency', name: 'Balance Currency', category: 'Balance', description: 'Currency symbol (SOL/USD)', selector: '.balance-currency', customizable: true },
  { id: 'balance-label', name: 'Balance Label', category: 'Balance', description: 'Total Balance text label', selector: '.balance-label', customizable: true },
  { id: 'usd-value', name: 'USD Value', category: 'Balance', description: 'USD equivalent display', selector: '.usd-value', customizable: true },
  
  // Action Buttons
  { id: 'send-button', name: 'Send Button', category: 'Actions', description: 'Send crypto button', selector: '.send-btn', customizable: true },
  { id: 'receive-button', name: 'Receive Button', category: 'Actions', description: 'Receive crypto button', selector: '.receive-btn', customizable: true },
  { id: 'swap-button', name: 'Swap Button', category: 'Actions', description: 'Swap tokens button', selector: '.swap-btn', customizable: true },
  { id: 'buy-button', name: 'Buy Button', category: 'Actions', description: 'Buy crypto button', selector: '.buy-btn', customizable: true },
  { id: 'action-icons', name: 'Action Icons', category: 'Actions', description: 'Icons on action buttons', selector: '.action-icon', customizable: true },
  { id: 'action-labels', name: 'Action Labels', category: 'Actions', description: 'Text labels on action buttons', selector: '.action-label', customizable: true },
  
  // Content Areas
  { id: 'home-content', name: 'Home Content', category: 'Content', description: 'Main home screen content', selector: '.home-content', customizable: true },
  { id: 'assets-list', name: 'Assets List', category: 'Content', description: 'List of user assets/tokens', selector: '.assets-list', customizable: true },
  { id: 'transaction-history', name: 'Transaction History', category: 'Content', description: 'Recent transactions list', selector: '.transaction-history', customizable: true },
  { id: 'asset-item', name: 'Asset Item', category: 'Content', description: 'Individual asset list item', selector: '.asset-item', customizable: true },
  { id: 'transaction-item', name: 'Transaction Item', category: 'Content', description: 'Individual transaction item', selector: '.transaction-item', customizable: true },
  
  // Navigation
  { id: 'bottom-nav', name: 'Bottom Navigation', category: 'Navigation', description: 'Bottom navigation bar', selector: '.bottom-nav', customizable: true },
  { id: 'nav-home', name: 'Home Tab', category: 'Navigation', description: 'Home navigation tab', selector: '.nav-home', customizable: true },
  { id: 'nav-apps', name: 'Apps Tab', category: 'Navigation', description: 'Apps navigation tab', selector: '.nav-apps', customizable: true },
  { id: 'nav-swap', name: 'Swap Tab', category: 'Navigation', description: 'Swap navigation tab', selector: '.nav-swap', customizable: true },
  { id: 'nav-history', name: 'History Tab', category: 'Navigation', description: 'History navigation tab', selector: '.nav-history', customizable: true },
  { id: 'nav-search', name: 'Search Tab', category: 'Navigation', description: 'Search navigation tab', selector: '.nav-search', customizable: true },
  { id: 'nav-icons', name: 'Navigation Icons', category: 'Navigation', description: 'Icons in navigation tabs', selector: '.nav-icon', customizable: true },
  { id: 'nav-labels', name: 'Navigation Labels', category: 'Navigation', description: 'Text labels in navigation', selector: '.nav-label', customizable: true },
  
  // Cards & Containers
  { id: 'wallet-card', name: 'Wallet Card', category: 'Containers', description: 'Main wallet card container', selector: '.wallet-card', customizable: true },
  { id: 'content-cards', name: 'Content Cards', category: 'Containers', description: 'Content area cards', selector: '.content-card', customizable: true },
  { id: 'modal-overlays', name: 'Modal Overlays', category: 'Containers', description: 'Modal dialog overlays', selector: '.modal-overlay', customizable: true },
  
  // Background & Layout
  { id: 'main-background', name: 'Main Background', category: 'Background', description: 'Main application background', selector: '.main-bg', customizable: true },
  { id: 'gradient-overlays', name: 'Gradient Overlays', category: 'Background', description: 'Gradient overlay effects', selector: '.gradient-overlay', customizable: true },
  { id: 'container-backgrounds', name: 'Container Backgrounds', category: 'Background', description: 'Individual container backgrounds', selector: '.container-bg', customizable: true },
  
  // Typography
  { id: 'heading-fonts', name: 'Heading Fonts', category: 'Typography', description: 'Main heading typography', selector: 'h1, h2, h3', customizable: true },
  { id: 'body-fonts', name: 'Body Fonts', category: 'Typography', description: 'Body text typography', selector: 'p, span', customizable: true },
  { id: 'button-fonts', name: 'Button Fonts', category: 'Typography', description: 'Button text typography', selector: 'button', customizable: true },
  { id: 'label-fonts', name: 'Label Fonts', category: 'Typography', description: 'Label text typography', selector: '.label', customizable: true },
  
  // Colors & Effects
  { id: 'primary-colors', name: 'Primary Colors', category: 'Colors', description: 'Primary brand colors', selector: '.primary', customizable: true },
  { id: 'accent-colors', name: 'Accent Colors', category: 'Colors', description: 'Accent/highlight colors', selector: '.accent', customizable: true },
  { id: 'text-colors', name: 'Text Colors', category: 'Colors', description: 'Text color scheme', selector: '.text', customizable: true },
  { id: 'border-colors', name: 'Border Colors', category: 'Colors', description: 'Border and outline colors', selector: '.border', customizable: true },
  { id: 'shadow-effects', name: 'Shadow Effects', category: 'Effects', description: 'Drop shadows and glows', selector: '.shadow', customizable: true },
  { id: 'border-radius', name: 'Border Radius', category: 'Effects', description: 'Rounded corners and borders', selector: '.rounded', customizable: true },
  
  // Interactive Elements
  { id: 'hover-effects', name: 'Hover Effects', category: 'Interactive', description: 'Button and link hover states', selector: ':hover', customizable: true },
  { id: 'active-states', name: 'Active States', category: 'Interactive', description: 'Active/pressed button states', selector: ':active', customizable: true },
  { id: 'focus-states', name: 'Focus States', category: 'Interactive', description: 'Focus indicators', selector: ':focus', customizable: true },
  { id: 'loading-states', name: 'Loading States', category: 'Interactive', description: 'Loading animations and spinners', selector: '.loading', customizable: true },
  
  // AI Pet Integration
  { id: 'ai-pet-container', name: 'AI Pet Container', category: 'AI Pet', description: 'AI pet display area', selector: '.ai-pet', customizable: true },
  { id: 'ai-pet-eyes', name: 'AI Pet Eyes', category: 'AI Pet', description: 'AI pet eye elements', selector: '.ai-pet-eyes', customizable: true },
  { id: 'ai-pet-mouth', name: 'AI Pet Mouth', category: 'AI Pet', description: 'AI pet mouth element', selector: '.ai-pet-mouth', customizable: true },
  { id: 'ai-pet-body', name: 'AI Pet Body', category: 'AI Pet', description: 'AI pet body/shape', selector: '.ai-pet-body', customizable: true }
];

// Функция для получения элементов по категории
export const getElementsByCategory = (category: string): WalletElement[] => {
  return WALLET_ELEMENTS_REGISTRY.filter(element => element.category === category);
};

// Функция для получения всех категорий
export const getAllCategories = (): string[] => {
  return [...new Set(WALLET_ELEMENTS_REGISTRY.map(element => element.category))];
};

// Функция для поиска элементов
export const searchElements = (query: string): WalletElement[] => {
  const lowercaseQuery = query.toLowerCase();
  return WALLET_ELEMENTS_REGISTRY.filter(element => 
    element.name.toLowerCase().includes(lowercaseQuery) ||
    element.description.toLowerCase().includes(lowercaseQuery) ||
    element.category.toLowerCase().includes(lowercaseQuery)
  );
};

// Компонент для отображения реестра элементов (для отладки)
export const WalletElementsDebugger: React.FC = () => {
  const categories = getAllCategories();
  
  return (
    <div className="p-4 bg-gray-900 text-white rounded">
      <h3 className="text-lg font-bold mb-4">Wallet Elements Registry ({WALLET_ELEMENTS_REGISTRY.length} elements)</h3>
      {categories.map(category => (
        <div key={category} className="mb-4">
          <h4 className="font-semibold text-purple-400 mb-2">{category} ({getElementsByCategory(category).length})</h4>
          <ul className="text-sm text-gray-300 ml-4">
            {getElementsByCategory(category).map(element => (
              <li key={element.id} className="mb-1">
                <strong>{element.name}</strong>: {element.description}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default WalletElementsRegistry;
