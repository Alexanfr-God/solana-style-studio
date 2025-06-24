
import React from 'react';

// Детальный реестр ВСЕХ элементов кошелька внутри белых границ
export interface DetailedWalletElement {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  selector: string;
  cssSelector?: string;
  customizable: boolean;
  layer?: string;
  interactiveState?: 'default' | 'hover' | 'active' | 'focus';
  position?: 'header' | 'content' | 'footer' | 'sidebar' | 'overlay';
  elementType?: 'container' | 'button' | 'text' | 'input' | 'icon' | 'image' | 'background';
}

export const DETAILED_WALLET_ELEMENTS_REGISTRY: DetailedWalletElement[] = [
  // ========== WALLET CONTAINER & BORDERS ==========
  {
    id: 'wallet-main-container',
    name: 'Main Wallet Container',
    category: 'Structure',
    subcategory: 'Container',
    description: 'Main wallet container with white borders (361x601px)',
    selector: '.wallet-container',
    cssSelector: 'div[style*="361px"][style*="601px"]',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'wallet-white-border',
    name: 'White Border',
    category: 'Structure',
    subcategory: 'Border',
    description: 'White border around wallet (1px solid white)',
    selector: '.wallet-border',
    cssSelector: 'div[style*="border: 1px solid white"]',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'wallet-background',
    name: 'Wallet Background',
    category: 'Background',
    subcategory: 'Main',
    description: 'Main wallet background area',
    selector: '.wallet-bg',
    customizable: true,
    elementType: 'background'
  },

  // ========== LOGIN LAYER ==========
  {
    id: 'login-header-container',
    name: 'Login Header Container',
    category: 'Login Screen',
    subcategory: 'Header',
    description: 'Header section of login screen (58px height)',
    selector: '.login-header',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'login-phantom-logo-text',
    name: 'Phantom Logo Text',
    category: 'Login Screen',
    subcategory: 'Branding',
    description: 'Phantom text logo in header',
    selector: '.login-logo-text',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'login-help-icon',
    name: 'Help Icon',
    category: 'Login Screen',
    subcategory: 'Navigation',
    description: 'Help circle icon in header',
    selector: '.login-help-icon',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'icon'
  },
  {
    id: 'login-transition-strip',
    name: 'Transition Strip',
    category: 'Login Screen',
    subcategory: 'Separator',
    description: 'Thin divider between header and content (1px)',
    selector: '.login-transition-strip',
    customizable: true,
    layer: 'login',
    elementType: 'container'
  },
  {
    id: 'login-main-content',
    name: 'Login Main Content',
    category: 'Login Screen',
    subcategory: 'Content',
    description: 'Main content area of login screen (541px height)',
    selector: '.login-main-content',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'login-phantom-ghost-icon',
    name: 'Phantom Ghost Icon',
    category: 'Login Screen',
    subcategory: 'Branding',
    description: 'Large Phantom ghost logo (120x120px)',
    selector: '.login-ghost-icon',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'image'
  },
  {
    id: 'login-ghost-glow-effect',
    name: 'Ghost Glow Effect',
    category: 'Login Screen',
    subcategory: 'Effects',
    description: 'Glow animation around ghost icon',
    selector: '.login-ghost-glow',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'login-password-title',
    name: 'Password Title',
    category: 'Login Screen',
    subcategory: 'Text',
    description: '"Enter your password" text',
    selector: '.login-password-title',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'login-password-input',
    name: 'Password Input Field',
    category: 'Login Screen',
    subcategory: 'Input',
    description: 'Password input field with placeholder',
    selector: '.login-password-input',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'login-show-password-button',
    name: 'Show/Hide Password Button',
    category: 'Login Screen',
    subcategory: 'Interactive',
    description: 'Eye icon to toggle password visibility',
    selector: '.login-show-password',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'login-forgot-password-link',
    name: 'Forgot Password Link',
    category: 'Login Screen',
    subcategory: 'Navigation',
    description: 'Forgot password clickable text',
    selector: '.login-forgot-password',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'login-unlock-button',
    name: 'Unlock Button',
    category: 'Login Screen',
    subcategory: 'Action',
    description: 'Main unlock button',
    selector: '.login-unlock-button',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'button'
  },

  // ========== HOME LAYER HEADER ==========
  {
    id: 'home-header-container',
    name: 'Home Header Container',
    category: 'Home Screen',
    subcategory: 'Header',
    description: 'Header section with account info and search',
    selector: '.home-header',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'home-user-avatar',
    name: 'User Avatar',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Round user avatar (40x40px)',
    selector: '.home-user-avatar',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'image'
  },
  {
    id: 'home-account-dropdown-button',
    name: 'Account Dropdown Button',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Account selector with name and address',
    selector: '.home-account-dropdown',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'home-account-name',
    name: 'Account Name',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Display name of current account',
    selector: '.home-account-name',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'home-account-address',
    name: 'Account Address',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Shortened wallet address',
    selector: '.home-account-address',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'home-dropdown-chevron',
    name: 'Dropdown Chevron',
    category: 'Home Screen',
    subcategory: 'Icon',
    description: 'Chevron down icon for dropdown',
    selector: '.home-dropdown-chevron',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'icon'
  },
  {
    id: 'home-search-button',
    name: 'Search Button',
    category: 'Home Screen',
    subcategory: 'Navigation',
    description: 'Search icon button in header',
    selector: '.home-search-button',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'button'
  },

  // ========== HOME CONTENT AREA ==========
  {
    id: 'home-content-container',
    name: 'Home Content Container',
    category: 'Home Screen',
    subcategory: 'Content',
    description: 'Main content area for home screen',
    selector: '.home-content',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-balance-section',
    name: 'Balance Section',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'Total balance display area',
    selector: '.home-balance-section',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-total-balance-label',
    name: 'Total Balance Label',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: '"Total Balance" text label',
    selector: '.home-balance-label',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-sol-amount',
    name: 'SOL Amount',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'Main SOL balance number',
    selector: '.home-sol-amount',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-usd-value',
    name: 'USD Value',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'USD equivalent of balance',
    selector: '.home-usd-value',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },

  // ========== ACTION BUTTONS ROW ==========
  {
    id: 'home-actions-row',
    name: 'Action Buttons Row',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Row container for action buttons',
    selector: '.home-actions-row',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-send-button',
    name: 'Send Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Send crypto action button',
    selector: '.home-send-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-send-icon',
    name: 'Send Icon',
    category: 'Home Screen',
    subcategory: 'Icon',
    description: 'Send arrow icon',
    selector: '.home-send-icon',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'home-send-label',
    name: 'Send Label',
    category: 'Home Screen',
    subcategory: 'Text',
    description: 'Send button text label',
    selector: '.home-send-label',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-receive-button',
    name: 'Receive Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Receive crypto action button',
    selector: '.home-receive-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-receive-icon',
    name: 'Receive Icon',
    category: 'Home Screen',
    subcategory: 'Icon',
    description: 'Receive arrow icon',
    selector: '.home-receive-icon',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'home-receive-label',
    name: 'Receive Label',
    category: 'Home Screen',
    subcategory: 'Text',
    description: 'Receive button text label',
    selector: '.home-receive-label',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-buy-button',
    name: 'Buy Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Buy crypto action button',
    selector: '.home-buy-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-buy-icon',
    name: 'Buy Icon',
    category: 'Home Screen',
    subcategory: 'Icon',
    description: 'Buy plus icon',
    selector: '.home-buy-icon',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'home-buy-label',
    name: 'Buy Label',
    category: 'Home Screen',
    subcategory: 'Text',
    description: 'Buy button text label',
    selector: '.home-buy-label',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-swap-button',
    name: 'Swap Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Swap tokens action button',
    selector: '.home-swap-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-swap-icon',
    name: 'Swap Icon',
    category: 'Home Screen',
    subcategory: 'Icon',
    description: 'Swap arrows icon',
    selector: '.home-swap-icon',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'home-swap-label',
    name: 'Swap Label',
    category: 'Home Screen',
    subcategory: 'Text',
    description: 'Swap button text label',
    selector: '.home-swap-label',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },

  // ========== ASSETS SECTION ==========
  {
    id: 'home-assets-section',
    name: 'Assets Section',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Assets list section container',
    selector: '.home-assets-section',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-assets-header',
    name: 'Assets Header',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Assets section header row',
    selector: '.home-assets-header',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-assets-title',
    name: 'Assets Title',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: '"Assets" section title',
    selector: '.home-assets-title',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-see-all-button',
    name: 'See All Button',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: '"See all" link button',
    selector: '.home-see-all',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-assets-list',
    name: 'Assets List',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Container for asset items',
    selector: '.home-assets-list',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-asset-item',
    name: 'Asset Item',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Individual asset list item',
    selector: '.home-asset-item',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-asset-icon',
    name: 'Asset Icon',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Cryptocurrency icon',
    selector: '.home-asset-icon',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'home-asset-name',
    name: 'Asset Name',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Asset full name',
    selector: '.home-asset-name',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-asset-symbol',
    name: 'Asset Symbol',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Asset ticker symbol',
    selector: '.home-asset-symbol',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-asset-balance',
    name: 'Asset Balance',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Asset quantity owned',
    selector: '.home-asset-balance',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-asset-value',
    name: 'Asset Value',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Asset USD value',
    selector: '.home-asset-value',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },

  // ========== BOTTOM NAVIGATION ==========
  {
    id: 'bottom-nav-container',
    name: 'Bottom Navigation Container',
    category: 'Navigation',
    subcategory: 'Main',
    description: 'Bottom navigation bar container',
    selector: '.bottom-nav',
    customizable: true,
    position: 'footer',
    elementType: 'container'
  },
  {
    id: 'nav-home-tab',
    name: 'Home Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Home navigation tab',
    selector: '.nav-home',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-home-icon',
    name: 'Home Icon',
    category: 'Navigation',
    subcategory: 'Icon',
    description: 'Home tab icon',
    selector: '.nav-home-icon',
    customizable: true,
    position: 'footer',
    elementType: 'icon'
  },
  {
    id: 'nav-home-label',
    name: 'Home Label',
    category: 'Navigation',
    subcategory: 'Text',
    description: 'Home tab text label',
    selector: '.nav-home-label',
    customizable: true,
    position: 'footer',
    elementType: 'text'
  },
  {
    id: 'nav-swap-tab',
    name: 'Swap Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Swap navigation tab',
    selector: '.nav-swap',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-swap-icon',
    name: 'Swap Icon',
    category: 'Navigation',
    subcategory: 'Icon',
    description: 'Swap tab icon',
    selector: '.nav-swap-icon',
    customizable: true,
    position: 'footer',
    elementType: 'icon'
  },
  {
    id: 'nav-swap-label',
    name: 'Swap Label',
    category: 'Navigation',
    subcategory: 'Text',
    description: 'Swap tab text label',
    selector: '.nav-swap-label',
    customizable: true,
    position: 'footer',
    elementType: 'text'
  },
  {
    id: 'nav-apps-tab',
    name: 'Apps Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Apps navigation tab',
    selector: '.nav-apps',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-apps-icon',
    name: 'Apps Icon',
    category: 'Navigation',
    subcategory: 'Icon',
    description: 'Apps tab icon',
    selector: '.nav-apps-icon',
    customizable: true,
    position: 'footer',
    elementType: 'icon'
  },
  {
    id: 'nav-apps-label',
    name: 'Apps Label',
    category: 'Navigation',
    subcategory: 'Text',
    description: 'Apps tab text label',
    selector: '.nav-apps-label',
    customizable: true,
    position: 'footer',
    elementType: 'text'
  },
  {
    id: 'nav-history-tab',
    name: 'History Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'History navigation tab',
    selector: '.nav-history',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-history-icon',
    name: 'History Icon',
    category: 'Navigation',
    subcategory: 'Icon',
    description: 'History tab icon',
    selector: '.nav-history-icon',
    customizable: true,
    position: 'footer',
    elementType: 'icon'
  },
  {
    id: 'nav-history-label',
    name: 'History Label',
    category: 'Navigation',
    subcategory: 'Text',
    description: 'History tab text label',
    selector: '.nav-history-label',
    customizable: true,
    position: 'footer',
    elementType: 'text'
  },

  // ========== SEND LAYER ==========
  {
    id: 'send-header',
    name: 'Send Header',
    category: 'Send Screen',
    subcategory: 'Header',
    description: 'Send screen header with back button',
    selector: '.send-header',
    customizable: true,
    layer: 'send',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'send-back-button',
    name: 'Send Back Button',
    category: 'Send Screen',
    subcategory: 'Navigation',
    description: 'Back arrow button',
    selector: '.send-back-button',
    customizable: true,
    layer: 'send',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'send-title',
    name: 'Send Title',
    category: 'Send Screen',
    subcategory: 'Text',
    description: '"Send" page title',
    selector: '.send-title',
    customizable: true,
    layer: 'send',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'send-content',
    name: 'Send Content',
    category: 'Send Screen',
    subcategory: 'Content',
    description: 'Send form content area',
    selector: '.send-content',
    customizable: true,
    layer: 'send',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'send-recipient-input',
    name: 'Recipient Input',
    category: 'Send Screen',
    subcategory: 'Form',
    description: 'Recipient address input field',
    selector: '.send-recipient-input',
    customizable: true,
    layer: 'send',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'send-amount-input',
    name: 'Amount Input',
    category: 'Send Screen',
    subcategory: 'Form',
    description: 'Amount to send input field',
    selector: '.send-amount-input',
    customizable: true,
    layer: 'send',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'send-confirm-button',
    name: 'Send Confirm Button',
    category: 'Send Screen',
    subcategory: 'Action',
    description: 'Confirm send transaction button',
    selector: '.send-confirm-button',
    customizable: true,
    layer: 'send',
    position: 'content',
    elementType: 'button'
  },

  // ========== RECEIVE LAYER ==========
  {
    id: 'receive-header',
    name: 'Receive Header',
    category: 'Receive Screen',
    subcategory: 'Header',
    description: 'Receive screen header with back button',
    selector: '.receive-header',
    customizable: true,
    layer: 'receive',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'receive-back-button',
    name: 'Receive Back Button',
    category: 'Receive Screen',
    subcategory: 'Navigation',
    description: 'Back arrow button',
    selector: '.receive-back-button',
    customizable: true,
    layer: 'receive',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'receive-title',
    name: 'Receive Title',
    category: 'Receive Screen',
    subcategory: 'Text',
    description: '"Receive" page title',
    selector: '.receive-title',
    customizable: true,
    layer: 'receive',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'receive-content',
    name: 'Receive Content',
    category: 'Receive Screen',
    subcategory: 'Content',
    description: 'Receive screen content area',
    selector: '.receive-content',
    customizable: true,
    layer: 'receive',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'receive-qr-code',
    name: 'QR Code',
    category: 'Receive Screen',
    subcategory: 'Display',
    description: 'Wallet address QR code',
    selector: '.receive-qr-code',
    customizable: true,
    layer: 'receive',
    position: 'content',
    elementType: 'image'
  },
  {
    id: 'receive-address-display',
    name: 'Address Display',
    category: 'Receive Screen',
    subcategory: 'Display',
    description: 'Wallet address text display',
    selector: '.receive-address-display',
    customizable: true,
    layer: 'receive',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'receive-copy-button',
    name: 'Copy Address Button',
    category: 'Receive Screen',
    subcategory: 'Action',
    description: 'Copy address to clipboard button',
    selector: '.receive-copy-button',
    customizable: true,
    layer: 'receive',
    position: 'content',
    elementType: 'button'
  },

  // ========== BUY LAYER ==========
  {
    id: 'buy-header',
    name: 'Buy Header',
    category: 'Buy Screen',
    subcategory: 'Header',
    description: 'Buy screen header with back button',
    selector: '.buy-header',
    customizable: true,
    layer: 'buy',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'buy-back-button',
    name: 'Buy Back Button',
    category: 'Buy Screen',
    subcategory: 'Navigation',
    description: 'Back arrow button',
    selector: '.buy-back-button',
    customizable: true,
    layer: 'buy',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'buy-title',
    name: 'Buy Title',
    category: 'Buy Screen',
    subcategory: 'Text',
    description: '"Buy" page title',
    selector: '.buy-title',
    customizable: true,
    layer: 'buy',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'buy-content',
    name: 'Buy Content',
    category: 'Buy Screen',
    subcategory: 'Content',
    description: 'Buy options content area',
    selector: '.buy-content',
    customizable: true,
    layer: 'buy',
    position: 'content',
    elementType: 'container'
  },

  // ========== SWAP CONTENT ==========
  {
    id: 'swap-content',
    name: 'Swap Content',
    category: 'Swap Screen',
    subcategory: 'Content',
    description: 'Swap interface content area',
    selector: '.swap-content',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'swap-from-token',
    name: 'From Token Selector',
    category: 'Swap Screen',
    subcategory: 'Form',
    description: 'Source token selection',
    selector: '.swap-from-token',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'swap-to-token',
    name: 'To Token Selector',
    category: 'Swap Screen',
    subcategory: 'Form',
    description: 'Destination token selection',
    selector: '.swap-to-token',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'swap-switch-button',
    name: 'Switch Tokens Button',
    category: 'Swap Screen',
    subcategory: 'Action',
    description: 'Switch from/to tokens button',
    selector: '.swap-switch-button',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'swap-amount-input',
    name: 'Swap Amount Input',
    category: 'Swap Screen',
    subcategory: 'Form',
    description: 'Amount to swap input field',
    selector: '.swap-amount-input',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'swap-confirm-button',
    name: 'Swap Confirm Button',
    category: 'Swap Screen',
    subcategory: 'Action',
    description: 'Confirm swap transaction button',
    selector: '.swap-confirm-button',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'button'
  },

  // ========== APPS CONTENT ==========
  {
    id: 'apps-content',
    name: 'Apps Content',
    category: 'Apps Screen',
    subcategory: 'Content',
    description: 'DApps and applications content area',
    selector: '.apps-content',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'apps-grid',
    name: 'Apps Grid',
    category: 'Apps Screen',
    subcategory: 'Layout',
    description: 'Grid layout for app icons',
    selector: '.apps-grid',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'apps-item',
    name: 'App Item',
    category: 'Apps Screen',
    subcategory: 'Item',
    description: 'Individual app item',
    selector: '.apps-item',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'apps-icon',
    name: 'App Icon',
    category: 'Apps Screen',
    subcategory: 'Icon',
    description: 'Application icon',
    selector: '.apps-icon',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'icon'
  },
  {
    id: 'apps-name',
    name: 'App Name',
    category: 'Apps Screen',
    subcategory: 'Text',
    description: 'Application name',
    selector: '.apps-name',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'text'
  },

  // ========== HISTORY CONTENT ==========
  {
    id: 'history-content',
    name: 'History Content',
    category: 'History Screen',
    subcategory: 'Content',
    description: 'Transaction history content area',
    selector: '.history-content',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'history-list',
    name: 'History List',
    category: 'History Screen',
    subcategory: 'List',
    description: 'Transaction list container',
    selector: '.history-list',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'history-item',
    name: 'History Item',
    category: 'History Screen',
    subcategory: 'Item',
    description: 'Individual transaction item',
    selector: '.history-item',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'history-transaction-type',
    name: 'Transaction Type',
    category: 'History Screen',
    subcategory: 'Text',
    description: 'Type of transaction',
    selector: '.history-transaction-type',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'history-transaction-amount',
    name: 'Transaction Amount',
    category: 'History Screen',
    subcategory: 'Text',
    description: 'Transaction amount',
    selector: '.history-transaction-amount',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'history-transaction-date',
    name: 'Transaction Date',
    category: 'History Screen',
    subcategory: 'Text',
    description: 'Transaction timestamp',
    selector: '.history-transaction-date',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'text'
  },

  // ========== SEARCH CONTENT ==========
  {
    id: 'search-content',
    name: 'Search Content',
    category: 'Search Screen',
    subcategory: 'Content',
    description: 'Search interface content area',
    selector: '.search-content',
    customizable: true,
    layer: 'search',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'search-input',
    name: 'Search Input',
    category: 'Search Screen',
    subcategory: 'Form',
    description: 'Search query input field',
    selector: '.search-input',
    customizable: true,
    layer: 'search',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'search-results',
    name: 'Search Results',
    category: 'Search Screen',
    subcategory: 'Results',
    description: 'Search results container',
    selector: '.search-results',
    customizable: true,
    layer: 'search',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'search-result-item',
    name: 'Search Result Item',
    category: 'Search Screen',
    subcategory: 'Item',
    description: 'Individual search result',
    selector: '.search-result-item',
    customizable: true,
    layer: 'search',
    position: 'content',
    elementType: 'container'
  },

  // ========== ACCOUNT DROPDOWN ==========
  {
    id: 'account-dropdown-overlay',
    name: 'Account Dropdown Overlay',
    category: 'Account',
    subcategory: 'Dropdown',
    description: 'Account dropdown overlay container',
    selector: '.account-dropdown-overlay',
    customizable: true,
    position: 'overlay',
    elementType: 'container'
  },
  {
    id: 'account-dropdown-menu',
    name: 'Account Dropdown Menu',
    category: 'Account',
    subcategory: 'Dropdown',
    description: 'Account dropdown menu content',
    selector: '.account-dropdown-menu',
    customizable: true,
    position: 'overlay',
    elementType: 'container'
  },
  {
    id: 'account-dropdown-item',
    name: 'Account Dropdown Item',
    category: 'Account',
    subcategory: 'Item',
    description: 'Individual account in dropdown',
    selector: '.account-dropdown-item',
    customizable: true,
    position: 'overlay',
    elementType: 'button'
  },

  // ========== ACCOUNT SIDEBAR ==========
  {
    id: 'account-sidebar-overlay',
    name: 'Account Sidebar Overlay',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Account sidebar overlay background',
    selector: '.account-sidebar-overlay',
    customizable: true,
    position: 'overlay',
    elementType: 'container'
  },
  {
    id: 'account-sidebar-panel',
    name: 'Account Sidebar Panel',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Account sidebar sliding panel',
    selector: '.account-sidebar-panel',
    customizable: true,
    position: 'sidebar',
    elementType: 'container'
  },
  {
    id: 'account-sidebar-header',
    name: 'Account Sidebar Header',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Account sidebar header section',
    selector: '.account-sidebar-header',
    customizable: true,
    position: 'sidebar',
    elementType: 'container'
  },
  {
    id: 'account-sidebar-close-button',
    name: 'Sidebar Close Button',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Close sidebar button',
    selector: '.account-sidebar-close',
    customizable: true,
    position: 'sidebar',
    elementType: 'button'
  },
  {
    id: 'account-sidebar-content',
    name: 'Account Sidebar Content',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Account sidebar main content',
    selector: '.account-sidebar-content',
    customizable: true,
    position: 'sidebar',
    elementType: 'container'
  },

  // ========== AI PET (INSIDE WALLET) ==========
  {
    id: 'ai-pet-inside-container',
    name: 'AI Pet Inside Container',
    category: 'AI Pet',
    subcategory: 'Inside',
    description: 'AI Pet when positioned inside wallet',
    selector: '.ai-pet-inside',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'ai-pet-eyes-inside',
    name: 'AI Pet Eyes (Inside)',
    category: 'AI Pet',
    subcategory: 'Features',
    description: 'AI Pet eyes when inside wallet',
    selector: '.ai-pet-eyes-inside',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'ai-pet-mouth-inside',
    name: 'AI Pet Mouth (Inside)',
    category: 'AI Pet',
    subcategory: 'Features',
    description: 'AI Pet mouth when inside wallet',
    selector: '.ai-pet-mouth-inside',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'ai-pet-body-inside',
    name: 'AI Pet Body (Inside)',
    category: 'AI Pet',
    subcategory: 'Features',
    description: 'AI Pet body when inside wallet',
    selector: '.ai-pet-body-inside',
    customizable: true,
    elementType: 'container'
  },

  // ========== INTERACTIVE STATES ==========
  {
    id: 'button-hover-state',
    name: 'Button Hover State',
    category: 'Interactive',
    subcategory: 'States',
    description: 'Hover effect for all buttons',
    selector: 'button:hover',
    customizable: true,
    interactiveState: 'hover',
    elementType: 'button'
  },
  {
    id: 'button-active-state',
    name: 'Button Active State',
    category: 'Interactive',
    subcategory: 'States',
    description: 'Active/pressed state for buttons',
    selector: 'button:active',
    customizable: true,
    interactiveState: 'active',
    elementType: 'button'
  },
  {
    id: 'button-focus-state',
    name: 'Button Focus State',
    category: 'Interactive',
    subcategory: 'States',
    description: 'Focus state for keyboard navigation',
    selector: 'button:focus',
    customizable: true,
    interactiveState: 'focus',
    elementType: 'button'
  },
  {
    id: 'input-focus-state',
    name: 'Input Focus State',
    category: 'Interactive',
    subcategory: 'States',
    description: 'Focus state for input fields',
    selector: 'input:focus',
    customizable: true,
    interactiveState: 'focus',
    elementType: 'input'
  },

  // ========== LOADING STATES ==========
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    category: 'Loading',
    subcategory: 'Animation',
    description: 'Loading spinner animation',
    selector: '.loading-spinner',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'loading-skeleton',
    name: 'Loading Skeleton',
    category: 'Loading',
    subcategory: 'Animation',
    description: 'Skeleton loading placeholder',
    selector: '.loading-skeleton',
    customizable: true,
    elementType: 'container'
  },

  // ========== ERROR STATES ==========
  {
    id: 'error-message',
    name: 'Error Message',
    category: 'Error',
    subcategory: 'Display',
    description: 'Error message display',
    selector: '.error-message',
    customizable: true,
    elementType: 'text'
  },
  {
    id: 'validation-error',
    name: 'Validation Error',
    category: 'Error',
    subcategory: 'Form',
    description: 'Form validation error text',
    selector: '.validation-error',
    customizable: true,
    elementType: 'text'
  },

  // ========== ADDITIONAL TYPOGRAPHY ==========
  {
    id: 'primary-heading',
    name: 'Primary Heading',
    category: 'Typography',
    subcategory: 'Headings',
    description: 'Main heading text (h1)',
    selector: 'h1',
    customizable: true,
    elementType: 'text'
  },
  {
    id: 'secondary-heading',
    name: 'Secondary Heading',
    category: 'Typography',
    subcategory: 'Headings',
    description: 'Secondary heading text (h2)',
    selector: 'h2',
    customizable: true,
    elementType: 'text'
  },
  {
    id: 'body-text',
    name: 'Body Text',
    category: 'Typography',
    subcategory: 'Text',
    description: 'Main body text',
    selector: 'p',
    customizable: true,
    elementType: 'text'
  },
  {
    id: 'small-text',
    name: 'Small Text',
    category: 'Typography',
    subcategory: 'Text',
    description: 'Small auxiliary text',
    selector: '.text-sm',
    customizable: true,
    elementType: 'text'
  },
  {
    id: 'link-text',
    name: 'Link Text',
    category: 'Typography',
    subcategory: 'Links',
    description: 'Clickable link text',
    selector: 'a',
    customizable: true,
    elementType: 'text'
  }
];

