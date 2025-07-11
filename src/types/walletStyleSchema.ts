
export interface AnimationConfig {
  transition?: string;
  duration?: string;
  easing?: string;
  delay?: string;
}

export interface InteractiveStates {
  default?: ComponentStyle;
  hover?: Partial<ComponentStyle>;
  active?: Partial<ComponentStyle>;
  focus?: Partial<ComponentStyle>;
  disabled?: Partial<ComponentStyle>;
}

export interface ComponentStyle {
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string | number;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  backgroundImage?: string;
  backdropFilter?: string;
  opacity?: string;
  transition?: string;
  // Animation support
  animation?: AnimationConfig;
  // Interactive states
  states?: InteractiveStates;
}

export interface TokenColors {
  positive: string;
  negative: string;
  neutral: string;
  warning: string;
  info: string;
}

export interface StatusColors {
  success: string;
  error: string;
  pending: string;
  inactive: string;
}

// Добавляем типы для контейнеров с backgroundImage
export interface ContainerStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  borderRadius?: string;
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
  // Theme and animations support
  theme?: string;
  animations?: {
    enabled: boolean;
    duration?: string;
    easing?: string;
  };
}
