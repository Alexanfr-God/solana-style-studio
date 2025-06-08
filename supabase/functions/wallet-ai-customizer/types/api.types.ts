
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
