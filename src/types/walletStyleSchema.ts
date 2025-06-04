
export interface AnimationConfig {
  transition?: string;
  duration?: string;
  easing?: string;
  delay?: string;
}

export interface InteractiveStates {
  default: ComponentStyle;
  hover?: Partial<ComponentStyle>;
  active?: Partial<ComponentStyle>;
  focus?: Partial<ComponentStyle>;
  disabled?: Partial<ComponentStyle>;
}

export interface ComponentStyle {
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  backgroundImage?: string;
  backdropFilter?: string;
  opacity?: string;
  // Animation support
  animation?: AnimationConfig;
  // Interactive states
  states?: InteractiveStates;
}

export interface TokenColors {
  positive: string;    // Green for gains
  negative: string;    // Red for losses
  neutral: string;     // Gray for no change
  warning: string;     // Yellow for warnings
  info: string;        // Blue for info
}

export interface StatusColors {
  success: string;
  error: string;
  pending: string;
  inactive: string;
}

export interface WalletStyleSet {
  global: ComponentStyle;
  header: ComponentStyle;
  buttons: ComponentStyle;
  panels: ComponentStyle;
  navigation: ComponentStyle;
  inputs: ComponentStyle;
  cards: ComponentStyle;
  overlays: ComponentStyle;
  containers: ComponentStyle;
  searchInputs: ComponentStyle;
  // Color systems
  tokenColors: TokenColors;
  statusColors: StatusColors;
  // AI Pet configuration
  aiPet: {
    zone: AiPetZone;
    bodyType: AiPetBodyType;
    emotion: AiPetEmotion;
  };
}

export type AiPetEmotion = 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';
