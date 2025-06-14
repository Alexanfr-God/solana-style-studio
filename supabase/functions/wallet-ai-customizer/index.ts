import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Import API types for validation and conversion
import type { 
  WalletCustomizationData, 
  FullWalletCustomizationResponse,
  CustomizationValidation,
  EXCLUDED_FROM_API_CUSTOMIZATION
} from "./types/api.types.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Temporarily commented out - files don't exist yet
// import { WalletAPIClient } from "./core/wallet-api-client.ts";
// import { ImageProcessor } from "./core/image-processor.ts";
// import { N8NConductor } from "./core/n8n-conductor.ts";
// import { LearningCollector } from "./core/learning-collector.ts";
// import { ValidationService } from "./services/validation.ts";
// import { NFTStub } from "./services/nft-stub.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

// Database Integration Helper Functions
class DatabaseIntegration {
  // Get wallet structure analysis from database
  static async getWalletStructureAnalysis(walletType: string, screenType: string = 'login', version: string = '1.0') {
    log('DatabaseIntegration', 'INFO', 'Fetching wallet structure analysis', { walletType, screenType, version });
    
    try {
      const { data, error } = await supabase
        .from('wallet_structure_analysis')
        .select('*')
        .eq('wallet_type', walletType)
        .eq('screen_type', screenType)
        .eq('version', version)
        .maybeSingle();

      if (error) {
        log('DatabaseIntegration', 'ERROR', 'Failed to fetch wallet structure', { error: error.message });
        return null;
      }

      if (!data) {
        log('DatabaseIntegration', 'WARN', 'No wallet structure found, using default', { walletType, screenType });
        return null;
      }

      log('DatabaseIntegration', 'INFO', 'Successfully fetched wallet structure', { id: data.id });
      return data;
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Exception fetching wallet structure', { error: error.message });
      return null;
    }
  }

  // Check image analysis cache
  static async getImageAnalysisFromCache(imageUrl: string, imageHash?: string) {
    log('DatabaseIntegration', 'INFO', 'Checking image analysis cache', { imageUrl: imageUrl.substring(0, 50) + '...', imageHash });
    
    try {
      let query = supabase.from('image_analysis_cache').select('*');
      
      if (imageHash) {
        query = query.eq('image_hash', imageHash);
      } else {
        query = query.eq('image_url', imageUrl);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        log('DatabaseIntegration', 'ERROR', 'Failed to check image cache', { error: error.message });
        return null;
      }

      if (data) {
        log('DatabaseIntegration', 'INFO', 'Found cached image analysis', { id: data.id, age: new Date().getTime() - new Date(data.created_at).getTime() });
      }

      return data;
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Exception checking image cache', { error: error.message });
      return null;
    }
  }

  // Save image analysis to cache
  static async saveImageAnalysisToCache(imageUrl: string, analysisResult: any, imageHash?: string, analysisDuration?: number) {
    log('DatabaseIntegration', 'INFO', 'Saving image analysis to cache', { imageUrl: imageUrl.substring(0, 50) + '...', imageHash });
    
    try {
      const { data, error } = await supabase
        .from('image_analysis_cache')
        .insert({
          image_url: imageUrl,
          image_hash: imageHash,
          analysis_result: analysisResult,
          analysis_duration_ms: analysisDuration,
          analysis_version: '1.0'
        })
        .select()
        .single();

      if (error) {
        log('DatabaseIntegration', 'ERROR', 'Failed to save image analysis', { error: error.message });
        return null;
      }

      log('DatabaseIntegration', 'INFO', 'Successfully saved image analysis', { id: data.id });
      return data;
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Exception saving image analysis', { error: error.message });
      return null;
    }
  }

  // Create customization result entry
  static async createCustomizationResult(sessionId: string, walletStructureId?: string, imageAnalysisId?: string, userId?: string) {
    log('DatabaseIntegration', 'INFO', 'Creating customization result entry', { sessionId, walletStructureId, imageAnalysisId });
    
    try {
      const { data, error } = await supabase
        .from('customization_results')
        .insert({
          session_id: sessionId,
          user_id: userId,
          wallet_structure_id: walletStructureId,
          image_analysis_id: imageAnalysisId,
          status: 'processing',
          customization_data: {}
        })
        .select()
        .single();

      if (error) {
        log('DatabaseIntegration', 'ERROR', 'Failed to create customization result', { error: error.message });
        return null;
      }

      log('DatabaseIntegration', 'INFO', 'Successfully created customization result', { id: data.id });
      return data;
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Exception creating customization result', { error: error.message });
      return null;
    }
  }

  // Update customization result with N8N payload and result
  static async updateCustomizationResult(
    resultId: string, 
    updates: {
      n8nPayload?: any,
      n8nResult?: any,
      status?: string,
      processingTimeMs?: number,
      errorDetails?: any,
      qualityScore?: number,
      customizationData?: any
    }
  ) {
    log('DatabaseIntegration', 'INFO', 'Updating customization result', { resultId, status: updates.status });
    
    try {
      const { data, error } = await supabase
        .from('customization_results')
        .update({
          ...(updates.n8nPayload && { n8n_payload: updates.n8nPayload }),
          ...(updates.n8nResult && { n8n_result: updates.n8nResult }),
          ...(updates.status && { status: updates.status }),
          ...(updates.processingTimeMs && { processing_time_ms: updates.processingTimeMs }),
          ...(updates.errorDetails && { error_details: updates.errorDetails }),
          ...(updates.qualityScore && { quality_score: updates.qualityScore }),
          ...(updates.customizationData && { customization_data: updates.customizationData })
        })
        .eq('id', resultId)
        .select()
        .single();

      if (error) {
        log('DatabaseIntegration', 'ERROR', 'Failed to update customization result', { error: error.message });
        return null;
      }

      log('DatabaseIntegration', 'INFO', 'Successfully updated customization result', { id: data.id });
      return data;
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Exception updating customization result', { error: error.message });
      return null;
    }
  }

