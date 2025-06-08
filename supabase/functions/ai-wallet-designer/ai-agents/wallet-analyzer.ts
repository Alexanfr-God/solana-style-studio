
import type { WalletStructure } from "../types/wallet.types.ts";
import type { WalletAnalysis, ElementAnalysis } from "../types/ai.types.ts";

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [WalletAnalyzer::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class WalletAnalyzerAI {
  constructor() {
    log('Constructor', 'INFO', 'WalletAnalyzerAI initialized');
  }

  async analyzeWallet(structure: WalletStructure): Promise<WalletAnalysis> {
    const analysisId = crypto.randomUUID();
    const startTime = Date.now();
    
    log('AnalyzeWallet', 'INFO', 'Starting wallet analysis', { 
      analysisId,
      walletType: structure.metadata.walletType,
      totalScreens: structure.metadata.totalScreens,
      totalElements: structure.metadata.totalCustomizableElements
    });

    try {
      // Collect all elements from all screens
      const allElements: { [elementId: string]: any } = {};
      
      structure.screens.forEach((screen, screenIndex) => {
        log('AnalyzeWallet', 'DEBUG', `Processing screen: ${screen.screenId}`, { 
          screenIndex,
          elementsCount: Object.keys(screen.elements).length 
        });
        
        Object.entries(screen.elements).forEach(([elementId, element]) => {
          allElements[`${screen.screenId}_${elementId}`] = {
            ...element,
            screenId: screen.screenId,
            screenPriority: screen.priority
          };
        });
      });

      log('AnalyzeWallet', 'INFO', `Collected ${Object.keys(allElements).length} elements for analysis`);

      // Analyze each element
      const elementAnalysis: { [elementId: string]: ElementAnalysis } = {};
      let processedElements = 0;
      
      for (const [elementId, element] of Object.entries(allElements)) {
        log('AnalyzeElement', 'DEBUG', `Analyzing element: ${elementId}`, { 
          progress: `${processedElements + 1}/${Object.keys(allElements).length}` 
        });
        
        try {
          elementAnalysis[elementId] = await this.analyzeElement(element, elementId);
          processedElements++;
          
          if (processedElements % 5 === 0) {
            log('AnalyzeWallet', 'INFO', `Progress: analyzed ${processedElements}/${Object.keys(allElements).length} elements`);
          }
        } catch (error) {
          log('AnalyzeElement', 'ERROR', `Failed to analyze element: ${elementId}`, { error: error.message });
          // Continue with other elements
        }
      }

      log('AnalyzeWallet', 'INFO', 'Generating global insights');
      const globalInsights = await this.generateGlobalInsights(structure, elementAnalysis);

      const processingTime = Date.now() - startTime;
      
      const walletAnalysis: WalletAnalysis = {
        analysisId,
        confidence: this.calculateOverallConfidence(elementAnalysis),
        processingTime,
        result: {
          elementAnalysis,
          globalInsights,
          metadata: structure.metadata
        },
        elementAnalysis,
        globalInsights
      };

      log('AnalyzeWallet', 'INFO', 'Wallet analysis completed successfully', { 
        analysisId,
        processingTime: `${processingTime}ms`,
        elementsAnalyzed: Object.keys(elementAnalysis).length,
        confidence: walletAnalysis.confidence
      });

      return walletAnalysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      log('AnalyzeWallet', 'ERROR', 'Wallet analysis failed', { 
        analysisId,
        processingTime: `${processingTime}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  private async analyzeElement(element: any, elementId: string): Promise<ElementAnalysis> {
    log('AnalyzeElement', 'DEBUG', `Starting element analysis: ${elementId}`);
    
    try {
      // Use GPT-4 to analyze the element
      const analysis = await this.callGPT4ForElementAnalysis(element, elementId);
      
      const elementAnalysis: ElementAnalysis = {
        semanticType: analysis.semanticType || element.elementType || 'unknown',
        functionalPurpose: analysis.functionalPurpose || 'UI component',
        importanceLevel: this.determineImportanceLevel(element, analysis),
        customizationPotential: {
          colors: analysis.customizationPotential?.colors || true,
          fonts: analysis.customizationPotential?.fonts || true,
          sizes: analysis.customizationPotential?.sizes || true,
          effects: analysis.customizationPotential?.effects || true
        }
      };

      log('AnalyzeElement', 'DEBUG', `Element analysis completed: ${elementId}`, { 
        semanticType: elementAnalysis.semanticType,
        importance: elementAnalysis.importanceLevel 
      });

      return elementAnalysis;

    } catch (error) {
      log('AnalyzeElement', 'ERROR', `Element analysis failed: ${elementId}`, { error: error.message });
      
      // Return fallback analysis
      return {
        semanticType: element.elementType || 'unknown',
        functionalPurpose: 'UI component',
        importanceLevel: 'MEDIUM',
        customizationPotential: {
          colors: true,
          fonts: true,
          sizes: true,
          effects: true
        }
      };
    }
  }

  private async callGPT4ForElementAnalysis(element: any, elementId: string): Promise<any> {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    log('GPT4ElementAnalysis', 'DEBUG', `Calling GPT-4 for element: ${elementId}`);

    const prompt = `Analyze this wallet UI element for customization purposes:

Element ID: ${elementId}
Element Type: ${element.elementType}
Current Styles: ${JSON.stringify(element.currentStyles)}
Screen: ${element.screenId}
AI Instructions: ${JSON.stringify(element.aiInstructions)}

Return a JSON object with:
{
  "semanticType": "button|text|input|container|icon|image|navigation|list",
  "functionalPurpose": "clear description of what this element does",
  "importanceLevel": "CRITICAL|HIGH|MEDIUM|LOW",
  "customizationPotential": {
    "colors": boolean,
    "fonts": boolean,
    "sizes": boolean,
    "effects": boolean
  },
  "recommendations": ["specific customization suggestions"]
}

Consider financial app UI patterns and user experience principles.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a UI/UX expert specializing in financial app design and customization.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.2
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('GPT4ElementAnalysis', 'ERROR', `OpenAI API error: ${response.status}`, { error: errorText });
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      return JSON.parse(content);

    } catch (error) {
      log('GPT4ElementAnalysis', 'ERROR', `GPT-4 element analysis failed: ${elementId}`, { error: error.message });
      throw error;
    }
  }

  private determineImportanceLevel(element: any, analysis: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    // Use AI analysis if available
    if (analysis.importanceLevel) {
      return analysis.importanceLevel;
    }

    // Fallback logic based on element properties
    if (element.aiInstructions?.priority === 'HIGH') return 'HIGH';
    if (element.elementType === 'button') return 'HIGH';
    if (element.elementType === 'text' && element.screenId === 'home') return 'HIGH';
    if (element.elementType === 'container') return 'MEDIUM';
    
    return 'MEDIUM';
  }

  private async generateGlobalInsights(structure: WalletStructure, elementAnalysis: { [elementId: string]: ElementAnalysis }): Promise<any> {
    log('GlobalInsights', 'INFO', 'Generating global wallet insights');
    
    try {
      const criticalElements = Object.entries(elementAnalysis)
        .filter(([_, analysis]) => analysis.importanceLevel === 'CRITICAL')
        .map(([elementId, _]) => elementId);

      const designPatterns = this.identifyDesignPatterns(structure, elementAnalysis);

      const insights = {
        walletType: structure.metadata.walletType,
        designPatterns,
        criticalElements,
        totalCustomizableElements: Object.keys(elementAnalysis).length,
        screenDistribution: this.analyzeScreenDistribution(structure),
        recommendedCustomizationAreas: this.getRecommendedAreas(elementAnalysis)
      };

      log('GlobalInsights', 'INFO', 'Global insights generated', { 
        patternsFound: designPatterns.length,
        criticalElementsCount: criticalElements.length 
      });

      return insights;

    } catch (error) {
      log('GlobalInsights', 'ERROR', 'Failed to generate global insights', { error: error.message });
      
      // Return fallback insights
      return {
        walletType: structure.metadata.walletType,
        designPatterns: ['standard-layout'],
        criticalElements: [],
        totalCustomizableElements: Object.keys(elementAnalysis).length
      };
    }
  }

  private identifyDesignPatterns(structure: WalletStructure, elementAnalysis: { [elementId: string]: ElementAnalysis }): string[] {
    const patterns = [];
    
    // Basic pattern detection
    const hasNavigation = Object.values(elementAnalysis).some(analysis => 
      analysis.semanticType.includes('navigation'));
    
    const hasCardLayout = Object.values(elementAnalysis).some(analysis => 
      analysis.semanticType.includes('container'));
    
    if (hasNavigation) patterns.push('bottom-navigation');
    if (hasCardLayout) patterns.push('card-based-layout');
    if (structure.screens.length > 1) patterns.push('multi-screen');
    
    return patterns.length > 0 ? patterns : ['standard-layout'];
  }

  private analyzeScreenDistribution(structure: WalletStructure): any {
    return structure.screens.reduce((acc, screen) => {
      acc[screen.screenId] = Object.keys(screen.elements).length;
      return acc;
    }, {} as { [screenId: string]: number });
  }

  private getRecommendedAreas(elementAnalysis: { [elementId: string]: ElementAnalysis }): string[] {
    const recommendations = [];
    
    const hasHighImportanceElements = Object.values(elementAnalysis).some(analysis => 
      analysis.importanceLevel === 'HIGH' || analysis.importanceLevel === 'CRITICAL');
    
    if (hasHighImportanceElements) {
      recommendations.push('primary-actions');
    }
    
    recommendations.push('color-scheme', 'typography', 'spacing');
    
    return recommendations;
  }

  private calculateOverallConfidence(elementAnalysis: { [elementId: string]: ElementAnalysis }): number {
    const elementCount = Object.keys(elementAnalysis).length;
    if (elementCount === 0) return 0.5;
    
    // Simple confidence calculation - can be enhanced
    return Math.min(0.9, 0.6 + (elementCount * 0.05));
  }
}

export const walletAnalyzer = new WalletAnalyzerAI();
