// ====== Enhanced types/wallet.ts ======

/**
 * Enhanced Wallet Context with full state management
 */
export interface WalletContext {
  // Basic wallet info
  walletType: 'phantom' | 'metamask' | 'solflare' | 'backpack' | 'coinbase' | 'walletconnect';
  walletVersion?: string;
  networkId?: string;
  
  // Current state
  activeLayer: string;
  activeScreen: string;
  currentStyle: WalletStyle;
  
  // Available customizations
  availableElements: WalletElement[];
  customizableScreens: string[];
  supportedFeatures: WalletFeature[];
  
  // User preferences
  userPreferences: UserPreferences;
  
  // Session data
  sessionData: {
    sessionId: string;
    userId?: string;
    startTime: string;
    lastActivity: string;
    actionsCount: number;
    customizationsApplied: number;
  };
  
  // Metadata
  metadata: {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browserInfo: BrowserInfo;
    capabilities: WalletCapabilities;
    limitations: string[];
  };
}

/**
 * Comprehensive Wallet Style
 */
export interface WalletStyle {
  // Core styling
  backgroundColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  
  // Layout
  borderRadius?: string;
  spacing?: string;
  shadows?: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'auto' | 'custom';
  mode: 'simple' | 'advanced' | 'developer';
  
  // Custom properties
  customCSS?: string;
  customVariables?: { [key: string]: string };
  
  // Screen-specific styles
  screenStyles?: { [screen: string]: Partial<WalletStyle> };
  
  // Animation preferences
  animations: {
    enabled: boolean;
    duration: 'fast' | 'normal' | 'slow';
    effects: string[];
  };
  
  // Accessibility
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'normal' | 'large' | 'xl';
    colorBlindFriendly: boolean;
  };
  
  // Metadata
  metadata: {
    name?: string;
    description?: string;
    version: string;
    created: string;
    updated: string;
    author?: string;
    tags: string[];
  };
}

/**
 * Enhanced Wallet Element with full configuration
 */
export interface WalletElement {
  // Basic properties
  id: string;
  name: string;
  type: ElementType;
  category: ElementCategory;
  
  // Hierarchy
  parent?: string;
  children?: string[];
  siblings?: string[];
  
  // Positioning
  screen: string;
  position: ElementPosition;
  zIndex?: number;
  
  // Customization
  customizable: boolean;
  customProperties: CustomProperty[];
  restrictions?: ElementRestriction[];
  
  // Styling
  defaultStyle: ElementStyle;
  currentStyle?: ElementStyle;
  variants?: { [variant: string]: ElementStyle };
  
  // Behavior
  interactive: boolean;
  events?: ElementEvent[];
  animations?: ElementAnimation[];
  
  // Responsive
  responsive: {
    mobile?: Partial<ElementStyle>;
    tablet?: Partial<ElementStyle>;
    desktop?: Partial<ElementStyle>;
  };
  
  // Metadata
  metadata: {
    description: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
    complexity: 'simple' | 'moderate' | 'complex';
    documentation?: string;
    examples?: string[];
    lastModified: string;
  };
}

/**
 * Element Types
 */
export type ElementType = 
  | 'background' 
  | 'header' 
  | 'navigation' 
  | 'button' 
  | 'text' 
  | 'icon' 
  | 'input' 
  | 'card' 
  | 'modal' 
  | 'tooltip' 
  | 'badge' 
  | 'avatar' 
  | 'logo' 
  | 'divider' 
  | 'container' 
  | 'grid' 
  | 'list' 
  | 'table' 
  | 'chart' 
  | 'image' 
  | 'video' 
  | 'form' 
  | 'dropdown' 
  | 'slider' 
  | 'toggle' 
  | 'progress' 
  | 'spinner' 
  | 'notification' 
  | 'breadcrumb' 
  | 'pagination' 
  | 'tabs' 
  | 'accordion' 
  | 'carousel' 
  | 'timeline' 
  | 'calendar' 
  | 'custom';

/**
 * Element Categories
 */
export type ElementCategory = 
  | 'layout' 
  | 'navigation' 
  | 'content' 
  | 'interactive' 
  | 'feedback' 
  | 'data' 
  | 'media' 
  | 'form' 
  | 'utility' 
  | 'custom';

