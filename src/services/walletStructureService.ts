
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

      console.log('🏗️ Loading wallet structure from database...');

      // Load structure from existing database tables instead of edge function
      const { data: elements, error: elementsError } = await supabase
        .from('wallet_elements')
        .select('*')
        .order('screen', { ascending: true });

      if (elementsError) {
        throw new Error(`Failed to load elements: ${elementsError.message}`);
      }

      const { data: categories, error: categoriesError } = await supabase
        .from('element_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (categoriesError) {
        throw new Error(`Failed to load categories: ${categoriesError.message}`);
      }

      // Build structure data
      const structureData: WalletStructureData = {
        elements: elements || [],
        hierarchy: [], // Build from elements parent_element relationships
        screens: [...new Set((elements || []).map(el => el.screen))],
        categories: (categories || []).map(cat => cat.name),
        totalElements: (elements || []).length
      };

      this.cachedStructure = structureData;
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

      // Get current structure
      const structure = await this.getWalletStructure();
      if (!structure) {
        throw new Error('Failed to load wallet structure');
      }

      // Create basic analysis based on structure data
      const analysis = `Structure analysis for wallet with ${structure.totalElements} elements across ${structure.screens.length} screens.`;
      const recommendations = [
        'Consider grouping related elements for better UX',
        'Ensure consistent styling across all screens',
        'Optimize element hierarchy for accessibility'
      ];

      console.log('✅ Structure analysis completed');

      return {
        success: true,
        structure,
        analysis,
        recommendations
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