  // Generate image hash for caching
  static async generateImageHash(imageData: string): Promise<string> {
    try {
      // Create a simple hash from image data for caching purposes
      const encoder = new TextEncoder();
      const data = encoder.encode(imageData.substring(0, 1000)); // Use first 1000 chars for hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.substring(0, 32); // First 32 chars
    } catch (error) {
      log('DatabaseIntegration', 'ERROR', 'Failed to generate image hash', { error: error.message });
      return crypto.randomUUID(); // Fallback to random UUID
    }
  }
}

// API Schema Integration Helper Functions
class APISchemaConverter {
  static validateCustomizationData(data: any): CustomizationValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for excluded elements
    const checkForExcluded = (obj: any, path = '') => {
      if (typeof obj !== 'object' || obj === null) return;
      
      Object.keys(obj).forEach(key => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (['logo', 'aiPet', 'aiPetContainer', 'brandLogo', 'companyLogo'].some(excluded => 
          key.toLowerCase().includes(excluded.toLowerCase())
        )) {
          warnings.push(`Element '${currentPath}' is excluded from API customization`);
          return;
        }
        
        if (typeof obj[key] === 'object') {
          checkForExcluded(obj[key], currentPath);
        }
      });
    };

    checkForExcluded(data);

    // Validate required structure
    if (!data.loginScreen && !data.walletScreen && !data.global) {
      errors.push('At least one customization section (loginScreen, walletScreen, global) is required');
    }

    // Validate color formats
    const validateColors = (obj: any, path = '') => {
      if (typeof obj !== 'object' || obj === null) return;
      
      Object.keys(obj).forEach(key => {
        if (key.toLowerCase().includes('color') && typeof obj[key] === 'string') {
          const colorValue = obj[key];
          const isValidColor = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+)/.test(colorValue);
          if (!isValidColor) {
            errors.push(`Invalid color format at ${path}.${key}: ${colorValue}`);
          }
        }
        
        if (typeof obj[key] === 'object') {
          validateColors(obj[key], path ? `${path}.${key}` : key);
        }
      });
    };

    validateColors(data);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static convertToStoreFormat(apiData: WalletCustomizationData): any {
    const storeFormat = {
      walletStyle: {},
      loginStyle: {},
      components: {}
    };

    // Convert login screen customization
    if (apiData.loginScreen) {
      if (apiData.loginScreen.background?.color) {
        storeFormat.loginStyle.backgroundColor = apiData.loginScreen.background.color;
      }
      if (apiData.loginScreen.unlockButton) {
        storeFormat.loginStyle.buttonColor = apiData.loginScreen.unlockButton.background?.color;
        storeFormat.loginStyle.buttonTextColor = apiData.loginScreen.unlockButton.text?.color;
        storeFormat.loginStyle.borderRadius = apiData.loginScreen.unlockButton.border?.radius?.all;
      }
      if (apiData.loginScreen.phantomText) {
        storeFormat.loginStyle.textColor = apiData.loginScreen.phantomText.color;
        storeFormat.loginStyle.fontFamily = apiData.loginScreen.phantomText.fontFamily;
      }
    }

    // Convert wallet screen customization
    if (apiData.walletScreen) {
      if (apiData.walletScreen.header) {
        storeFormat.components.header = {
          backgroundColor: apiData.walletScreen.header.container?.background?.color,
          color: apiData.walletScreen.header.accountInfo?.color,
          fontFamily: apiData.walletScreen.header.accountInfo?.fontFamily
        };
      }
      if (apiData.walletScreen.actionButtons) {
        storeFormat.components.buttons = {
          backgroundColor: apiData.walletScreen.actionButtons.receiveButton?.background?.color,
          color: apiData.walletScreen.actionButtons.buttonLabels?.color,
          borderRadius: apiData.walletScreen.actionButtons.receiveButton?.border?.radius?.all
        };
      }
    }

    // Convert global customization
    if (apiData.global) {
      if (apiData.global.fonts?.primary) {
        const fontFamily = apiData.global.fonts.primary.family;
        storeFormat.walletStyle.fontFamily = fontFamily;
        storeFormat.loginStyle.fontFamily = fontFamily;
      }
      if (apiData.global.colors?.primary) {
        const primaryColor = apiData.global.colors.primary['500'] || apiData.global.colors.primary.main;
        storeFormat.walletStyle.accentColor = primaryColor;
        storeFormat.loginStyle.accentColor = primaryColor;
      }
    }

    return storeFormat;
  }

  static convertFromN8NResult(n8nResult: any): FullWalletCustomizationResponse {
    const timestamp = new Date().toISOString();
    
    if (!n8nResult.success) {
      return {
        success: false,
        error: n8nResult.error || 'N8N customization failed',
        timestamp
      };
    }

    // Extract customization data from N8N result
    const customizationData: WalletCustomizationData = {
      loginScreen: {
        background: {
          color: n8nResult.result?.loginStyle?.backgroundColor
        },
        unlockButton: {
          background: { color: n8nResult.result?.loginStyle?.buttonColor },
          text: { color: n8nResult.result?.loginStyle?.buttonTextColor, fontSize: '16px', fontWeight: 'normal' },
          border: { radius: { all: n8nResult.result?.loginStyle?.borderRadius }, width: '1px', style: 'solid', color: '#transparent' },
          shadow: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
          states: {
            default: {},
            hover: {},
            active: {},
            disabled: {},
            focus: {}
          },
          size: {}
        },
        passwordInput: {
          background: { color: '#2b2b2b' },
          text: { fontSize: '16px', fontWeight: 'normal', color: '#ffffff' },
          placeholder: { fontSize: '16px', fontWeight: 'normal', color: '#888888' },
          border: { width: '1px', style: 'solid', color: '#444444' },
          shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
          states: {
            default: {},
            focus: {},
            error: {},
            disabled: {},
            valid: {}
          },
          size: {}
        },
        phantomText: {
          fontFamily: n8nResult.result?.loginStyle?.fontFamily || 'Inter, sans-serif',
          fontSize: '24px',
          fontWeight: 'bold',
          color: n8nResult.result?.loginStyle?.textColor || '#ffffff'
        }
      },
      walletScreen: {
        header: {
          container: {
            background: { color: n8nResult.result?.walletStyle?.backgroundColor },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            size: {},
            padding: { all: '16px' },
            layout: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
          },
          accountSelector: {
            background: { color: 'transparent' },
            text: { fontSize: '16px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.textColor },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          searchButton: {
            background: { color: 'transparent' },
            text: { fontSize: '16px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.textColor },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          avatar: {
            size: '32px',
            background: { color: n8nResult.result?.walletStyle?.accentColor },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            placeholder: { fontSize: '14px', fontWeight: 'normal', color: '#ffffff' }
          },
          accountInfo: {
            fontFamily: n8nResult.result?.walletStyle?.fontFamily || 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          }
        },
        balance: {
          container: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            size: {},
            padding: { all: '16px' },
            layout: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
          },
          totalBalanceLabel: {
            fontSize: '14px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          totalBalanceValue: {
            fontSize: '32px',
            fontWeight: 'bold',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          changeIndicator: {
            fontSize: '16px',
            fontWeight: 'normal',
            color: '#10B981'
          }
        },
        actionButtons: {
          container: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            size: {},
            padding: { all: '16px' },
            layout: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' }
          },
          receiveButton: {
            background: { color: n8nResult.result?.walletStyle?.buttonColor },
            text: { fontSize: '14px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.buttonTextColor },
            border: { radius: { all: n8nResult.result?.walletStyle?.borderRadius }, width: '1px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          sendButton: {
            background: { color: n8nResult.result?.walletStyle?.buttonColor },
            text: { fontSize: '14px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.buttonTextColor },
            border: { radius: { all: n8nResult.result?.walletStyle?.borderRadius }, width: '1px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          swapButton: {
            background: { color: n8nResult.result?.walletStyle?.buttonColor },
            text: { fontSize: '14px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.buttonTextColor },
            border: { radius: { all: n8nResult.result?.walletStyle?.borderRadius }, width: '1px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          buyButton: {
            background: { color: n8nResult.result?.walletStyle?.buttonColor },
            text: { fontSize: '14px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.buttonTextColor },
            border: { radius: { all: n8nResult.result?.walletStyle?.borderRadius }, width: '1px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          buttonLabels: {
            fontSize: '12px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          buttonIcons: {
            size: '20px',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          }
        },
        assets: {
          container: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            size: {},
            padding: { all: '16px' },
            layout: { display: 'flex', flexDirection: 'column' }
          },
          sectionTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          seeAllButton: {
            background: { color: 'transparent' },
            text: { fontSize: '14px', fontWeight: 'normal', color: n8nResult.result?.walletStyle?.accentColor },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              hover: {},
              active: {},
              disabled: {},
              focus: {}
            },
            size: {}
          },
          assetItem: {
            container: {
              background: { color: 'rgba(255,255,255,0.05)' },
              border: { radius: { all: '8px' }, width: '1px', style: 'solid', color: 'rgba(255,255,255,0.1)' },
              shadow: { offsetX: '0px', offsetY: '2px', blurRadius: '8px', color: 'rgba(0,0,0,0.1)' },
              size: {},
              padding: { all: '12px' },
              layout: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            },
            layout: { display: 'flex', alignItems: 'center' },
            states: {
              default: {},
              hover: {},
              selected: {},
              disabled: {}
            },
            spacing: { all: '8px' }
          },
          assetIcon: {
            size: '24px',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          assetName: {
            fontSize: '16px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          assetTicker: {
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#888888'
          },
          assetAmount: {
            fontSize: '16px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          assetValue: {
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#888888'
          },
          assetChange: {
            fontSize: '14px',
            fontWeight: 'normal',
            color: '#10B981'
          }
        },
        navigation: {
          container: {
            background: { color: 'rgba(0,0,0,0.5)' },
            border: { radius: { all: '0px' }, width: '1px', style: 'solid', color: 'rgba(255,255,255,0.1)' },
            shadow: { offsetX: '0px', offsetY: '-4px', blurRadius: '20px', color: 'rgba(0,0,0,0.3)' },
            size: {},
            padding: { all: '16px' },
            layout: { display: 'flex', justifyContent: 'space-around', alignItems: 'center' }
          },
          homeButton: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              active: {},
              hover: {},
              disabled: {}
            },
            size: {},
            spacing: { all: '8px' }
          },
          appsButton: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              active: {},
              hover: {},
              disabled: {}
            },
            size: {},
            spacing: { all: '8px' }
          },
          swapButton: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              active: {},
              hover: {},
              disabled: {}
            },
            size: {},
            spacing: { all: '8px' }
          },
          historyButton: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              active: {},
              hover: {},
              disabled: {}
            },
            size: {},
            spacing: { all: '8px' }
          },
          searchButton: {
            background: { color: 'transparent' },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            shadow: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            states: {
              default: {},
              active: {},
              hover: {},
              disabled: {}
            },
            size: {},
            spacing: { all: '8px' }
          },
          buttonIcons: {
            size: '24px',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          },
          buttonLabels: {
            fontSize: '12px',
            fontWeight: 'normal',
            color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
          }
        }
      },
      global: {
        fonts: {
          primary: {
            family: n8nResult.result?.walletStyle?.fontFamily || 'Inter, sans-serif',
            weights: [400, 600, 700],
            fallbacks: ['system-ui', 'sans-serif']
          },
          fallbacks: ['system-ui', 'sans-serif']
        },
        colors: {
          primary: {
            '500': n8nResult.result?.walletStyle?.accentColor || '#9945FF',
            '50': '#f0f0ff',
            '100': '#e5e5ff',
            '200': '#d1d1ff',
            '300': '#b3b3ff',
            '400': '#8080ff',
            '600': '#7a34e6',
            '700': '#6b2bcc',
            '800': '#5a24b3',
            '900': '#4b1d99'
          },
          secondary: {
            '500': '#6B7280',
            '50': '#f9fafb',
            '100': '#f3f4f6',
            '200': '#e5e7eb',
            '300': '#d1d5db',
            '400': '#9ca3af',
            '600': '#4b5563',
            '700': '#374151',
            '800': '#1f2937',
            '900': '#111827'
          },
          accent: {
            '500': n8nResult.result?.walletStyle?.accentColor || '#9945FF',
            '50': '#f0f0ff',
            '100': '#e5e5ff',
            '200': '#d1d1ff',
            '300': '#b3b3ff',
            '400': '#8080ff',
            '600': '#7a34e6',
            '700': '#6b2bcc',
            '800': '#5a24b3',
            '900': '#4b1d99'
          },
          neutral: {
            '500': '#6B7280',
            '50': '#f9fafb',
            '100': '#f3f4f6',
            '200': '#e5e7eb',
            '300': '#d1d5db',
            '400': '#9ca3af',
            '600': '#4b5563',
            '700': '#374151',
            '800': '#1f2937',
            '900': '#111827'
          },
          semantic: {
            success: {
              light: '#10B981',
              main: '#059669',
              dark: '#047857',
              contrastText: '#ffffff'
            },
            error: {
              light: '#EF4444',
              main: '#DC2626',
              dark: '#B91C1C',
              contrastText: '#ffffff'
            },
            warning: {
              light: '#F59E0B',
              main: '#D97706',
              dark: '#B45309',
              contrastText: '#ffffff'
            },
            info: {
              light: '#3B82F6',
              main: '#2563EB',
              dark: '#1D4ED8',
              contrastText: '#ffffff'
            }
          },
          gradients: {
            primary: {
              type: 'linear',
              direction: '135deg',
              stops: [
                { color: n8nResult.result?.walletStyle?.accentColor || '#9945FF', position: '0%' },
                { color: '#764ba2', position: '100%' }
              ]
            },
            secondary: {
              type: 'linear',
              direction: '90deg',
              stops: [
                { color: '#6B7280', position: '0%' },
                { color: '#4B5563', position: '100%' }
              ]
            },
            accent: {
              type: 'radial',
              direction: 'circle',
              stops: [
                { color: n8nResult.result?.walletStyle?.accentColor || '#9945FF', position: '0%' },
                { color: '#764ba2', position: '100%' }
              ]
            },
            background: {
              type: 'linear',
              direction: '180deg',
              stops: [
                { color: n8nResult.result?.walletStyle?.backgroundColor || '#131313', position: '0%' },
                { color: '#000000', position: '100%' }
              ]
            }
          }
        },
        borders: {
          radiusScale: {
            none: '0px',
            sm: '4px',
            md: n8nResult.result?.walletStyle?.borderRadius || '8px',
            lg: '12px',
            xl: '16px',
            full: '9999px'
          },
          widthScale: {
            none: '0px',
            thin: '1px',
            medium: '2px',
            thick: '4px'
          },
          styles: {
            default: {
              width: '1px',
              style: 'solid',
              color: 'rgba(255,255,255,0.1)',
              radius: { all: n8nResult.result?.walletStyle?.borderRadius || '8px' }
            },
            focus: {
              width: '2px',
              style: 'solid',
              color: n8nResult.result?.walletStyle?.accentColor || '#9945FF',
              radius: { all: n8nResult.result?.walletStyle?.borderRadius || '8px' }
            },
            error: {
              width: '1px',
              style: 'solid',
              color: '#EF4444',
              radius: { all: n8nResult.result?.walletStyle?.borderRadius || '8px' }
            },
            success: {
              width: '1px',
              style: 'solid',
              color: '#10B981',
              radius: { all: n8nResult.result?.walletStyle?.borderRadius || '8px' }
            }
          }
        },
        shadows: {
          elevation: {
            none: { offsetX: '0px', offsetY: '0px', blurRadius: '0px', color: 'transparent' },
            sm: { offsetX: '0px', offsetY: '1px', blurRadius: '3px', color: 'rgba(0,0,0,0.1)' },
            md: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            lg: { offsetX: '0px', offsetY: '8px', blurRadius: '24px', color: 'rgba(0,0,0,0.3)' },
            xl: { offsetX: '0px', offsetY: '12px', blurRadius: '32px', color: 'rgba(0,0,0,0.4)' },
            '2xl': { offsetX: '0px', offsetY: '20px', blurRadius: '40px', color: 'rgba(0,0,0,0.5)' }
          },
          colors: {
            default: 'rgba(0,0,0,0.25)',
            colored: n8nResult.result?.walletStyle?.accentColor ? `${n8nResult.result.walletStyle.accentColor}40` : 'rgba(153,69,255,0.25)',
            inset: 'rgba(0,0,0,0.1)'
          },
          styles: {
            button: { offsetX: '0px', offsetY: '4px', blurRadius: '12px', color: 'rgba(0,0,0,0.25)' },
            card: { offsetX: '0px', offsetY: '2px', blurRadius: '8px', color: 'rgba(0,0,0,0.1)' },
            dropdown: { offsetX: '0px', offsetY: '8px', blurRadius: '24px', color: 'rgba(0,0,0,0.3)' },
            modal: { offsetX: '0px', offsetY: '20px', blurRadius: '40px', color: 'rgba(0,0,0,0.5)' }
          }
        },
        spacing: {
          scale: {
            xs: '4px',
            sm: '8px',
            md: '16px',
            lg: '24px',
            xl: '32px',
            '2xl': '48px',
            '3xl': '64px'
          },
          layouts: {
            container: { all: '16px' },
            section: { all: '24px' },
            component: { all: '12px' },
            element: { all: '8px' }
          }
        },
        animations: {
          durations: {
            instant: '0ms',
            fast: '150ms',
            normal: '300ms',
            slow: '500ms',
            slower: '750ms'
          },
          easings: {
            linear: 'linear',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          },
          transitions: {
            fade: { name: 'fade', duration: '300ms', timingFunction: 'ease-in-out' },
            slide: { name: 'slide', duration: '300ms', timingFunction: 'ease-out' },
            scale: { name: 'scale', duration: '200ms', timingFunction: 'ease-in-out' },
            rotate: { name: 'rotate', duration: '400ms', timingFunction: 'ease-in-out' }
          }
        }
      },
      dropdownMenus: {
        accountDropdown: {
          container: {
            background: { color: 'rgba(24,24,24,0.95)' },
            border: { radius: { all: '16px' }, width: '1px', style: 'solid', color: 'rgba(255,255,255,0.1)' },
            shadow: { offsetX: '0px', offsetY: '20px', blurRadius: '40px', color: 'rgba(0,0,0,0.5)' },
            size: {},
            padding: { all: '8px' },
            layout: { display: 'flex', flexDirection: 'column' }
          },
          backdrop: {
            color: 'rgba(0,0,0,0.5)',
            blur: '4px',
            opacity: 0.8
          },
          header: {
            background: { color: 'transparent' },
            text: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
            },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            padding: { all: '12px' }
          },
          items: {
            background: { color: 'transparent' },
            text: {
              fontSize: '14px',
              fontWeight: 'normal',
              color: n8nResult.result?.walletStyle?.textColor || '#ffffff'
            },
            border: { width: '0px', style: 'solid', color: 'transparent' },
            states: {
              default: {},
              hover: {},
              selected: {},
              disabled: {}
            },
            padding: { all: '12px' }
          }
        }
      }
    };

    return {
      success: true,
      result: {
        appliedCustomization: customizationData,
        excludedElements: ['logo', 'aiPet', 'aiPetContainer', 'brandLogo', 'companyLogo'],
        warnings: n8nResult.warnings || [],
        performance: {
          elementsProcessed: Object.keys(customizationData.walletScreen || {}).length + 
                            Object.keys(customizationData.loginScreen || {}).length + 
                            Object.keys(customizationData.global || {}).length,
          processingTime: n8nResult.processingTime || 0
        }
      },
      timestamp
    };
  }
}

