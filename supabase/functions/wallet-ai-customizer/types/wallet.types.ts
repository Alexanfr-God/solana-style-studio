
// Wallet structure interfaces based on WalletPreviewContainer
export interface WalletStructure {
  metadata: WalletMetadata;
  screens: WalletScreen[];
  elements: WalletElement[];
}

export interface WalletMetadata {
  walletType: string;
  version: string;
  totalScreens: number;
  totalCustomizableElements: number;
  lastUpdated: string;
  walletName?: string;
  description?: string;
}

export interface WalletScreen {
  screenId: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  elements: { [elementId: string]: WalletElement };
  navigation?: ScreenNavigation;
  state?: ScreenState;
}

export interface WalletElement {
  elementType: ElementType;
  currentStyles: { [property: string]: any };
  customizable: boolean;
  aiInstructions?: AIElementInstructions;
  componentName?: string;
  parentContainer?: string;
  children?: string[];
  interactionType?: InteractionType;
  accessibility?: AccessibilityInfo;
}

export type ElementType = 
  | 'button'
  | 'text' 
  | 'container'
  | 'input'
  | 'icon'
  | 'image'
  | 'navigation'
  | 'modal'
  | 'list'
  | 'card'
  | 'header'
  | 'footer'
  | 'separator'
  | 'progress'
  | 'toggle'
  | 'dropdown';

export type InteractionType =
  | 'clickable'
  | 'hoverable' 
  | 'focusable'
  | 'draggable'
  | 'scrollable'
  | 'input'
  | 'static';

export interface AIElementInstructions {
  styleAgent?: string;
  fontAgent?: string;
  colorAgent?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  customizationRules?: CustomizationRules;
  semanticRole?: string;
  designPrinciples?: string[];
}

export interface CustomizationRules {
  allowColorChange: boolean;
  allowFontChange: boolean;
  allowSizeChange: boolean;
  allowSpacingChange: boolean;
  allowBorderChange: boolean;
  allowShadowChange: boolean;
  preserveRatio?: boolean;
  constraints?: StyleConstraints;
}

export interface StyleConstraints {
  minSize?: { width?: number; height?: number };
  maxSize?: { width?: number; height?: number };
  colorRestrictions?: string[];
  fontRestrictions?: string[];
  borderRadiusMax?: number;
}

export interface ScreenNavigation {
  type: 'tab' | 'modal' | 'slide' | 'stack';
  transitions?: NavigationTransition[];
  parentScreen?: string;
  childScreens?: string[];
}

export interface NavigationTransition {
  trigger: string;
  targetScreen: string;
  animation?: string;
  duration?: number;
}

export interface ScreenState {
  isDefault: boolean;
  requires?: string[];
  conditions?: StateCondition[];
  variants?: ScreenVariant[];
}

export interface StateCondition {
  property: string;
  operator: '=' | '!=' | '>' | '<' | 'contains';
  value: any;
}

export interface ScreenVariant {
  name: string;
  condition: StateCondition;
  elementOverrides: { [elementId: string]: Partial<WalletElement> };
}

export interface AccessibilityInfo {
  ariaLabel?: string;
  ariaRole?: string;
  tabIndex?: number;
  keyboardShortcut?: string;
  screenReaderText?: string;
  contrastRequirement?: 'AA' | 'AAA';
}

// Wallet API response types
export interface WalletAPIResponse {
  success: boolean;
  data?: WalletStructure;
  error?: string;
  timestamp: string;
  processingTime?: number;
}

export interface WalletValidation {
  valid: boolean;
  totalElements: number;
  customizableElements: number;
  criticalElements: string[];
  issues?: string[];
  warnings?: string[];
}

// Component mapping for WalletPreviewContainer
export interface WalletComponentMap {
  'WalletPreviewContainer': ContainerComponent;
  'WalletContainer': ContainerComponent;
  'WalletHomeLayer': LayerComponent;
  'ReceiveLayer': LayerComponent;
  'SendLayer': LayerComponent;
  'BuyLayer': LayerComponent;
  'AppsContent': ContentComponent;
  'SwapContent': ContentComponent;
  [key: string]: BaseComponent;
}

export interface BaseComponent {
  id: string;
  type: ElementType;
  props?: { [key: string]: any };
  styles?: { [key: string]: any };
  children?: string[];
  state?: ComponentState;
}

export interface ContainerComponent extends BaseComponent {
  layout: 'flex' | 'grid' | 'absolute' | 'relative';
  layers?: string[];
  activeLayer?: string;
}

export interface LayerComponent extends BaseComponent {
  visible: boolean;
  zIndex?: number;
  modal?: boolean;
  overlay?: boolean;
}

export interface ContentComponent extends BaseComponent {
  content: any;
  loading?: boolean;
  error?: string;
}

export interface ComponentState {
  active: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  data?: any;
}