/**
 * Element Position
 */
export interface ElementPosition {
  x?: number;
  y?: number;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
}

/**
 * Custom Property for elements
 */
export interface CustomProperty {
  name: string;
  type: PropertyType;
  value: any;
  defaultValue: any;
  label: string;
  description?: string;
  required: boolean;
  validation?: PropertyValidation;
  options?: PropertyOption[];
  group?: string;
  order?: number;
  conditional?: PropertyCondition;
}

/**
 * Property Types
 */
export type PropertyType = 
  | 'color' 
  | 'text' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiselect' 
  | 'range' 
  | 'file' 
  | 'url' 
  | 'gradient' 
  | 'shadow' 
  | 'spacing' 
  | 'font' 
  | 'animation' 
  | 'json' 
  | 'css' 
  | 'code';

/**
 * Property Validation
 */
export interface PropertyValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

/**
 * Property Option
 */
export interface PropertyOption {
  label: string;
  value: any;
  description?: string;
  icon?: string;
  preview?: string;
  disabled?: boolean;
}

/**
 * Property Condition
 */
export interface PropertyCondition {
  property: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater' | 'less';
  value: any;
}

/**
 * Element Restriction
 */
export interface ElementRestriction {
  type: 'readonly' | 'hidden' | 'disabled' | 'conditional';
  reason: string;
  condition?: PropertyCondition;
  override?: boolean;
}

/**
 * Element Style
 */
export interface ElementStyle extends StyleChangeSet {
  // Element-specific style properties
  selector?: string;
  pseudoClasses?: { [pseudo: string]: Partial<ElementStyle> };
  mediaQueries?: { [query: string]: Partial<ElementStyle> };
  
  // State variants
  states?: {
    default?: Partial<ElementStyle>;
    hover?: Partial<ElementStyle>;
    active?: Partial<ElementStyle>;
    focus?: Partial<ElementStyle>;
    disabled?: Partial<ElementStyle>;
    loading?: Partial<ElementStyle>;
  };
  
  // Composite properties
  layout?: LayoutProperties;
  typography?: TypographyProperties;
  effects?: EffectProperties;
  interactions?: InteractionProperties;
}

/**
 * Layout Properties
 */
export interface LayoutProperties {
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  padding?: string;
  margin?: string;
  border?: string;
  borderRadius?: string;
  overflow?: string;
  zIndex?: number;
  
  // Flexbox
  flex?: string;
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  order?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  
  // Grid
  gridTemplate?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
}

/**
 * Typography Properties
 */
export interface TypographyProperties {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;
  textShadow?: string;
  color?: string;
  whiteSpace?: string;
  wordBreak?: string;
  textOverflow?: string;
}

/**
 * Effect Properties
 */
export interface EffectProperties {
  boxShadow?: string;
  textShadow?: string;
  filter?: string;
  backdropFilter?: string;
  opacity?: number;
  visibility?: string;
  transform?: string;
  transformOrigin?: string;
  perspective?: string;
  backfaceVisibility?: string;
  clipPath?: string;
  mask?: string;
}

/**
 * Interaction Properties
 */
export interface InteractionProperties {
  cursor?: string;
  pointerEvents?: string;
  userSelect?: string;
  touchAction?: string;
  outline?: string;
  resize?: string;
  appearance?: string;
  willChange?: string;
}

/**
 * Element Event
 */
export interface ElementEvent {
  type: 'click' | 'hover' | 'focus' | 'scroll' | 'resize' | 'custom';
  action: 'style_change' | 'animation' | 'navigation' | 'modal' | 'custom';
  target?: string;
  data?: any;
  condition?: PropertyCondition;
}

/**
 * Element Animation
 */
export interface ElementAnimation {
  name: string;
  trigger: 'load' | 'hover' | 'click' | 'scroll' | 'manual';
  keyframes: AnimationKeyframe[];
  options: {
    duration: number;
    delay?: number;
    iterations?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
    timingFunction?: string;
  };
}

/**
 * Animation Keyframe
 */
