
import type { WalletStructure, WalletMetadata } from "../types/wallet.types.ts";

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [WalletAPIClient::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class WalletAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Deno.env.get('WALLET_API_URL') || '';
    log('Constructor', 'INFO', 'WalletAPIClient initialized', { baseUrl: this.baseUrl });
  }

  async fetchWalletStructure(walletType: string): Promise<WalletStructure> {
    log('FetchStructure', 'INFO', `Fetching wallet structure for: ${walletType}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/wallet-customization-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ walletType })
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        log('FetchStructure', 'ERROR', `API request failed: ${response.status}`, { 
          walletType,
          duration: `${duration}ms`,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Failed to fetch wallet structure: ${response.statusText}`);
      }

      const data = await response.json();
      
      log('FetchStructure', 'INFO', `Wallet structure fetched successfully`, { 
        walletType,
        duration: `${duration}ms`,
        totalScreens: data.metadata?.totalScreens || 0,
        totalElements: data.metadata?.totalCustomizableElements || 0
      });

      return data;

    } catch (error) {
      const duration = Date.now() - startTime;
      log('FetchStructure', 'ERROR', `Failed to fetch wallet structure`, { 
        walletType,
        duration: `${duration}ms`,
        error: error.message 
      });
      
      // Return fallback structure
      log('FetchStructure', 'WARN', 'Using fallback wallet structure', { walletType });
      
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
    log('ValidateType', 'INFO', `Validating wallet type: ${walletType}`);
    
    const supportedTypes = ['phantom', 'solana', 'metamask', 'coinbase'];
    const isValid = supportedTypes.includes(walletType.toLowerCase());
    
    log('ValidateType', isValid ? 'INFO' : 'WARN', `Wallet type validation result: ${isValid}`, { 
      walletType,
      supportedTypes 
    });
    
    return isValid;
  }

  async fetchWalletMetadata(walletType: string): Promise<WalletMetadata> {
    log('FetchMetadata', 'INFO', `Fetching wallet metadata for: ${walletType}`);
    
    try {
      const structure = await this.fetchWalletStructure(walletType);
      
      log('FetchMetadata', 'INFO', 'Wallet metadata fetched successfully', { 
        walletType,
        version: structure.metadata.version,
        totalElements: structure.metadata.totalCustomizableElements
      });
      
      return structure.metadata;
      
    } catch (error) {
      log('FetchMetadata', 'ERROR', 'Failed to fetch wallet metadata', { 
        walletType,
        error: error.message 
      });
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    log('TestConnection', 'INFO', 'Testing wallet API connection');
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/wallet-customization-structure`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        }
      });
      
      const duration = Date.now() - startTime;
      const isConnected = response.ok;
      
      log('TestConnection', isConnected ? 'INFO' : 'ERROR', `Connection test result: ${isConnected}`, { 
        duration: `${duration}ms`,
        status: response.status
      });
      
      return isConnected;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('TestConnection', 'ERROR', 'Connection test failed', { 
        duration: `${duration}ms`,
        error: error.message 
      });
      return false;
    }
  }
}

export const walletAPIClient = new WalletAPIClient();
