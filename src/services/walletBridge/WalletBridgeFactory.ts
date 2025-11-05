import type { WalletBridgeAPI } from './WalletBridge';
import { MetaMaskBridge } from './MetaMaskBridge';
import { PhantomBridge } from './PhantomBridge';
import { WsWalletBridge } from './WsWalletBridge';

/**
 * Factory for creating WalletBridge instances
 */
export class WalletBridgeFactory {
  static create(walletType: 'MetaMask' | 'Phantom' | 'WS'): WalletBridgeAPI {
    console.log(`[WalletBridgeFactory] 🏭 Creating bridge for ${walletType}`);
    
    switch (walletType) {
      case 'WS':
        return new WsWalletBridge();
      
      case 'MetaMask':
        return new MetaMaskBridge();
      
      case 'Phantom':
        return new PhantomBridge();
      
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }
}