// Enhanced N8N Conductor with Database Integration
class N8NConductor {
  private n8nWebhookUrl: string;
  
  constructor() {
    this.n8nWebhookUrl = 'https://wacocu.app.n8n.cloud/webhook/wallet-customizer-v2';
    log('N8NConductor', 'INFO', 'N8NConductor initialized', { 
      hasWebhookUrl: !!this.n8nWebhookUrl 
    });
  }

  // Create comprehensive N8N payload with database integration
  async createComprehensivePayload(params: {
    sessionId: string,
    walletId: string,
    imageData: string,
    customPrompt: string,
    walletStructureAnalysis?: any,
    imageAnalysis?: any
  }) {
    log('N8NConductor', 'INFO', 'Creating comprehensive N8N payload', { sessionId: params.sessionId });

    const { sessionId, walletId, imageData, customPrompt, walletStructureAnalysis, imageAnalysis } = params;

    // Build comprehensive payload structure
    const comprehensivePayload = {
      // Session and metadata
      sessionId,
      timestamp: new Date().toISOString(),
      processingMode: 'full_customization_v2',
      
      // Wallet analysis from database
      walletAnalysis: walletStructureAnalysis ? {
        loginScreen: {
          uiStructure: walletStructureAnalysis.ui_structure,
          functionalContext: walletStructureAnalysis.functional_context,
          generationContext: walletStructureAnalysis.generation_context,
          safeZones: walletStructureAnalysis.safe_zones,
          colorPalette: walletStructureAnalysis.color_palette,
          typography: walletStructureAnalysis.typography,
          interactivity: walletStructureAnalysis.interactivity
        },
        metadata: {
          walletType: walletStructureAnalysis.wallet_type,
          screenType: walletStructureAnalysis.screen_type,
          version: walletStructureAnalysis.version
        }
      } : {
        // Fallback wallet structure
        loginScreen: {
          uiStructure: { layout: { type: "login" } },
          functionalContext: { purpose: "Wallet authentication" },
          generationContext: { promptEnhancement: "Create a modern wallet login interface" },
          safeZones: { criticalElements: ["login button", "input fields"] },
          colorPalette: { primary: "#9945FF", background: "#131313" },
          typography: { fontFamily: "Inter, sans-serif" },
          interactivity: { buttons: [], inputs: [] }
        },
        metadata: {
          walletType: walletId || 'phantom',
          screenType: 'login',
          version: '1.0'
        }
      },

      // Image analysis from cache or new analysis
      imageAnalysis: imageAnalysis ? {
        colorPalette: imageAnalysis.analysis_result?.colorPalette || {},
        mood: imageAnalysis.analysis_result?.mood || "modern",
        style: imageAnalysis.analysis_result?.style || "professional",
        composition: imageAnalysis.analysis_result?.composition || {},
        dominantColors: imageAnalysis.analysis_result?.dominantColors || [],
        metadata: {
          imageHash: imageAnalysis.image_hash,
          analysisVersion: imageAnalysis.analysis_version,
          cacheAge: new Date().getTime() - new Date(imageAnalysis.created_at).getTime()
        }
      } : {
        // Placeholder for new analysis
        colorPalette: {},
        mood: "unknown",
        style: "unknown",
        composition: {},
        dominantColors: [],
        metadata: {
          requiresAnalysis: true
        }
      },

      // Customization context
      customizationContext: {
        userPrompt: customPrompt,
        stylePreferences: {
          modern: true,
          professional: true,
          accessible: true
        },
        preserveElements: [
          "logo", "aiPet", "aiPetContainer", "brandLogo", "companyLogo",
          "login button", "input fields", "navigation elements"
        ],
        customizationPriority: [
          "colors", "typography", "spacing", "effects", "animations"
        ]
      },

      // Raw data for processing
      imageData,
      
      // Processing configuration
      processingConfig: {
        learningEnabled: true,
        qualityChecks: true,
        preserveAccessibility: true,
        generateAlternatives: false
      },

      // Request metadata
      requestMetadata: {
        source: 'edge_function_v2',
        userAgent: 'wallet-ai-customizer/2.0',
        startTime: Date.now(),
        databaseIntegration: true
      }
    };

    log('N8NConductor', 'INFO', 'Comprehensive payload created', {
      sessionId,
      hasWalletAnalysis: !!walletStructureAnalysis,
      hasImageAnalysis: !!imageAnalysis,
      payloadSize: JSON.stringify(comprehensivePayload).length
    });

    return comprehensivePayload;
  }
  
