
import type { CustomizationResult, AIRequest } from "../types/ai.types.ts";
import type { WalletAnalysis } from "../types/wallet.types.ts";
import { imageAnalyzer } from "./image-analyzer.ts";

export class CustomizationAI {
  private openAIKey: string;

  constructor() {
    this.openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
    console.log('🎨 CustomizationAI initialized');
  }

  async generateCustomization(request: any): Promise<CustomizationResult> {
    console.log('🎨 Generating customization');
    
    try {
      const stylePrompt = await this.buildStylePrompt(request);
      const aiResponse = await this.callStyleGenerationAPI(stylePrompt);
      const cssVariables = this.generateCSSVariables(aiResponse);
      const elementStyles = this.generateElementStyles(request.walletAnalysis, aiResponse);

      return {
        success: true,
        themeId: crypto.randomUUID(),
        generatedCSS: {
          variables: cssVariables,
          elements: elementStyles
        },
        applicationResult: {
          prompt: stylePrompt,
          aiResponse,
          metadata: {
            generatedAt: new Date().toISOString(),
            walletType: request.walletType,
            hasImageAnalysis: !!request.imageAnalysis
          }
        }
      };

    } catch (error) {
      console.error('❌ Customization generation error:', error);
      return this.getFallbackCustomization(request);
    }
  }

  private async buildStylePrompt(request: any): Promise<string> {
    console.log('📝 Building style generation prompt');
    
    let prompt = `Generate CSS styling for a ${request.walletType} wallet interface.`;
    
    // Add wallet analysis context
    if (request.walletAnalysis) {
      const analysis = request.walletAnalysis as WalletAnalysis;
      prompt += ` The wallet has ${Object.keys(analysis.result.elementAnalysis).length} customizable elements.`;
      prompt += ` Critical elements: ${analysis.result.globalInsights.criticalElements.join(', ')}.`;
    }

    // Add image analysis context
    if (request.imageAnalysis) {
      const imageAnalysis = request.imageAnalysis;
      prompt += ` Style inspiration: ${imageAnalysis.moodProfile.primary} mood with ${imageAnalysis.moodProfile.energy} energy.`;
      prompt += ` Color palette: ${imageAnalysis.colorPalette.dominant.join(', ')}.`;
      prompt += ` Accent color: ${imageAnalysis.colorPalette.accent}.`;
    }

    // Add custom prompt
    if (request.customPrompt) {
      prompt += ` Additional requirements: ${request.customPrompt}`;
    }

    prompt += ` Generate CSS custom properties and element-specific styles that create a cohesive, modern design.`;
    prompt += ` Focus on accessibility, usability, and visual hierarchy.`;
    prompt += ` Return response as structured JSON with 'variables' and 'elements' objects.`;

    return prompt;
  }

  private async callStyleGenerationAPI(prompt: string): Promise<any> {
    if (!this.openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert CSS designer specializing in wallet UI customization. Generate clean, modern CSS that follows best practices for accessibility and user experience. Always return valid JSON with CSS properties.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return this.parseTextResponse(content);
    }
  }

  private generateCSSVariables(aiResponse: any): { [key: string]: string } {
    console.log('🎨 Generating CSS variables');
    
    const defaultVariables = {
      '--primary-color': '#3B82F6',
      '--secondary-color': '#1E40AF',
      '--accent-color': '#F59E0B',
      '--background-color': '#FFFFFF',
      '--surface-color': '#F8FAFC',
      '--text-primary': '#1F2937',
      '--text-secondary': '#6B7280',
      '--border-color': '#E5E7EB',
      '--border-radius': '8px',
      '--shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '--shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      '--font-family': 'Inter, system-ui, sans-serif'
    };

    // Merge with AI response if available
    if (aiResponse?.variables) {
      return { ...defaultVariables, ...aiResponse.variables };
    }

    return defaultVariables;
  }

  private generateElementStyles(walletAnalysis: any, aiResponse: any): { [elementId: string]: any } {
    console.log('🎨 Generating element-specific styles');
    
    const elementStyles: { [elementId: string]: any } = {};

    if (walletAnalysis?.result?.elementAnalysis) {
      const elements = walletAnalysis.result.elementAnalysis;
      
      Object.keys(elements).forEach(elementType => {
        const analysis = elements[elementType];
        
        elementStyles[elementType] = this.generateElementStyle(elementType, analysis, aiResponse);
      });
    }

    return elementStyles;
  }

  private generateElementStyle(elementType: string, analysis: any, aiResponse: any): any {
    const baseStyles: { [key: string]: any } = {
      button: {
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        borderRadius: 'var(--border-radius)',
        border: 'none',
        padding: '12px 24px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      text: {
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-family)',
        lineHeight: '1.5'
      },
      background: {
        backgroundColor: 'var(--background-color)',
        backgroundImage: 'linear-gradient(135deg, var(--background-color) 0%, var(--surface-color) 100%)'
      },
      card: {
        backgroundColor: 'var(--surface-color)',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        padding: '16px',
        border: '1px solid var(--border-color)'
      }
    };

    const baseStyle = baseStyles[elementType.toLowerCase()] || {};
    
    // Apply AI-suggested styles if available
    if (aiResponse?.elements?.[elementType]) {
      return { ...baseStyle, ...aiResponse.elements[elementType] };
    }

    return baseStyle;
  }

  private parseTextResponse(content: string): any {
    console.log('📝 Parsing text-based style response');
    
    // Extract CSS properties from text response
    const variables: { [key: string]: string } = {};
    const elements: { [key: string]: any } = {};

    // Simple regex to find CSS custom properties
    const varMatches = content.match(/--[\w-]+:\s*[^;]+/g);
    if (varMatches) {
      varMatches.forEach(match => {
        const [property, value] = match.split(':').map(s => s.trim());
        variables[property] = value;
      });
    }

    return { variables, elements };
  }

  private getFallbackCustomization(request: any): CustomizationResult {
    console.log('🔄 Using fallback customization');
    
    return {
      success: true,
      themeId: crypto.randomUUID(),
      generatedCSS: {
        variables: {
          '--primary-color': '#6366F1',
          '--secondary-color': '#4F46E5',
          '--accent-color': '#F59E0B',
          '--background-color': '#FFFFFF',
          '--surface-color': '#F8FAFC',
          '--text-primary': '#1F2937',
          '--text-secondary': '#6B7280'
        },
        elements: {
          button: {
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderRadius: '8px',
            padding: '12px 24px'
          }
        }
      },
      applicationResult: {
        fallback: true,
        reason: 'AI service unavailable'
      }
    };
  }
}

export const customizationAI = new CustomizationAI();
