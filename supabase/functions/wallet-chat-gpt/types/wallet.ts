// Enhanced Wallet types and interfaces

// Base wallet types
export type WalletType = 'phantom' | 'metamask' | 'coinbase' | 'trust' | 'custom';
export type WalletLayer = 'unlock' | 'balance' | 'global';
export type WalletMode = 'analysis' | 'dalle' | 'replicate' | 'wow-analysis' | 'wow-apply' | 'style-fusion' | 'interactive-preview';

// Main wallet context interface
export interface WalletContext {
  // Basic identification
  walletType: WalletType;
  walletName: string;
  activeLayer: WalletLayer;
  
  // Styling
  currentStyle: WalletStyle;
  defaultStyle: WalletStyle;
  
  // Elements
  availableElements: string[];
  coreElements: string[];
  customizableElements: string[];
  
  // Advanced features
  capabilities: WalletCapabilities;
  wowEffects: WowEffectState;
  layers: WalletLayerConfig[];
  
  // API configuration
  apiConfig: ApiConfiguration;
  
  // Metadata
  metadata: WalletMetadata;
}

// Style configuration
export interface WalletStyle {
  // Colors
  backgroundColor: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  
  // Typography
  font?: string;
  fontFamily?: string;
  headerFont?: string;
  bodyFont?: string;
  
  // Layout
  borderRadius?: string;
  spacing?: string;
  padding?: string;
  
  // Effects
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  
  // Custom properties
  [key: string]: any;
}

// Wallet element interface
export interface WalletElement {
  id: string;
  name: string;
  type: ElementType;
  layer: WalletLayer;
  customizable: boolean;
  selector: string;
  
  // Style state
  currentStyle?: Record<string, any>;
  defaultStyle?: Record<string, any>;
  
  // Constraints
  constraints?: ElementConstraints;
  
  // Effects
  effects?: WowEffect[];
}

// Element types
export type ElementType = 
  | 'header'
  | 'button'
  | 'balance'
  | 'address'
  | 'logo'
  | 'background'
  | 'card'
  | 'navigation'
  | 'icon'
  | 'text'
  | 'container';

// Element constraints
export interface ElementConstraints {
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;
  position?: 'fixed' | 'absolute' | 'relative';
  zIndex?: number;
}

// Wallet capabilities
export interface WalletCapabilities {
  multiWalletSupport: boolean;
  structureAware: boolean;
  safeZoneRespect: boolean;
  collaborationReady: boolean;
  
  // Visual capabilities
  multiLayer: boolean;
  animations: boolean;
  customFonts: boolean;
  gradients: boolean;
  masks: boolean;
  particles: boolean;
  threeDEffects: boolean;
  
  // Interaction capabilities
  hover: boolean;
  click: boolean;
  drag: boolean;
  
  // Advanced features
  wowEffects: boolean;
  interactiveElements: boolean;
  dynamicContent: boolean;
}

// WOW Effects
export interface WowEffectState {
  enabled: boolean;
  activeEffects: WowEffect[];
  availableEffects: WowEffect[];
  performanceMode: 'performance' | 'balanced' | 'quality';
}

export interface WowEffect {
  id: string;
  type: WowEffectType;
  name: string;
  description?: string;
  target: string;
  properties: Record<string, any>;
  
  // Timing
  duration?: string;
  delay?: string;
  easing?: string;
  
  // Triggers
  trigger?: 'load' | 'hover' | 'click' | 'scroll' | 'always';
  
  // Requirements
  requiresJS?: boolean;
  cssSupport?: boolean;
  performance?: 'low' | 'medium' | 'high';
  
  // Categories
  category?: 'visual' | 'interactive' | 'animation' | 'advanced';
}

export type WowEffectType = 
  | 'animation'
  | 'gradient'
  | 'glow'
  | 'shadow'
  | 'transform'
  | 'transition'
  | 'particle'
  | 'blur'
  | 'hover'
  | 'click'
  | '3d'
  | 'filter'
  | 'mask'
  | 'pattern';

// Layer configuration
export interface WalletLayerConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  styles: Record<string, any>;
  effects: WowEffect[];
  
  // Dimensions
  width?: string;
  height?: string;
  position?: 'absolute' | 'relative' | 'fixed';
  
  // Content
  elements?: string[];
  background?: LayerBackground;
}

export interface LayerBackground {
  type: 'color' | 'gradient' | 'image' | 'video' | 'pattern';
  value: string;
  opacity?: number;
  blendMode?: string;
  size?: string;
  position?: string;
  repeat?: string;
}

// API Configuration
export interface ApiConfiguration {
  endpoint: string | null;
  authenticated: boolean;
  apiKey: string | null;
  headers?: Record<string, string>;
  timeout?: number;
}

// Metadata
export interface WalletMetadata {
  version: string;
  lastModified: string;
  lastValidated?: string;
  isDemo: boolean;
  author?: string;
  tags?: string[];
  exportable?: boolean;
  nftReady?: boolean;
}

// Request data interface
export interface RequestData {
  content: string;
  imageUrl?: string;
  walletElement?: WalletElement;
  walletContext?: WalletContext;
  mode: WalletMode;
  sessionId?: string;
  walletType?: string;
  wowEffects?: WowEffect[];
  targetElements?: string[];
}

// Enhanced context for wow effects
export interface WowEffectContext extends WalletContext {
  walletStructure?: any;
  registryElements?: any[];
  wowPreferences?: {
    enableAnimations: boolean;
    enableParticles: boolean;
    enable3D: boolean;
    performanceMode: 'performance' | 'balanced' | 'quality';
  };
}

// Theme variations
export interface ThemeVariation {
  name: string;
  style: WalletStyle;
  effects?: WowEffect[];
  preview?: string;
}

// Export/Import format
export interface WalletConfiguration {
  version: string;
  type: WalletType;
  name: string;
  exportDate: string;
  configuration: {
    style: WalletStyle;
    effects: WowEffect[];
    layers: WalletLayerConfig[];
    customElements: string[];
  };
}

// Style presets
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  style: WalletStyle;
  effects?: WowEffect[];
  tags: string[];
  premium?: boolean;
}

// Animation keyframes
export interface AnimationKeyframe {
  offset?: number;
  percent?: string;
  styles: string;
  easing?: string;
}

export interface Animation {
  name: string;
  keyframes: AnimationKeyframe[];
  options: {
    duration: string;
    easing: string;
    iterations: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  };
}

// Gradient types
export interface Gradient {
  id: string;
  name: string;
  type: 'linear' | 'radial' | 'conic';
  colors: string[];
  angle?: number | string;
  stops?: number[];
  position?: string;
}

// Pattern types
export interface Pattern {
  id: string;
  name: string;
  type: 'geometric' | 'organic' | 'abstract';
  svg: string;
  scale?: number;
  opacity?: number;
  color?: string;
}

// Icon types
export interface Icon {
  name: string;
  library: 'phosphor' | 'heroicons' | 'lucide' | 'custom';
  url: string;
  category?: string;
  tags?: string[];
}

// Color palette
export interface ColorPalette {
  dominant: string;
  palette: string[];
  accent: string;
  background: string;
  text: string;
  complementary?: string[];
  analogous?: string[];
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}
