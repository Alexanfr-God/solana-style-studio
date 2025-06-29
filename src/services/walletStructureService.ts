
import { supabase } from '@/integrations/supabase/client';
import { frontendLogger } from './frontendLogger';

export interface WalletStructureData {
  elements: any[];
  hierarchy: any[];
  screens: any[];
  categories: string[];
  totalElements: number;
}

export interface StructureAnalysisResult {
  success: boolean;
  structure: WalletStructureData | null;
  analysis: string;
  recommendations: string[];
  errors?: string[];
}

export class WalletStructureService {
  private static instance: WalletStructureService;
  private cachedStructure: WalletStructureData | null = null;
  
  static getInstance(): WalletStructureService {
    if (!WalletStructureService.instance) {
      WalletStructureService.instance = new WalletStructureService();
    }
    return WalletStructureService.instance;
  }

  async getWalletStructure(
    walletType: string = 'Phantom Wallet (WalletAlivePlayground)',
    forceRefresh: boolean = false
  ): Promise<WalletStructureData | null> {
    if (this.cachedStructure && !forceRefresh) {
      return this.cachedStructure;
    }

    try {
      await frontendLogger.logUserInteraction(
        'structure',
        'wallet_structure_load',
        `Loading structure for ${walletType}`
      );

      console.log('🏗️ Loading wallet structure from Edge Function...');

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          mode: 'structure',
          walletType,
          content: 'Load full wallet structure with hierarchy'
        }
      });

      if (error) {
        console.error('❌ Structure loading error:', error);
        throw new Error(`Structure loading failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Structure API error:', data?.error);
        throw new Error(data?.error || 'Failed to load wallet structure');
      }

      this.cachedStructure = data.structure;
      console.log('✅ Wallet structure loaded:', this.cachedStructure);

      return this.cachedStructure;

    } catch (error) {
      await frontendLogger.logUserError(
        'STRUCTURE_LOAD_ERROR',
        error.message,
        'wallet_structure_service'
      );

      console.error('💥 Structure service error:', error);
      return null;
    }
  }

  async analyzeStructure(
    userPrompt: string,
    sessionId?: string
  ): Promise<StructureAnalysisResult> {
    try {
      await frontendLogger.logUserInteraction(
        'structure',
        'structure_analysis',
        `Analyzing: ${userPrompt.substring(0, 50)}...`
      );

      console.log('🔍 Analyzing wallet structure...');

      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          mode: 'structure',
          content: userPrompt,
          sessionId: sessionId || `struct_${Date.now()}`,
          analysisType: 'detailed'
        }
      });

      if (error) {
        console.error('❌ Structure analysis error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Structure analysis API error:', data?.error);
        throw new Error(data?.error || 'Failed to analyze structure');
      }

      console.log('✅ Structure analysis completed:', data);

      return {
        success: true,
        structure: data.structure,
        analysis: data.analysis || 'Structure analysis completed',
        recommendations: data.recommendations || []
      };

    } catch (error) {
      await frontendLogger.logUserError(
        'STRUCTURE_ANALYSIS_ERROR',
        error.message,
        'wallet_structure_service'
      );

      console.error('💥 Structure analysis error:', error);
      
      return {
        success: false,
        structure: null,
        analysis: 'Analysis failed',
        recommendations: [],
        errors: [error.message]
      };
    }
  }

  clearCache(): void {
    this.cachedStructure = null;
    console.log('🧹 Structure cache cleared');
  }
}

// Export singleton instance
export const walletStructureService = WalletStructureService.getInstance();
