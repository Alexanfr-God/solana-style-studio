// Enhanced Style types and interfaces

import { WowEffect } from './wallet.ts';

// Base style changes interface
export interface StyleChanges {
  layer: 'unlock' | 'balance' | 'global';
  target: string;
  selector?: string;
  changes: CSSProperties;
  reasoning: string;
  
  // Enhanced properties
  priority?: number;
  animate?: boolean;
  duration?: string;
  validation?: StyleValidation;
}

// Comprehensive CSS properties
export interface CSSProperties {
  // Colors
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  outlineColor?: string;
  textDecorationColor?: string;
  
  // Gradients
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundClip?: string;
  backgroundOrigin?: string;
  
  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string;
  textAlign?: string;
  textTransform?: string;
  textDecoration?: string;
  textShadow?: string;
  wordSpacing?: string;
  whiteSpace?: string;
  
  // Box Model
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  
  // Borders
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
  
  // Effects
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  opacity?: string | number;
  mixBlendMode?: string;
  
  // Transform
  transform?: string;
  transformOrigin?: string;
  transformStyle?: string;
  perspective?: string;
  perspectiveOrigin?: string;
  backfaceVisibility?: string;
  
  // Animation
  animation?: string;
  animationName?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationIterationCount?: string | number;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  
  // Transition
  transition?: string;
  transitionProperty?: string;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  transitionDelay?: string;
  
  // Layout
  display?: string;
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string | number;
  float?: string;
  clear?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  
  // Flexbox
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  flex?: string;
  flexGrow?: string | number;
  flexShrink?: string | number;
  flexBasis?: string;
  alignSelf?: string;
  order?: string | number;
  
  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridColumnGap?: string;
  gridRowGap?: string;
  gridGap?: string;
  gridAutoColumns?: string;
  gridAutoRows?: string;
  gridAutoFlow?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  
  // Custom properties
  [key: string]: any;
}

// Color palette with extended options
export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryLight?: string;
  primaryDark?: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight?: string;
  secondaryDark?: string;
  
  // Accent colors
  accent: string;
  accentLight?: string;
  accentDark?: string;
  
  // Base colors
  background: string;
  surface?: string;
  text: string;
  textSecondary?: string;
  
  // State colors
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  
  // Additional colors
  border?: string;
  divider?: string;
  disabled?: string;
  overlay?: string;
  
  // Gradients
  gradients?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

// Typography system
export interface TypographySystem {
  // Font families
  fontFamilies: {
    heading: string;
    body: string;
    mono?: string;
    display?: string;
  };
  
  // Font sizes
  fontSizes: {
    xs?: string;
    sm?: string;
    base: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    '4xl'?: string;
  };
  
  // Font weights
  fontWeights: {
    thin?: number;
    light?: number;
    regular: number;
    medium?: number;
    semibold?: number;
    bold: number;
    black?: number;
  };
  
  // Line heights
  lineHeights: {
    tight?: string | number;
    normal: string | number;
    relaxed?: string | number;
    loose?: string | number;
  };
  
  // Letter spacing
  letterSpacing: {
    tighter?: string;
    tight?: string;
    normal: string;
    wide?: string;
    wider?: string;
  };
}

// Spacing system
export interface SpacingSystem {
  base: string; // e.g., '4px'
  scale: {
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
  };
}

// Border system
export interface BorderSystem {
  widths: {
    none: string;
    thin: string;
    base: string;
    thick: string;
  };
  radii: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  styles: {
    solid: string;
    dashed: string;
    dotted: string;
    double: string;
  };
}

// Shadow system
export interface ShadowSystem {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  outline: string;
  
  // Custom shadows
  glow?: {
    sm: string;
    base: string;
    lg: string;
  };
  neon?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Complete design system
export interface DesignSystem {
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  borders: BorderSystem;
  shadows: ShadowSystem;
  
  // Additional systems
  animations?: AnimationSystem;
  transitions?: TransitionSystem;
  breakpoints?: BreakpointSystem;
}

// Animation system
export interface AnimationSystem {
  durations: {
    fast: string;
    base: string;
    slow: string;
    slower: string;
  };
  easings: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    elastic: string;
  };
  keyframes: Record<string, string>;
}

// Transition system
export interface TransitionSystem {
  properties: {
    all: string;
    colors: string;
    opacity: string;
    shadow: string;
    transform: string;
  };
  durations: {
    fast: string;
    base: string;
    slow: string;
  };
  easings: {
    default: string;
    linear: string;
    in: string;
    out: string;
    inOut: string;
  };
}

// Breakpoint system
export interface BreakpointSystem {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// Style validation
export interface StyleValidation {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
  accessibility?: AccessibilityCheck;
}

export interface AccessibilityCheck {
  contrastRatio?: number;
  isWCAGCompliant?: boolean;
  suggestions?: string[];
}

// Style preset with complete configuration
export interface CompleteStylePreset {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'modern' | 'vibrant' | 'dark' | 'light' | 'custom';
  
  // Design system
  designSystem: DesignSystem;
  
  // Component styles
  components: {
    wallet: CSSProperties;
    header: CSSProperties;
    buttons: {
      primary: CSSProperties;
      secondary: CSSProperties;
      ghost: CSSProperties;
    };
    cards: CSSProperties;
    inputs: CSSProperties;
    navigation: CSSProperties;
  };
  
  // Effects
  effects?: WowEffect[];
  
  // Metadata
  metadata: {
    author?: string;
    version: string;
    tags: string[];
    premium?: boolean;
    popularity?: number;
  };
}

// Style diff for tracking changes
export interface StyleDiff {
  element: string;
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

// Style history
export interface StyleHistory {
  id: string;
  timestamp: string;
  changes: StyleDiff[];
  snapshot: DesignSystem;
  description?: string;
}

// Export utilities
export interface StyleExport {
  format: 'css' | 'scss' | 'json' | 'js';
  content: string;
  minified?: boolean;
  includes: {
    variables?: boolean;
    utilities?: boolean;
    components?: boolean;
    animations?: boolean;
  };
}