  async triggerCustomization(payload: any) {
    log('TriggerCustomization', 'INFO', 'Starting N8N customization process', {
      sessionId: payload.sessionId,
      walletId: payload.walletId || payload.walletAnalysis?.metadata?.walletType,
      hasImage: !!payload.imageData,
      webhookUrl: this.n8nWebhookUrl,
      hasComprehensiveData: !!(payload.walletAnalysis && payload.imageAnalysis)
    });
    
    const startTime = Date.now();
    
    try {
      // ИСПРАВЛЕНИЕ 1: Правильный payload для n8n
      const n8nPayload = {
        sessionId: payload.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        walletStructure: payload.walletStructure || {
          type: payload.walletId || 'phantom',
          elements: payload.walletElements || [],
          metadata: {
            walletId: payload.walletId || 'default',
            version: '1.0'
          }
        },
        imageData: payload.imageData,
        customPrompt: payload.customPrompt || 'Create a modern and professional wallet design',
        processingMode: 'full_customization',
        learningEnabled: true,
        requestSource: 'edge_function',
        userAgent: 'wallet-ai-customizer/1.0',
        startTime: Date.now()
      };
      
      // ИСПРАВЛЕНИЕ 2: Валидация данных ПЕРЕД отправкой в n8n
      console.log('🔍 Validating payload for n8n:', {
        hasSessionId: !!n8nPayload.sessionId,
        hasWalletStructure: !!n8nPayload.walletStructure,
        hasImageData: !!n8nPayload.imageData,
        imageDataType: typeof n8nPayload.imageData,
        imageDataLength: n8nPayload.imageData?.length || 0
      });

      // Проверяем обязательные поля
      if (!n8nPayload.sessionId) {
        console.error('❌ Missing sessionId for n8n');
        return {
          success: false,
          error: 'Missing sessionId'
        };
      }

      if (!n8nPayload.walletStructure) {
        console.error('❌ Missing walletStructure for n8n');
        return {
          success: false,
          error: 'Missing walletStructure'
        };
      }

      if (!n8nPayload.imageData) {
        console.error('❌ Missing imageData for n8n');
        return {
          success: false,
          error: 'Missing imageData'
        };
      }

      // ИСПРАВЛЕНИЕ 3: Исправить обработку imageData
      let processedImageData = n8nPayload.imageData;

      if (typeof processedImageData !== 'string') {
        console.log('🔄 Converting imageData to base64...');
        // Конвертируем в base64 если это не строка
        if (processedImageData instanceof ArrayBuffer) {
          processedImageData = btoa(String.fromCharCode(...new Uint8Array(processedImageData)));
        } else if (typeof processedImageData === 'object') {
          processedImageData = JSON.stringify(processedImageData);
        }
      }

      // Обновляем payload
      n8nPayload.imageData = processedImageData;
      console.log('✅ ImageData processed, length:', processedImageData.length);
      
      // Detailed logging before request
      console.log('🚀 Starting n8n request at:', new Date().toISOString());
      console.log('📊 Request payload size:', JSON.stringify(n8nPayload).length, 'bytes');
      console.log('🚀 SENDING TO N8N:', this.n8nWebhookUrl);
      console.log('📦 PAYLOAD PREVIEW:', {
        sessionId: n8nPayload.sessionId,
        walletType: n8nPayload.walletStructure?.type, 
        hasImage: !!n8nPayload.imageData,
        imageSize: n8nPayload.imageData?.length || 0,
        prompt: n8nPayload.customPrompt
      });
      
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': payload.sessionId
        },
        body: JSON.stringify(n8nPayload),
        signal: AbortSignal.timeout(240000) // 4 minutes
      });
      
      // Detailed logging after response
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log('✅ n8n response received at:', new Date().toISOString());
      console.log('⏱️  Total request duration:', duration, 'seconds');
      console.log('📦 Response size:', response.headers.get('content-length') || 'unknown', 'bytes');
      console.log('🔍 Response status:', response.status, response.statusText);
      console.log('📡 N8N RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ n8n error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500) // первые 500 символов
        });
        
        // Если это ошибка валидации от n8n
        if (errorText.includes('Missing required fields')) {
          console.error('🚨 N8N VALIDATION ERROR: Check payload format!');
          console.error('📋 Sent payload keys:', Object.keys(n8nPayload));
        }
        
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📨 N8N RESPONSE DATA:', result);
      
      log('TriggerCustomization', 'INFO', 'N8N customization completed', {
        sessionId: payload.sessionId,
        duration: `${duration}s`,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('❌ n8n request failed after', duration, 'seconds');
      console.error('🔍 Error type:', error.name);
      console.error('📝 Error message:', error.message);
      
      // Special timeout handling
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.error('⏰ TIMEOUT ERROR: n8n workflow took too long');
        console.error('🔧 Suggestion: n8n workflow took', duration, 'seconds, increase timeout or optimize workflow');
      }
      
      log('TriggerCustomization', 'ERROR', 'N8N customization failed', {
        sessionId: payload.sessionId,
        duration: `${duration}s`,
        error: error.message,
        errorType: error.name
      });
      
      return {
        success: false,
        sessionId: payload.sessionId,
        error: error.name === 'AbortError' ? 'AI processing timeout' : 'N8N customization temporarily unavailable',
        details: `Request failed after ${duration}s. ${error.name === 'AbortError' ? 'n8n workflow may be taking too long.' : error.message}`,
        timestamp: new Date().toISOString(),
        debugInfo: {
          errorType: error.name,
          duration: duration,
          maxTimeout: 240
        }
      };
    }
  }
}

