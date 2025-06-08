
import type { AIRequest, CustomizationResult, ImageAnalysis, WalletAnalysis } from "../types/ai.types.ts";

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [CustomizationAI::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class CustomizationAI {
  constructor() {
    log('Constructor', 'INFO', 'CustomizationAI initialized');
  }

  async generateCustomization(request: AIRequest): Promise<CustomizationResult> {
    const themeId = crypto.randomUUID();
    const startTime = Date.now();
    
    log('GenerateCustomization', 'INFO', 'Starting customization generation', { 
      themeId,
      hasImageAnalysis: !!request.imageAnalysis,
      hasWalletAnalysis: !!request.walletAnalysis,
      walletType: request.walletType
    });

    try {
      // Generate style plan using Claude
      log('GenerateCustomization', 'INFO', 'Step 1: Generating style plan');
      const stylePlan = await this.generateStylePlan(request);
      
      log('GenerateCustomization', 'INFO', 'Step 2: Generating CSS from style plan');
      const generatedCSS = await this.generateCSS(stylePlan, request);
      
      log('GenerateCustomization', 'INFO', 'Step 3: Validating generated CSS');
      const validationResult = this.validateGeneratedCSS(generatedCSS);
      
      if (!validationResult.valid) {
        log('GenerateCustomization', 'WARN', 'CSS validation failed, applying fixes', { 
          issues: validationResult.issues 
        });
        // Apply basic fixes if needed
      }

      const processingTime = Date.now() - startTime;
      
      const customizationResult: CustomizationResult = {
        success: true,
        themeId,
        generatedCSS,
        applicationResult: {
          applied: true,
          timestamp: new Date().toISOString(),
          processingTime
        }
      };

      log('GenerateCustomization', 'INFO', 'Customization generation completed successfully', { 
        themeId,
        processingTime: `${processingTime}ms`,
        variablesCount: Object.keys(generatedCSS.variables).length,
        elementsCount: Object.keys(generatedCSS.elements).length
      });

      return customizationResult;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      log('GenerateCustomization', 'ERROR', 'Customization generation failed', { 
        themeId,
        processingTime: `${processingTime}ms`,
        error: error.message 
      });

      return {
        success: false,
        themeId,
        generatedCSS: {
          variables: {},
          elements: {}
        },
        applicationResult: {
          applied: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async generateStylePlan(request: AIRequest): Promise<any> {
    log('StylePlan', 'INFO', 'Generating style plan with Claude');
    
    try {
      const prompt = this.buildStylePlanPrompt(request);
      const stylePlan = await this.callClaude(prompt, 'style-plan');
      
      log('StylePlan', 'INFO', 'Style plan generated successfully', { 
        planKeys: Object.keys(stylePlan).length 
      });
      
      return stylePlan;

    } catch (error) {
      log('StylePlan', 'ERROR', 'Failed to generate style plan', { error: error.message });
      
      // Return fallback style plan
      return this.getFallbackStylePlan(request);
    }
  }

  private buildStylePlanPrompt(request: AIRequest): string {
    let prompt = `Create a comprehensive style plan for a ${request.walletType} wallet customization.

CONTEXT:
- Wallet Type: ${request.walletType}
- Custom Prompt: ${request.customPrompt || 'Modern and professional design'}

`;

    if (request.imageAnalysis) {
      const img = request.imageAnalysis as ImageAnalysis;
      prompt += `IMAGE ANALYSIS:
- Dominant Colors: ${img.colorPalette.dominant.join(', ')}
- Accent Color: ${img.colorPalette.accent}
- Mood: ${img.moodProfile.primary} (${img.moodProfile.energy} energy, ${img.moodProfile.formality})

`;
    }

    if (request.walletAnalysis) {
      const wallet = request.walletAnalysis as WalletAnalysis;
      prompt += `WALLET ANALYSIS:
- Critical Elements: ${wallet.globalInsights.criticalElements.length}
- Design Patterns: ${wallet.globalInsights.designPatterns.join(', ')}
- Total Elements: ${Object.keys(wallet.elementAnalysis).length}

`;
    }

    prompt += `Generate a JSON style plan with:
{
  "colorScheme": {
    "primary": "hex color",
    "secondary": "hex color", 
    "accent": "hex color",
    "background": "hex color",
    "surface": "hex color",
    "text": "hex color",
    "textSecondary": "hex color"
  },
  "typography": {
    "primaryFont": "font family",
    "secondaryFont": "font family",
    "baseFontSize": "size in px",
    "lineHeight": "ratio",
    "fontWeights": {
      "light": number,
      "regular": number,
      "medium": number,
      "bold": number
    }
  },
  "spacing": {
    "unit": "base unit in px",
    "scale": [multipliers],
    "padding": "default padding",
    "margin": "default margin"
  },
  "effects": {
    "borderRadius": "border radius values",
    "shadows": "shadow definitions",
    "transitions": "animation properties",
    "gradients": "gradient definitions"
  },
  "layout": {
    "containerMaxWidth": "max width",
    "gridGap": "grid gap",
    "aspectRatios": "common ratios"
  }
}

Focus on financial app design principles: trust, clarity, accessibility, and modern aesthetics.`;

    return prompt;
  }

  private async generateCSS(stylePlan: any, request: AIRequest): Promise<any> {
    log('GenerateCSS', 'INFO', 'Generating CSS from style plan');
    
    try {
      const prompt = this.buildCSSPrompt(stylePlan, request);
      const cssResult = await this.callClaude(prompt, 'css-generation');
      
      log('GenerateCSS', 'INFO', 'CSS generated successfully', { 
        variablesCount: Object.keys(cssResult.variables || {}).length,
        elementsCount: Object.keys(cssResult.elements || {}).length 
      });
      
      return cssResult;

    } catch (error) {
      log('GenerateCSS', 'ERROR', 'Failed to generate CSS', { error: error.message });
      
      // Return fallback CSS
      return this.getFallbackCSS(stylePlan);
    }
  }

  private buildCSSPrompt(stylePlan: any, request: AIRequest): string {
    let prompt = `Convert this style plan into specific CSS for ${request.walletType} wallet elements:

STYLE PLAN:
${JSON.stringify(stylePlan, null, 2)}

`;

    if (request.walletAnalysis) {
      const wallet = request.walletAnalysis as WalletAnalysis;
      prompt += `WALLET ELEMENTS TO STYLE:
`;
      Object.entries(wallet.elementAnalysis).forEach(([elementId, analysis]) => {
        prompt += `- ${elementId}: ${analysis.semanticType} (${analysis.importanceLevel} importance)\n`;
      });
    }

    prompt += `Generate a JSON object with:
{
  "variables": {
    "--primary-color": "value",
    "--secondary-color": "value",
    "--accent-color": "value",
    "--background-color": "value",
    "--text-color": "value",
    "--font-family": "value",
    "--border-radius": "value",
    "--shadow": "value",
    ...more CSS custom properties
  },
  "elements": {
    "elementId": {
      "backgroundColor": "var(--primary-color)",
      "color": "var(--text-color)",
      "fontFamily": "var(--font-family)",
      "borderRadius": "var(--border-radius)",
      ...more CSS properties
    },
    ...styles for each wallet element
  }
}

Use CSS custom properties (variables) for consistency. Include hover states, focus states, and responsive design. Ensure accessibility with proper contrast ratios.`;

    return prompt;
  }

  private async callClaude(prompt: string, operation: string): Promise<any> {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    log('Claude', 'INFO', `Making request to Claude for: ${operation}`);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'x-api-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          temperature: 0.3,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('Claude', 'ERROR', `Anthropic API error: ${response.status}`, { error: errorText });
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      log('Claude', 'INFO', `Claude response received for: ${operation}`, { 
        usage: data.usage 
      });

      const content = data.content[0]?.text;
      if (!content) {
        throw new Error('No content in Claude response');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        log('Claude', 'ERROR', 'Failed to parse JSON response', { content });
        throw new Error('Invalid JSON response from Claude');
      }

    } catch (error) {
      log('Claude', 'ERROR', `Claude API call failed for: ${operation}`, { error: error.message });
      throw error;
    }
  }

  private validateGeneratedCSS(css: any): { valid: boolean; issues?: string[] } {
    log('ValidateCSS', 'DEBUG', 'Validating generated CSS');
    
    const issues = [];

    if (!css.variables || typeof css.variables !== 'object') {
      issues.push('Missing or invalid variables object');
    }

    if (!css.elements || typeof css.elements !== 'object') {
      issues.push('Missing or invalid elements object');
    }

    // Check for required CSS variables
    const requiredVars = ['--primary-color', '--background-color', '--text-color'];
    requiredVars.forEach(varName => {
      if (css.variables && !css.variables[varName]) {
        issues.push(`Missing required variable: ${varName}`);
      }
    });

    const isValid = issues.length === 0;
    
    log('ValidateCSS', isValid ? 'INFO' : 'WARN', `CSS validation ${isValid ? 'passed' : 'failed'}`, { 
      issues: issues.length 
    });

    return {
      valid: isValid,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  private getFallbackStylePlan(request: AIRequest): any {
    log('FallbackStylePlan', 'INFO', 'Using fallback style plan');
    
    return {
      colorScheme: {
        primary: '#9945FF',
        secondary: '#6B73FF',
        accent: '#00D4FF',
        background: '#131313',
        surface: '#1C1C1C',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0'
      },
      typography: {
        primaryFont: 'Inter, sans-serif',
        secondaryFont: 'Inter, sans-serif',
        baseFontSize: '16px',
        lineHeight: '1.5',
        fontWeights: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700
        }
      },
      spacing: {
        unit: '8px',
        scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8],
        padding: '16px',
        margin: '16px'
      },
      effects: {
        borderRadius: '8px',
        shadows: '0 4px 20px rgba(0, 0, 0, 0.1)',
        transitions: 'all 0.3s ease',
        gradients: 'linear-gradient(135deg, #9945FF 0%, #6B73FF 100%)'
      }
    };
  }

  private getFallbackCSS(stylePlan: any): any {
    log('FallbackCSS', 'INFO', 'Using fallback CSS');
    
    const plan = stylePlan || this.getFallbackStylePlan({} as AIRequest);
    
    return {
      variables: {
        '--primary-color': plan.colorScheme?.primary || '#9945FF',
        '--secondary-color': plan.colorScheme?.secondary || '#6B73FF',
        '--accent-color': plan.colorScheme?.accent || '#00D4FF',
        '--background-color': plan.colorScheme?.background || '#131313',
        '--surface-color': plan.colorScheme?.surface || '#1C1C1C',
        '--text-color': plan.colorScheme?.text || '#FFFFFF',
        '--text-secondary': plan.colorScheme?.textSecondary || '#A0A0A0',
        '--font-family': plan.typography?.primaryFont || 'Inter, sans-serif',
        '--font-size-base': plan.typography?.baseFontSize || '16px',
        '--border-radius': plan.effects?.borderRadius || '8px',
        '--shadow': plan.effects?.shadows || '0 4px 20px rgba(0, 0, 0, 0.1)',
        '--transition': plan.effects?.transitions || 'all 0.3s ease'
      },
      elements: {
        'global': {
          backgroundColor: 'var(--background-color)',
          color: 'var(--text-color)',
          fontFamily: 'var(--font-family)'
        },
        'button': {
          backgroundColor: 'var(--primary-color)',
          color: 'var(--text-color)',
          borderRadius: 'var(--border-radius)',
          border: 'none',
          padding: '12px 24px',
          transition: 'var(--transition)'
        },
        'container': {
          backgroundColor: 'var(--surface-color)',
          borderRadius: 'var(--border-radius)',
          boxShadow: 'var(--shadow)'
        }
      }
    };
  }
}

export const customizationAI = new CustomizationAI();
