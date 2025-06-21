
// Enhanced structure analyzer with detailed element analysis
import { WalletElement, PHANTOM_WALLET_ELEMENTS, getElementsByCategory, getCustomizableElements } from './elementRegistry.ts';

export interface DetailedWalletAnalysis {
  walletType: string;
  screenType: string;
  version: string;
  timestamp: string;
  
  // Detailed UI Structure
  uiStructure: {
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
    layout: {
      type: 'wallet' | 'login';
      sections: Array<{
        name: string;
        position: { x: number; y: number; width: number; height: number };
        elements: string[];
      }>;
      zIndexLayers: Array<{
        level: number;
        elements: string[];
      }>;
    };
    elements: WalletElement[];
  };
  
  // Comprehensive Color Analysis
  colorSystem: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    status: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
    interactive: {
      normal: string;
      hover: string;
      active: string;
      disabled: string;
    };
    gradients: string[];
  };
  
  // Typography System
  typography: {
    fontFamily: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
      button: string;
    };
    weights: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  // Interactive Elements Analysis
  interactivity: {
    buttons: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; width: number; height: number };
      states: {
        normal: any;
        hover?: any;
        active?: any;
        disabled?: any;
      };
      functionality: string;
      customizable: boolean;
    }>;
    inputs: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; width: number; height: number };
      styling: any;
      customizable: boolean;
    }>;
    icons: Array<{
      id: string;
      name: string;
      position: { x: number; y: number; width: number; height: number };
      color: string;
      size: number;
      customizable: boolean;
    }>;
    animations: Array<{
      elementId: string;
      type: string;
      duration: number;
      trigger: string;
      customizable: boolean;
    }>;
  };
  
  // Safe Zones and Customization Rules
  customizationRules: {
    safeZones: Array<{
      elementId: string;
      canCustomize: boolean;
      restrictions: string[];
      criticalForFunctionality: boolean;
    }>;
    excludedElements: string[];
    recommendedCustomizations: Array<{
      category: string;
      elements: string[];
      suggestions: string[];
    }>;
  };
  
  // Layout and Spacing
  layoutSystem: {
    containers: Array<{
      id: string;
      type: string;
      position: { x: number; y: number; width: number; height: number };
      padding: { top: number; right: number; bottom: number; left: number };
      margin: { top: number; right: number; bottom: number; left: number };
      borders: {
        width: number;
        style: string;
        color: string;
        radius: number;
      };
      customizable: boolean;
    }>;
    spacing: {
      base: number;
      scale: number[];
    };
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
  
  // AI Generation Context
  generationContext: {
    promptEnhancement: string;
    styleAdaptationGuidelines: string[];
    preservationRules: string[];
    customizationBestPractices: string[];
    themeVariations: Array<{
      name: string;
      description: string;
      colorOverrides: any;
      typographyOverrides: any;
    }>;
  };
}

export function analyzeWalletStructure(
  walletType: string = 'phantom',
  screenType: string = 'wallet'
): DetailedWalletAnalysis {
  
  const elements = PHANTOM_WALLET_ELEMENTS;
  const customizableElements = getCustomizableElements(elements);
  
  // Extract color system from elements
  const colorSystem = extractColorSystem(elements);
  
  // Extract typography system
  const typography = extractTypographySystem(elements);
  
  // Analyze interactive elements
  const interactivity = analyzeInteractiveElements(elements);
  
  // Create customization rules
  const customizationRules = createCustomizationRules(elements);
  
  // Analyze layout system
  const layoutSystem = analyzeLayoutSystem(elements);
  
  return {
    walletType,
    screenType,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    
    uiStructure: {
      dimensions: {
        width: 320,
        height: 569,
        aspectRatio: '9:16'
      },
      layout: {
        type: 'wallet',
        sections: [
          {
            name: 'header',
            position: { x: 0, y: 0, width: 320, height: 60 },
            elements: getElementsByCategory(elements, 'header').map(el => el.id)
          },
          {
            name: 'content',
            position: { x: 0, y: 60, width: 320, height: 429 },
            elements: getElementsByCategory(elements, 'content').map(el => el.id)
          },
          {
            name: 'navigation',
            position: { x: 0, y: 489, width: 320, height: 80 },
            elements: getElementsByCategory(elements, 'navigation').map(el => el.id)
          }
        ],
        zIndexLayers: [
          { level: 1, elements: ['main-content'] },
          { level: 2, elements: ['balance-section', 'action-buttons-container', 'token-list-container'] },
          { level: 10, elements: ['header-container', 'bottom-navigation'] },
          { level: 11, elements: ['phantom-logo', 'account-avatar', 'account-selector', 'search-button'] }
        ]
      },
      elements
    },
    
    colorSystem,
    typography,
    interactivity,
    customizationRules,
    layoutSystem,
    
    generationContext: {
      promptEnhancement: `
This is a ${walletType} wallet interface with ${elements.length} distinct elements.
The interface follows a mobile-first design with a 320x569 viewport.
Key customizable areas include: ${customizableElements.map(el => el.name).join(', ')}.
Critical elements that must preserve functionality: ${elements.filter(el => el.safeZone.criticalForFunctionality).map(el => el.name).join(', ')}.
      `,
      styleAdaptationGuidelines: [
        'Maintain contrast ratios for accessibility',
        'Preserve interactive element functionality',
        'Respect safe zones for critical elements',
        'Keep navigation elements easily identifiable',
        'Ensure text remains readable across all themes',
        'Maintain brand identity elements (logo, core colors)',
        'Preserve animation performance and smoothness'
      ],
      preservationRules: [
        'Never hide or disable navigation elements',
        'Maintain minimum touch target sizes (44px)',
        'Preserve color meaning for status indicators',
        'Keep critical buttons easily accessible',
        'Maintain visual hierarchy and information architecture',
        'Preserve brand logo and identity elements'
      ],
      customizationBestPractices: [
        'Use consistent color palettes',
        'Apply harmonious typography scales',
        'Maintain visual consistency across states',
        'Consider theme variations (light/dark)',
        'Apply appropriate contrast ratios',
        'Use smooth transitions for state changes',
        'Maintain consistent spacing and alignment'
      ],
      themeVariations: [
        {
          name: 'cyberpunk',
          description: 'Neon colors with dark backgrounds and futuristic elements',
          colorOverrides: {
            primary: '#00ff88',
            accent: '#ff0080',
            background: '#0a0a0a'
          },
          typographyOverrides: {
            fontFamily: 'Monaco, monospace'
          }
        },
        {
          name: 'minimal',
          description: 'Clean, minimal design with subtle colors',
          colorOverrides: {
            primary: '#000000',
            accent: '#007bff',
            background: '#ffffff'
          },
          typographyOverrides: {
            fontFamily: 'SF Pro Display, system-ui'
          }
        },
        {
          name: 'luxury',
          description: 'Premium feel with gold accents and rich colors',
          colorOverrides: {
            primary: '#d4af37',
            accent: '#1a1a1a',
            background: '#0f0f0f'
          },
          typographyOverrides: {
            fontFamily: 'Playfair Display, serif'
          }
        }
      ]
    }
  };
}