class WalletAPIClient {
  async getWalletStructure(walletId: string) {
    log('WalletAPI', 'INFO', 'Getting wallet structure', { walletId });
    return { 
      walletId, 
      structure: 'mock_structure',
      metadata: {
        totalCustomizableElements: 0,
        totalScreens: 0
      }
    };
  }
}

class ImageProcessor {
  async processUploadedImage(file: File) {
    log('ImageProcessor', 'INFO', 'Processing image', { fileName: file.name, size: file.size });
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      Array.from(new Uint8Array(arrayBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    return {
      base64Data: `data:${file.type};base64,${base64}`,
      imageSize: file.size,
      format: file.type
    };
  }
}

class LearningCollector {
  async collectUserSession(data: any) {
    log('LearningCollector', 'INFO', 'Collecting user session', data);
  }
  
  async saveUserRating(sessionId: string, rating: number, feedback: string) {
    log('LearningCollector', 'INFO', 'Saving user rating', { sessionId, rating, feedback });
  }
}

class NFTStub {
  async prepareMetadata(sessionId: string) {
    log('NFTStub', 'INFO', 'Preparing NFT metadata', { sessionId });
    return { success: true, metadata: 'mock_nft_data' };
  }
}

class ValidationService {
  async validateCustomizeRequest(data: any) {
    log('ValidationService', 'INFO', 'Validating request', data);
    if (!data.walletId || !data.imageUrl) {
      return { valid: false, error: 'Missing walletId or imageUrl' };
    }
    return { valid: true };
  }
}

// Initialize services with working stub classes
const walletAPI = new WalletAPIClient();
const imageProcessor = new ImageProcessor();
const n8nConductor = new N8NConductor();
const learningCollector = new LearningCollector();
const nftStub = new NFTStub();
const validator = new ValidationService();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log('Router', 'INFO', `Processing request: ${req.method} ${req.url}`);

    const url = new URL(req.url);
    
    // Route based on path for better organization
    switch (url.pathname) {
      case '/':
      case '/customize':
        if (req.method === 'POST') {
          return await handleCustomizeWallet(req);
        }
        break;
        
      case '/customize-with-api':
        if (req.method === 'POST') {
          return await handleCustomizeWithAPI(req);
        }
        break;
        
      case '/health':
        return await handleHealth(req);
        
      case '/prepare-nft':
        if (req.method === 'GET') {
          return await handleNFTPrepare(req);
        }
        break;
        
      default:
        // Fallback to method-based routing for backward compatibility
        switch (req.method) {
          case 'POST':
            return await handleCustomizeWallet(req);
          case 'GET':
            if (url.searchParams.has('health')) {
              return await handleHealth(req);
            }
            if (url.searchParams.has('sessionId')) {
              return await handleNFTPrepare(req);
            }
            return await handleHealth(req);
          default:
            return new Response(
              JSON.stringify({
                error: 'Method Not Allowed',
                allowedMethods: ['POST', 'GET', 'OPTIONS'],
                availableEndpoints: [
                  '/customize - POST: Original image-based customization',
                  '/customize-with-api - POST: Direct API schema customization',
                  '/health - GET: Health check',
                  '/prepare-nft - GET: NFT preparation'
                ]
              }),
              { 
                status: 405, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
        }
    }
  } catch (error) {
    log('Router', 'ERROR', 'Unhandled error', { error: error.message });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// NEW: Direct API Schema Customization Handler
async function handleCustomizeWithAPI(req: Request) {
  const sessionId = crypto.randomUUID();
  log('CustomizeWithAPI', 'INFO', 'Starting direct API customization', { sessionId });
  
  try {
    // Parse JSON request body (not FormData)
    const requestBody = await req.json();
    const { customization, options = {} } = requestBody;
    
    log('CustomizeWithAPI', 'INFO', 'Received API customization data', {
      sessionId,
      hasLoginScreen: !!customization?.loginScreen,
      hasWalletScreen: !!customization?.walletScreen,
      hasGlobal: !!customization?.global,
      options
    });
    
    // Validate the customization data against API schema
    const validation = APISchemaConverter.validateCustomizationData(customization);
    
    if (!validation.isValid) {
      log('CustomizeWithAPI', 'ERROR', 'Validation failed', { 
        sessionId, 
        errors: validation.errors 
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: validation.errors,
          warnings: validation.warnings,
          sessionId,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log validation warnings if any
    if (validation.warnings.length > 0) {
      log('CustomizeWithAPI', 'WARN', 'Validation warnings', { 
        sessionId, 
        warnings: validation.warnings 
      });
    }

    // Convert API format to store format for compatibility
    const storeFormat = APISchemaConverter.convertToStoreFormat(customization);
    
    log('CustomizeWithAPI', 'INFO', 'Converted to store format', {
      sessionId,
      storeFormat: Object.keys(storeFormat)
    });

    // Create a mock N8N result in the expected format
    const mockN8NResult = {
      success: true,
      result: storeFormat,
      sessionId,
      processingTime: 0.1,
      warnings: validation.warnings,
      timestamp: new Date().toISOString()
    };

    // Convert to full API response format
    const apiResponse = APISchemaConverter.convertFromN8NResult(mockN8NResult);
    
    log('CustomizeWithAPI', 'INFO', 'API customization completed', { 
      sessionId,
      elementsProcessed: apiResponse.result?.performance?.elementsProcessed || 0
    });
    
    return new Response(
      JSON.stringify(apiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    log('CustomizeWithAPI', 'ERROR', 'API customization failed', { 
      sessionId, 
      error: error.message 
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        sessionId,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// MODIFIED: Enhanced customization handler with database integration
async function handleCustomizeWallet(req: Request) {
  const sessionId = crypto.randomUUID();
  log('CustomizeWallet', 'INFO', 'Starting enhanced wallet customization', { sessionId });
  
  try {
    // Parse form data
    const formData = await req.formData();
    const walletId = formData.get('walletId') as string || 'phantom';
    const imageUrl = formData.get('imageUrl') as string;
    const customPrompt = formData.get('customPrompt') as string || '';
    
    log('CustomizeWallet', 'INFO', 'Received form data', { walletId, imageUrl, customPrompt });

    // STAGE 2: Database Integration Steps
    
    // Step 1: Get wallet structure from database
    const walletStructureAnalysis = await DatabaseIntegration.getWalletStructureAnalysis(walletId, 'login');
    
    // Step 2: Check image analysis cache
    const imageHash = await DatabaseIntegration.generateImageHash(imageUrl);
    let imageAnalysis = await DatabaseIntegration.getImageAnalysisFromCache(imageUrl, imageHash);
    
    // Step 3: Create customization result entry
    const customizationEntry = await DatabaseIntegration.createCustomizationResult(
      sessionId, 
      walletStructureAnalysis?.id, 
      imageAnalysis?.id
    );

    // Step 4: Create comprehensive N8N payload
    const comprehensivePayload = await n8nConductor.createComprehensivePayload({
      sessionId,
      walletId,
      imageData: imageUrl,
      customPrompt,
      walletStructureAnalysis,
      imageAnalysis
    });

    // Step 5: Save N8N payload to database
    if (customizationEntry) {
      await DatabaseIntegration.updateCustomizationResult(customizationEntry.id, {
        n8nPayload: comprehensivePayload,
        status: 'processing'
      });
    }

    // Step 6: Trigger N8N with comprehensive data
    const n8nResult = await n8nConductor.triggerCustomization(comprehensivePayload);

    // Step 7: Update database with results
    if (customizationEntry && n8nResult) {
      await DatabaseIntegration.updateCustomizationResult(customizationEntry.id, {
        n8nResult: n8nResult,
        status: n8nResult.success ? 'completed' : 'failed',
        processingTimeMs: Date.now() - comprehensivePayload.requestMetadata.startTime,
        customizationData: n8nResult.result || {}
      });
    }

    // Step 8: Convert to API response format
    const apiResponse = APISchemaConverter.convertFromN8NResult(n8nResult);

    log('CustomizeWallet', 'INFO', 'Enhanced customization completed', { 
      sessionId, 
      success: apiResponse.success,
      databaseIntegration: true
    });

    return new Response(JSON.stringify(apiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    log('CustomizeWallet', 'ERROR', 'Enhanced customization failed', { 
      sessionId, 
      error: error.message 
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      sessionId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
    
  } catch (error) {
    log('CustomizeWallet', 'ERROR', 'Customization failed', { 
      sessionId, 
      error: error.message 
    });
    
    // Improved error response for timeout cases
    const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout ? 'AI processing timeout' : error.message,
        details: isTimeout ? 'Request failed due to timeout. n8n workflow may be taking too long.' : undefined,
        sessionId,
        timestamp: new Date().toISOString(),
        debugInfo: isTimeout ? {
          errorType: error.name,
          maxTimeout: 240
        } : undefined
      }),
      { 
        status: isTimeout ? 408 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleRateResult(req: Request) {
  log('RateResult', 'INFO', 'Processing user rating');
  
  try {
    const { sessionId, rating, feedback } = await req.json();
    
    await learningCollector.saveUserRating(sessionId, rating, feedback);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    log('RateResult', 'ERROR', 'Failed to save rating', { error: error.message });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleNFTPrepare(req: Request) {
  log('NFTPrepare', 'INFO', 'Preparing NFT metadata');
  
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sessionId required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const nftData = await nftStub.prepareMetadata(sessionId);
    
    return new Response(
      JSON.stringify(nftData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    log('NFTPrepare', 'ERROR', 'NFT preparation failed', { error: error.message });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleHealth(req: Request) {
  log('Health', 'INFO', 'Health check requested');
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        walletAPI: 'ready',
        imageProcessor: 'ready',
        n8nConductor: 'ready',
        learningCollector: 'ready',
        nftStub: 'ready'
      }
    };
    
    return new Response(
      JSON.stringify(health),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
