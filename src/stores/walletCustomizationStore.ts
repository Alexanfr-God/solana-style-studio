import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateStyle } from '@/services/apiService';
import type { StyleBlueprint } from '@/services/styleBlueprintService';
import { blueprintToWalletStyles } from '@/services/styleBlueprintService';

export type LayerType = 'login' | 'wallet';
export type WalletLayer = 'home' | 'apps' | 'swap' | 'history' | 'search' | 'send' | 'receive' | 'buy' | 'login';
export type AiPetEmotion = 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';
export type AiPetBodyType = 'phantom' | 'lottie';

export interface WalletStyle {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow: string;
  styleNotes?: string;
  // Additional properties expected by components
  primaryColor?: string;
  font?: string;
  image?: string;
  gradient?: string;
}

interface ComponentStyles {
  header: {
    backgroundColor: string;
    color: string;
    fontFamily: string;
  };
  buttons: {
    backgroundColor: string;
    color: string;
    borderRadius: string;
    boxShadow: string;
  };
  inputs: {
    backgroundColor: string;
    borderColor: string;
    focusColor: string;
  };
}

interface AiPetState {
  isVisible: boolean;
  emotion: AiPetEmotion;
  zone: AiPetZone;
  bodyType: AiPetBodyType;
  energy: number;
}

interface Account {
  id: string;
  name: string;
  address: string;
  balance: string;
  avatar?: string;
  network: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface TokenColors {
  positive: string;
  negative: string;
  neutral: string;
  warning: string;
  info: string;
}

interface StatusColors {
  success: string;
  error: string;
  pending: string;
  inactive: string;
}

interface WalletCustomizationStore {
  loginStyle: WalletStyle;
  walletStyle: WalletStyle;
  activeLayer: LayerType;
  prompt: string;
  uploadedImage: string | null;
  uploadedFile: File | null;
  isGenerating: boolean;
  isCustomizing: boolean;
  editorMode: 'create-style' | 'fine-tune' | 'decorate';
  components: ComponentStyles;
  
  // Wallet and Layer Management
  selectedWallet: 'phantom' | 'metamask';
  currentLayer: WalletLayer;
  setSelectedWallet: (wallet: 'phantom' | 'metamask') => void;
  setCurrentLayer: (layer: WalletLayer) => void;
  
  // AI Pet State
  aiPet: AiPetState;
  containerBounds: DOMRect | null;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setAiPetZone: (zone: AiPetZone) => void;
  setAiPetBodyType: (bodyType: AiPetBodyType) => void;
  setContainerBounds: (bounds: DOMRect | null) => void;
  triggerAiPetInteraction: () => void;
  updateAiPetEnergy: () => void;
  onAiPetHover: () => void;
  onAiPetClick: () => void;
  onAiPetDoubleClick: () => void;
  setTemporaryEmotion: (emotion: AiPetEmotion, duration: number) => void;
  
  // Account Management
  accounts: Account[];
  activeAccountId: string;
  showAccountSidebar: boolean;
  showAccountDropdown: boolean;
  setActiveAccount: (accountId: string) => void;
  setShowAccountSidebar: (show: boolean) => void;
  setShowAccountDropdown: (show: boolean) => void;
  
  // Wallet Data
  tokens: Token[];
  totalBalance: string;
  totalChange: string;
  isBalancePositive: boolean;
  
