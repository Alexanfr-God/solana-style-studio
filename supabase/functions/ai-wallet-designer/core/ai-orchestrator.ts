
import { walletAPIClient } from "./wallet-api-client.ts";
import { learningEngine } from "./learning-engine.ts";
import { walletAnalyzer } from "../ai-agents/wallet-analyzer.ts";
import { imageAnalyzer } from "../ai-agents/image-analyzer.ts";
import { customizationAI } from "../ai-agents/customization-ai.ts";
import { supabaseService } from "../services/supabase-service.ts";
import type { AIRequest, AIResponse } from "../types/ai.types.ts";

export class AIOrchestrator {
  constructor() {
    console.log('🎭 AIOrchestrator initialized');
  }

  async process(request: AIRequest): Promise<AIResponse> {
    console.log('🚀 Processing AI request:', request.type);
    
    try {
      let result;
      
      switch (request.type) {
        case 'wallet_analysis':
          result = await this.processWalletAnalysis(request);
          break;
        case 'image_analysis':
          result = await this.processImageAnalysis(request);
          break;
        case 'style_generation':
          result = await this.processStyleGeneration(request);
          break;
        case 'full_customization':
          result = await this.processFullCustomization(request);
          break;
        default:
          throw new Error(`Unknown request type: ${request.type}`);
      }

      // Learn from the interaction
      await learningEngine.recordInteraction(request, result);

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      };

    } catch (error) {
      console.error('❌ AI Orchestrator error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      };
    }
  }

  private async processWalletAnalysis(request: AIRequest) {
    const walletData = await walletAPIClient.fetchWalletStructure(request.walletType);
    const analysis = await walletAnalyzer.analyzeWallet(walletData);
    await supabaseService.saveAnalysis('wallet', analysis);
    return analysis;
  }

  private async processImageAnalysis(request: AIRequest) {
    const analysis = await imageAnalyzer.analyzeImage(request.imageUrl!);
    await supabaseService.saveAnalysis('image', analysis);
    return analysis;
  }

  private async processStyleGeneration(request: AIRequest) {
    const customization = await customizationAI.generateCustomization(request);
    await supabaseService.saveCustomization(customization);
    return customization;
  }

  private async processFullCustomization(request: AIRequest) {
    // Комплексная кастомизация
    const walletData = await walletAPIClient.fetchWalletStructure(request.walletType);
    const walletAnalysis = await walletAnalyzer.analyzeWallet(walletData);
    
    let imageAnalysis = null;
    if (request.imageUrl) {
      imageAnalysis = await imageAnalyzer.analyzeImage(request.imageUrl);
    }

    const customization = await customizationAI.generateCustomization({
      ...request,
      walletAnalysis,
      imageAnalysis
    });

    await supabaseService.saveFullResult({
      walletAnalysis,
      imageAnalysis,
      customization,
      request
    });

    return {
      walletAnalysis,
      imageAnalysis,
      customization
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
