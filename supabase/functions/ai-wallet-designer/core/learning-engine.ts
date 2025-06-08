
import { supabaseService } from "../services/supabase-service.ts";
import type { AIRequest, AIResponse, LearningData } from "../types/ai.types.ts";

export class LearningEngine {
  private interactionHistory: LearningData[] = [];

  constructor() {
    console.log('📚 LearningEngine initialized');
  }

  async recordInteraction(request: AIRequest, response: AIResponse): Promise<void> {
    console.log('📝 Recording interaction for learning');
    
    const learningData: LearningData = {
      timestamp: new Date().toISOString(),
      requestType: request.type,
      requestData: request,
      responseData: response,
      success: response.success,
      processingTime: Date.now() - new Date(response.timestamp).getTime(),
      patterns: this.extractPatterns(request, response)
    };

    this.interactionHistory.push(learningData);
    
    // Save to database
    await supabaseService.saveLearningData(learningData);
    
    // Trigger learning analysis if we have enough data
    if (this.interactionHistory.length % 10 === 0) {
      await this.analyzeLearningPatterns();
    }
  }

  async analyzeLearningPatterns(): Promise<void> {
    console.log('🧠 Analyzing learning patterns');
    
    const recentData = this.interactionHistory.slice(-50);
    
    const patterns = {
      successRate: this.calculateSuccessRate(recentData),
      commonRequestTypes: this.getCommonRequestTypes(recentData),
      averageProcessingTime: this.calculateAverageProcessingTime(recentData),
      errorPatterns: this.identifyErrorPatterns(recentData),
      popularWalletTypes: this.getPopularWalletTypes(recentData)
    };

    console.log('📊 Learning patterns identified:', patterns);
    
    await supabaseService.saveAnalysisPatterns(patterns);
  }

  private extractPatterns(request: AIRequest, response: AIResponse): any {
    return {
      walletType: request.walletType,
      hasImage: !!request.imageUrl,
      requestComplexity: this.calculateRequestComplexity(request),
      responseQuality: this.calculateResponseQuality(response)
    };
  }

  private calculateSuccessRate(data: LearningData[]): number {
    if (data.length === 0) return 0;
    const successes = data.filter(d => d.success).length;
    return (successes / data.length) * 100;
  }

  private getCommonRequestTypes(data: LearningData[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    data.forEach(d => {
      counts[d.requestType] = (counts[d.requestType] || 0) + 1;
    });
    return counts;
  }

  private calculateAverageProcessingTime(data: LearningData[]): number {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, d) => sum + d.processingTime, 0);
    return total / data.length;
  }

  private identifyErrorPatterns(data: LearningData[]): any[] {
    return data
      .filter(d => !d.success)
      .map(d => ({
        type: d.requestType,
        error: d.responseData.error,
        timestamp: d.timestamp
      }));
  }

  private getPopularWalletTypes(data: LearningData[]): { [key: string]: number } {
    const counts: { [key: string]: number } = {};
    data.forEach(d => {
      const walletType = d.requestData.walletType;
      if (walletType) {
        counts[walletType] = (counts[walletType] || 0) + 1;
      }
    });
    return counts;
  }

  private calculateRequestComplexity(request: AIRequest): number {
    let complexity = 1;
    if (request.imageUrl) complexity += 2;
    if (request.customPrompt) complexity += 1;
    if (request.type === 'full_customization') complexity += 3;
    return complexity;
  }

  private calculateResponseQuality(response: AIResponse): number {
    if (!response.success) return 0;
    
    let quality = 5;
    if (response.data) {
      const dataKeys = Object.keys(response.data);
      quality += dataKeys.length * 0.5;
    }
    
    return Math.min(quality, 10);
  }
}

export const learningEngine = new LearningEngine();
