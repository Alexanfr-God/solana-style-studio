// API Request/Response types
export interface CustomizeWalletRequest {
  walletId: string;
  image: File;
  customPrompt?: string;
  options?: CustomizationOptions;
}

export interface CustomizationOptions {
  aiMode?: 'fast' | 'quality' | 'experimental';
  stylePreferences?: StylePreferences;
  preserveElements?: string[];
  focusAreas?: string[];
  learningEnabled?: boolean;
}

export interface StylePreferences {
  colorScheme?: 'vibrant' | 'muted' | 'monochrome' | 'gradient';
  layoutStyle?: 'minimal' | 'rich' | 'compact' | 'spacious';
  fontStyle?: 'modern' | 'classic' | 'playful' | 'professional';
  effectLevel?: 'none' | 'subtle' | 'moderate' | 'dramatic';
}

export interface CustomizeWalletResponse {
  success: boolean;
  sessionId: string;
  result?: CustomizationResult;
  error?: string;
  timestamp: string;
  processingTime?: number;
}

export interface CustomizationResult {
  themeId: string;
  generatedStyles: GeneratedStyles;
  aiAnalysis: AIAnalysisResult;
  preview?: PreviewData;
  confidence: number;
  metadata: ResultMetadata;
}

export interface GeneratedStyles {
  variables: CSSVariables;
  elements: ElementStyles;
  responsive?: ResponsiveStyles;
  animations?: AnimationStyles;
  themes?: ThemeVariants;
}

export interface CSSVariables {
  [variableName: string]: string;
}

export interface ElementStyles {
  [elementId: string]: {
    [property: string]: any;
  };
}

export interface ResponsiveStyles {
  mobile?: ElementStyles;
  tablet?: ElementStyles;
  desktop?: ElementStyles;
}

export interface AnimationStyles {
  [animationName: string]: {
    keyframes: { [percentage: string]: any };
    duration: string;
    timingFunction: string;
    delay?: string;
  };
}

export interface ThemeVariants {
  light?: Partial<GeneratedStyles>;
  dark?: Partial<GeneratedStyles>;
  highContrast?: Partial<GeneratedStyles>;
}

export interface AIAnalysisResult {
  imageAnalysis: ImageAnalysis;
  walletAnalysis: WalletAnalysis;
  styleRecommendations: StyleRecommendations;
  confidence: number;
  processingSteps: ProcessingStep[];
}

export interface ImageAnalysis {
  dominantColors: string[];
  colorPalette: ColorPalette;
  mood: MoodProfile;
  composition: CompositionAnalysis;
  style: StyleAnalysis;
  confidence: number;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: string;
  text: string;
  distribution: { [color: string]: number };
}

export interface MoodProfile {
  primary: string;
  energy: 'high' | 'medium' | 'low';
  formality: 'formal' | 'casual' | 'mixed';
  warmth: 'warm' | 'cool' | 'neutral';
  emotions: string[];
  confidence: number;
}

export interface CompositionAnalysis {
  layout: 'centered' | 'asymmetric' | 'grid' | 'organic';
  balance: 'balanced' | 'dynamic' | 'heavy-left' | 'heavy-right';
  focal_points: Point[];
  rhythm: 'static' | 'dynamic' | 'chaotic';
}

export interface StyleAnalysis {
  category: string;
  subcategories: string[];
  influences: string[];
  modernityScore: number;
  complexityScore: number;
  uniquenessScore: number;
}

export interface Point {
  x: number;
  y: number;
  importance: number;
}

export interface WalletAnalysis {
  elementClassification: { [elementId: string]: ElementClassification };
  hierarchy: ElementHierarchy;
  interactions: InteractionMap;
  designPatterns: DesignPattern[];
  accessibility: AccessibilityAnalysis;
  confidence: number;
}

export interface ElementClassification {
  semanticType: string;
  functionalRole: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  userImpact: number;
  customizationPotential: CustomizationPotential;
}

export interface CustomizationPotential {
  colors: boolean;
  typography: boolean;
  spacing: boolean;
  borders: boolean;
  shadows: boolean;
  animations: boolean;
  risk: 'low' | 'medium' | 'high';
}

export interface ElementHierarchy {
  primary: string[];
  secondary: string[];
  tertiary: string[];
  decorative: string[];
}

