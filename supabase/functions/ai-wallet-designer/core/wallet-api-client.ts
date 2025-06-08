
import type { WalletStructure, WalletMetadata } from "../types/wallet.types.ts";

export class WalletAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Deno.env.get('WALLET_API_URL') || '';
    console.log('🔌 WalletAPIClient initialized');
  }

  async fetchWalletStructure(walletType: string): Promise<WalletStructure> {
    console.log('📥 Fetching wallet structure for:', walletType);
    
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/wallet-customization-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ walletType })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wallet structure: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('❌ Error fetching wallet structure:', error);
      
      // Fallback structure
      return {
        metadata: {
          walletType,
          version: '1.0.0',
          totalScreens: 1,
          totalCustomizableElements: 0,
          lastUpdated: new Date().toISOString()
        },
        screens: [],
        elements: []
      };
    }
  }

  async validateWalletType(walletType: string): Promise<boolean> {
    console.log('✅ Validating wallet type:', walletType);
    
    const supportedTypes = ['phantom', 'solana', 'metamask', 'coinbase'];
    return supportedTypes.includes(walletType.toLowerCase());
  }

  async fetchWalletMetadata(walletType: string): Promise<WalletMetadata> {
    console.log('📊 Fetching wallet metadata for:', walletType);
    
    const structure = await this.fetchWalletStructure(walletType);
    return structure.metadata;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/wallet-customization-structure`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

export const walletAPIClient = new WalletAPIClient();
