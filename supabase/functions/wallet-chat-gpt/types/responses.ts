// Enhanced API response types with human-friendly messaging

import { WowEffect, WalletStyle, ValidationResult, ColorPalette } from './wallet.ts';
import { StyleChanges } from './styles.ts';

// Main GPT response with dual format (human + technical)
export interface GPTResponse {
  success: boolean;
  
  // Human-readable response for chat UI
  response: string;
  
  // Technical data (hidden from user in chat)
  styleChanges?: EnhancedStyleChanges;
  
  // Additional response data
  imageUrl?: string;
  mode: ResponseMode;
  error?: string;
  
  // Enhanced features
  wowEffects?: WowEffect[];
  effectCategories?: EffectCategories;
  previewData?: PreviewData;
  appliedEffects?: WowEffect[];
  animationData?: AnimationData[];
  fusionSources?: string[];
  fusionBalance?: Record<string, number>;
  
  // Context and metadata
  enhancedContext?: any;
  validation?: ValidationResult;
  metadata?: ResponseMetadata;
}

// Response modes
export type ResponseMode = 
  | 'analysis'
  | 'enhanced-analysis'
  | 'wow-analysis'
  | 'wow-apply'
  | 'style-fusion'
  | 'interactive-preview'
  | 'dalle'
  | 'replicate'
  | 'error';

// Enhanced style changes structure (technical data)
export interface EnhancedStyleChanges {
  // Analysis summary
  analysis: string;
  
  // Actions taken (for logging/debugging)
  actions: string[];
  
  // Actual style changes
  elements: {
    // Backgrounds
    backgrounds?: {
      login?: string;
      dashboard?: string;
      unified?: string;
    };
    
    // Color system
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      text?: string;
      background?: string;
      surface?: string;
      error?: string;
      success?: string;
      warning?: string;
    };
    
    // Typography system
    typography?: {
      header?: string;
      body?: string;
      button?: string;
      caption?: string;
      fontSizes?: {
        small?: string;
        medium?: string;
        large?: string;
        xlarge?: string;
      };
      fontWeights?: {
        light?: number;
        regular?: number;
        medium?: number;
        bold?: number;
      };
    };
    
    // Component styles
    components?: {
      buttons?: ButtonStyles;
      cards?: CardStyles;
      navigation?: NavigationStyles;
      inputs?: InputStyles;
      modals?: ModalStyles;
    };
    
    // Layout
    spacing?: {
      small?: string;
      medium?: string;
      large?: string;
    };
    
    // Effects and animations
    effects?: {
      transitions?: string;
      animations?: string[];
      filters?: string[];
    };
  };
  
  // Metadata for NFT minting
  metadata: {
    generated_assets?: string[];
    style_reasoning: string;
    nft_ready: boolean;
    timestamp?: string;
    version?: string;
    author?: string;
    tags?: string[];
  };
}

// Component style types
export interface ButtonStyles {
  default?: StyleSet;
  primary?: StyleSet;
  secondary?: StyleSet;
  danger?: StyleSet;
  ghost?: StyleSet;
}

export interface CardStyles {
  default?: StyleSet;
  elevated?: StyleSet;
  outlined?: StyleSet;
  transparent?: StyleSet;
}

export interface NavigationStyles {
  header?: StyleSet;
  footer?: StyleSet;
  sidebar?: StyleSet;
  tabs?: StyleSet;
}

export interface InputStyles {
  text?: StyleSet;
  textarea?: StyleSet;
  select?: StyleSet;
  checkbox?: StyleSet;
}

export interface ModalStyles {
  backdrop?: StyleSet;
  container?: StyleSet;
  header?: StyleSet;
  body?: StyleSet;
  footer?: StyleSet;
}

// Style set for components
export interface StyleSet {
  base?: Record<string, any>;
  hover?: Record<string, any>;
  active?: Record<string, any>;
  disabled?: Record<string, any>;
  focus?: Record<string, any>;
}

// Image generation responses
export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  mode: 'dalle' | 'replicate';
  error?: string;
  
  // Enhanced features
  dimensions?: {
    width: number;
    height: number;
  };
  layers?: ImageLayer[];
  displayOptimization?: DisplayOptimization;
  viewportConfig?: ViewportConfig;
  metadata?: ImageMetadata;
}