function extractColorSystem(elements: WalletElement[]) {
  return {
    primary: '#9945FF',
    secondary: '#FFFFFF',
    accent: '#9945FF',
    background: '#131313',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      accent: '#9945FF'
    },
    status: {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    interactive: {
      normal: 'rgba(40, 40, 40, 0.8)',
      hover: 'rgba(60, 60, 60, 0.8)',
      active: 'rgba(153, 69, 255, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.3)'
    },
    gradients: [
      'linear-gradient(135deg, #9945FF, #FF5733)',
      'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)'
    ]
  };
}

function extractTypographySystem(elements: WalletElement[]) {
  return {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: '24px',
      h2: '20px',
      h3: '16px',
      body: '14px',
      caption: '12px',
      button: '14px'
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8
    }
  };
}

function analyzeInteractiveElements(elements: WalletElement[]) {
  const buttons = elements.filter(el => el.type === 'button');
  const inputs = elements.filter(el => el.type === 'input');
  const icons = elements.filter(el => el.type === 'icon');
  const animatedElements = elements.filter(el => el.animations && el.animations.length > 0);
  
  return {
    buttons: buttons.map(btn => ({
      id: btn.id,
      type: btn.name,
      position: btn.position,
      states: btn.states,
      functionality: btn.category,
      customizable: btn.safeZone.canCustomize
    })),
    inputs: inputs.map(input => ({
      id: input.id,
      type: input.name,
      position: input.position,
      styling: input.styles,
      customizable: input.safeZone.canCustomize
    })),
    icons: [], // Will be populated with actual icon analysis
    animations: animatedElements.flatMap(el => 
      el.animations!.map(anim => ({
        elementId: el.id,
        type: anim.type,
        duration: anim.duration,
        trigger: anim.trigger,
        customizable: el.safeZone.canCustomize
      }))
    )
  };
}

function createCustomizationRules(elements: WalletElement[]) {
  return {
    safeZones: elements.map(el => ({
      elementId: el.id,
      canCustomize: el.safeZone.canCustomize,
      restrictions: el.safeZone.restrictions,
      criticalForFunctionality: el.safeZone.criticalForFunctionality
    })),
    excludedElements: elements.filter(el => !el.safeZone.canCustomize).map(el => el.id),
    recommendedCustomizations: [
      {
        category: 'colors',
        elements: ['header-container', 'balance-section', 'action-buttons-container'],
        suggestions: ['Change background colors', 'Adjust text colors', 'Apply gradient backgrounds']
      },
      {
        category: 'typography',
        elements: ['total-balance', 'balance-change'],
        suggestions: ['Change font family', 'Adjust font sizes', 'Modify font weights']
      },
      {
        category: 'spacing',
        elements: ['main-content', 'balance-section'],
        suggestions: ['Adjust padding', 'Modify margins', 'Change border radius']
      }
    ]
  };
}

function analyzeLayoutSystem(elements: WalletElement[]) {
  const containers = elements.filter(el => el.type === 'container');
  
  return {
    containers: containers.map(container => ({
      id: container.id,
      type: container.name,
      position: container.position,
      padding: { top: 16, right: 16, bottom: 16, left: 16 }, // Default values
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      borders: {
        width: 1,
        style: 'solid',
        color: 'rgba(255, 255, 255, 0.1)',
        radius: 12
      },
      customizable: container.safeZone.canCustomize
    })),
    spacing: {
      base: 4,
      scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]
    },
    breakpoints: {
      mobile: 320,
      tablet: 768,
      desktop: 1024
    }
  };
}
