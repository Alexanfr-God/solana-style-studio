
import { supabase } from '@/integrations/supabase/client';

export interface WalletStructureData {
  elements: WalletElementData[];
  screens: string[];
  categories: string[];
  totalElements: number;
}

export interface WalletElementData {
  id: string;
  name: string;
  type: string;
  screen: string;
  description: string;
  customizable: boolean;
  position?: string;
  selector?: string;
  custom_props?: any[];
}

export interface StructureAnalysisResult {
  success: boolean;
  data?: WalletStructureData;
  error?: string;
  processingTime?: string;
}

class WalletStructureService {
  /**
   * Get wallet structure using the unified wallet-chat-gpt function
   */
  async getWalletStructure(walletType: string = 'phantom'): Promise<StructureAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log('🏗️ Getting wallet structure via wallet-chat-gpt...', { walletType });

      // Call the unified wallet-chat-gpt function with structure request
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: `Get wallet structure for ${walletType} wallet`,
          walletContext: {
            walletType: walletType,
            activeLayer: 'wallet'
          },
          mode: 'structure' // Use structure mode
        }
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (error) {
        console.error('❌ Wallet structure error:', error);
        throw new Error(`Structure analysis failed: ${error.message}`);
      }

      console.log('✅ Wallet structure retrieved:', {
        duration: `${duration}s`,
        success: data?.success,
        elementsCount: data?.walletElements?.length || 0
      });

      // Transform the response to match expected format
      const structureData: WalletStructureData = {
        elements: data?.walletElements || [],
        screens: [...new Set((data?.walletElements || []).map((el: any) => el.screen))],
        categories: [...new Set((data?.walletElements || []).map((el: any) => el.type))],
        totalElements: (data?.walletElements || []).length
      };

      return {
        success: true,
        data: structureData,
        processingTime: `${duration.toFixed(1)}s`
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('💥 Error in wallet structure service:', {
        error: error.message,
        duration: `${duration}s`
      });
      
      return {
        success: false,
        error: error.message,
        processingTime: `${duration.toFixed(1)}s`
      };
    }
  }

  /**
   * Get elements by screen
   */
  async getElementsByScreen(screen: string, walletType: string = 'phantom'): Promise<WalletElementData[]> {
    try {
      const result = await this.getWalletStructure(walletType);
      
      if (result.success && result.data) {
        return result.data.elements.filter(el => el.screen === screen);
      }
      
      return [];
    } catch (error) {
      console.error('💥 Error getting elements by screen:', error);
      return [];
    }
  }

  /**
   * Get customizable elements only
   */
  async getCustomizableElements(walletType: string = 'phantom'): Promise<WalletElementData[]> {
    try {
      const result = await this.getWalletStructure(walletType);
      
      if (result.success && result.data) {
        return result.data.elements.filter(el => el.customizable);
      }
      
      return [];
    } catch (error) {
      console.error('💥 Error getting customizable elements:', error);
      return [];
    }
  }

  /**
   * Search elements by name or description
   */
  async searchElements(query: string, walletType: string = 'phantom'): Promise<WalletElementData[]> {
    try {
      const result = await this.getWalletStructure(walletType);
      
      if (result.success && result.data) {
        const lowerQuery = query.toLowerCase();
        return result.data.elements.filter(el => 
          el.name.toLowerCase().includes(lowerQuery) ||
          el.description.toLowerCase().includes(lowerQuery) ||
          el.id.toLowerCase().includes(lowerQuery)
        );
      }
      
      return [];
    } catch (error) {
      console.error('💥 Error searching elements:', error);
      return [];
    }
  }

  /**
   * Get structure statistics
   */
  async getStructureStatistics(walletType: string = 'phantom'): Promise<any> {
    try {
      const result = await this.getWalletStructure(walletType);
      
      if (result.success && result.data) {
        const data = result.data;
        const customizable = data.elements.filter(el => el.customizable).length;
        
        return {
          total: data.totalElements,
          customizable,
          customizationPercentage: Math.round((customizable / data.totalElements) * 100),
          screens: data.screens.length,
          categories: data.categories.length,
          screenBreakdown: data.screens.reduce((acc, screen) => {
            acc[screen] = data.elements.filter(el => el.screen === screen).length;
            return acc;
          }, {} as Record<string, number>),
          categoryBreakdown: data.categories.reduce((acc, category) => {
            acc[category] = data.elements.filter(el => el.type === category).length;
            return acc;
          }, {} as Record<string, number>)
        };
      }
      
      return {
        total: 0,
        customizable: 0,
        customizationPercentage: 0,
        screens: 0,
        categories: 0
      };
    } catch (error) {
      console.error('💥 Error getting structure statistics:', error);
      return {
        total: 0,
        customizable: 0,
        customizationPercentage: 0,
        screens: 0,
        categories: 0
      };
    }
  }
}

// Create and export service instance
export const walletStructureService = new WalletStructureService();

// Export types
export type { WalletStructureData, WalletElementData, StructureAnalysisResult };