export interface AnimationKeyframe {
  offset: number;
  styles: Partial<ElementStyle>;
  easing?: string;
}

/**
 * Wallet Feature
 */
export interface WalletFeature {
  name: string;
  type: 'customization' | 'integration' | 'security' | 'performance' | 'accessibility';
  supported: boolean;
  version?: string;
  description: string;
  documentation?: string;
  limitations?: string[];
}

/**
 * User Preferences
 */
export interface UserPreferences {
  // UI preferences
  theme: 'light' | 'dark' | 'auto';
  colorScheme: string;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  sounds: boolean;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  
  // Customization preferences
  autoSave: boolean;
  backupEnabled: boolean;
  shareAnalytics: boolean;
  betaFeatures: boolean;
  
  // Advanced settings
  developerMode: boolean;
  debugMode: boolean;
  performanceMode: boolean;
  offlineMode: boolean;
  
  // Personal data
  favoriteStyles: string[];
  recentlyUsed: string[];
  customTemplates: string[];
  bookmarks: string[];
}

/**
 * Browser Information
 */
export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  supported: boolean;
  capabilities: {
    webgl: boolean;
    css3: boolean;
    es6: boolean;
    webp: boolean;
    darkMode: boolean;
    prefersReducedMotion: boolean;
  };
}

/**
 * Wallet Capabilities
 */
export interface WalletCapabilities {
  // Styling capabilities
  customCSS: boolean;
  customFonts: boolean;
  animations: boolean;
  gradients: boolean;
  shadows: boolean;
  filters: boolean;
  transforms: boolean;
  
  // Layout capabilities
  flexbox: boolean;
  grid: boolean;
  responsiveDesign: boolean;
  viewportUnits: boolean;
  
  // Interactive capabilities
  hover: boolean;
  focus: boolean;
  transitions: boolean;
  keyframes: boolean;
  
  // Media capabilities
  images: boolean;
  videos: boolean;
  svg: boolean;
  webp: boolean;
  
  // Performance capabilities
  hardwareAcceleration: boolean;
  webWorkers: boolean;
  asyncLoading: boolean;
  
  // Security capabilities
  contentSecurityPolicy: boolean;
  crossOriginIsolation: boolean;
  secureContext: boolean;
}

/**
 * Wallet Configuration
 */
export interface WalletConfiguration {
  id: string;
  name: string;
  version: string;
  type: string;
  
  // Structure
  screens: WalletScreen[];
  elements: WalletElement[];
  themes: ThemeConfig[];
  
  // Capabilities
  features: WalletFeature[];
  capabilities: WalletCapabilities;
  limitations: string[];
  
  // Customization settings
  customization: {
    enabled: boolean;
    maxElements: number;
    allowedTypes: ElementType[];
    restrictedProperties: string[];
    requiresPermission: string[];
  };
  
  // Integration
  integration: {
    apis: string[];
    webhooks: string[];
    extensions: string[];
    plugins: string[];
  };
  
  // Metadata
  metadata: {
    author: string;
    description: string;
    documentation: string;
    supportUrl: string;
    created: string;
    updated: string;
    tags: string[];
    category: string;
  };
}

/**
 * Wallet Screen
 */
export interface WalletScreen {
  id: string;
  name: string;
  path: string;
  type: 'main' | 'modal' | 'overlay' | 'popup' | 'drawer';
  
  // Layout
  layout: {
    type: 'fixed' | 'responsive' | 'adaptive';
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
  
  // Elements
  elements: string[]; // Element IDs
  zones: ScreenZone[];
  
  // Behavior
  navigation: {
    canGoBack: boolean;
    showHeader: boolean;
    showFooter: boolean;
    showNavigation: boolean;
  };
  
  // Customization
  customizable: boolean;
  customizationLevel: 'none' | 'basic' | 'advanced' | 'full';
  
  // State management
  state: {
    persistent: boolean;
    cachedData: boolean;
    autoRefresh: boolean;
    refreshInterval?: number;
  };
  
  // Metadata
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    priority: number;
    category: string;
  };
}

/**
 * Screen Zone
 */
