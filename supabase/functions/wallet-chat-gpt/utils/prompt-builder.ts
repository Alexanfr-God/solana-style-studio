// ====== Enhanced utils/prompt-builder.ts ======
import type { WalletContext, WalletElement } from '../types/wallet.ts';
import type { StyleAnalysisResponse } from '../types/responses.ts';

export interface PromptConfig {
  type: 'customization' | 'analysis' | 'generation' | 'chat' | 'tutorial';
  context: WalletContext;
  userRequest: string;
  imageUrl?: string;
  targetElement?: string;
  stylePreferences?: any;
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export interface WowEffectConfig {
  effectType: 'cyberpunk' | 'luxury' | 'neon' | 'cosmic' | 'minimal' | 'retro' | 'gaming' | 'professional';
  intensity: 'subtle' | 'medium' | 'dramatic' | 'extreme';
  targetElements: string[];
  preserveUsability: boolean;
  nftReady: boolean;
}

/**
 * Detect user's language from their input
 */
export function detectUserLanguage(userInput: string): string {
  if (!userInput || userInput.trim().length === 0) {
    return 'en'; // Default to English
  }

  // Simple language detection based on common words and patterns
  const russianPatterns = [
    /[а-яё]/i, // Cyrillic characters
    /\b(привет|здравствуй|спасибо|пожалуйста|да|нет|как|что|где|когда|почему|создай|сделай|измени|добавь|удали)\b/i
  ];

  const englishPatterns = [
    /\b(hello|hi|thanks|thank you|please|yes|no|how|what|where|when|why|create|make|change|add|remove|delete|set|update)\b/i
  ];

  const hasRussian = russianPatterns.some(pattern => pattern.test(userInput));
  const hasEnglish = englishPatterns.some(pattern => pattern.test(userInput));

  if (hasRussian && !hasEnglish) {
    return 'ru';
  } else if (hasEnglish && !hasRussian) {
    return 'en';
  } else if (hasRussian && hasEnglish) {
    // Mixed language, prioritize based on script
    return /[а-яё]/i.test(userInput) ? 'ru' : 'en';
  }

  return 'en'; // Default to English
}

/**
 * Get localized response instruction based on detected language
 */
export function getLanguageInstruction(userLanguage: string): string {
  const instructions = {
    en: 'Respond in English with friendly, conversational explanations.',
    ru: 'Отвечай на русском языке дружелюбными, разговорными объяснениями.',
    // Add more languages as needed
  };

  return instructions[userLanguage as keyof typeof instructions] || instructions.en;
}

/**
 * Get localized example message
 */
export function getLocalizedExample(userLanguage: string): string {
  const examples = {
    en: 'Done! I created a beautiful design with blue background. How do you like it?',
    ru: 'Готово! Я создал красивый дизайн с синим фоном. Как вам?',
  };

  return examples[userLanguage as keyof typeof examples] || examples.en;
}

/**
 * Advanced Prompt Builder with context awareness and optimization
 */
export class AdvancedPromptBuilder {
  private static effectDefinitions = {
    cyberpunk: {
      colors: ['#00ff41', '#ff0080', '#0080ff', '#ffff00', '#00ffff'],
      description: 'futuristic cyberpunk aesthetic with matrix-style elements',
      effects: 'neon glows, digital grid overlays, holographic effects, electric animations',
      mood: 'futuristic, high-tech, mysterious, edgy',
      typography: 'monospace, tech-inspired fonts',
      patterns: 'circuit boards, binary code, digital noise'
    },
    luxury: {
      colors: ['#ffd700', '#c9b037', '#000000', '#ffffff', '#8b4513'],
      description: 'premium luxury design with sophisticated elegance',
      effects: 'metallic gradients, subtle shadows, refined animations, premium textures',
      mood: 'sophisticated, exclusive, elegant, premium',
      typography: 'serif fonts, elegant script, refined sans-serif',
      patterns: 'marble textures, gold leaf, premium materials'
    },
    neon: {
      colors: ['#ff006e', '#00f5ff', '#39ff14', '#ff073a', '#bf00ff'],
      description: 'vibrant neon aesthetic with electric energy',
      effects: 'bright neon glows, electric animations, pulsing effects, color cycling',
      mood: 'energetic, vibrant, electric, bold',
      typography: 'bold sans-serif, impact fonts, glowing text',
      patterns: 'neon tube lighting, electric patterns, grid systems'
    },
    cosmic: {
      colors: ['#4c1d95', '#7c3aed', '#a855f7', '#c084fc', '#1e1b4b'],
      description: 'cosmic space theme with stellar grandeur',
      effects: 'stellar gradients, particle effects, cosmic animations, nebula patterns',
      mood: 'mysterious, vast, inspirational, cosmic',
      typography: 'futuristic fonts, space-age design',
      patterns: 'star fields, nebulae, galaxy spirals, cosmic dust'
    },
    minimal: {
      colors: ['#f8fafc', '#64748b', '#1e293b', '#0f172a', '#374151'],
      description: 'ultra-clean minimal design with perfect balance',
      effects: 'subtle shadows, smooth transitions, clean lines, micro-interactions',
      mood: 'clean, focused, sophisticated, modern',
      typography: 'clean sans-serif, geometric fonts, perfect hierarchy',
      patterns: 'geometric shapes, clean grids, negative space'
    },
    retro: {
      colors: ['#ff6b35', '#f7931e', '#ffcd3c', '#c5d86d', '#8b5a3c'],
      description: 'nostalgic 80s aesthetic with vintage charm',
      effects: 'retro gradients, vintage animations, nostalgic feel, chromatic aberration',
      mood: 'nostalgic, warm, playful, vintage',
      typography: 'retro fonts, 80s-style typography, bold headers',
      patterns: 'retro patterns, vintage textures, 80s graphics'
    },
    gaming: {
      colors: ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'],
      description: 'high-energy gaming aesthetic with competitive edge',
      effects: 'RGB lighting, gaming animations, competitive feel, action elements',
      mood: 'competitive, energetic, dynamic, intense',
      typography: 'gaming fonts, bold typography, action-oriented',
      patterns: 'gaming patterns, tech elements, competitive styling'
    },
    professional: {
      colors: ['#1e40af', '#374151', '#f3f4f6', '#111827', '#6b7280'],
      description: 'professional business aesthetic with trustworthy appeal',
      effects: 'corporate gradients, professional animations, trust-building elements',
      mood: 'trustworthy, professional, reliable, corporate',
      typography: 'corporate fonts, professional hierarchy',
      patterns: 'business patterns, corporate elements, professional styling'
    }
  };

