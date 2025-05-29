import { create } from 'zustand';

interface Account {
  id: string;
  name: string;
  address: string;
  network: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  amount: string;
  value: string;
  change: string;
  isPositive: boolean;
}

interface WalletStyle {
  backgroundColor: string;
  primaryColor: string;
  font: string;
}

interface AiPetEmotion {
  emotion: string;
  timestamp: number;
}

interface WalletCustomizationState {
  accounts: Account[];
  activeAccountId: string;
  setActiveAccount: (accountId: string) => void;
  tokens: Token[];
  walletStyle: WalletStyle;
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  totalBalance: string;
  totalChange: string;
  totalChangePercent: string;
  isBalancePositive: boolean;
  aiPetEmotion: AiPetEmotion | null;
  setAiPetEmotion: (emotion: string) => void;
  setTemporaryEmotion: (emotion: string, duration: number) => void;
  triggerAiPetInteraction: () => void;
  selectedWallet: string;
  setSelectedWallet: (wallet: string) => void;
  currentLayer: string;
  setCurrentLayer: (layer: string) => void;
  showAccountDropdown: boolean;
  setShowAccountDropdown: (show: boolean) => void;
}

export const useWalletCustomizationStore = create<WalletCustomizationState>()(
  (set, get) => ({
    accounts: [
      { id: '1', name: 'Account 1', address: '0x123...', network: 'Ethereum' },
      { id: '2', name: 'Account 2', address: '0x456...', network: 'Ethereum' },
      { id: '3', name: 'Account 3', address: '0x789...', network: 'Ethereum' },
    ],
    activeAccountId: '1',
    setActiveAccount: (accountId: string) => set({ activeAccountId: accountId }),
    tokens: [
      { id: '1', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', amount: '3.456', value: '$12,345.67', change: '+3.4%', isPositive: true },
      { id: '2', name: 'Solana', symbol: 'SOL', icon: '◎', amount: '12.345', value: '$2,345.67', change: '-1.2%', isPositive: false },
      { id: '3', name: 'Bitcoin', symbol: 'BTC', icon: '₿', amount: '0.123', value: '$3,456.78', change: '+0.8%', isPositive: true },
    ],
    walletStyle: {
      backgroundColor: '#181818',
      primaryColor: '#9945FF',
      font: 'Inter'
    },
    setWalletStyle: (style) => set(state => ({ walletStyle: { ...state.walletStyle, ...style } })),
    totalBalance: '$15,691.34',
    totalChange: '+ $123.45',
    totalChangePercent: '+0.78%',
    isBalancePositive: true,
    aiPetEmotion: null,
    setAiPetEmotion: (emotion) => {
      set({ aiPetEmotion: { emotion: emotion, timestamp: Date.now() } });
    },
    setTemporaryEmotion: (emotion, duration) => {
      set({ aiPetEmotion: { emotion: emotion, timestamp: Date.now() } });
      setTimeout(() => {
        set({ aiPetEmotion: null });
      }, duration);
    },
    triggerAiPetInteraction: () => {
      const emotions = ['happy', 'excited', 'curious', 'sleepy', 'neutral'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      get().setAiPetEmotion(randomEmotion);
    },
    selectedWallet: 'phantom',
    setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
    currentLayer: 'home',
    setCurrentLayer: (layer) => set({ currentLayer: layer }),
    showAccountDropdown: false,
    setShowAccountDropdown: (show: boolean) => set({ showAccountDropdown: show }),
  })
);
