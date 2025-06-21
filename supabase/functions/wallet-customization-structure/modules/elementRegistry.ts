
// Comprehensive wallet element registry for detailed GPT analysis
export interface WalletElement {
  id: string;
  name: string;
  type: 'button' | 'icon' | 'text' | 'container' | 'input' | 'image' | 'animation' | 'layer' | 'sidebar' | 'dropdown';
  category: 'header' | 'navigation' | 'content' | 'interactive' | 'visual' | 'typography' | 'overlay' | 'sidebar' | 'dropdown';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  };
  styles: {
    backgroundColor?: string;
    color?: string;
    border?: string;
    borderRadius?: string;
    fontSize?: string;
    fontFamily?: string;
    boxShadow?: string;
    opacity?: number;
    transform?: string;
  };
  states: {
    normal: any;
    hover?: any;
    active?: any;
    disabled?: any;
  };
  safeZone: {
    canCustomize: boolean;
    restrictions: string[];
    criticalForFunctionality: boolean;
  };
  children?: string[];
  parent?: string;
  animations?: {
    type: string;
    duration: number;
    trigger: string;
  }[];
}

// Phantom Wallet Complete Element Registry
export const PHANTOM_WALLET_ELEMENTS: WalletElement[] = [
  // === HEADER SECTION ===
  {
    id: 'header-container',
    name: 'Header Container',
    type: 'container',
    category: 'header',
    position: { x: 0, y: 0, width: 320, height: 60, zIndex: 10 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px 16px 0 0'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: false },
    children: ['phantom-logo', 'account-avatar', 'account-selector', 'search-button']
  },
  {
    id: 'phantom-logo',
    name: 'Phantom Logo',
    type: 'image',
    category: 'header',
    position: { x: 16, y: 16, width: 32, height: 32, zIndex: 11 },
    styles: {
      opacity: 1
    },
    states: { normal: {} },
    safeZone: { canCustomize: false, restrictions: ['brand-identity'], criticalForFunctionality: true },
    parent: 'header-container'
  },
  {
    id: 'account-avatar',
    name: 'Account Avatar',
    type: 'image',
    category: 'header',
    position: { x: 60, y: 16, width: 40, height: 40, zIndex: 11 },
    styles: {
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    },
    states: {
      normal: {},
      hover: { transform: 'scale(1.05)' }
    },
    safeZone: { canCustomize: true, restrictions: ['maintain-circle-shape'], criticalForFunctionality: false },
    parent: 'header-container',
    animations: [{ type: 'hover-scale', duration: 200, trigger: 'hover' }]
  },
  {
    id: 'account-selector',
    name: 'Account Selector Button',
    type: 'button',
    category: 'header',
    position: { x: 110, y: 16, width: 120, height: 40, zIndex: 11 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
      active: { transform: 'scale(0.98)' }
    },
    safeZone: { canCustomize: true, restrictions: ['maintain-functionality'], criticalForFunctionality: true },
    parent: 'header-container',
    animations: [{ type: 'hover-bg', duration: 200, trigger: 'hover' }]
  },
  {
    id: 'search-button',
    name: 'Search Button',
    type: 'button',
    category: 'header',
    position: { x: 270, y: 16, width: 32, height: 32, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderRadius: '8px'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-icon'], criticalForFunctionality: true },
    parent: 'header-container'
  },

  // === ACCOUNT DROPDOWN (НОВЫЙ) ===
  {
    id: 'account-dropdown',
    name: 'Account Dropdown Menu',
    type: 'dropdown',
    category: 'dropdown',
    position: { x: 60, y: 60, width: 200, height: 180, zIndex: 50 },
    styles: {
      backgroundColor: 'rgba(25, 25, 25, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(35, 35, 35, 0.95)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality', 'maintain-readability'], criticalForFunctionality: false },
    children: ['dropdown-account-list', 'dropdown-settings-button']
  },
  {
    id: 'dropdown-account-list',
    name: 'Dropdown Account List',
    type: 'container',
    category: 'dropdown',
    position: { x: 60, y: 60, width: 200, height: 120, zIndex: 51 },
    styles: {
      backgroundColor: 'transparent'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: true },
    parent: 'account-dropdown'
  },
  {
    id: 'dropdown-settings-button',
    name: 'Dropdown Settings Button',
    type: 'button',
    category: 'dropdown',
    position: { x: 70, y: 200, width: 180, height: 30, zIndex: 51 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#FFFFFF',
      borderRadius: '8px',
      fontSize: '14px'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['maintain-functionality'], criticalForFunctionality: true },
    parent: 'account-dropdown'
  },

  // === ACCOUNT SIDEBAR (НОВЫЙ) ===
  {
    id: 'account-sidebar',
    name: 'Account Sidebar Panel',
    type: 'sidebar',
    category: 'sidebar',
    position: { x: 0, y: 0, width: 280, height: 569, zIndex: 40 },
    styles: {
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0 16px 16px 0'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(25, 25, 25, 0.95)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: false },
    children: ['sidebar-header', 'sidebar-account-list', 'sidebar-footer']
  },
  {
    id: 'sidebar-header',
    name: 'Sidebar Header',
    type: 'container',
    category: 'sidebar',
    position: { x: 0, y: 0, width: 280, height: 60, zIndex: 41 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'account-sidebar'
  },
  {
    id: 'sidebar-account-list',
    name: 'Sidebar Account List',
    type: 'container',
    category: 'sidebar',
    position: { x: 0, y: 60, width: 280, height: 400, zIndex: 41 },
    styles: {
      backgroundColor: 'transparent'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: true },
    parent: 'account-sidebar'
  },
  {
    id: 'sidebar-footer',
    name: 'Sidebar Footer',
    type: 'container',
    category: 'sidebar',
    position: { x: 0, y: 460, width: 280, height: 109, zIndex: 41 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'account-sidebar'
  },

  // === CONTENT SECTION ===
  {
    id: 'main-content',
    name: 'Main Content Container',
    type: 'container',
    category: 'content',
    position: { x: 0, y: 60, width: 320, height: 429, zIndex: 1 },
    styles: {
      backgroundColor: 'transparent'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: [], criticalForFunctionality: false },
    children: ['balance-section', 'action-buttons', 'token-list']
  },
  {
    id: 'balance-section',
    name: 'Balance Display Section',
    type: 'container',
    category: 'content',
    position: { x: 16, y: 80, width: 288, height: 80, zIndex: 2 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-readability'], criticalForFunctionality: false },
    parent: 'main-content',
    children: ['total-balance', 'balance-change']
  },
  {
    id: 'total-balance',
    name: 'Total Balance Text',
    type: 'text',
    category: 'typography',
    position: { x: 32, y: 100, width: 200, height: 30, zIndex: 3 },
    styles: {
      color: '#FFFFFF',
      fontSize: '24px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: '700'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['maintain-readability'], criticalForFunctionality: false },
    parent: 'balance-section'
  },
  {
    id: 'balance-change',
    name: 'Balance Change Indicator',
    type: 'text',
    category: 'typography',
    position: { x: 32, y: 130, width: 100, height: 20, zIndex: 3 },
    styles: {
      color: '#10B981',
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      positive: { color: '#10B981' },
      negative: {       color: '#EF4444' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-color-meaning'], criticalForFunctionality: false },
    parent: 'balance-section'
  },

  // === ACTION BUTTONS ===
  {
    id: 'action-buttons-container',
    name: 'Action Buttons Container',
    type: 'container',
    category: 'interactive',
    position: { x: 16, y: 180, width: 288, height: 60, zIndex: 2 },
    styles: {},
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: [], criticalForFunctionality: false },
    parent: 'main-content',
    children: ['receive-button', 'send-button', 'swap-button', 'buy-button']
  },
  {
    id: 'receive-button',
    name: 'Receive Button',
    type: 'button',
    category: 'interactive',
    position: { x: 16, y: 180, width: 68, height: 60, zIndex: 3 },
    styles: {
      backgroundColor: 'rgba(40, 40, 40, 0.8)',
      color: '#9945FF',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(60, 60, 60, 0.8)', transform: 'scale(1.02)' },
      active: { transform: 'scale(0.98)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'action-buttons-container',
    animations: [{ type: 'hover-scale', duration: 200, trigger: 'hover' }]
  },
  {
    id: 'send-button',
    name: 'Send Button',
    type: 'button',
    category: 'interactive',
    position: { x: 92, y: 180, width: 68, height: 60, zIndex: 3 },
    styles: {
      backgroundColor: 'rgba(40, 40, 40, 0.8)',
      color: '#9945FF',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(60, 60, 60, 0.8)', transform: 'scale(1.02)' },
      active: { transform: 'scale(0.98)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'action-buttons-container',
    animations: [{ type: 'hover-scale', duration: 200, trigger: 'hover' }]
  },
  {
    id: 'swap-button',
    name: 'Swap Button',
    type: 'button',
    category: 'interactive',
    position: { x: 168, y: 180, width: 68, height: 60, zIndex: 3 },
    styles: {
      backgroundColor: 'rgba(40, 40, 40, 0.8)',
      color: '#9945FF',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(60, 60, 60, 0.8)', transform: 'scale(1.02)' },
      active: { transform: 'scale(0.98)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'action-buttons-container',
    animations: [{ type: 'hover-scale', duration: 200, trigger: 'hover' }]
  },
  {
    id: 'buy-button',
    name: 'Buy Button',
    type: 'button',
    category: 'interactive',
    position: { x: 244, y: 180, width: 68, height: 60, zIndex: 3 },
    styles: {
      backgroundColor: 'rgba(40, 40, 40, 0.8)',
      color: '#9945FF',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'Inter, sans-serif'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(60, 60, 60, 0.8)', transform: 'scale(1.02)' },
      active: { transform: 'scale(0.98)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'action-buttons-container',
    animations: [{ type: 'hover-scale', duration: 200, trigger: 'hover' }]
  },

  // === BUY LAYER (НОВЫЙ) ===
  {
    id: 'buy-layer',
    name: 'Buy Crypto Layer',
    type: 'layer',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 569, zIndex: 30 },
    styles: {
      backgroundColor: 'rgba(24, 24, 24, 0.95)',
      borderRadius: '16px'
    },
    states: {
      normal: {},
      active: { transform: 'translateY(0)', opacity: 1 },
      inactive: { transform: 'translateY(100%)', opacity: 0 }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: false },
    children: ['buy-header', 'buy-search', 'buy-tokens-list']
  },
  {
    id: 'buy-header',
    name: 'Buy Layer Header',
    type: 'container',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 60, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'buy-layer'
  },
  {
    id: 'buy-search',
    name: 'Buy Search Input',
    type: 'input',
    category: 'overlay',
    position: { x: 16, y: 80, width: 288, height: 40, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: '#FFFFFF'
    },
    states: {
      normal: {},
      focus: { border: '1px solid #9945FF' }
    },
    safeZone: { canCustomize: true, restrictions: ['maintain-functionality'], criticalForFunctionality: true },
    parent: 'buy-layer'
  },
  {
    id: 'buy-tokens-list',
    name: 'Buy Tokens List',
    type: 'container',
    category: 'overlay',
    position: { x: 16, y: 140, width: 288, height: 350, zIndex: 31 },
    styles: {
      backgroundColor: 'transparent'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'buy-layer'
  },

  // === SEND LAYER (НОВЫЙ) ===
  {
    id: 'send-layer',
    name: 'Send Crypto Layer',
    type: 'layer',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 569, zIndex: 30 },
    styles: {
      backgroundColor: 'rgba(24, 24, 24, 0.95)',
      borderRadius: '16px'
    },
    states: {
      normal: {},
      active: { transform: 'translateY(0)', opacity: 1 },
      inactive: { transform: 'translateY(100%)', opacity: 0 }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: false },
    children: ['send-header', 'send-form', 'send-recent-contacts']
  },
  {
    id: 'send-header',
    name: 'Send Layer Header',
    type: 'container',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 60, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'send-layer'
  },
  {
    id: 'send-form',
    name: 'Send Form Container',
    type: 'container',
    category: 'overlay',
    position: { x: 16, y: 80, width: 288, height: 200, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'send-layer'
  },
  {
    id: 'send-recent-contacts',
    name: 'Send Recent Contacts',
    type: 'container',
    category: 'overlay',
    position: { x: 16, y: 300, width: 288, height: 200, zIndex: 31 },
    styles: {
      backgroundColor: 'transparent'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'send-layer'
  },

  // === RECEIVE LAYER (НОВЫЙ) ===
  {
    id: 'receive-layer',
    name: 'Receive Crypto Layer',
    type: 'layer',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 569, zIndex: 30 },
    styles: {
      backgroundColor: 'rgba(24, 24, 24, 0.95)',
      borderRadius: '16px'
    },
    states: {
      normal: {},
      active: { transform: 'translateY(0)', opacity: 1 },
      inactive: { transform: 'translateY(100%)', opacity: 0 }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: false },
    children: ['receive-header', 'receive-qr-code', 'receive-address']
  },
  {
    id: 'receive-header',
    name: 'Receive Layer Header',
    type: 'container',
    category: 'overlay',
    position: { x: 0, y: 0, width: 320, height: 60, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'receive-layer'
  },
  {
    id: 'receive-qr-code',
    name: 'Receive QR Code',
    type: 'image',
    category: 'overlay',
    position: { x: 60, y: 120, width: 200, height: 200, zIndex: 31 },
    styles: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '2px solid rgba(255, 255, 255, 0.1)'
    },
    states: { normal: {} },
    safeZone: { canCustomize: false, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'receive-layer'
  },
  {
    id: 'receive-address',
    name: 'Receive Address Display',
    type: 'text',
    category: 'overlay',
    position: { x: 16, y: 350, width: 288, height: 40, zIndex: 31 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: '#FFFFFF',
      fontSize: '12px'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['maintain-readability'], criticalForFunctionality: true },
    parent: 'receive-layer'
  },

  // === TOKEN LIST ===
  {
    id: 'token-list-container',
    name: 'Token List Container',
    type: 'container',
    category: 'content',
    position: { x: 16, y: 260, width: 288, height: 200, zIndex: 2 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: '12px'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: [], criticalForFunctionality: false },
    parent: 'main-content',
    children: ['token-item-sol', 'token-item-usdc']
  },
  {
    id: 'token-item-sol',
    name: 'SOL Token Item',
    type: 'container',
    category: 'content',
    position: { x: 16, y: 260, width: 288, height: 60, zIndex: 3 },
    styles: {
      backgroundColor: 'transparent',
      borderRadius: '8px'
    },
    states: {
      normal: {},
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-layout'], criticalForFunctionality: false },
    parent: 'token-list-container',
    children: ['sol-icon', 'sol-name', 'sol-amount', 'sol-value']
  },

  // === NAVIGATION ===
  {
    id: 'bottom-navigation',
    name: 'Bottom Navigation',
    type: 'container',
    category: 'navigation',
    position: { x: 0, y: 489, width: 320, height: 80, zIndex: 10 },
    styles: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0 0 16px 16px'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    children: ['nav-home', 'nav-swap', 'nav-activity', 'nav-settings']
  },
  {
    id: 'nav-home',
    name: 'Home Navigation Tab',
    type: 'button',
    category: 'navigation',
    position: { x: 20, y: 509, width: 60, height: 40, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#9945FF',
      fontSize: '12px'
    },
    states: {
      normal: {},
      active: { color: '#9945FF', backgroundColor: 'rgba(153, 69, 255, 0.1)' },
      inactive: { color: '#666666' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-swap',
    name: 'Swap Navigation Tab',
    type: 'button',
    category: 'navigation',
    position: { x: 100, y: 509, width: 60, height: 40, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#666666',
      fontSize: '12px'
    },
    states: {
      normal: {},
      active: { color: '#9945FF', backgroundColor: 'rgba(153, 69, 255, 0.1)' },
      inactive: { color: '#666666' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-activity',
    name: 'Activity Navigation Tab',
    type: 'button',
    category: 'navigation',
    position: { x: 180, y: 509, width: 60, height: 40, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#666666',
      fontSize: '12px'
    },
    states: {
      normal: {},
      active: { color: '#9945FF', backgroundColor: 'rgba(153, 69, 255, 0.1)' },
      inactive: { color: '#666666' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-settings',
    name: 'Settings Navigation Tab',
    type: 'button',
    category: 'navigation',
    position: { x: 260, y: 509, width: 60, height: 40, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#666666',
      fontSize: '12px'
    },
    states: {
      normal: {},
      active: { color: '#9945FF', backgroundColor: 'rgba(153, 69, 255, 0.1)' },
      inactive: { color: '#666666' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  }
];

// Export function to get elements by category
export function getElementsByCategory(category: string): WalletElement[] {
  return PHANTOM_WALLET_ELEMENTS.filter(element => element.category === category);
}

// Export function to get customizable elements
export function getCustomizableElements(): WalletElement[] {
  return PHANTOM_WALLET_ELEMENTS.filter(element => element.safeZone.canCustomize);
}

// Export function to get critical elements
export function getCriticalElements(): WalletElement[] {
  return PHANTOM_WALLET_ELEMENTS.filter(element => element.safeZone.criticalForFunctionality);
}

// Export function to get elements by type
export function getElementsByType(type: string): WalletElement[] {
  return PHANTOM_WALLET_ELEMENTS.filter(element => element.type === type);
}

// Export function to build comprehensive wallet structure for GPT
export function buildComprehensiveWalletStructure(): {
  totalElements: number;
  customizableElements: number;
  criticalElements: number;
  elementsByCategory: Record<string, WalletElement[]>;
  elementsByType: Record<string, WalletElement[]>;
  safeCustomizationTargets: string[];
  restrictedElements: string[];
} {
  const customizableElements = getCustomizableElements();
  const criticalElements = getCriticalElements();
  
  const elementsByCategory = PHANTOM_WALLET_ELEMENTS.reduce((acc, element) => {
    if (!acc[element.category]) acc[element.category] = [];
    acc[element.category].push(element);
    return acc;
  }, {} as Record<string, WalletElement[]>);
  
  const elementsByType = PHANTOM_WALLET_ELEMENTS.reduce((acc, element) => {
    if (!acc[element.type]) acc[element.type] = [];
    acc[element.type].push(element);
    return acc;
  }, {} as Record<string, WalletElement[]>);
  
  const safeCustomizationTargets = customizableElements.map(el => el.id);
  const restrictedElements = PHANTOM_WALLET_ELEMENTS
    .filter(el => !el.safeZone.canCustomize)
    .map(el => el.id);
  
  return {
    totalElements: PHANTOM_WALLET_ELEMENTS.length,
    customizableElements: customizableElements.length,
    criticalElements: criticalElements.length,
    elementsByCategory,
    elementsByType,
    safeCustomizationTargets,
    restrictedElements
  };
}