  /**
   * Build advanced wallet system prompt with full context
   */
  static buildAdvancedWalletSystemPrompt(
    config: PromptConfig,
    designExamples: any[] = [],
    chosenStyle?: any
  ): string {
    const userLanguage = detectUserLanguage(config.userRequest);
    const languageInstruction = getLanguageInstruction(userLanguage);
    const exampleMessage = getLocalizedExample(userLanguage);
    
    const basePrompt = this.getBaseSystemPrompt(config.complexity, userLanguage);
    const contextPrompt = this.buildContextPrompt(config);
    const examplesPrompt = this.buildExamplesPrompt(designExamples, chosenStyle);
    const constraintsPrompt = this.buildConstraintsPrompt(config);

    return `${basePrompt}

${contextPrompt}

${examplesPrompt}

${constraintsPrompt}

LANGUAGE INSTRUCTION: ${languageInstruction}

CRITICAL INSTRUCTIONS:
- Always respond with the enhanced JSON format shown above
- Include detailed reasoning in the analysis section
- Ensure all colors have proper contrast ratios (WCAG AA minimum)
- Consider the wallet type capabilities and limitations
- Provide actionable style changes that improve user experience
- Include accessibility considerations in your recommendations
- IMPORTANT: The userText field must be a friendly, conversational explanation in the same language as the user's input
- Example userText: "${exampleMessage}"`;
  }

  /**
   * Build customization prompt for wallet styling
   */
  static buildCustomizationPrompt(
    userRequest: string,
    customizableElements: any[],
    currentStyles: any
  ): string {
    const userLanguage = detectUserLanguage(userRequest);
    const languageInstruction = getLanguageInstruction(userLanguage);
    
    return `
CUSTOMIZATION REQUEST: ${userRequest}

AVAILABLE ELEMENTS:
${customizableElements.map(el => `- ${el.name}: ${el.description}`).join('\n')}

CURRENT STYLES:
${JSON.stringify(currentStyles, null, 2)}

LANGUAGE INSTRUCTION: ${languageInstruction}

INSTRUCTIONS:
- Focus on the specific elements mentioned in the request
- Maintain wallet functionality and usability
- Ensure cross-platform compatibility
- Provide specific CSS/styling recommendations
- Consider accessibility and performance impact
- Respond in the same language as the user's input
    `;
  }