  // Style Management
  setBackgroundColor: (color: string) => void;
  setLoginStyle: (style: WalletStyle) => void;
  setWalletStyle: (style: WalletStyle) => void;
  setStyleForLayer: (layer: LayerType, style: WalletStyle) => void;
  setActiveLayer: (layer: LayerType) => void;
  setPrompt: (prompt: string) => void;
  setUploadedImage: (image: string | null, file?: File | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setEditorMode: (mode: 'create-style' | 'fine-tune' | 'decorate') => void;
  resetStyles: () => void;
  lockWallet: () => void;
  unlockWallet: () => void;
  resetWallet: () => void;
  
  // Component Styling
  getStyleForComponent: (component: string) => any;
  getTokenColors: () => TokenColors;
  getStatusColors: () => StatusColors;
  
  // Customization Methods
  customizeWallet: () => void;
  onCustomizationStart: () => void;
  onCustomizationStartWithTimeout: () => void;
  resetCustomizationState: () => void;
  
  // StyleBlueprint Integration
  currentBlueprint: StyleBlueprint | null;
  applyStyleFromBlueprint: (blueprint: StyleBlueprint) => void;
  applyStyleFromAiCustomizer: (result: any) => void;
  
  // Full API Customization Methods
  applyFullApiCustomization: (customization: any) => void;
  validateApiCustomization: (customization: any) => { isValid: boolean; errors: string[]; warnings: string[] };
  getExcludedElements: () => string[];
  
  // Enhanced styling methods for API
  setStyleForElement: (elementPath: string, style: any) => void;
  getStyleForElement: (elementPath: string) => any;
  bulkUpdateStyles: (styleUpdates: Record<string, any>) => void;
  
  // Helper methods for processing API customization
  processLoginScreenCustomization: (loginScreen: any) => any;
  processWalletScreenCustomization: (walletScreen: any) => any;
  processGlobalCustomization: (global: any) => any;
}

const defaultLoginStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF',
  textColor: '#FFFFFF',
  buttonColor: '#9945FF',
  buttonTextColor: '#000000',
  borderRadius: '100px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  styleNotes: 'default login style',
  primaryColor: '#9945FF',
  font: 'Inter, sans-serif',
  gradient: 'linear-gradient(135deg, #9945FF, #FF5733)'
};

const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#131313',
  accentColor: '#9945FF',
  textColor: '#FFFFFF',
  buttonColor: 'rgba(40, 40, 40, 0.8)',
  buttonTextColor: '#9945FF',
  borderRadius: '16px',
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  styleNotes: 'default wallet style',
  primaryColor: '#9945FF',
  font: 'Inter, sans-serif',
  gradient: 'linear-gradient(135deg, #9945FF, #FF5733)'
};

const defaultAccounts: Account[] = [
  {
    id: 'account1',
    name: 'Main Account',
    address: '7Z8...K9L',
    balance: '2.45 SOL',
    avatar: undefined,
    network: 'Solana'
  },
  {
    id: 'account2', 
    name: 'Trading Account',
    address: '9M3...X2Y',
    balance: '0.12 SOL',
    avatar: undefined,
    network: 'Solana'
  }
];

const defaultTokens: Token[] = [
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    amount: '2.45',
    value: '$412.30',
    change: '+5.2%',
    isPositive: true
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    amount: '150.00',
    value: '$150.00',
    change: '+0.1%',
    isPositive: true
  }
];

const defaultTokenColors: TokenColors = {
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#6B7280',
  warning: '#F59E0B',
  info: '#3B82F6'
};

const defaultStatusColors: StatusColors = {
  success: '#10B981',
  error: '#EF4444',
  pending: '#F59E0B',
  inactive: '#6B7280'
};

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Увеличиваем timeout с 30 секунд до 5 минут
let customizationTimeoutId: number | null = null;

// API Customization Protection List
const EXCLUDED_FROM_API = [
  'logo',
  'aiPet', 
  'aiPetContainer',
  'brandLogo',
  'companyLogo',
  'aiPetEmotion',
  'aiPetZone',
  'aiPetBodyType'
] as const;

