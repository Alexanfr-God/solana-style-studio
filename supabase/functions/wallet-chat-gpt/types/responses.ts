// ====== Enhanced types/responses.ts ======

/**
 * Base API Response Interface
 */
export interface BaseAPIResponse {
  success: boolean;
  timestamp: string;
  requestId?: string;
  processingTime?: number;
  version?: string;
}

/**
 * Enhanced GPT Response with full context and metadata
 */
export interface GPTResponse extends BaseAPIResponse {
  response: string;
  action: 'style_analysis' | 'element_customization' | 'image_generation' | 'chat' | 'tutorial' | 'troubleshooting';
  data: {
    styleChanges?: EnhancedStyleChanges;
    imageUrl?: string;
    analysisResults?: StyleAnalysisResponse;
    chatContext?: ChatContextResponse;
    tutorialSteps?: TutorialStep[];
    suggestions?: string[];
    followUpQuestions?: string[];
  };
  mode: string;
  error?: APIError;
  metadata: ResponseMetadata;
}

/**
 * Comprehensive Style Changes with AI reasoning
 */
export interface EnhancedStyleChanges {
  // AI Analysis and reasoning
  analysis: {
    userIntent: string;
    identifiedElements: string[];
    styleDirection: string;
    confidenceScore: number;
    reasoningSteps: string[];
  };
  
  // Specific actions taken
  actions: StyleAction[];
  
  // Detailed element modifications
  elements: {
    backgrounds?: {
      login?: BackgroundStyle;
      dashboard?: BackgroundStyle;
      main?: BackgroundStyle;
      settings?: BackgroundStyle;
      [screen: string]: BackgroundStyle | undefined;
    };
    colors?: EnhancedColorScheme;
    typography?: TypographyScheme;
    components?: ComponentStyles;
    layout?: LayoutStyles;
    animations?: AnimationStyles;
  };
  
  // Rich metadata and assets
  metadata: {
    generatedAssets: GeneratedAsset[];
    styleReasoning: string;
    nftReady: boolean;
    accessibilityScore: number;
    compatibilityInfo: CompatibilityInfo;
    exportFormats: ExportFormat[];
    appliedOptimizations: string[];
    qualityMetrics: QualityMetrics;
  };
  
  // Preview and validation
  preview: {
    mockupUrl?: string;
    previewElements: PreviewElement[];
    validationResults: ValidationResult[];
  };
}

/**
 * Style Action with detailed change tracking
 */
export interface StyleAction {
  type: 'color_change' | 'font_change' | 'layout_change' | 'component_update' | 'animation_add';
  target: string;
  description: string;
  before?: any;
  after: any;
  impact: 'low' | 'medium' | 'high';
  reversible: boolean;
  timestamp: string;
}

/**
 * Background Style Configuration
 */
