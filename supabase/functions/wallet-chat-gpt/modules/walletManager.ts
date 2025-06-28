
// Unified wallet manager that gets configurations from database
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWalletElementsManager } from './walletElementsManager.ts';

export interface WalletConfiguration {
  id: string;
  name: string;
  type: string;
  screens: string[];
  features: string[];
  elements: any[];
  metadata: any;
}

export class WalletManager {
  private supabase: any;
  private elementsManager: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.elementsManager = createWalletElementsManager(supabaseUrl, supabaseKey);
  }

  /**
   * Get wallet configuration from database
   */
  async getWalletConfiguration(walletType: string): Promise<WalletConfiguration> {
    console.log(`🔧 Loading wallet configuration for: ${walletType}`);
    
    try {
      // Load all elements from database
      const elements = await this.elementsManager.loadAllElements();
      
      // Group elements by screen
      const grouped = this.elementsManager.groupElementsByScreen(elements);
      const screens = Object.keys(grouped);
      
      // Extract unique features/types
      const features = [...new Set(elements.map(el => el.type))];
      
      // Create configuration object
      const configuration: WalletConfiguration = {
        id: walletType,
        name: `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet`,
        type: walletType,
        screens,
        features,
        elements,
        metadata: {
          totalElements: elements.length,
          customizableElements: elements.filter(el => el.customizable).length,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      console.log('✅ Wallet configuration loaded:', {
        wallet: walletType,
        screens: screens.length,
        elements: elements.length,
        features: features.length
      });

      return configuration;
      
    } catch (error) {
      console.error('❌ Error loading wallet configuration:', error);
      
      // Fallback configuration
      return {
        id: walletType,
        name: 'Unknown Wallet',
        type: walletType,
        screens: ['main'],
        features: ['basic'],
        elements: [],
        metadata: {
          totalElements: 0,
          customizableElements: 0,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          fallback: true
        }
      };
    }
  }

  /**
   * Get supported wallet types from database
   */
  async getSupportedWalletTypes(): Promise<string[]> {
    try {
      // For now, return default types
      // In the future, this could be stored in a separate table
      return ['phantom', 'solflare', 'backpack', 'metamask'];
    } catch (error) {
      console.error('❌ Error getting supported wallet types:', error);
      return ['phantom'];
    }
  }

  /**
   * Get wallet features by type
   */
  async getWalletFeatures(walletType: string): Promise<string[]> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      return configuration.features;
    } catch (error) {
      console.error('❌ Error getting wallet features:', error);
      return [];
    }
  }

  /**
   * Get wallet screens by type
   */
  async getWalletScreens(walletType: string): Promise<string[]> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      return configuration.screens;
    } catch (error) {
      console.error('❌ Error getting wallet screens:', error);
      return [];
    }
  }

  /**
   * Validate wallet type
   */
  async isValidWalletType(walletType: string): Promise<boolean> {
    try {
      const supportedTypes = await this.getSupportedWalletTypes();
      return supportedTypes.includes(walletType.toLowerCase());
    } catch (error) {
      console.error('❌ Error validating wallet type:', error);
      return false;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStatistics(walletType: string): Promise<any> {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const stats = this.elementsManager.getElementsStatistics(configuration.elements);
      
      return {
        ...stats,
        walletType,
        configuration: configuration.metadata
      };
    } catch (error) {
      console.error('❌ Error getting wallet statistics:', error);
      return {
        total: 0,
        customizable: 0,
        customizationPercentage: 0,
        screens: { count: 0, list: [] },
        types: { count: 0, list: [] },
        walletType
      };
    }
  }

  /**
   * Create AI context for wallet
   */
  async createWalletAIContext(walletType: string, activeScreen?: string) {
    try {
      const configuration = await this.getWalletConfiguration(walletType);
      const context = this.elementsManager.createAIContext(
        configuration.elements,
        activeScreen
      );
      
      return {
        ...context,
        walletConfiguration: configuration,
        walletType,
        supportedFeatures: configuration.features,
        availableScreens: configuration.screens
      };
    } catch (error) {
      console.error('❌ Error creating wallet AI context:', error);
      return {
        elements: [],
        grouped: {},
        statistics: { total: 0, customizable: 0 },
        customizableElements: [],
        walletType,
        error: error.message
      };
    }
  }
}

// Factory function for creating wallet manager
export function createWalletManager(supabaseUrl: string, supabaseKey: string) {
  return new WalletManager(supabaseUrl, supabaseKey);
}
