// ====== Enhanced types/styles.ts ======

/**
 * Advanced Style Changes with context and reasoning
 */
export interface StyleChanges {
  id: string;
  timestamp: string;
  layer: string;
  target: string;
  screen?: string;
  changes: StyleChangeSet;
  reasoning: StyleReasoning;
  metadata: StyleMetadata;
  preview?: StylePreview;
  validation: StyleValidation;
}

/**
 * Comprehensive Style Change Set
 */
export interface StyleChangeSet {
  // Visual properties
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  borderColor?: string;
  
  // Layout properties
  borderRadius?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  
  // Effects
  boxShadow?: string;
  textShadow?: string;
  filter?: string;
  backdropFilter?: string;
  
  // Background
  gradient?: GradientDefinition;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  
  // Animation
  transition?: string;
  animation?: string;
  transform?: string;
  
  // Custom properties
  customProperties?: { [key: string]: string };
  
  // Responsive variants
  responsive?: {
    mobile?: Partial<StyleChangeSet>;
    tablet?: Partial<StyleChangeSet>;
    desktop?: Partial<StyleChangeSet>;
  };
}

/**
 * Style Reasoning with AI insights
 */
export interface StyleReasoning {
  intent: string;
  steps: string[];
  principles: string[];
  tradeoffs: string[];
  alternatives: string[];
  confidence: number;
  context: {
    userRequest: string;
    currentStyle: any;
    walletType: string;
    targetAudience?: string;
  };
}

/**
 * Style Metadata
 */
export interface StyleMetadata {
  source: 'ai' | 'user' | 'template' | 'import';
  generator?: string;
  version: string;
  tags: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedImpact: 'low' | 'medium' | 'high';
  dependencies: string[];
  conflicts: string[];
}

/**
 * Style Preview
 */
export interface StylePreview {
  mockupUrl?: string;
  cssCode: string;
  affectedElements: string[];
  screenshots: {
    before?: string;
    after?: string;
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

/**
 * Style Validation
 */
export interface StyleValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  accessibilityScore: number;
  performanceScore: number;
}

/**
 * Validation Error
 */
export interface ValidationError {
  type: string;
  message: string;
  property: string;
  value: any;
  fix?: string;
}

/**
 * Validation Warning
 */
export interface ValidationWarning {
  type: string;
  message: string;
  property: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

/**
 * Validation Suggestion
 */
export interface ValidationSuggestion {
  type: string;
  message: string;
  improvement: string;
  benefit: string;
}

/**
 * Enhanced Color Palette with advanced features
 */
export interface ColorPalette {
  // Core colors
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  
  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Interactive colors
  link: string;
  linkHover: string;
  focus: string;
  selection: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Shadow colors
  shadow: string;
  shadowLight: string;
  shadowDark: string;
  
  // Brand colors
  brand?: { [key: string]: string };
  
  // Metadata
  metadata: {
    name: string;
    description?: string;
    harmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'custom';
    temperature: 'warm' | 'cool' | 'neutral';
    mood: string[];
    accessibility: {
      contrastChecked: boolean;
      wcagLevel: 'A' | 'AA' | 'AAA';
      issues: string[];
    };
    generated: boolean;
    source?: string;
    inspiration?: string[];
  };
}

/**
 * Advanced Theme Configuration
 */
export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  
  // Core theme data
  colors: ColorPalette;
  typography: TypographyScheme;
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  animations: AnimationConfig;
  
  // Layout configuration
  layout: {
    container: LayoutContainer;
    grid: GridSystem;
    breakpoints: Breakpoints;
  };
  
  // Component styling
  components: ComponentTheme;
  
  // Theme metadata
  metadata: {
    author: string;
    tags: string[];
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    walletCompatibility: string[];
    created: string;
    updated: string;
    downloads?: number;
    rating?: number;
  };
  
  // Customization options
  customization: {
    allowColorChanges: boolean;
    allowTypographyChanges: boolean;
    allowLayoutChanges: boolean;
    lockedProperties: string[];
  };
}

/**
 * Spacing Scale
 */
export interface SpacingScale {
  '0': string;
  '1': string;
  '2': string;
  '3': string;
  '4': string;
  '5': string;
  '6': string;
  '8': string;
  '10': string;
  '12': string;
  '16': string;
  '20': string;
  '24': string;
  '32': string;
  '40': string;
  '48': string;
  '56': string;
  '64': string;
  '72': string;
  '80': string;
  '96': string;
}

/**
 * Border Radius Scale
 */
export interface BorderRadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Shadow Scale
 */
export interface ShadowScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  outline: string;
}

/**
 * Animation Configuration
 */
export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  presets: { [name: string]: AnimationDefinition };
}

/**
 * Layout Container
 */
export interface LayoutContainer {
  maxWidth: { [breakpoint: string]: string };
  padding: { [breakpoint: string]: string };
  margin: string;
  center: boolean;
}

/**
 * Grid System
 */
export interface GridSystem {
  columns: number;
  gap: { [breakpoint: string]: string };
  container: boolean;
}

/**
 * Breakpoints
 */
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Component Theme
 */
export interface ComponentTheme {
  button: ButtonTheme;
  input: InputTheme;
  card: CardTheme;
  modal: ModalTheme;
  navigation: NavigationTheme;
  [component: string]: any;
}

/**
 * Card Styles
 */
export interface CardStyles {
  base: CardVariant;
  elevated: CardVariant;
  outlined: CardVariant;
  filled: CardVariant;
}

/**
 * Card Variant
 */
export interface CardVariant {
  background: string;
  border: string;
  borderRadius: string;
  padding: string;
  boxShadow: string;
  transition: string;
  hover: {
    background: string;
    border: string;
    boxShadow: string;
    transform?: string;
  };
}