  /**
   * Build wow effect prompt with advanced specifications
   */
  static buildWowEffectPrompt(config: WowEffectConfig, walletContext: WalletContext): string {
    const effect = this.effectDefinitions[config.effectType];
    const intensityModifiers = {
      subtle: 'gentle and refined with understated elegance',
      medium: 'noticeable and appealing with balanced impact',
      dramatic: 'bold and striking with high visual impact',
      extreme: 'maximum impact with cutting-edge visual effects'
    };

    const intensitySpecs = {
      subtle: { opacity: '0.3-0.6', glow: '2-5px', animation: 'slow', contrast: 'low' },
      medium: { opacity: '0.6-0.8', glow: '5-10px', animation: 'medium', contrast: 'medium' },
      dramatic: { opacity: '0.8-0.95', glow: '10-20px', animation: 'fast', contrast: 'high' },
      extreme: { opacity: '0.95-1.0', glow: '20-40px', animation: 'very fast', contrast: 'maximum' }
    };

    const specs = intensitySpecs[config.intensity];
    const intensityDescription = intensityModifiers[config.intensity];

    return `Create a WOW-EFFECT ${effect.description} for ${walletContext.walletType} wallet that will make users absolutely amazed.

🎨 EFFECT SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Style: ${config.effectType.toUpperCase()}
Intensity: ${config.intensity.toUpperCase()} (${intensityDescription})
Target: ${config.targetElements.join(', ')}
Colors: ${effect.colors.join(' • ')}
Effects: ${effect.effects}
Mood: ${effect.mood}
Typography: ${effect.typography}
Patterns: ${effect.patterns}

🔧 TECHNICAL SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Opacity: ${specs.opacity}
Glow Radius: ${specs.glow}
Animation Speed: ${specs.animation}
Contrast Level: ${specs.contrast}

💎 WALLET COMPATIBILITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Wallet Type: ${walletContext.walletType}
Screen Elements: ${walletContext.elements?.join(', ') || 'standard elements'}
Safe Zones: ${config.preserveUsability ? 'MUST preserve all interactive areas' : 'Can overlay interface'}
NFT Ready: ${config.nftReady ? 'YES - prepare for NFT minting' : 'NO - display only'}

🎯 GENERATION REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Create ${intensityDescription} visual impact
2. Apply ${config.effectType} aesthetic throughout
3. Target elements: ${config.targetElements.join(', ')}
4. Maintain wallet functionality and usability
5. Use specified color palette and effects
6. Ensure accessibility compliance (WCAG AA)
7. Optimize for ${walletContext.walletType} interface patterns

Generate CSS variables and styling that will create this amazing ${config.effectType} effect!`;
  }

  /**
   * Get base system prompt based on complexity level
   */
  private static getBaseSystemPrompt(complexity: 'beginner' | 'intermediate' | 'advanced', userLanguage: string = 'en'): string {
    const languageInstruction = getLanguageInstruction(userLanguage);
    const exampleMessage = getLocalizedExample(userLanguage);
    
    const prompts = {
      beginner: `You are a friendly wallet design assistant. Provide simple, clear guidance.

RESPONSE FORMAT: Always respond with valid JSON:
{
  "success": true,
  "response": "Technical response for system processing", 
  "userText": "Human-friendly explanation for the user",
  "styleChanges": { ... }
}

${languageInstruction}
The userText field must contain a conversational explanation like "${exampleMessage}"`,

      intermediate: `You are an experienced wallet design expert. Provide balanced technical insights.

RESPONSE FORMAT: Always respond with valid JSON:
{
  "success": true,
  "response": "Technical response for system processing",
  "userText": "Human-friendly explanation for the user", 
  "styleChanges": { ... }
}

${languageInstruction}
The userText field must contain a detailed but friendly explanation of what was changed and why.`,

      advanced: `You are a senior wallet design architect. Provide sophisticated, technical recommendations.

RESPONSE FORMAT: Always respond with valid JSON:
{
  "success": true,
  "response": "Technical response for system processing",
  "userText": "Human-friendly explanation for the user",
  "styleChanges": { ... }
}

${languageInstruction}
The userText field must contain an expert-level but accessible explanation of the design decisions made.`
    };
    return prompts[complexity];
  }

  /**
   * Build context-aware prompt section
   */
  private static buildContextPrompt(config: PromptConfig): string {
    return `
WALLET CONTEXT:
- Type: ${config.context.walletType}
- Elements: ${config.context.elements?.join(', ') || 'standard'}
- User Request: ${config.userRequest}
- Target Element: ${config.targetElement || 'general'}
${config.imageUrl ? `- Reference Image: ${config.imageUrl}` : ''}`;
  }

  /**
   * Build examples prompt section
   */
  private static buildExamplesPrompt(designExamples: any[], chosenStyle?: any): string {
    if (designExamples.length === 0) return '';
    
    return `
DESIGN EXAMPLES:
${designExamples.map((example, index) => `
Example ${index + 1}:
- Style: ${example.style || 'undefined'}
- Colors: ${example.colors?.join(', ') || 'undefined'}
- Description: ${example.description || 'undefined'}
`).join('')}

${chosenStyle ? `CHOSEN STYLE REFERENCE:
- Primary: ${chosenStyle.primary || '#000000'}
- Secondary: ${chosenStyle.secondary || '#ffffff'}
- Accent: ${chosenStyle.accent || '#0066cc'}` : ''}`;
  }

  /**
   * Build constraints prompt section
   */
  private static buildConstraintsPrompt(config: PromptConfig): string {
    return `
CONSTRAINTS:
- Complexity Level: ${config.complexity}
- Request Type: ${config.type}
- Style Preferences: ${config.stylePreferences ? 'Applied' : 'Default'}
- Accessibility: WCAG AA compliance required
- Performance: Optimize for mobile and desktop
- Compatibility: Cross-wallet implementation`;
  }
}

/**
 * Factory function for creating AdvancedPromptBuilder instance
 */
export function createAdvancedPromptBuilder() {
  return new AdvancedPromptBuilder();
}