export interface ScreenZone {
  id: string;
  name: string;
  type: 'header' | 'content' | 'sidebar' | 'footer' | 'overlay' | 'modal';
  
  // Layout
  position: ElementPosition;
  dimensions: {
    width: string;
    height: string;
    minWidth?: string;
    maxWidth?: string;
    minHeight?: string;
    maxHeight?: string;
  };
  
  // Content
  allowedElements: ElementType[];
  maxElements?: number;
  required: boolean;
  
  // Styling
  defaultStyle: ElementStyle;
  customizable: boolean;
  
  // Responsive
  responsive: {
    mobile?: Partial<ScreenZone>;
    tablet?: Partial<ScreenZone>;
    desktop?: Partial<ScreenZone>;
  };
}

/**
 * Wallet State Management
 */
export interface WalletState {
  // Current state
  current: {
    screen: string;
    theme: string;
    customizations: { [elementId: string]: ElementStyle };
    userPreferences: UserPreferences;
  };
  
  // History
  history: WalletStateSnapshot[];
  maxHistorySize: number;
  
  // Auto-save
  autoSave: {
    enabled: boolean;
    interval: number;
    lastSaved: string;
  };
  
  // Sync
  sync: {
    enabled: boolean;
    cloudBackup: boolean;
    deviceSync: boolean;
    lastSync: string;
  };
  
  // Performance
  performance: {
    lazy: boolean;
    preload: string[];
    cache: boolean;
    compression: boolean;
  };
}

/**
 * Wallet State Snapshot
 */
export interface WalletStateSnapshot {
  id: string;
  timestamp: string;
  description: string;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  data: {
    screen: string;
    customizations: { [elementId: string]: ElementStyle };
    preferences: Partial<UserPreferences>;
  };
  metadata: {
    automatic: boolean;
    size: number;
    compressed: boolean;
  };
}

/**
 * Type Guards and Utilities
 */

/**
 * Type guard for WalletElement
 */
export function isWalletElement(obj: any): obj is WalletElement {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.customizable === 'boolean';
}

/**
 * Type guard for StyleChanges
 */
export function isStyleChanges(obj: any): obj is StyleChanges {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.layer === 'string' &&
    typeof obj.target === 'string' &&
    obj.changes !== undefined &&
    obj.reasoning !== undefined;
}

/**
 * Type guard for ColorPalette
 */
export function isColorPalette(obj: any): obj is ColorPalette {
  return obj &&
    typeof obj.primary === 'string' &&
    typeof obj.secondary === 'string' &&
    typeof obj.accent === 'string' &&
    typeof obj.background === 'string' &&
    typeof obj.text === 'string';
}

/**
 * Default configurations
 */
export const DEFAULT_WALLET_CONTEXT: Partial<WalletContext> = {
  walletType: 'phantom',
  activeLayer: 'main',
  activeScreen: 'dashboard',
  currentStyle: {
    theme: 'dark',
    mode: 'simple',
    animations: {
      enabled: true,
      duration: 'normal',
      effects: ['fade', 'slide']
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'normal',
      colorBlindFriendly: false
    },
    metadata: {
      version: '1.0.0',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      tags: []
    }
  },
  userPreferences: {
    theme: 'dark',
    colorScheme: 'blue',
    fontSize: 'medium',
    animations: true,
    sounds: false,
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
    autoSave: true,
    backupEnabled: true,
    shareAnalytics: false,
    betaFeatures: false,
    developerMode: false,
    debugMode: false,
    performanceMode: false,
    offlineMode: false,
    favoriteStyles: [],
    recentlyUsed: [],
    customTemplates: [],
    bookmarks: []
  }
};

export const DEFAULT_COLOR_PALETTE: ColorPalette = {
  primary: '#6366f1',
  secondary: '#4f46e5',
  accent: '#8b5cf6',
  background: '#1e293b',
  surface: '#334155',
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  link: '#6366f1',
  linkHover: '#4f46e5',
  focus: '#8b5cf6',
  selection: '#6366f180',
  border: '#475569',
  borderLight: '#64748b',
  borderDark: '#334155',
  shadow: '#00000040',
  shadowLight: '#00000020',
  shadowDark: '#00000060',
  metadata: {
    name: 'Default Dark',
    harmony: 'complementary',
    temperature: 'cool',
    mood: ['professional', 'modern', 'trustworthy'],
    accessibility: {
      contrastChecked: true,
      wcagLevel: 'AA',
      issues: []
    },
    generated: false
  }
};

