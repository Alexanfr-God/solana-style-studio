
import type { WalletStructure, WalletElement, WalletAnalysis } from "../types/wallet.types.ts";
import type { ElementAnalysis } from "../types/ai.types.ts";

export class WalletAnalyzer {
  constructor() {
    console.log('🧠 WalletAnalyzer initialized');
  }

  async analyzeWallet(walletData: WalletStructure): Promise<WalletAnalysis> {
    console.log('🔍 Analyzing wallet structure');
    
    const elementAnalyses: { [elementId: string]: ElementAnalysis } = {};
    
    // Analyze each element
    for (const element of walletData.elements) {
      elementAnalyses[element.elementType] = await this.analyzeElement(element);
    }

    const globalInsights = this.generateGlobalInsights(walletData, elementAnalyses);

    return {
      analysisId: crypto.randomUUID(),
      confidence: this.calculateOverallConfidence(elementAnalyses),
      processingTime: Date.now(),
      result: {
        elementAnalysis: elementAnalyses,
        globalInsights,
        recommendations: this.generateRecommendations(walletData, elementAnalyses)
      }
    };
  }

  private async analyzeElement(element: WalletElement): Promise<ElementAnalysis> {
    console.log('🔍 Analyzing element:', element.elementType);
    
    // Determine semantic type based on element type
    const semanticType = this.determineSemanticType(element.elementType);
    const functionalPurpose = this.determineFunctionalPurpose(element.elementType);
    const importanceLevel = this.determineImportanceLevel(element.elementType);
    
    return {
      semanticType,
      functionalPurpose,
      importanceLevel,
      customizationPotential: {
        colors: this.canCustomizeColors(element),
        fonts: this.canCustomizeFonts(element),
        sizes: this.canCustomizeSizes(element),
        effects: this.canCustomizeEffects(element)
      }
    };
  }

  private determineSemanticType(elementType: string): string {
    const typeMap: { [key: string]: string } = {
      'button': 'interactive',
      'text': 'content',
      'background': 'visual',
      'icon': 'decorative',
      'input': 'interactive',
      'card': 'container',
      'header': 'navigation',
      'footer': 'navigation'
    };
    
    return typeMap[elementType.toLowerCase()] || 'unknown';
  }

  private determineFunctionalPurpose(elementType: string): string {
    const purposeMap: { [key: string]: string } = {
      'button': 'user_action',
      'text': 'information_display',
      'background': 'visual_foundation',
      'icon': 'visual_cue',
      'input': 'data_entry',
      'card': 'content_grouping',
      'header': 'navigation',
      'footer': 'secondary_actions'
    };
    
    return purposeMap[elementType.toLowerCase()] || 'utility';
  }

  private determineImportanceLevel(elementType: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const criticalElements = ['button', 'input', 'header'];
    const highElements = ['text', 'card', 'icon'];
    const mediumElements = ['background', 'footer'];
    
    if (criticalElements.includes(elementType.toLowerCase())) return 'CRITICAL';
    if (highElements.includes(elementType.toLowerCase())) return 'HIGH';
    if (mediumElements.includes(elementType.toLowerCase())) return 'MEDIUM';
    return 'LOW';
  }

  private canCustomizeColors(element: WalletElement): boolean {
    return element.customizable && 
           (element.currentStyles?.backgroundColor !== undefined ||
            element.currentStyles?.color !== undefined);
  }

  private canCustomizeFonts(element: WalletElement): boolean {
    return element.customizable && 
           (element.currentStyles?.fontFamily !== undefined ||
            element.currentStyles?.fontSize !== undefined);
  }

  private canCustomizeSizes(element: WalletElement): boolean {
    return element.customizable && 
           (element.currentStyles?.width !== undefined ||
            element.currentStyles?.height !== undefined);
  }

  private canCustomizeEffects(element: WalletElement): boolean {
    return element.customizable && 
           (element.currentStyles?.borderRadius !== undefined ||
            element.currentStyles?.boxShadow !== undefined);
  }

  private generateGlobalInsights(walletData: WalletStructure, analyses: { [key: string]: ElementAnalysis }) {
    const elementTypes = Object.keys(analyses);
    const criticalElements = elementTypes.filter(type => 
      analyses[type].importanceLevel === 'CRITICAL'
    );

    return {
      walletType: walletData.metadata.walletType,
      designPatterns: this.identifyDesignPatterns(analyses),
      criticalElements,
      customizabilityScore: this.calculateCustomizabilityScore(analyses)
    };
  }

  private identifyDesignPatterns(analyses: { [key: string]: ElementAnalysis }): string[] {
    const patterns: string[] = [];
    
    const interactiveCount = Object.values(analyses)
      .filter(a => a.semanticType === 'interactive').length;
    
    if (interactiveCount > 5) patterns.push('interaction_heavy');
    if (interactiveCount < 3) patterns.push('content_focused');
    
    const colorCustomizable = Object.values(analyses)
      .filter(a => a.customizationPotential.colors).length;
    
    if (colorCustomizable > analyses.length * 0.7) patterns.push('highly_customizable');
    
    return patterns;
  }

  private calculateCustomizabilityScore(analyses: { [key: string]: ElementAnalysis }): number {
    const total = Object.keys(analyses).length;
    if (total === 0) return 0;
    
    const customizable = Object.values(analyses).reduce((sum, analysis) => {
      const potential = analysis.customizationPotential;
      const score = (potential.colors ? 1 : 0) + 
                   (potential.fonts ? 1 : 0) + 
                   (potential.sizes ? 1 : 0) + 
                   (potential.effects ? 1 : 0);
      return sum + score;
    }, 0);
    
    return (customizable / (total * 4)) * 100;
  }

  private calculateOverallConfidence(analyses: { [key: string]: ElementAnalysis }): number {
    const elementCount = Object.keys(analyses).length;
    return Math.min(0.7 + (elementCount * 0.05), 0.95);
  }

  private generateRecommendations(walletData: WalletStructure, analyses: { [key: string]: ElementAnalysis }) {
    const recommendations = [];
    
    const criticalElements = Object.entries(analyses)
      .filter(([_, analysis]) => analysis.importanceLevel === 'CRITICAL')
      .map(([elementType, _]) => elementType);
    
    if (criticalElements.length > 0) {
      recommendations.push({
        type: 'priority',
        message: `Focus on customizing critical elements: ${criticalElements.join(', ')}`,
        elements: criticalElements
      });
    }
    
    const highlyCustomizable = Object.entries(analyses)
      .filter(([_, analysis]) => 
        Object.values(analysis.customizationPotential).filter(Boolean).length > 2
      )
      .map(([elementType, _]) => elementType);
    
    if (highlyCustomizable.length > 0) {
      recommendations.push({
        type: 'opportunity',
        message: `High customization potential: ${highlyCustomizable.join(', ')}`,
        elements: highlyCustomizable
      });
    }
    
    return recommendations;
  }
}

export const walletAnalyzer = new WalletAnalyzer();
