import type { WalletBridgeAPI } from './WalletBridge';
import { MetaMaskBridge } from './MetaMaskBridge';
import { PhantomBridge } from './PhantomBridge';

/**
 * Factory for creating WalletBridge instances
 */
export class WalletBridgeFactory {
  static create(walletType: 'MetaMask' | 'Phantom'): WalletBridgeAPI {
    console.log(`[WalletBridgeFactory] 🏭 Creating bridge for ${walletType}`);
    
    switch (walletType) {
      case 'MetaMask':
        return new MetaMaskBridge();
      
      case 'Phantom':
        return new PhantomBridge();
      
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }
}