export interface BackgroundStyle {
  type: 'solid' | 'gradient' | 'image' | 'pattern' | 'video';
  value: string;
  fallback?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
  animation?: {
    enabled: boolean;
    type: string;
    duration: number;
  };
  responsive: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

/**
 * Enhanced Color Scheme with accessibility
 */
export interface EnhancedColorScheme {
  primary: ColorDefinition;
  secondary: ColorDefinition;
  accent: ColorDefinition;
  background: ColorDefinition;
  surface: ColorDefinition;
  text: ColorDefinition;
  textSecondary: ColorDefinition;
  success: ColorDefinition;
  warning: ColorDefinition;
  error: ColorDefinition;
  info: ColorDefinition;
  gradients?: GradientDefinition[];
  customColors?: { [name: string]: ColorDefinition };
}

/**
 * Color Definition with variants and accessibility
 */
export interface ColorDefinition {
  value: string;
  variants?: {
    50?: string;
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
    600?: string;
    700?: string;
    800?: string;
    900?: string;
  };
  accessibility: {
    contrastRatio: number;
    wcagLevel: 'AA' | 'AAA' | 'fail';
    readableOn: string[];
  };
  metadata: {
    name?: string;
    description?: string;
    psychology?: string[];
    harmony?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic';
  };
}

/**
 * Typography Scheme
 */
export interface TypographyScheme {
  fontFamilies: {
    primary: FontDefinition;
    secondary?: FontDefinition;
    monospace?: FontDefinition;
  };
  scales: {
    desktop: FontScale;
    tablet: FontScale;
    mobile: FontScale;
  };
  elements: {
    h1?: TypographyElement;
    h2?: TypographyElement;
    h3?: TypographyElement;
    h4?: TypographyElement;
    h5?: TypographyElement;
    h6?: TypographyElement;
    body?: TypographyElement;
    caption?: TypographyElement;
    button?: TypographyElement;
    label?: TypographyElement;
  };
}

/**
 * Font Definition
 */
export interface FontDefinition {
  family: string;
  weights: number[];
  styles: string[];
  source: 'google' | 'custom' | 'system';
  fallbacks: string[];
  preload?: boolean;
}

/**
 * Font Scale
 */
export interface FontScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

/**
 * Typography Element
 */
export interface TypographyElement {
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
  textTransform?: string;
  fontFamily?: string;
}

/**
 * Component Styles
 */
export interface ComponentStyles {
  buttons?: ButtonStyles;
  cards?: CardStyles;
  navigation?: NavigationStyles;
  forms?: FormStyles;
  modals?: ModalStyles;
  tooltips?: TooltipStyles;
  [component: string]: any;
}

/**
 * Button Styles
 */
export interface ButtonStyles {
  primary: ButtonVariant;
  secondary: ButtonVariant;
  outline: ButtonVariant;
  ghost: ButtonVariant;
  danger: ButtonVariant;
  sizes: {
    sm: ButtonSize;
    md: ButtonSize;
    lg: ButtonSize;
    xl: ButtonSize;
  };
}

/**
 * Button Variant
 */
export interface ButtonVariant {
  background: string;
  color: string;
  border: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: number;
  transition: string;
  hover: {
    background: string;
    color: string;
    border: string;
    transform?: string;
  };
  active: {
    background: string;
    color: string;
    transform?: string;
  };
  disabled: {
    background: string;
    color: string;
    opacity: number;
  };
}

/**
 * Button Size
 */
export interface ButtonSize {
  padding: string;
  fontSize: string;
  lineHeight: string;
  borderRadius: string;
}

/**
 * Layout Styles
 */
export interface LayoutStyles {
  container: {
    maxWidth: string;
    padding: string;
    margin: string;
  };
  grid: {
    columns: number;
    gap: string;
    breakpoints: { [key: string]: number };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

/**
 * Animation Styles
 */
export interface AnimationStyles {
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
  animations: {
    [name: string]: AnimationDefinition;
  };
  preferences: {
    reducedMotion: boolean;
    duration: 'fast' | 'normal' | 'slow';
    easing: string;
  };
}

/**
 * Animation Definition
 */
export interface AnimationDefinition {
  keyframes: string;
  duration: string;
  timingFunction: string;
  delay?: string;
  iterationCount?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

/**
 * Generated Asset
 */
export interface GeneratedAsset {
  type: 'image' | 'icon' | 'pattern' | 'texture' | 'gradient';
  url: string;
  format: 'png' | 'jpg' | 'svg' | 'webp' | 'gif';
  dimensions?: { width: number; height: number };
  size?: number;
  purpose: string;
  metadata: {
    generator: string;
    prompt?: string;
    style?: string;
    timestamp: string;
  };
}

/**
 * Compatibility Information
 */
export interface CompatibilityInfo {
  browsers: {
    chrome: string;
    firefox: string;
    safari: string;
    edge: string;
  };
  walletSupport: {
    phantom: boolean;
    metamask: boolean;
    solflare: boolean;
    backpack: boolean;
  };
  features: {
    darkMode: boolean;
    animations: boolean;
    gradients: boolean;
    customFonts: boolean;
  };
  limitations: string[];
  recommendations: string[];
}

/**
 * Export Format
 */
export interface ExportFormat {
  type: 'css' | 'scss' | 'json' | 'tailwind' | 'figma';
  available: boolean;
  size?: number;
  downloadUrl?: string;
}

/**
 * Quality Metrics
 */
export interface QualityMetrics {
  accessibility: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  performance: {
    score: number;
    metrics: {
      colorComplexity: number;
      animationLoad: number;
      assetCount: number;
    };
  };
  design: {
    consistency: number;
    harmony: number;
    usability: number;
  };
  overall: number;
}

/**
 * Preview Element
 */
export interface PreviewElement {
  type: string;
  name: string;
  before: string;
  after: string;
  screenshot?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  suggestion?: string;
  autoFixable: boolean;
}

/**
 * Style Analysis Response
 */
export interface StyleAnalysisResponse {
  analysis: {
    dominantColors: string[];
    colorHarmony: string;
    mood: string;
    style: string;
    complexity: 'low' | 'medium' | 'high';
    confidence: number;
  };
  recommendations: string[];
  palette: EnhancedColorScheme;
  inspiration: {
    sources: string[];
    keywords: string[];
    similarStyles: string[];
  };
}

/**
 * Chat Context Response
 */
export interface ChatContextResponse {
  sessionId: string;
  messageCount: number;
  context: {
    walletType: string;
    activeScreen: string;
    recentActions: string[];
    preferences: any;
  };
  suggestions: string[];
  nextSteps: string[];
}

/**
 * Tutorial Step
 */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  screenshot?: string;
  duration?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Response Metadata
 */
export interface ResponseMetadata {
  aiModel: string;
  processingSteps: string[];
  confidenceScore: number;
  alternatives: any[];
  debugInfo?: any;
  performanceMetrics: {
    totalTime: number;
    aiTime: number;
    processingTime: number;
    renderTime: number;
  };
}

/**
 * Image Generation Response
 */
export interface ImageGenerationResponse extends BaseAPIResponse {
  imageUrl?: string;
  generationId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: APIError;
  metadata: {
    generator: 'leonardo' | 'replicate';
    prompt: string;
    enhancedPrompt?: string;
    style: string;
    dimensions: { width: number; height: number };
    quality: 'standard' | 'high' | 'premium';
    processingTime?: number;
    optimizations: string[];
    reasoning?: string[];
  };
  variations?: ImageVariation[];
}

/**
 * Image Variation
 */
export interface ImageVariation {
  url: string;
  type: 'color' | 'style' | 'composition';
  description: string;
}

/**
 * API Error
 */
export interface APIError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  suggestions?: string[];
}

/**
 * Gradient Definition
 */
export interface GradientDefinition {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  direction?: string;
  stops: GradientStop[];
}

/**
 * Gradient Stop
 */
export interface GradientStop {
  color: string;
  position: number;
}