export interface InteractionMap {
  [elementId: string]: {
    triggers: string[];
    targets: string[];
    type: 'navigation' | 'action' | 'input' | 'display';
  };
}

export interface DesignPattern {
  name: string;
  elements: string[];
  description: string;
  confidence: number;
}

export interface AccessibilityAnalysis {
  contrastIssues: ContrastIssue[];
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  recommendations: string[];
  score: number;
}

export interface ContrastIssue {
  elementId: string;
  currentRatio: number;
  requiredRatio: number;
  severity: 'low' | 'medium' | 'high';
}

export interface StyleRecommendations {
  colorChanges: ColorRecommendation[];
  typographyChanges: TypographyRecommendation[];
  layoutChanges: LayoutRecommendation[];
  effectChanges: EffectRecommendation[];
  priority: 'low' | 'medium' | 'high';
}

export interface ColorRecommendation {
  elementId: string;
  property: string;
  currentValue: string;
  recommendedValue: string;
  reason: string;
  confidence: number;
}

export interface TypographyRecommendation {
  elementId: string;
  property: string;
  currentValue: string;
  recommendedValue: string;
  reason: string;
  confidence: number;
}

export interface LayoutRecommendation {
  elementId: string;
  property: string;
  currentValue: string;
  recommendedValue: string;
  reason: string;
  confidence: number;
}

export interface EffectRecommendation {
  elementId: string;
  effect: string;
  parameters: { [key: string]: any };
  reason: string;
  confidence: number;
}

export interface ProcessingStep {
  name: string;
  duration: number;
  success: boolean;
  output?: any;
  error?: string;
}

export interface PreviewData {
  thumbnailUrl?: string;
  fullPreviewUrl?: string;
  interactivePreview?: boolean;
  generatedAt: string;
}

export interface ResultMetadata {
  sessionId: string;
  walletId: string;
  aiModelsUsed: string[];
  processingTime: number;
  timestamp: string;
  version: string;
  qualityScore: number;
}

// Rating and feedback types
export interface RatingRequest {
  sessionId: string;
  rating: number;
  feedback?: string;
  categories?: RatingCategories;
}

export interface RatingCategories {
  colorAccuracy?: number;
  styleMatch?: number;
  usability?: number;
  creativity?: number;
  overall?: number;
}

export interface RatingResponse {
  success: boolean;
  message: string;
  analytics?: {
    averageRating: number;
    totalRatings: number;
    distribution: { [rating: number]: number };
  };
}

// NFT types
export interface NFTPrepareRequest {
  sessionId: string;
  includePreview?: boolean;
}

export interface NFTPrepareResponse {
  success: boolean;
  available: boolean;
  message: string;
  placeholder?: NFTPlaceholder;
  implementation?: NFTImplementation;
}

