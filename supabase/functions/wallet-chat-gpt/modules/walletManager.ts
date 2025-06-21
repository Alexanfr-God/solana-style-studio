
// Wallet context and management
import type { WalletContext } from '../types/wallet.ts';

export function createDefaultWalletContext(walletType: string = 'phantom'): WalletContext {
  return {
    walletType,
    activeLayer: 'wallet',
    currentStyle: {
      backgroundColor: '#1a1a1a',
      primaryColor: '#9945ff',
      font: 'Inter'
    },
    availableElements: [
      'Header Bar', 'Balance Display', 'Login Screen', 'Action Buttons',
      'Asset List', 'Bottom Navigation', 'Background', 'Color Scheme',
      'Typography', 'Icons'
    ]
  };
}

export function validateWalletContext(context: any): WalletContext {
  if (!context || typeof context !== 'object') {
    return createDefaultWalletContext();
  }

  return {
    walletType: context.walletType || 'phantom',
    activeLayer: context.activeLayer || 'wallet',
    currentStyle: context.currentStyle || {},
    availableElements: context.availableElements || []
  };
}
