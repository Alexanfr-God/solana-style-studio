
import { create } from 'zustand';

export interface WalletStyle {
  backgroundColor: string;
  font: string;
  primaryColor: string;
  image?: string;
}

interface WalletCustomizationState {
  walletStyle: WalletStyle;
  uploadedImage: string | null;
  selectedWallet: 'phantom' | 'metamask' | 'solflare';
  isCustomizing: boolean;
  
  setWalletStyle: (style: Partial<WalletStyle>) => void;
  setUploadedImage: (image: string | null) => void;
  setSelectedWallet: (wallet: 'phantom' | 'metamask' | 'solflare') => void;
  setIsCustomizing: (isCustomizing: boolean) => void;
  customizeWallet: () => void;
  resetWallet: () => void;
}

const defaultWalletStyle: WalletStyle = {
  backgroundColor: '#1a1a1a',
  font: 'Inter',
  primaryColor: '#8B5CF6',
  image: undefined
};

export const useWalletCustomizationStore = create<WalletCustomizationState>((set, get) => ({
  walletStyle: { ...defaultWalletStyle },
  uploadedImage: null,
  selectedWallet: 'phantom',
  isCustomizing: false,
  
  setWalletStyle: (style) => set((state) => ({
    walletStyle: { ...state.walletStyle, ...style }
  })),
  
  setUploadedImage: (image) => set({ uploadedImage: image }),
  
  setSelectedWallet: (wallet) => set({ selectedWallet: wallet }),
  
  setIsCustomizing: (isCustomizing) => set({ isCustomizing }),
  
  customizeWallet: () => {
    const { uploadedImage } = get();
    set((state) => ({
      walletStyle: {
        ...state.walletStyle,
        backgroundColor: '#e93e3e', // Simulate first step of style application
        image: uploadedImage || undefined
      },
      isCustomizing: true
    }));
    
    // Reset customizing state after animation
    setTimeout(() => set({ isCustomizing: false }), 1000);
  },
  
  resetWallet: () => set({
    walletStyle: { ...defaultWalletStyle },
    uploadedImage: null,
    isCustomizing: false
  })
}));
