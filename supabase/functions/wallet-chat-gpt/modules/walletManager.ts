// Enhanced Wallet context and management with multi-wallet support

// Wallet configurations for different wallet types
const WALLET_CONFIGS = {
  phantom: {
    name: 'Phantom',
    type: 'phantom',
    layers: ['unlock', 'main'],
    defaultStyle: {
      backgroundColor: '#1a1a1a',
      primaryColor: '#9945ff',
      secondaryColor: '#ab4aba',
      accentColor: '#00d4ff',
      font: 'Inter',
      borderRadius: '16px'
    },
    elements: {
      core: [
        'header-bar',
        'wallet-logo',
        'balance-display',
        'address-display',
        'unlock-button',
        'action-buttons',
        'asset-list',
        'bottom-navigation'
      ],
      customizable: [
        'background',
        'color-scheme',
        'typography',
        'icons',
        'animations',
        'effects'
      ]
    },
    capabilities: {
      multiLayer: true,
      animations: true,
      customFonts: true,
      gradients: true,
      masks: true,
      particles: true,
      '3dEffects': true
    },
    apiEndpoint: null // Demo wallet, no API needed
  },
  metamask: {
    name: 'MetaMask',
    type: 'metamask',
    layers: ['single'],
    defaultStyle: {
      backgroundColor: '#f6851b',
      primaryColor: '#037dd6',
      secondaryColor: '#ffffff',
      accentColor: '#f6851b',
      font: 'Roboto',
      borderRadius: '8px'
    },
    elements: {
      core: [
        'fox-logo',
        'account-selector',
        'balance-view',
        'network-selector',
        'activity-tab',
        'assets-tab'
      ],
      customizable: [
        'theme',
        'accent-colors',
        'backgrounds'
      ]
    },
    capabilities: {
      multiLayer: false,
      animations: true,
      customFonts: false,
      gradients: true,
      masks: false,
      particles: false,
      '3dEffects': false
    },
    apiEndpoint: 'https://api.metamask.io/customization' // Future API
  },
  // Template for future wallet integrations
  custom: {
    name: 'Custom Wallet',
    type: 'custom',
    layers: ['dynamic'],
    defaultStyle: {},
    elements: {
      core: [],
      customizable: []
    },
    capabilities: {},
    apiEndpoint: null // To be provided by user
  }
};

// Main wallet context creation with enhanced features
export function createDefaultWalletContext(walletType = 'phantom') {
  const config = WALLET_CONFIGS[walletType] || WALLET_CONFIGS.phantom;
  
  return {
    // Basic info
    walletType: config.type,
    walletName: config.name,
    activeLayer: config.layers[0] || 'wallet',
    
    // Styling
    currentStyle: { ...config.defaultStyle },
    defaultStyle: { ...config.defaultStyle },
    
    // Elements
    availableElements: [...config.elements.core, ...config.elements.customizable],
    coreElements: config.elements.core,
    customizableElements: config.elements.customizable,
    
    // Capabilities
    capabilities: { ...config.capabilities },
    
    // WOW effects state
    wowEffects: {
      enabled: true,
      activeEffects: [],
      availableEffects: getAvailableEffects(config.capabilities),
      performanceMode: 'balanced'
    },
    
    // Multi-layer support
    layers: config.layers.map(layer => ({
      id: layer,
      name: layer,
      visible: true,
      opacity: 1,
      zIndex: config.layers.indexOf(layer),
      styles: {},
      effects: []
    })),
    
    // API configuration
    apiConfig: {
      endpoint: config.apiEndpoint,
      authenticated: false,
      apiKey: null
    },
    
    // Metadata
    metadata: {
      version: '2.0',
      lastModified: new Date().toISOString(),
      isDemo: !config.apiEndpoint
    }
  };
}

// Validate and enhance wallet context
export function validateWalletContext(context) {
  if (!context || typeof context !== 'object') {
    return createDefaultWalletContext();
  }
  
  const walletType = context.walletType || 'phantom';
  const defaultContext = createDefaultWalletContext(walletType);
  
  // Merge with defaults to ensure all properties exist
  return {
    ...defaultContext,
    ...context,
    // Ensure nested objects are properly merged
    currentStyle: {
      ...defaultContext.currentStyle,
      ...context.currentStyle
    },
    capabilities: {
      ...defaultContext.capabilities,
      ...context.capabilities
    },
    wowEffects: {
      ...defaultContext.wowEffects,
      ...context.wowEffects
    },
    metadata: {
      ...defaultContext.metadata,
      ...context.metadata,
      lastValidated: new Date().toISOString()
    }
  };
}

