
import { walletAPIClient } from "./wallet-api-client.ts";
import { learningEngine } from "./learning-engine.ts";
import { walletAnalyzer } from "../ai-agents/wallet-analyzer.ts";
import { imageAnalyzer } from "../ai-agents/image-analyzer.ts";
import { customizationAI } from "../ai-agents/customization-ai.ts";
import { supabaseService } from "../services/supabase-service.ts";
import type { AIRequest, AIResponse } from "../types/ai.types.ts";

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [AIOrchestrator::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class AIOrchestrator {
  constructor() {
    log('Constructor', 'INFO', 'AIOrchestrator initialized');
  }

  async process(request: AIRequest): Promise<AIResponse> {
    const requestId = crypto.randomUUID();
    log('Process', 'INFO', `Processing AI request: ${request.type}`, { requestId, request });
    
    const startTime = Date.now();
    
    try {
      let result;
      
      switch (request.type) {
        case 'wallet_analysis':
          log('Process', 'INFO', 'Starting wallet analysis', { requestId });
          result = await this.processWalletAnalysis(request);
          break;
        case 'image_analysis':
          log('Process', 'INFO', 'Starting image analysis', { requestId });
          result = await this.processImageAnalysis(request);
          break;
        case 'style_generation':
          log('Process', 'INFO', 'Starting style generation', { requestId });
          result = await this.processStyleGeneration(request);
          break;
        case 'full_customization':
          log('Process', 'INFO', 'Starting full customization', { requestId });
          result = await this.processFullCustomization(request);
          break;
        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      const duration = Date.now() - startTime;
      log('Process', 'INFO', `AI request completed successfully`, { 
        requestId, 
        type: request.type, 
        duration: `${duration}ms` 
      });

      // Learn from the interaction
      await learningEngine.recordInteraction(request, result);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      log('Process', 'ERROR', `AI request failed`, { 
        requestId, 
        type: request.type, 
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack 
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId
      };
    }
  }

  private async processWalletAnalysis(request: AIRequest) {
    log('WalletAnalysis', 'INFO', `Fetching wallet structure for: ${request.walletType}`);
    
    const walletData = await walletAPIClient.fetchWalletStructure(request.walletType);
    log('WalletAnalysis', 'INFO', 'Wallet structure fetched, starting analysis', { 
      totalElements: walletData.elements?.length || 0,
      totalScreens: walletData.screens?.length || 0 
    });
    
    const analysis = await walletAnalyzer.analyzeWallet(walletData);
    log('WalletAnalysis', 'INFO', 'Wallet analysis completed', { 
      analysisId: analysis.analysisId,
      confidence: analysis.confidence 
    });
    
    await supabaseService.saveAnalysis('wallet', analysis);
    log('WalletAnalysis', 'INFO', 'Analysis saved to database');
    
    return analysis;
  }

  private async processImageAnalysis(request: AIRequest) {
    if (!request.imageUrl) {
      throw new Error('Image URL is required for image analysis');
    }

    log('ImageAnalysis', 'INFO', 'Starting image analysis', { 
      imageUrl: request.imageUrl.substring(0, 50) + '...' 
    });
    
    const analysis = await imageAnalyzer.analyzeImage(request.imageUrl);
    log('ImageAnalysis', 'INFO', 'Image analysis completed', { 
      analysisId: analysis.analysisId,
      confidence: analysis.confidence,
      dominantColors: analysis.colorPalette?.dominant?.length || 0
    });
    
    await supabaseService.saveAnalysis('image', analysis);
    log('ImageAnalysis', 'INFO', 'Analysis saved to database');
    
    return analysis;
  }

  private async processStyleGeneration(request: AIRequest) {
    log('StyleGeneration', 'INFO', 'Starting style generation process');
    
    let walletAnalysis, imageAnalysis;
    
    if (request.walletAnalysis) {
      walletAnalysis = request.walletAnalysis;
      log('StyleGeneration', 'INFO', 'Using provided wallet analysis');
    } else {
      log('StyleGeneration', 'INFO', 'Generating wallet analysis');
      const walletData = await walletAPIClient.fetchWalletStructure(request.walletType);
      walletAnalysis = await walletAnalyzer.analyzeWallet(walletData);
    }
    
    if (request.imageAnalysis) {
      imageAnalysis = request.imageAnalysis;
      log('StyleGeneration', 'INFO', 'Using provided image analysis');
    } else if (request.imageUrl) {
      log('StyleGeneration', 'INFO', 'Generating image analysis');
      imageAnalysis = await imageAnalyzer.analyzeImage(request.imageUrl);
    }

    const customization = await customizationAI.generateCustomization({
      type: request.type,
      walletType: request.walletType,
      customPrompt: request.customPrompt,
      walletAnalysis,
      imageAnalysis
    });

    log('StyleGeneration', 'INFO', 'Style generation completed', { 
      themeId: customization.themeId,
      success: customization.success,
      cssVariablesCount: Object.keys(customization.generatedCSS?.variables || {}).length
    });

    await supabaseService.saveCustomization(customization);
    log('StyleGeneration', 'INFO', 'Customization saved to database');
    
    return customization;
  }

  private async processFullCustomization(request: AIRequest) {
    log('FullCustomization', 'INFO', 'Starting full customization process');
    
    // Get wallet analysis
    log('FullCustomization', 'INFO', 'Step 1: Analyzing wallet structure');
    const walletData = await walletAPIClient.fetchWalletStructure(request.walletType);
    const walletAnalysis = await walletAnalyzer.analyzeWallet(walletData);
    log('FullCustomization', 'INFO', 'Wallet analysis completed', { 
      analysisId: walletAnalysis.analysisId 
    });
    
    // Get image analysis if image provided
    let imageAnalysis = null;
    if (request.imageUrl) {
      log('FullCustomization', 'INFO', 'Step 2: Analyzing image');
      imageAnalysis = await imageAnalyzer.analyzeImage(request.imageUrl);
      log('FullCustomization', 'INFO', 'Image analysis completed', { 
        analysisId: imageAnalysis.analysisId 
      });
    }

    // Generate customization
    log('FullCustomization', 'INFO', 'Step 3: Generating customization');
    const customization = await customizationAI.generateCustomization({
      ...request,
      walletAnalysis,
      imageAnalysis
    });
    log('FullCustomization', 'INFO', 'Customization generated', { 
      themeId: customization.themeId 
    });

    const fullResult = {
      walletAnalysis,
      imageAnalysis,
      customization
    };

    await supabaseService.saveFullResult({
      ...fullResult,
      request
    });
    log('FullCustomization', 'INFO', 'Full result saved to database');

    return fullResult;
  }
}

export const aiOrchestrator = new AIOrchestrator();