// Функции для работы с расширенным реестром
export const getDetailedElementsByCategory = (category: string): DetailedWalletElement[] => {
  return DETAILED_WALLET_ELEMENTS_REGISTRY.filter(element => element.category === category);
};

export const getDetailedElementsByLayer = (layer: string): DetailedWalletElement[] => {
  return DETAILED_WALLET_ELEMENTS_REGISTRY.filter(element => element.layer === layer);
};

export const getDetailedElementsByPosition = (position: string): DetailedWalletElement[] => {
  return DETAILED_WALLET_ELEMENTS_REGISTRY.filter(element => element.position === position);
};

export const getAllDetailedCategories = (): string[] => {
  return [...new Set(DETAILED_WALLET_ELEMENTS_REGISTRY.map(element => element.category))];
};

export const getAllDetailedLayers = (): string[] => {
  return [...new Set(DETAILED_WALLET_ELEMENTS_REGISTRY.filter(element => element.layer).map(element => element.layer!))];
};

export const searchDetailedElements = (query: string): DetailedWalletElement[] => {
  const lowercaseQuery = query.toLowerCase();
  return DETAILED_WALLET_ELEMENTS_REGISTRY.filter(element => 
    element.name.toLowerCase().includes(lowercaseQuery) ||
    element.description.toLowerCase().includes(lowercaseQuery) ||
    element.category.toLowerCase().includes(lowercaseQuery) ||
    (element.subcategory && element.subcategory.toLowerCase().includes(lowercaseQuery))
  );
};