// Enhance wallet context with additional features
export function enhanceWalletContext(baseContext) {
  const validated = validateWalletContext(baseContext);
  
  // Add dynamic enhancements
  return {
    ...validated,
    
    // Add effect presets based on capabilities
    effectPresets: generateEffectPresets(validated.capabilities),
    
    // Add style variations
    styleVariations: generateStyleVariations(validated.currentStyle),
    
    // Add responsive configurations
    responsive: {
      mobile: generateMobileConfig(validated),
      tablet: generateTabletConfig(validated),
      desktop: generateDesktopConfig(validated)
    },
    
    // Add theme variations
    themes: {
      light: generateLightTheme(validated.currentStyle),
      dark: generateDarkTheme(validated.currentStyle),
      auto: true
    }
  };
}

// Load wallet configuration from API
export async function loadWalletFromAPI(apiEndpoint, apiKey) {
  try {
    console.log('🔌 Loading wallet configuration from API:', apiEndpoint);
    
    const response = await fetch(apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const walletData = await response.json();
    
    // Transform API response to our format
    return {
      walletType: walletData.type || 'custom',
      walletName: walletData.name || 'Custom Wallet',
      layers: walletData.layers || ['main'],
      defaultStyle: walletData.style || {},
      elements: {
        core: walletData.coreElements || [],
        customizable: walletData.customizableElements || []
      },
      capabilities: walletData.capabilities || {},
      apiEndpoint: apiEndpoint
    };
    
  } catch (error) {
    console.error('❌ Failed to load wallet from API:', error);
    throw error;
  }
}

// Register a new wallet type
export function registerWalletType(walletConfig) {
  const { type, name, config } = walletConfig;
  
  if (!type || !name || !config) {
    throw new Error('Invalid wallet configuration');
  }
  
  // Validate required config properties
  const requiredProps = ['layers', 'defaultStyle', 'elements', 'capabilities'];
  for (const prop of requiredProps) {
    if (!config[prop]) {
      throw new Error(`Missing required property: ${prop}`);
    }
  }
  
  // Register the wallet type
  WALLET_CONFIGS[type] = {
    name,
    type,
    ...config
  };
  
  console.log(`✅ Registered new wallet type: ${name} (${type})`);
  
  return true;
}

// Get available wallet types
export function getAvailableWalletTypes() {
  return Object.entries(WALLET_CONFIGS).map(([type, config]) => ({
    type,
    name: config.name,
    isDemo: !config.apiEndpoint,
    capabilities: config.capabilities,
    preview: config.defaultStyle
  }));
}

// Switch between wallet types
export async function switchWalletType(currentContext, newWalletType, options = {}) {
  console.log(`🔄 Switching from ${currentContext.walletType} to ${newWalletType}`);
  
  // Save current customizations if requested
  if (options.preserveCustomizations) {
    const customizations = extractCustomizations(currentContext);
    const newContext = createDefaultWalletContext(newWalletType);
    return applyCustomizations(newContext, customizations);
  }
  
  // Load from API if needed
  if (options.apiEndpoint && options.apiKey) {
    try {
      const apiConfig = await loadWalletFromAPI(options.apiEndpoint, options.apiKey);
      registerWalletType({
        type: newWalletType,
        name: apiConfig.walletName,
        config: apiConfig
      });
    } catch (error) {
      console.error('Failed to load wallet from API, using defaults');
    }
  }
  
  return createDefaultWalletContext(newWalletType);
}

// Helper Functions

function getAvailableEffects(capabilities) {
  const effects = [];
  
  if (capabilities.animations) {
    effects.push(
      { id: 'fade', name: 'Fade', type: 'animation' },
      { id: 'slide', name: 'Slide', type: 'animation' },
      { id: 'pulse', name: 'Pulse', type: 'animation' },
      { id: 'bounce', name: 'Bounce', type: 'animation' }
    );
  }
  
  if (capabilities.gradients) {
    effects.push(
      { id: 'linear-gradient', name: 'Linear Gradient', type: 'gradient' },
      { id: 'radial-gradient', name: 'Radial Gradient', type: 'gradient' },
      { id: 'conic-gradient', name: 'Conic Gradient', type: 'gradient' }
    );
  }
  
  if (capabilities.particles) {
    effects.push(
      { id: 'stars', name: 'Stars', type: 'particle' },
      { id: 'snow', name: 'Snow', type: 'particle' },
      { id: 'bubbles', name: 'Bubbles', type: 'particle' }
    );
  }
  
  if (capabilities['3dEffects']) {
    effects.push(
      { id: 'perspective', name: '3D Perspective', type: '3d' },
      { id: 'rotate3d', name: '3D Rotation', type: '3d' },
      { id: 'flip3d', name: '3D Flip', type: '3d' }
    );
  }
  
  return effects;
}

function generateEffectPresets(capabilities) {
  const presets = {
    minimal: {
      name: 'Minimal',
      effects: ['fade'],
      performance: 'high'
    },
    balanced: {
      name: 'Balanced',
      effects: ['fade', 'slide', 'linear-gradient'],
      performance: 'medium'
    },
    rich: {
      name: 'Rich',
      effects: ['fade', 'slide', 'pulse', 'linear-gradient', 'stars'],
      performance: 'low'
    }
  };
  
  // Filter presets based on capabilities
  Object.keys(presets).forEach(key => {
    presets[key].effects = presets[key].effects.filter(effectId => {
      const effectType = getEffectType(effectId);
      return capabilities[effectType];
    });
  });
  
  return presets;
}

function getEffectType(effectId) {
  const typeMap = {
    'fade': 'animations',
    'slide': 'animations',
    'pulse': 'animations',
    'bounce': 'animations',
    'linear-gradient': 'gradients',
    'radial-gradient': 'gradients',
    'stars': 'particles',
    'snow': 'particles',
    'perspective': '3dEffects',
    'rotate3d': '3dEffects'
  };
  
  return typeMap[effectId] || 'animations';
}

function generateStyleVariations(baseStyle) {
  return {
    vibrant: {
      ...baseStyle,
      primaryColor: increaseSaturation(baseStyle.primaryColor, 20),
      accentColor: increaseSaturation(baseStyle.accentColor, 20)
    },
    muted: {
      ...baseStyle,
      primaryColor: decreaseSaturation(baseStyle.primaryColor, 30),
      accentColor: decreaseSaturation(baseStyle.accentColor, 30)
    },
    contrast: {
      ...baseStyle,
      backgroundColor: invertColor(baseStyle.backgroundColor),
      primaryColor: invertColor(baseStyle.primaryColor)
    }
  };
}

function generateMobileConfig(context) {
  return {
    fontSize: 'smaller',
    spacing: 'compact',
    elements: context.coreElements.filter(el => !['bottom-navigation'].includes(el)),
    effects: context.wowEffects.availableEffects.filter(e => e.type !== '3d')
  };
}

function generateTabletConfig(context) {
  return {
    fontSize: 'medium',
    spacing: 'normal',
    elements: context.coreElements,
    effects: context.wowEffects.availableEffects
  };
}

function generateDesktopConfig(context) {
  return {
    fontSize: 'large',
    spacing: 'comfortable',
    elements: [...context.coreElements, 'sidebar', 'extended-view'],
    effects: context.wowEffects.availableEffects
  };
}

function generateLightTheme(darkStyle) {
  return {
    backgroundColor: '#ffffff',
    primaryColor: darkStyle.primaryColor,
    secondaryColor: '#f0f0f0',
    textColor: '#000000',
    accentColor: darkStyle.accentColor
  };
}

function generateDarkTheme(lightStyle) {
  return {
    backgroundColor: '#1a1a1a',
    primaryColor: lightStyle.primaryColor || '#9945ff',
    secondaryColor: '#2a2a2a',
    textColor: '#ffffff',
    accentColor: lightStyle.accentColor || '#00d4ff'
  };
}

function extractCustomizations(context) {
  return {
    style: context.currentStyle,
    effects: context.wowEffects.activeEffects,
    layers: context.layers.map(l => ({
      id: l.id,
      styles: l.styles,
      effects: l.effects
    }))
  };
}

function applyCustomizations(context, customizations) {
  return {
    ...context,
    currentStyle: {
      ...context.currentStyle,
      ...customizations.style
    },
    wowEffects: {
      ...context.wowEffects,
      activeEffects: customizations.effects || []
    },
    layers: context.layers.map(layer => {
      const customLayer = customizations.layers?.find(l => l.id === layer.id);
      return customLayer ? { ...layer, ...customLayer } : layer;
    })
  };
}

// Color manipulation helpers
function increaseSaturation(color, percent) {
  // Simple implementation - in production use a proper color library
  return color; // Placeholder
}

function decreaseSaturation(color, percent) {
  return color; // Placeholder
}

function invertColor(color) {
  // Simple hex color inversion
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const inverted = (0xFFFFFF - parseInt(hex, 16)).toString(16);
    return '#' + inverted.padStart(6, '0');
  }
  return color;
}

// Export wallet configuration for saving/sharing
export function exportWalletConfiguration(context) {
  return {
    version: '2.0',
    type: context.walletType,
    name: context.walletName,
    exportDate: new Date().toISOString(),
    configuration: {
      style: context.currentStyle,
      effects: context.wowEffects.activeEffects,
      layers: context.layers,
      customElements: context.customizableElements
    }
  };
}

// Import wallet configuration
export function importWalletConfiguration(configData) {
  if (!configData.version || !configData.type) {
    throw new Error('Invalid wallet configuration format');
  }
  
  const baseContext = createDefaultWalletContext(configData.type);
  
  return {
    ...baseContext,
    ...configData.configuration,
    metadata: {
      ...baseContext.metadata,
      importedAt: new Date().toISOString(),
      originalExportDate: configData.exportDate
    }
  };
}
