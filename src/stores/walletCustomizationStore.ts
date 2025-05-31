import { create } from 'zustand';
import { defaultLoginStyle, defaultWalletStyle } from '../constants/defaultWalletStyles';

export type WalletLayer = 'login' | 'home' | 'apps' | 'swap' | 'history' | 'search' | 'receive' | 'send';
export type AiPetEmotion = 'default' | 'happy' | 'excited' | 'sad' | 'angry' | 'thinking';

export interface WalletStyle {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow?: string;
  styleNotes?: string;
  primaryColor?: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export interface WalletAnalysis {
  uiStructure: {
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
    layout: {
      type: 'login' | 'wallet';
      primaryElements: string[];
      interactiveElements: string[];
      visualHierarchy: string[];
    };
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
      gradients?: string[];
    };
    typography: {
      fontFamily: string;
      primaryTextColor: string;
      secondaryTextColor: string;
      textSizes: string[];
    };
    interactivity: {
      buttons: Array<{
        type: string;
        position: string;
        color: string;
        textColor: string;
        functionality: string;
      }>;
      inputs: Array<{
        type: string;
        placeholder: string;
        position: string;
        styling: string;
      }>;
      animations: string[];
    };
    safeZone: {
      x: number;
      y: number;
      width: number;
      height: number;
      criticalElements: string[];
    };
  };
  functionalContext: {
    purpose: string;
    userFlow: string[];
    criticalFeatures: string[];
    designPhilosophy: string;
  };
  generationContext: {
    promptEnhancement: string;
    characterInteractionGuidelines: string[];
    preservationRules: string[];
    styleAdaptation: string;
  };
}

interface WalletCustomizationState {
  currentLayer: WalletLayer;
  walletStyle: WalletStyle;
  loginStyle: WalletStyle;
  tokens: Token[];
  totalBalance: string;
  totalChange: string;
  totalChangePercent: string;
  isBalancePositive: boolean;
  showAccountDropdown: boolean;
  aiPetEmotion: AiPetEmotion;
  temporaryEmotion: AiPetEmotion;
  selectedWallet: string;
  walletAnalysis: WalletAnalysis | null;
  analysisTimestamp: string | null;

  setCurrentLayer: (layer: WalletLayer) => void;
  setWalletStyle: (style: WalletStyle) => void;
  setLoginStyle: (style: WalletStyle) => void;
  setTokens: (tokens: Token[]) => void;
  setTotalBalance: (balance: string) => void;
  setTotalChange: (change: string) => void;
  setTotalChangePercent: (percent: string) => void;
  setIsBalancePositive: (isPositive: boolean) => void;
  setShowAccountDropdown: (show: boolean) => void;
  setAiPetEmotion: (emotion: AiPetEmotion) => void;
  setTemporaryEmotion: (emotion: AiPetEmotion, duration: number) => void;
  triggerAiPetInteraction: () => void;
  setSelectedWallet: (wallet: string) => void;
  setWalletAnalysis: (analysis: WalletAnalysis | null) => void;
}

const defaultTokens: Token[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    amount: '0.00345',
    value: '$140.23',
    change: '+2.3%',
    isPositive: true
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    amount: '0.012',
    value: '$40.56',
    change: '-1.1%',
    isPositive: false
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    amount: '1.23',
    value: '$123.45',
    change: '+5.6%',
    isPositive: true
  }
];

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  currentLayer: 'home',
  walletStyle: { ...defaultWalletStyle },
  loginStyle: { ...defaultLoginStyle },
  tokens: defaultTokens,
  totalBalance: '$304.24',
  totalChange: '+ $12.42',
  totalChangePercent: '+4.3%',
  isBalancePositive: true,
  showAccountDropdown: false,
  aiPetEmotion: 'default',
  temporaryEmotion: 'default',
  selectedWallet: 'phantom',
  walletAnalysis: null,
  analysisTimestamp: null,

  setCurrentLayer: (layer) => set({ currentLayer: layer }),
  setWalletStyle: (style) => set({ walletStyle: style }),
  setLoginStyle: (style) => set({ loginStyle: style }),
  setTokens: (tokens) => set({ tokens: tokens }),
  setTotalBalance: (balance) => set({ totalBalance: balance }),
  setTotalChange: (change) => set({ totalChange: change }),
  setTotalChangePercent: (percent) => set({ totalChangePercent: percent }),
  setIsBalancePositive: (isPositive) => set({ isBalancePositive: isPositive }),
  setShowAccountDropdown: (show) => set({ showAccountDropdown: show }),
  setAiPetEmotion: (emotion) => set({ aiPetEmotion: emotion }),
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  setWalletAnalysis: (analysis) => set({ walletAnalysis: analysis }),

  setTemporaryEmotion: (emotion, duration) => {
    set({ temporaryEmotion: emotion });
    setTimeout(() => {
      set({ temporaryEmotion: 'default' });
    }, duration);
  },

  triggerAiPetInteraction: () => {
    // Placeholder for AI pet interaction logic
    // This function can be expanded to include more complex logic
    // such as checking the current emotion and triggering different
    // animations or responses based on the emotion.
    const currentEmotion = get().aiPetEmotion;
    console.log(`AI Pet interaction triggered. Current emotion: ${currentEmotion}`);
  },
}));