export const getDetailedElementById = (id: string): DetailedWalletElement | undefined => {
  return DETAILED_WALLET_ELEMENTS_REGISTRY.find(element => element.id === id);
};

// Компонент для отображения детального реестра (для отладки)
export const DetailedWalletElementsDebugger: React.FC = () => {
  const categories = getAllDetailedCategories();
  const layers = getAllDetailedLayers();
  
  return (
    <div className="p-4 bg-gray-900 text-white rounded max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold mb-4">
        Detailed Wallet Elements Registry ({DETAILED_WALLET_ELEMENTS_REGISTRY.length} elements)
      </h3>
      
      <div className="mb-6">
        <h4 className="font-semibold text-blue-400 mb-2">By Categories:</h4>
        {categories.map(category => (
          <div key={category} className="mb-3">
            <h5 className="font-medium text-purple-400">
              {category} ({getDetailedElementsByCategory(category).length})
            </h5>
            <ul className="text-xs text-gray-300 ml-4 space-y-1">
              {getDetailedElementsByCategory(category).slice(0, 3).map(element => (
                <li key={element.id}>
                  <strong>{element.name}</strong>: {element.description}
                </li>
              ))}
              {getDetailedElementsByCategory(category).length > 3 && (
                <li className="text-gray-500">...and {getDetailedElementsByCategory(category).length - 3} more</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-green-400 mb-2">By Layers:</h4>
        {layers.map(layer => (
          <div key={layer} className="mb-2">
            <span className="font-medium text-yellow-400">
              {layer}: {getDetailedElementsByLayer(layer).length} elements
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400">
        Total customizable elements: {DETAILED_WALLET_ELEMENTS_REGISTRY.filter(e => e.customizable).length}
      </div>
    </div>
  );
};

export default DETAILED_WALLET_ELEMENTS_REGISTRY;