export interface ImageLayer {
  id: string;
  name: string;
  imageUrl: string;
  cropConfig?: CropConfig;
  opacity: number;
}

export interface CropConfig {
  x: number | string;
  y: number | string;
  width: string;
  height: string;
}

export interface DisplayOptimization {
  cssRules: Record<string, any>;
  containerSettings: Record<string, any>;
}

export interface ViewportConfig {
  layer1?: LayerViewport;
  layer2?: LayerViewport;
}

export interface LayerViewport {
  viewport: {
    x: number;
    y: number;
    width: string;
    height: string;
  };
  scale: number;
  position: string;
}

export interface ImageMetadata {
  generatedAt: string;
  prompt?: string;
  revisedPrompt?: string;
  originalDimensions?: { width: number; height: number };
  optimizationApplied?: boolean;
  style?: string;
}

// WOW Effects response data
export interface EffectCategories {
  visual: WowEffect[];
  interactive: WowEffect[];
  animation: WowEffect[];
  advanced: WowEffect[];
}

export interface PreviewData {
  baseStyles: any;
  effects: EnhancedEffect[];
  combinedPreview: {
    html: string;
    css: string;
    js: string;
  };
}

export interface EnhancedEffect extends WowEffect {
  preview: any;
  cssCode: string;
  jsCode?: string;
}

export interface AnimationData {
  name: string;
  keyframes: AnimationKeyframe[];
  options: AnimationOptions;
}

export interface AnimationKeyframe {
  percent?: string;
  offset?: number;
  styles: string;
  imageUrl?: string;
}

export interface AnimationOptions {
  duration: string;
  easing: string;
  iterations: number | 'infinite';
  direction?: string;
  fillMode?: string;
}

// Response metadata
export interface ResponseMetadata {
  totalElements?: number;
  customizableElements?: number;
  validationPassed?: boolean;
  warningsCount?: number;
  processingMode?: string;
  hasWowEffects?: boolean;
  timestamp?: string;
  performanceImpact?: 'low' | 'medium' | 'high' | 'very-high';
  walletType?: string;
  effectsCount?: number;
  hasAnimations?: boolean;
  has3D?: boolean;
  structureAware?: boolean;
  registryElementsCount?: number;
  enhancedAnalysis?: boolean;
}

// Human-friendly message templates
export interface ChatMessage {
  type: 'greeting' | 'analysis' | 'success' | 'error' | 'suggestion' | 'confirmation';
  content: string;
  actions?: ChatAction[];
  visualPreview?: string;
}

export interface ChatAction {
  label: string;
  action: string;
  data?: any;
}

// NFT Mint preparation response
export interface NFTMintResponse {
  ready: boolean;
  walletStyle: WalletStyle;
  appliedEffects: WowEffect[];
  generatedAssets: string[];
  metadata: NFTMetadata;
  preview: {
    imageUrl: string;
    animationUrl?: string;
  };
  mintData: {
    name: string;
    description: string;
    attributes: NFTAttribute[];
    externalUrl?: string;
  };
}

export interface NFTMetadata {
  creator: string;
  createdAt: string;
  walletType: string;
  styleVersion: string;
  uniqueFeatures: string[];
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

// API Error responses
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  suggestion?: string;
}

// Style analysis response
export interface StyleAnalysisResponse {
  success: boolean;
  analysis: string;
  recommendations: StyleRecommendation[];
  colorHarmony: ColorHarmonyAnalysis;
  accessibilityScore: number;
  trendAlignment: TrendAnalysis;
}

export interface StyleRecommendation {
  aspect: string;
  current: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  reason: string;
}

export interface ColorHarmonyAnalysis {
  scheme: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'custom';
  harmony: number; // 0-100
  suggestions: ColorPalette[];
}

export interface TrendAnalysis {
  score: number; // 0-100
  matchingTrends: string[];
  suggestions: string[];
}

// Batch operation response
export interface BatchOperationResponse {
  success: boolean;
  operations: OperationResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface OperationResult {
  operation: string;
  success: boolean;
  result?: any;
  error?: string;
}

// Export all response types
export type AnyResponse = 
  | GPTResponse
  | ImageGenerationResponse
  | NFTMintResponse
  | ErrorResponse
  | StyleAnalysisResponse
  | BatchOperationResponse;