export const DEFAULT_STYLE_CHANGES: Partial<StyleChanges> = {
  timestamp: new Date().toISOString(),
  changes: {
    backgroundColor: '#1e293b',
    textColor: '#f1f5f9',
    accentColor: '#6366f1',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif'
  },
  reasoning: {
    intent: 'Apply default styling',
    steps: ['Set dark background', 'Ensure text contrast', 'Add modern border radius'],
    principles: ['Accessibility', 'Modern design', 'Brand consistency'],
    tradeoffs: [],
    alternatives: [],
    confidence: 0.9,
    context: {
      userRequest: 'Default styling',
      currentStyle: {},
      walletType: 'phantom'
    }
  },
  metadata: {
    source: 'template',
    version: '1.0.0',
    tags: ['default', 'dark', 'modern'],
    category: 'theme',
    difficulty: 'beginner',
    estimatedImpact: 'medium',
    dependencies: [],
    conflicts: []
  },
  validation: {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    accessibilityScore: 9,
    performanceScore: 10
  }
};

/**
 * Utility functions for type operations
 */

/**
 * Deep merge two style objects
 */
export function mergeStyles(base: Partial<ElementStyle>, override: Partial<ElementStyle>): ElementStyle {
  return {
    ...base,
    ...override,
    responsive: {
      ...base.responsive,
      ...override.responsive
    },
    states: {
      ...base.states,
      ...override.states
    }
  } as ElementStyle;
}

/**
 * Validate color format
 */
export function isValidColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
  const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
  const namedColors = ['transparent', 'inherit', 'initial', 'unset', 'currentColor'];
  
  return hexRegex.test(color) || 
         rgbRegex.test(color) || 
         rgbaRegex.test(color) || 
         hslRegex.test(color) || 
         namedColors.includes(color);
}

/**
 * Generate CSS custom properties from color palette
 */
export function generateCSSCustomProperties(palette: ColorPalette): string {
  const properties = Object.entries(palette)
    .filter(([key]) => key !== 'metadata')
    .map(([key, value]) => `  --color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
    .join('\n');
    
  return `:root {\n${properties}\n}`;
}

/**
 * Convert element style to CSS string
 */
export function elementStyleToCSS(style: ElementStyle, selector: string = ''): string {
  const cssProps = Object.entries(style)
    .filter(([key, value]) => value !== undefined && typeof value === 'string')
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${cssKey}: ${value};`;
    })
    .join('\n');
    
  return selector ? `${selector} {\n${cssProps}\n}` : cssProps;
}

/**
 * Create default wallet element
 */
export function createDefaultWalletElement(
  id: string, 
  name: string, 
  type: ElementType, 
  customizable: boolean = true
): WalletElement {
  return {
    id,
    name,
    type,
    category: 'content',
    screen: 'main',
    position: {
      position: 'relative',
      display: 'block'
    },
    customizable,
    customProperties: [],
    defaultStyle: {},
    interactive: false,
    responsive: {},
    metadata: {
      description: `${name} element`,
      importance: 'medium',
      complexity: 'simple',
      lastModified: new Date().toISOString()
    }
  };
}

/**
 * Export all types for easy importing
 */
export type {
  // Response types
  BaseAPIResponse,
  GPTResponse,
  EnhancedStyleChanges,
  ImageGenerationResponse,
  StyleAnalysisResponse,
  ChatContextResponse,
  
  // Style types
  StyleChanges,
  StyleChangeSet,
  StyleReasoning,
  ColorPalette,
  ThemeConfig,
  
  // Wallet types
  WalletContext,
  WalletStyle,
  WalletElement,
  WalletConfiguration,
  WalletScreen,
  WalletState,
  
  // Utility types
  ElementType,
  ElementCategory,
  PropertyType,
  CustomProperty
}; 