export const useWalletCustomizationStore = create<WalletCustomizationStore>()(
  persist(
    (set, get) => ({
      loginStyle: defaultLoginStyle,
      walletStyle: defaultWalletStyle,
      activeLayer: 'wallet',
      prompt: '',
      uploadedImage: null,
      uploadedFile: null,
      isGenerating: false,
      isCustomizing: false,
      editorMode: 'create-style',
      components: {
        header: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          fontFamily: 'Inter, sans-serif',
        },
        buttons: {
          backgroundColor: '#9945FF',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        },
        inputs: {
          backgroundColor: '#2b2b2b',
          borderColor: '#444444',
          focusColor: '#9945FF',
        },
      },
      
      // Wallet and Layer Management
      selectedWallet: 'phantom',
      currentLayer: 'home',
      setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
      setCurrentLayer: (layer) => set({ currentLayer: layer }),
      
      // AI Pet State
      aiPet: {
        isVisible: true,
        emotion: 'idle',
        zone: 'outside',
        bodyType: 'phantom',
        energy: 100
      },
      containerBounds: null,
      setAiPetEmotion: (emotion) => set((state) => ({ aiPet: { ...state.aiPet, emotion } })),
      setAiPetZone: (zone) => set((state) => ({ aiPet: { ...state.aiPet, zone } })),
      setAiPetBodyType: (bodyType) => set((state) => ({ aiPet: { ...state.aiPet, bodyType } })),
      setContainerBounds: (bounds) => set({ containerBounds: bounds }),
      triggerAiPetInteraction: () => {
        const state = get();
        if (state.aiPet.emotion !== 'excited') {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'happy' } }));
          setTimeout(() => {
            set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
          }, 2000);
        }
      },
      updateAiPetEnergy: () => {
        set((state) => ({
          aiPet: { 
            ...state.aiPet, 
            energy: Math.max(0, Math.min(100, state.aiPet.energy - 1))
          }
        }));
      },
      onAiPetHover: () => {
        set((state) => ({ aiPet: { ...state.aiPet, emotion: 'suspicious' } }));
      },
      onAiPetClick: () => {
        set((state) => ({ aiPet: { ...state.aiPet, emotion: 'wink' } }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
        }, 1500);
      },
      onAiPetDoubleClick: () => {
        const state = get();
        const newZone = state.aiPet.zone === 'inside' ? 'outside' : 'inside';
        set((state) => ({ 
          aiPet: { ...state.aiPet, zone: newZone, emotion: 'excited' }
        }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: 'idle' } }));
        }, 2000);
      },
      setTemporaryEmotion: (emotion, duration) => {
        const currentEmotion = get().aiPet.emotion;
        set((state) => ({ aiPet: { ...state.aiPet, emotion } }));
        setTimeout(() => {
          set((state) => ({ aiPet: { ...state.aiPet, emotion: currentEmotion } }));
        }, duration);
      },
      
      // Account Management
      accounts: defaultAccounts,
      activeAccountId: 'account1',
      showAccountSidebar: false,
      showAccountDropdown: false,
      setActiveAccount: (accountId) => set({ activeAccountId: accountId }),
      setShowAccountSidebar: (show) => set({ showAccountSidebar: show }),
      setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),
      
      // Wallet Data
      tokens: defaultTokens,
      totalBalance: '$562.30',
      totalChange: '+5.2%',
      isBalancePositive: true,
      
      // Style Management
      setBackgroundColor: (color: string) => {
        if (get().activeLayer === 'login') {
          set((state) => ({
            loginStyle: { ...state.loginStyle, backgroundColor: color },
          }));
        } else {
          set((state) => ({
            walletStyle: { ...state.walletStyle, backgroundColor: color },
          }));
        }
      },
      setLoginStyle: (style: WalletStyle) => set({ loginStyle: style }),
      setWalletStyle: (style: WalletStyle) => {
        const updatedStyle = { 
          ...style, 
          primaryColor: style.accentColor || style.primaryColor,
          font: style.fontFamily || style.font,
          gradient: style.gradient
        };
        
        set({ 
          walletStyle: updatedStyle, 
          components: {
            ...get().components,
            header: {
              ...get().components.header,
              backgroundColor: updatedStyle.backgroundColor,
              color: updatedStyle.textColor,
              fontFamily: updatedStyle.fontFamily
            },
            buttons: {
              ...get().components.buttons,
              backgroundColor: updatedStyle.buttonColor || updatedStyle.accentColor,
              color: updatedStyle.buttonTextColor,
              borderRadius: updatedStyle.borderRadius
            }
          }
        });
      },
      setStyleForLayer: (layer: LayerType, style: WalletStyle) => {
        if (layer === 'login') {
          set({ loginStyle: style });
        } else {
          set({ walletStyle: style });
        }
      },
      setActiveLayer: (layer: LayerType) => set({ activeLayer: layer }),
      setPrompt: (prompt: string) => set({ prompt }),
      setUploadedImage: (image: string | null, file?: File | null) => {
        // Reset customization state when new image is uploaded
        if (image !== null && get().isCustomizing) {
          console.log('🔄 New image uploaded, resetting customization state');
          get().resetCustomizationState();
        }
        set({ uploadedImage: image, uploadedFile: file || null });
      },
      setIsGenerating: (isGenerating: boolean) => set({ isGenerating }),
      setEditorMode: (mode: 'create-style' | 'fine-tune' | 'decorate') => set({ editorMode: mode }),
      resetStyles: () => {
        set({ 
          loginStyle: defaultLoginStyle, 
          walletStyle: defaultWalletStyle,
          components: {
            header: {
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
            },
            buttons: {
              backgroundColor: '#9945FF',
              color: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            },
            inputs: {
              backgroundColor: '#2b2b2b',
              borderColor: '#444444',
              focusColor: '#9945FF',
            },
          }
        });
      },
      lockWallet: () => {
        set({
          currentLayer: 'login',
          walletStyle: {
            ...get().walletStyle,
            styleNotes: 'Locked. Unlock in settings.',
          },
        });
      },
      unlockWallet: () => {
        set({ currentLayer: 'home' });
      },
      resetWallet: () => {
        set({
          loginStyle: defaultLoginStyle,
          walletStyle: defaultWalletStyle,
          currentLayer: 'home',
          selectedWallet: 'phantom',
          uploadedImage: null,
          isCustomizing: false,
          aiPet: {
            isVisible: true,
            emotion: 'idle',
            zone: 'outside',
            bodyType: 'phantom',
            energy: 100
          }
        });
      },
      
      // Component Styling
      getStyleForComponent: (component: string) => {
        const state = get();
        const currentStyle = state.activeLayer === 'login' ? state.loginStyle : state.walletStyle;
        
        // Base global styles that all components inherit - FIXED: Use currentStyle directly
        const globalStyles = {
          backgroundColor: currentStyle.backgroundColor,
          backgroundImage: currentStyle.backgroundImage,
          textColor: currentStyle.textColor,
          fontFamily: currentStyle.fontFamily,
          color: currentStyle.textColor,
          gradient: currentStyle.gradient || `linear-gradient(135deg, ${currentStyle.accentColor || '#9945FF'}, ${currentStyle.backgroundColor || '#131313'})`,
          primaryColor: currentStyle.primaryColor || currentStyle.accentColor,
          accentColor: currentStyle.accentColor,
          borderRadius: currentStyle.borderRadius,
          boxShadow: currentStyle.boxShadow
        };
        
        const componentStyles = {
          global: globalStyles,
          header: {
            ...globalStyles,
            backgroundColor: currentStyle.backgroundColor || state.components.header.backgroundColor,
            color: currentStyle.textColor || state.components.header.color,
            fontFamily: currentStyle.fontFamily || state.components.header.fontFamily,
            gradient: currentStyle.gradient || globalStyles.gradient,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          },
          buttons: {
            ...globalStyles,
            backgroundColor: currentStyle.buttonColor || currentStyle.accentColor,
            color: currentStyle.buttonTextColor || currentStyle.textColor,
            borderRadius: currentStyle.borderRadius || state.components.buttons.borderRadius,
            boxShadow: currentStyle.boxShadow || state.components.buttons.boxShadow
          },
          inputs: {
            ...globalStyles,
            backgroundColor: state.components.inputs.backgroundColor,
            borderColor: state.components.inputs.borderColor,
            focusColor: currentStyle.accentColor || state.components.inputs.focusColor
          },
          navigation: {
            ...globalStyles,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: currentStyle.fontFamily
          },
          overlays: {
            ...globalStyles,
            backgroundColor: 'rgba(24, 24, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: currentStyle.borderRadius || '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          },
          containers: {
            ...globalStyles,
            backgroundColor: currentStyle.backgroundColor,
            borderRadius: currentStyle.borderRadius,
            boxShadow: currentStyle.boxShadow,
            gradient: currentStyle.gradient || globalStyles.gradient
          },
          cards: {
            ...globalStyles,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: currentStyle.borderRadius,
            boxShadow: currentStyle.boxShadow
          }
        };
        
        return componentStyles[component as keyof typeof componentStyles] || componentStyles.global;
      },
      
      getTokenColors: () => defaultTokenColors,
      getStatusColors: () => defaultStatusColors,
      
      // Customization Methods
      customizeWallet: () => {
        set({ isCustomizing: true });
        setTimeout(() => {
          set({ isCustomizing: false });
        }, 5000); // Extended time for analysis
      },
      
      onCustomizationStart: () => {
        set({ isCustomizing: true });
      },
      
      onCustomizationStartWithTimeout: () => {
        console.log('🚀 Starting customization with 5-minute timeout...');
        
        // Clear any existing timeout
        if (customizationTimeoutId) {
          clearTimeout(customizationTimeoutId);
        }
        
        set({ isCustomizing: true });
        
        // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Увеличиваем timeout до 5 минут (300 секунд)
        customizationTimeoutId = window.setTimeout(() => {
          console.warn('⚠️ Customization timeout reached (5 minutes), this may indicate a real issue');
          console.warn('🔧 AI processing should normally complete within 3-4 minutes');
          get().resetCustomizationState();
        }, 300000); // 5 минут вместо 30 секунд
      },
      
      resetCustomizationState: () => {
        console.log('🔄 Resetting customization state');
        
        // Clear timeout if it exists
        if (customizationTimeoutId) {
          clearTimeout(customizationTimeoutId);
          customizationTimeoutId = null;
        }
        
        set({ isCustomizing: false });
      },
      
      // StyleBlueprint Integration
      currentBlueprint: null,
      
      applyStyleFromBlueprint: (blueprint: StyleBlueprint) => {
        const walletStyles = blueprintToWalletStyles(blueprint);
        
        const updatedStyle = {
          backgroundColor: walletStyles.backgroundColor,
          backgroundImage: walletStyles.backgroundImage,
          accentColor: walletStyles.accentColor,
          textColor: walletStyles.textColor,
          buttonColor: walletStyles.buttonColor,
          buttonTextColor: walletStyles.buttonTextColor,
          borderRadius: walletStyles.borderRadius,
          fontFamily: walletStyles.fontFamily,
          boxShadow: walletStyles.boxShadow,
          styleNotes: walletStyles.styleNotes,
          primaryColor: walletStyles.accentColor,
          font: walletStyles.fontFamily,
          gradient: walletStyles.gradient
        };
        
        set({
          currentBlueprint: blueprint,
          walletStyle: updatedStyle,
          isCustomizing: false, // Complete the customization process
          
          components: {
            ...get().components,
            header: {
              ...get().components.header,
              backgroundColor: blueprint.colorSystem.neutral,
              color: walletStyles.textColor,
              fontFamily: blueprint.typography.fontFamily,
            },
            buttons: {
              ...get().components.buttons,
              backgroundColor: blueprint.colorSystem.primary,
              color: walletStyles.buttonTextColor,
              borderRadius: walletStyles.borderRadius,
              boxShadow: blueprint.lighting.shadows,
            },
            inputs: {
              ...get().components.inputs,
              backgroundColor: blueprint.interactionHints.loginBox.background,
              borderColor: blueprint.interactionHints.loginBox.border,
              focusColor: blueprint.interactionHints.loginBox.focusState,
            }
          }
        });
        
        // Clear timeout since customization completed successfully
        if (customizationTimeoutId) {
          clearTimeout(customizationTimeoutId);
          customizationTimeoutId = null;
        }
        
        console.log('Applied StyleBlueprint to wallet:', {
          title: blueprint.meta.title,
          theme: blueprint.meta.theme,
          confidence: blueprint.meta.confidenceScore
        });
      },
      
      applyStyleFromAiCustomizer: (result: any) => {
        console.log('🎨 Applying AI customizer result:', result);
        
        if (result.success && result.result) {
          const styles = result.result.generatedStyles;
          
          if (styles && styles.variables) {
            const updatedStyle = {
              backgroundColor: styles.variables['--background-color'] || get().walletStyle.backgroundColor,
              accentColor: styles.variables['--primary-color'] || get().walletStyle.accentColor,
              textColor: styles.variables['--text-color'] || get().walletStyle.textColor,
              buttonColor: styles.variables['--primary-color'] || get().walletStyle.buttonColor,
              buttonTextColor: styles.variables['--text-color'] || get().walletStyle.buttonTextColor,
              borderRadius: get().walletStyle.borderRadius,
              fontFamily: get().walletStyle.fontFamily,
              boxShadow: get().walletStyle.boxShadow,
              styleNotes: `AI Generated - Theme: ${result.result.aiAnalysis?.styleType || 'custom'}`,
              primaryColor: styles.variables['--primary-color'] || get().walletStyle.accentColor,
              font: get().walletStyle.fontFamily,
              gradient: styles.variables['--background-gradient'] || get().walletStyle.gradient
            };
            
            set({
              walletStyle: updatedStyle,
              isCustomizing: false,
            });
            
            console.log('✅ AI customizer styles applied successfully');
          }
        }
        
        // Clear timeout since customization completed
        if (customizationTimeoutId) {
          clearTimeout(customizationTimeoutId);
          customizationTimeoutId = null;
        }
      },

      // NEW API CUSTOMIZATION METHODS
      applyFullApiCustomization: (customization: any) => {
        console.log('🎨 Applying full API customization:', customization);
        
        // Validate and filter out excluded elements
        const validation = get().validateApiCustomization(customization);
        if (!validation.isValid) {
          console.error('❌ API customization validation failed:', validation.errors);
          return;
        }

        try {
          const state = get();
          
          // Apply login screen customization
          if (customization.loginScreen) {
            const loginUpdates = get().processLoginScreenCustomization(customization.loginScreen);
            set((state) => ({
              loginStyle: { ...state.loginStyle, ...loginUpdates }
            }));
          }

          // Apply wallet screen customization  
          if (customization.walletScreen) {
            const walletUpdates = get().processWalletScreenCustomization(customization.walletScreen);
            set((state) => ({
              walletStyle: { ...state.walletStyle, ...walletUpdates },
              components: { ...state.components, ...walletUpdates.components }
            }));
          }

          // Apply global customization
          if (customization.global) {
            const globalUpdates = get().processGlobalCustomization(customization.global);
            set((state) => ({
              walletStyle: { ...state.walletStyle, ...globalUpdates.wallet },
              loginStyle: { ...state.loginStyle, ...globalUpdates.login },
              components: { ...state.components, ...globalUpdates.components }
            }));
          }

          console.log('✅ Full API customization applied successfully');
          
        } catch (error) {
          console.error('💥 Error applying API customization:', error);
        }
      },

      validateApiCustomization: (customization: any) => {
        const errors: string[] = [];
        const warnings: string[] = [];
        
        // Check for excluded elements
        const checkForExcluded = (obj: any, path = '') => {
          if (typeof obj !== 'object' || obj === null) return;
          
          Object.keys(obj).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (EXCLUDED_FROM_API.some(excluded => 
              key.toLowerCase().includes(excluded.toLowerCase())
            )) {
              warnings.push(`Element '${currentPath}' is excluded from API customization`);
              return;
            }
            
            if (typeof obj[key] === 'object') {
              checkForExcluded(obj[key], currentPath);
            }
          });
        };

        checkForExcluded(customization);

        // Validate required structure
        if (!customization.loginScreen && !customization.walletScreen && !customization.global) {
          errors.push('At least one customization section (loginScreen, walletScreen, global) is required');
        }

        // Validate color formats
        const validateColors = (obj: any, path = '') => {
          if (typeof obj !== 'object' || obj === null) return;
          
          Object.keys(obj).forEach(key => {
            if (key.toLowerCase().includes('color') && typeof obj[key] === 'string') {
              const colorValue = obj[key];
              const isValidColor = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+)/.test(colorValue);
              if (!isValidColor) {
                errors.push(`Invalid color format at ${path}.${key}: ${colorValue}`);
              }
            }
            
            if (typeof obj[key] === 'object') {
              validateColors(obj[key], path ? `${path}.${key}` : key);
            }
          });
        };

        validateColors(customization);

        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      },

      getExcludedElements: () => [...EXCLUDED_FROM_API],

      setStyleForElement: (elementPath: string, style: any) => {
        console.log(`🎨 Setting style for element: ${elementPath}`, style);
        
        // Check if element is excluded
        if (EXCLUDED_FROM_API.some(excluded => 
          elementPath.toLowerCase().includes(excluded.toLowerCase())
        )) {
          console.warn(`⚠️ Element '${elementPath}' is excluded from API customization`);
          return;
        }

        // Apply style based on element path
        const pathParts = elementPath.split('.');
        const [section, component, property] = pathParts;

        const state = get();
        
        if (section === 'walletStyle' && component) {
          set((state) => ({
            walletStyle: {
              ...state.walletStyle,
              [component]: property ? { ...state.walletStyle[component], [property]: style } : style
            }
          }));
        } else if (section === 'components' && component) {
          set((state) => ({
            components: {
              ...state.components,
              [component]: property ? { ...state.components[component], [property]: style } : style
            }
          }));
        }
      },

      getStyleForElement: (elementPath: string) => {
        const pathParts = elementPath.split('.');
        const [section, component, property] = pathParts;
        const state = get();

        if (section === 'walletStyle' && component) {
          const componentStyle = state.walletStyle[component];
          return property ? componentStyle?.[property] : componentStyle;
        } else if (section === 'components' && component) {
          const componentStyle = state.components[component];
          return property ? componentStyle?.[property] : componentStyle;
        }

        return null;
      },

      bulkUpdateStyles: (styleUpdates: Record<string, any>) => {
        console.log('🎨 Bulk updating styles:', Object.keys(styleUpdates).length, 'elements');
        
        Object.entries(styleUpdates).forEach(([elementPath, style]) => {
          get().setStyleForElement(elementPath, style);
        });
      },

      // Helper methods for processing API customization
      processLoginScreenCustomization: (loginScreen: any) => {
        const updates: any = {};
        
        if (loginScreen.background) {
          updates.backgroundColor = loginScreen.background.color || updates.backgroundColor;
          updates.backgroundImage = loginScreen.background.image?.url || updates.backgroundImage;
        }
        
        if (loginScreen.unlockButton) {
          updates.buttonColor = loginScreen.unlockButton.background?.color || updates.buttonColor;
          updates.buttonTextColor = loginScreen.unlockButton.text?.color || updates.buttonTextColor;
          updates.borderRadius = loginScreen.unlockButton.border?.radius?.all || updates.borderRadius;
        }

        if (loginScreen.phantomText) {
          updates.textColor = loginScreen.phantomText.color || updates.textColor;
          updates.fontFamily = loginScreen.phantomText.fontFamily || updates.fontFamily;
        }
        
        return updates;
      },

      processWalletScreenCustomization: (walletScreen: any) => {
        const updates: any = { components: {} };
        
        if (walletScreen.header) {
          updates.components.header = {
            backgroundColor: walletScreen.header.container?.background?.color,
            color: walletScreen.header.accountInfo?.color,
            fontFamily: walletScreen.header.accountInfo?.fontFamily
          };
        }

        if (walletScreen.actionButtons) {
          updates.components.buttons = {
            backgroundColor: walletScreen.actionButtons.receiveButton?.background?.color,
            color: walletScreen.actionButtons.buttonLabels?.color,
            borderRadius: walletScreen.actionButtons.receiveButton?.border?.radius?.all
          };
        }

        if (walletScreen.navigation) {
          updates.components.navigation = {
            backgroundColor: walletScreen.navigation.container?.background?.color,
            borderRadius: walletScreen.navigation.container?.border?.radius?.all
          };
        }
        
        return updates;
      },

      processGlobalCustomization: (global: any) => {
        const updates: any = { wallet: {}, login: {}, components: {} };
        
        if (global.fonts?.primary) {
          const fontFamily = global.fonts.primary.family;
          updates.wallet.fontFamily = fontFamily;
          updates.login.fontFamily = fontFamily;
        }

        if (global.colors?.primary) {
          const primaryColor = global.colors.primary['500'] || global.colors.primary.main;
          updates.wallet.accentColor = primaryColor;
          updates.login.accentColor = primaryColor;
        }

        if (global.borders?.radiusScale) {
          const borderRadius = global.borders.radiusScale.md || global.borders.radiusScale.default;
          updates.wallet.borderRadius = borderRadius;
          updates.login.borderRadius = borderRadius;
        }

        if (global.shadows?.elevation) {
          const boxShadow = global.shadows.elevation.md || global.shadows.elevation.default;
          updates.wallet.boxShadow = boxShadow?.offsetX ? 
            `${boxShadow.offsetX} ${boxShadow.offsetY} ${boxShadow.blurRadius} ${boxShadow.color}` : 
            boxShadow;
        }
        
        return updates;
      }
    }),
    {
      name: 'wallet-customization-storage',
    }
  )
);
