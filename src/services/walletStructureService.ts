
import { supabase } from '@/integrations/supabase/client';

export interface WalletStructureResponse {
  success: boolean;
  structure: any;
  metadata: {
    totalProviders: number;
    totalElements: number;
    totalInstances: number;
    totalWalletTypes: number;
    version: string;
    timestamp: string;
    capabilities: string[];
  };
}

export interface WalletSwitchResponse {
  success: boolean;
  walletStructure: any;
  message: string;
}

export interface CollaborationResponse {
  success: boolean;
  sessionId: string;
  analyzedStructure?: any;
  message: string;
}

export class WalletStructureService {
  private static structure: WalletStructureResponse | null = null;
  private static isLoading = false;
  private static currentWalletType = 'phantom';

  /**
   * Get comprehensive wallet structure for AI agents
   */
  static async getWalletStructure(): Promise<WalletStructureResponse> {
    try {
      if (this.structure) {
        console.log('🔄 Using cached wallet structure');
        return this.structure;
      }

      if (this.isLoading) {
        console.log('⏳ Structure already loading, waiting...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getWalletStructure();
      }

      this.isLoading = true;
      console.log('📡 Fetching comprehensive wallet structure from API...');

      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ Error fetching wallet structure:', error);
        throw new Error(`Failed to fetch wallet structure: ${error.message}`);
      }

      if (!data.success) {
        throw new Error('API returned unsuccessful response');
      }

      this.structure = data;
      this.isLoading = false;

      console.log(`✅ Comprehensive wallet structure loaded successfully!`);
      console.log(`📊 Total providers: ${data.metadata.totalProviders}`);
      console.log(`📊 Total elements: ${data.metadata.totalElements}`);
      console.log(`📊 Total wallet types: ${data.metadata.totalWalletTypes}`);
      console.log(`🎯 Capabilities: ${data.metadata.capabilities.join(', ')}`);

      // Make structure globally available
      if (typeof window !== 'undefined') {
        (window as any).walletStructure = data;
        (window as any).switchWallet = this.switchWallet.bind(this);
        (window as any).createCollaboration = this.createCollaboration.bind(this);
        console.log('🌐 Enhanced wallet structure made globally available');
      }

      return data;

    } catch (error) {
      this.isLoading = false;
      console.error('💥 Failed to load wallet structure:', error);
      throw error;
    }
  }

  /**
   * Switch to a different wallet type
   */
  static async switchWallet(walletType: string): Promise<WalletSwitchResponse> {
    try {
      console.log('🔄 Switching to wallet type:', walletType);

      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'POST',
        body: {
          action: 'switch-wallet',
          walletType
        }
      });

      if (error) {
        console.error('❌ Error switching wallet:', error);
        throw new Error(`Failed to switch wallet: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Wallet switch failed');
      }

      this.currentWalletType = walletType;
      
      // Invalidate cached structure to force reload with new wallet
      this.structure = null;

      console.log('✅ Wallet switched successfully:', walletType);
      return data;

    } catch (error) {
      console.error('💥 Failed to switch wallet:', error);
      throw error;
    }
  }

  /**
   * Create collaboration session with external API
   */
  static async createCollaboration(sessionName: string, externalApiUrl: string): Promise<CollaborationResponse> {
    try {
      console.log('🤝 Creating collaboration session:', sessionName);

      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'POST',
        body: {
          action: 'create-collaboration',
          sessionName,
          externalApiUrl
        }
      });

      if (error) {
        console.error('❌ Error creating collaboration:', error);
        throw new Error(`Failed to create collaboration: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Collaboration creation failed');
      }

      console.log('✅ Collaboration session created:', data.session.id);
      return data;

    } catch (error) {
      console.error('💥 Failed to create collaboration:', error);
      throw error;
    }
  }

  /**
   * Analyze external wallet and integrate into system
   */
  static async analyzeExternalWallet(apiUrl: string, sessionName: string): Promise<CollaborationResponse> {
    try {
      console.log('🔍 Analyzing external wallet:', apiUrl);

      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'POST',
        body: {
          action: 'analyze-external-wallet',
          externalApiUrl: apiUrl,
          sessionName
        }
      });

      if (error) {
        console.error('❌ Error analyzing external wallet:', error);
        throw new Error(`Failed to analyze external wallet: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'External wallet analysis failed');
      }

      // Invalidate cache to pick up new elements
      this.structure = null;

      console.log('✅ External wallet analyzed and integrated:', data.sessionId);
      return data;

    } catch (error) {
      console.error('💥 Failed to analyze external wallet:', error);
      throw error;
    }
  }

  /**
   * Apply custom theme with structure awareness
   */
  static async applyCustomTheme(theme: any, userId?: string): Promise<void> {
    try {
      console.log('🎨 Applying theme with structure awareness:', theme);
      
      const { data, error } = await supabase.functions.invoke('wallet-customization-structure', {
        method: 'POST',
        body: {
          action: 'apply-theme',
          theme,
          userId: userId || 'current-user'
        }
      });

      if (error) {
        console.error('❌ Error applying theme:', error);
        throw new Error(`Failed to apply theme: ${error.message}`);
      }

      console.log('✅ Theme applied successfully with structure awareness');
      
    } catch (error) {
      console.error('💥 Failed to apply theme:', error);
      throw error;
    }
  }

  /**
   * Get current wallet type
   */
  static getCurrentWalletType(): string {
    return this.currentWalletType;
  }

  /**
   * Get available wallet types
   */
  static async getAvailableWalletTypes(): Promise<string[]> {
    const structure = await this.getWalletStructure();
    return Object.keys(structure.structure.walletTypes);
  }

  /**
   * Get wallet providers
   */
  static async getWalletProviders(): Promise<any> {
    const structure = await this.getWalletStructure();
    return structure.structure.providers;
  }

  /**
   * Check system health
   */
  static async healthCheck(): Promise<any> {
    try {
      const structure = await this.getWalletStructure();
      
      return {
        status: 'healthy',
        capabilities: structure.metadata.capabilities,
        totalElements: structure.metadata.totalElements,
        version: structure.metadata.version,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Export structure for debugging
   */
  static async exportForDebug(): Promise<any> {
    const structure = await this.getWalletStructure();
    const health = await this.healthCheck();
    
    return {
      structure: structure.structure,
      metadata: structure.metadata,
      health,
      currentWalletType: this.currentWalletType,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    };
  }

  /**
   * Clear cache and force reload
   */
  static clearCache(): void {
    this.structure = null;
    console.log('🧹 Cache cleared, next request will fetch fresh data');
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  WalletStructureService.getWalletStructure().catch(error => {
    console.warn('⚠️ Failed to auto-initialize enhanced wallet structure:', error);
  });
}

export default WalletStructureService;