export interface NFTPlaceholder {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  futureFeatures: NFTFutureFeatures;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTFutureFeatures {
  blockchainNetworks: string[];
  mintingPrice: string;
  royalties: string;
  transferable: boolean;
  burnable: boolean;
}

export interface NFTImplementation {
  status: string;
  estimatedCompletion: string;
  requiredIntegrations: string[];
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: ServiceStatus;
  uptime?: number;
  version?: string;
}

export interface ServiceStatus {
  [serviceName: string]: 'healthy' | 'unhealthy' | 'unknown';
}

// Error types
export interface APIError {
  success: false;
  error: string;
  details?: string;
  code?: string;
  timestamp: string;
  sessionId?: string;
}

// Full Wallet Customization API Types
export interface FullWalletCustomizationRequest {
  walletId: string;
  customization: WalletCustomizationData;
  options?: WalletCustomizationOptions;
}

export interface WalletCustomizationOptions {
  excludeElements?: string[]; // Elements to skip during customization
  preserveUserPreferences?: boolean;
  validateColors?: boolean;
  validateAccessibility?: boolean;
}

export interface WalletCustomizationData {
  loginScreen: LoginScreenCustomization;
  walletScreen: WalletScreenCustomization;
  global: GlobalCustomization;
  dropdownMenus: DropdownMenuCustomization;
  // Explicitly excluded from API customization
  // logo: EXCLUDED - managed separately
  // aiPet: EXCLUDED - managed separately
}

// LOGIN SCREEN CUSTOMIZATION
export interface LoginScreenCustomization {
  background: BackgroundStyle;
  unlockButton: ButtonStyle;
  passwordInput: InputStyle;
  phantomText: TextStyle;
  welcomeMessage?: TextStyle;
  brandingArea?: ContainerStyle; // For logo area but logo itself excluded
}

// WALLET SCREEN CUSTOMIZATION
export interface WalletScreenCustomization {
  header: HeaderCustomization;
  balance: BalanceCustomization;
  actionButtons: ActionButtonsCustomization;
  assets: AssetsCustomization;
  navigation: NavigationCustomization;
}

export interface HeaderCustomization {
  container: ContainerStyle;
  accountSelector: ButtonStyle;
  searchButton: ButtonStyle;
  avatar: AvatarStyle;
  accountInfo: TextStyle;
}

export interface BalanceCustomization {
  container: ContainerStyle;
  totalBalanceLabel: TextStyle;
  totalBalanceValue: TextStyle;
  changeIndicator: TextStyle;
  currencySymbol?: TextStyle;
}

export interface ActionButtonsCustomization {
  container: ContainerStyle;
  receiveButton: ButtonStyle;
  sendButton: ButtonStyle;
  swapButton: ButtonStyle;
  buyButton: ButtonStyle;
  buttonLabels: TextStyle;
  buttonIcons: IconStyle;
}

export interface AssetsCustomization {
  container: ContainerStyle;
  sectionTitle: TextStyle;
  seeAllButton: ButtonStyle;
  assetItem: AssetItemStyle;
  assetIcon: IconStyle;
  assetName: TextStyle;
  assetTicker: TextStyle;
  assetAmount: TextStyle;
  assetValue: TextStyle;
  assetChange: TextStyle;
}

export interface NavigationCustomization {
  container: ContainerStyle;
  homeButton: NavigationButtonStyle;
  appsButton: NavigationButtonStyle;
  swapButton: NavigationButtonStyle;
  historyButton: NavigationButtonStyle;
  searchButton: NavigationButtonStyle;
  buttonIcons: IconStyle;
  buttonLabels: TextStyle;
}

// GLOBAL CUSTOMIZATION
export interface GlobalCustomization {
  fonts: FontConfiguration;
  colors: ColorSystem;
  borders: BorderConfiguration;
  shadows: ShadowConfiguration;
  spacing: SpacingConfiguration;
  animations: AnimationConfiguration;
}

export interface FontConfiguration {
  primary: FontStyle;
  secondary?: FontStyle;
  monospace?: FontStyle;
  display?: FontStyle;
  fallbacks: string[];
}

export interface ColorSystem {
  primary: ColorPalette;
  secondary: ColorPalette;
  accent: ColorPalette;
  neutral: ColorPalette;
  semantic: SemanticColors;
  gradients: GradientCollection;
}

export interface SemanticColors {
  success: ColorVariants;
  error: ColorVariants;
  warning: ColorVariants;
  info: ColorVariants;
}

export interface BorderConfiguration {
  radiusScale: BorderRadiusScale;
  widthScale: BorderWidthScale;
  styles: BorderStyleCollection;
}

export interface ShadowConfiguration {
  elevation: ShadowElevation;
  colors: ShadowColors;
  styles: ShadowStyleCollection;
}

export interface SpacingConfiguration {
  scale: SpacingScale;
  layouts: LayoutSpacing;
}

export interface AnimationConfiguration {
  durations: AnimationDurations;
  easings: AnimationEasings;
  transitions: TransitionCollection;
}

// DROPDOWN MENUS CUSTOMIZATION
export interface DropdownMenuCustomization {
  accountDropdown: DropdownStyle;
  assetDropdown?: DropdownStyle;
  settingsDropdown?: DropdownStyle;
  networkDropdown?: DropdownStyle;
}

export interface DropdownStyle {
  container: ContainerStyle;
  backdrop: BackdropStyle;
  header: DropdownHeaderStyle;
  items: DropdownItemStyle;
  footer?: DropdownFooterStyle;
  scrollbar?: ScrollbarStyle;
}

// DETAILED STYLE INTERFACES
export interface BackgroundStyle {
  color?: string;
  gradient?: GradientStyle;
  image?: BackgroundImageStyle;
  pattern?: PatternStyle;
  overlay?: OverlayStyle;
}

export interface ButtonStyle {
  background: BackgroundStyle;
  text: TextStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  states: ButtonStates;
  size: SizeConfiguration;
  icon?: IconStyle;
  animation?: AnimationStyle;
}

export interface ButtonStates {
  default: Partial<ButtonStyle>;
  hover: Partial<ButtonStyle>;
  active: Partial<ButtonStyle>;
  disabled: Partial<ButtonStyle>;
  focus: Partial<ButtonStyle>;
}

export interface InputStyle {
  background: BackgroundStyle;
  text: TextStyle;
  placeholder: TextStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  states: InputStates;
  size: SizeConfiguration;
  icon?: IconStyle;
}

export interface InputStates {
  default: Partial<InputStyle>;
  focus: Partial<InputStyle>;
  error: Partial<InputStyle>;
  disabled: Partial<InputStyle>;
  valid: Partial<InputStyle>;
}

export interface TextStyle {
  fontFamily?: string;
  fontSize: string | number;
  fontWeight: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  color: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: string;
  textShadow?: string;
}

export interface ContainerStyle {
  background: BackgroundStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  size: SizeConfiguration;
  padding: SpacingValues;
  margin?: SpacingValues;
  layout: LayoutStyle;
  overflow?: OverflowStyle;
}

export interface IconStyle {
  size: string | number;
  color: string;
  strokeWidth?: number;
  animation?: AnimationStyle;
  variants?: IconVariants;
}

export interface AvatarStyle {
  size: string | number;
  background: BackgroundStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  placeholder: TextStyle;
}

export interface AssetItemStyle {
  container: ContainerStyle;
  layout: LayoutStyle;
  states: AssetItemStates;
  spacing: SpacingValues;
}

export interface NavigationButtonStyle {
  background: BackgroundStyle;
  border: BorderStyle;
  shadow: ShadowStyle;
  states: NavigationButtonStates;
  size: SizeConfiguration;
  spacing: SpacingValues;
}

export interface DropdownHeaderStyle {
  background: BackgroundStyle;
  text: TextStyle;
  border: BorderStyle;
  padding: SpacingValues;
}

export interface DropdownItemStyle {
  background: BackgroundStyle;
  text: TextStyle;
  border: BorderStyle;
  states: DropdownItemStates;
  padding: SpacingValues;
  icon?: IconStyle;
}

export interface DropdownFooterStyle {
  background: BackgroundStyle;
  text: TextStyle;
  border: BorderStyle;
  padding: SpacingValues;
  buttons?: ButtonStyle;
}

// CONFIGURATION INTERFACES
export interface SizeConfiguration {
  width?: string | number;
  height?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
}

export interface SpacingValues {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  all?: string | number;
  horizontal?: string | number;
  vertical?: string | number;
}

export interface LayoutStyle {
  display?: 'flex' | 'grid' | 'block' | 'inline' | 'inline-block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: string | number;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
}

export interface GradientStyle {
  type: 'linear' | 'radial' | 'conic';
  direction?: string;
  stops: GradientStop[];
}

export interface GradientStop {
  color: string;
  position: string | number;
}

export interface BorderStyle {
  width: string | number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color: string;
  radius?: BorderRadius;
}

export interface BorderRadius {
  topLeft?: string | number;
  topRight?: string | number;
  bottomLeft?: string | number;
  bottomRight?: string | number;
  all?: string | number;
}

export interface ShadowStyle {
  offsetX: string | number;
  offsetY: string | number;
  blurRadius: string | number;
  spreadRadius?: string | number;
  color: string;
  inset?: boolean;
}

export interface AnimationStyle {
  name?: string;
  duration: string;
  timingFunction: string;
  delay?: string;
  iterationCount?: string | number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// UTILITY INTERFACES
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorVariants {
  light: string;
  main: string;
  dark: string;
  contrastText: string;
}

export interface FontStyle {
  family: string;
  weights: number[];
  fallbacks: string[];
  displayName?: string;
}

export interface BorderRadiusScale {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface BorderWidthScale {
  none: string;
  thin: string;
  medium: string;
  thick: string;
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

// STATE INTERFACES
export interface AssetItemStates {
  default: Partial<AssetItemStyle>;
  hover: Partial<AssetItemStyle>;
  selected: Partial<AssetItemStyle>;
  disabled: Partial<AssetItemStyle>;
}

export interface NavigationButtonStates {
  default: Partial<NavigationButtonStyle>;
  active: Partial<NavigationButtonStyle>;
  hover: Partial<NavigationButtonStyle>;
  disabled: Partial<NavigationButtonStyle>;
}

export interface DropdownItemStates {
  default: Partial<DropdownItemStyle>;
  hover: Partial<DropdownItemStyle>;
  selected: Partial<DropdownItemStyle>;
  disabled: Partial<DropdownItemStyle>;
}

// ADDITIONAL STYLE INTERFACES
export interface BackgroundImageStyle {
  url: string;
  size: 'cover' | 'contain' | 'auto' | string;
  position: string;
  repeat: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y';
}

export interface PatternStyle {
  type: 'dots' | 'stripes' | 'grid' | 'custom';
  color: string;
  size: string | number;
  spacing: string | number;
}

export interface OverlayStyle {
  color: string;
  opacity: number;
  blendMode?: string;
}

export interface BackdropStyle {
  color: string;
  blur: string | number;
  opacity: number;
}

export interface ScrollbarStyle {
  width: string | number;
  track: BackgroundStyle;
  thumb: BackgroundStyle;
  corner?: BackgroundStyle;
}

export interface OverflowStyle {
  x: 'visible' | 'hidden' | 'scroll' | 'auto';
  y: 'visible' | 'hidden' | 'scroll' | 'auto';
}

export interface IconVariants {
  filled?: IconStyle;
  outlined?: IconStyle;
  rounded?: IconStyle;
  sharp?: IconStyle;
}

// COLLECTION INTERFACES
export interface GradientCollection {
  primary: GradientStyle;
  secondary: GradientStyle;
  accent: GradientStyle;
  background: GradientStyle;
  [key: string]: GradientStyle;
}

export interface BorderStyleCollection {
  default: BorderStyle;
  focus: BorderStyle;
  error: BorderStyle;
  success: BorderStyle;
  [key: string]: BorderStyle;
}

export interface ShadowElevation {
  none: ShadowStyle;
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
  xl: ShadowStyle;
  '2xl': ShadowStyle;
}

export interface ShadowColors {
  default: string;
  colored: string;
  inset: string;
}

export interface ShadowStyleCollection {
  button: ShadowStyle;
  card: ShadowStyle;
  dropdown: ShadowStyle;
  modal: ShadowStyle;
  [key: string]: ShadowStyle;
}

export interface LayoutSpacing {
  container: SpacingValues;
  section: SpacingValues;
  component: SpacingValues;
  element: SpacingValues;
}

export interface AnimationDurations {
  instant: string;
  fast: string;
  normal: string;
  slow: string;
  slower: string;
}

export interface AnimationEasings {
  linear: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  bounce: string;
  elastic: string;
}

export interface TransitionCollection {
  fade: AnimationStyle;
  slide: AnimationStyle;
  scale: AnimationStyle;
  rotate: AnimationStyle;
  [key: string]: AnimationStyle;
}

// API RESPONSE FOR FULL CUSTOMIZATION
export interface FullWalletCustomizationResponse {
  success: boolean;
  result?: {
    appliedCustomization: WalletCustomizationData;
    excludedElements: string[]; // Elements that were filtered out (logo, aiPet)
    warnings?: string[]; // Any validation warnings
    performance: {
      elementsProcessed: number;
      processingTime: number;
    };
  };
  error?: string;
  timestamp: string;
}

// VALIDATION INTERFACES
export interface CustomizationValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

// PROTECTION CONSTANTS
export const EXCLUDED_FROM_API_CUSTOMIZATION = [
  'logo',
  'aiPet',
  'aiPetContainer',
  'brandLogo',
  'companyLogo'
] as const;

export type ExcludedElement = typeof EXCLUDED_FROM_API_CUSTOMIZATION[number];

// UTILITY TYPES
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
