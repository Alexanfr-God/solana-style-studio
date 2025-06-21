
// Comprehensive wallet element registry for detailed GPT analysis
export interface WalletElement {
  id: string;
  name: string;
  type: 'button' | 'icon' | 'text' | 'container' | 'input' | 'image' | 'animation';
  category: 'header' | 'navigation' | 'content' | 'interactive' | 'visual' | 'typography';
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
      negative: { color: '#EF4444' }
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0 0 16px 16px'
    },
    states: { normal: {} },
    safeZone: { canCustomize: true, restrictions: ['preserve-functionality'], criticalForFunctionality: true },
    children: ['nav-home', 'nav-apps', 'nav-swap', 'nav-history']
  },
  {
    id: 'nav-home',
    name: 'Home Navigation Button',
    type: 'button',
    category: 'navigation',
    position: { x: 20, y: 500, width: 60, height: 60, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#9945FF',
      borderRadius: '12px'
    },
    states: {
      normal: {},
      active: { backgroundColor: 'rgba(153, 69, 255, 0.2)' },
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-icon', 'maintain-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-apps',
    name: 'Apps Navigation Button',
    type: 'button',
    category: 'navigation',
    position: { x: 100, y: 500, width: 60, height: 60, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderRadius: '12px'
    },
    states: {
      normal: {},
      active: { backgroundColor: 'rgba(153, 69, 255, 0.2)', color: '#9945FF' },
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-icon', 'maintain-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-swap',
    name: 'Swap Navigation Button',
    type: 'button',
    category: 'navigation',
    position: { x: 180, y: 500, width: 60, height: 60, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderRadius: '12px'
    },
    states: {
      normal: {},
      active: { backgroundColor: 'rgba(153, 69, 255, 0.2)', color: '#9945FF' },
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-icon', 'maintain-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  },
  {
    id: 'nav-history',
    name: 'History Navigation Button',
    type: 'button',
    category: 'navigation',
    position: { x: 260, y: 500, width: 60, height: 60, zIndex: 11 },
    styles: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      borderRadius: '12px'
    },
    states: {
      normal: {},
      active: { backgroundColor: 'rgba(153, 69, 255, 0.2)', color: '#9945FF' },
      hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
    },
    safeZone: { canCustomize: true, restrictions: ['preserve-icon', 'maintain-functionality'], criticalForFunctionality: true },
    parent: 'bottom-navigation'
  }
];

// Helper functions for element analysis
export function getElementsByCategory(elements: WalletElement[], category: string): WalletElement[] {
  return elements.filter(el => el.category === category);
}

export function getCustomizableElements(elements: WalletElement[]): WalletElement[] {
  return elements.filter(el => el.safeZone.canCustomize);
}

export function getCriticalElements(elements: WalletElement[]): WalletElement[] {
  return elements.filter(el => el.safeZone.criticalForFunctionality);
}

export function getElementHierarchy(elements: WalletElement[]): Map<string, WalletElement[]> {
  const hierarchy = new Map<string, WalletElement[]>();
  
  elements.forEach(element => {
    if (element.parent) {
      if (!hierarchy.has(element.parent)) {
        hierarchy.set(element.parent, []);
      }
      hierarchy.get(element.parent)!.push(element);
    }
  });
  
  return hierarchy;
}

export function validateCustomization(elementId: string, changes: any): { valid: boolean; warnings: string[] } {
  const element = PHANTOM_WALLET_ELEMENTS.find(el => el.id === elementId);
  if (!element) {
    return { valid: false, warnings: ['Element not found'] };
  }
  
  const warnings: string[] = [];
  
  if (!element.safeZone.canCustomize) {
    return { valid: false, warnings: ['Element cannot be customized'] };
  }
  
  if (element.safeZone.criticalForFunctionality && changes.display === 'none') {
    warnings.push('Hiding critical element may break functionality');
  }
  
  element.safeZone.restrictions.forEach(restriction => {
    switch (restriction) {
      case 'preserve-functionality':
        if (changes.pointerEvents === 'none') {
          warnings.push('Disabling pointer events may break functionality');
        }
        break;
      case 'maintain-readability':
        if (changes.opacity < 0.7) {
          warnings.push('Low opacity may affect readability');
        }
        break;
      case 'preserve-color-meaning':
        if (element.id === 'balance-change' && changes.color) {
          warnings.push('Color changes may affect meaning of positive/negative indicators');
        }
        break;
    }
  });
  
  return { valid: warnings.length === 0, warnings };
}
