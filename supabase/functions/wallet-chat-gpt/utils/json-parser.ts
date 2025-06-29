🔧 TECHNICAL SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Opacity Range: ${specs.opacity}
• Glow Effects: ${specs.glow}
• Animation Speed: ${specs.animation}
• Contrast Level: ${specs.contrast}
• Preserve Usability: ${config.preserveUsability ? 'YES' : 'NO'}
• NFT Ready: ${config.nftReady ? 'YES' : 'NO'}

🎯 DESIGN REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Create ${intensityDescription} visual impact that generates genuine WOW reactions
2. Ensure excellent contrast and readability (WCAG AA minimum)
3. Maintain wallet functionality and intuitive navigation
4. Apply cohesive color harmony using ${effect.colors.length} primary colors
5. Include appropriate visual effects: ${effect.effects}
6. Incorporate ${effect.mood} emotional appeal
7. Use ${effect.typography} for text elements
8. Add ${effect.patterns} background elements
${config.nftReady ? '9. Make it NFT-marketplace ready with premium finish' : ''}
${config.preserveUsability ? '10. Prioritize usability over visual effects' : '10. Maximize visual impact within usability bounds'}

🔍 CURRENT WALLET STATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Background: ${walletContext.currentStyle?.backgroundColor || '#1a1a1a'}
• Primary: ${walletContext.currentStyle?.primaryColor || '#9945ff'}
• Accent: ${walletContext.currentStyle?.accentColor || '#00d4ff'}
• Theme: ${walletContext.currentStyle?.theme || 'dark'}
• Animation Preference: ${walletContext.currentStyle?.animations?.enabled ? 'ENABLED' : 'DISABLED'}

🚀 TRANSFORMATION GOAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transform this ${walletContext.walletType} wallet into a ${intensityDescription} ${config.effectType} masterpiece that will:
✨ Generate immediate WOW reactions from users
🎨 Showcase cutting-edge Web3 design excellence
💎 Feel premium and exclusive
🔥 Stand out in any portfolio or marketplace
⚡ Demonstrate advanced customization capabilities

CRITICAL: Return the complete enhanced JSON format with all sections filled out for maximum impact!`;
  }

  /**
   * Build user message with context and optimization
   */
  static buildUserMessage(
    content: string, 
    options: {
      walletElement?: string;
      imageUrl?: string;
      context?: WalletContext;
      priority?: 'low' | 'medium' | 'high';
      styleHints?: string[];
    } = {}
  ): string {
    let message = content;

    // Add element context
    if (options.walletElement) {
      message = `I want to customize the "${options.walletElement}" element. ${content}`;
    }

    // Add image context
    if (options.imageUrl) {
      message += '\n\n🖼️ IMAGE ANALYSIS REQUEST:\nI uploaded an image for style inspiration. Please analyze the colors, mood, and design elements, then suggest how to apply similar styling to my wallet interface. Focus on extracting the color palette and visual mood.';
    }

    // Add wallet context
    if (options.context) {
      message += `\n\n📱 WALLET CONTEXT:\n• Type: ${options.context.walletType}\n• Active Screen: ${options.context.activeScreen}\n• Current Theme: ${options.context.currentStyle?.theme}`;
    }

    // Add style hints
    if (options.styleHints && options.styleHints.length > 0) {
      message += `\n\n💡 STYLE PREFERENCES:\n${options.styleHints.map(hint => `• ${hint}`).join('\n')}`;
    }

    // Add priority context
    if (options.priority) {
      const priorityTexts = {
        low: 'This is a minor adjustment request.',
        medium: 'This is a standard customization request.',
        high: 'This is a high-priority customization that should have significant visual impact.'
      };
      message += `\n\n⭐ PRIORITY: ${priorityTexts[options.priority]}`;
    }

    return message;
  }

  /**
   * Build image analysis prompt
   */
  static buildImageAnalysisPrompt(imageUrl: string, context: WalletContext): string {
    return `🖼️ ADVANCED IMAGE STYLE ANALYSIS

Please analyze this image and extract comprehensive styling information for Web3 wallet customization.

📋 ANALYSIS REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 🎨 COLOR PALETTE EXTRACTION:
   • Primary colors (3-5 dominant colors)
   • Secondary/accent colors
   • Background tones
   • Text contrast colors
   • Emotional color temperature (warm/cool)

2. 🎭 MOOD & ATMOSPHERE:
   • Overall emotional feel
   • Energy level (calm/energetic)
   • Style category (modern/retro/futuristic/etc)
   • Target audience impression

3. 🏗️ DESIGN ELEMENTS:
   • Typography style suggestions
   • Layout patterns
   • Visual hierarchy cues
   • Spacing and proportions

4. 💎 WEB3 ADAPTATION:
   • How to translate this style to ${context.walletType} wallet
   • Which wallet elements would benefit most
   • Accessibility considerations
   • NFT/crypto market appeal

🎯 TARGET APPLICATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Type: ${context.walletType}
• Current Theme: ${context.currentStyle?.theme || 'dark'}
• Active Screen: ${context.activeScreen}
• User Preferences: ${context.userPreferences?.theme || 'not specified'}

Please provide the complete enhanced JSON response with extracted colors, suggested styling, and implementation recommendations.`;
  }

  /**
   * Build comparison prompt for A/B testing
   */
  static buildComparisonPrompt(styleA: any, styleB: any, context: WalletContext): string {
    return `🔄 WALLET STYLE COMPARISON & OPTIMIZATION

Compare these two wallet styling approaches and provide recommendations:

📊 STYLE A ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(styleA, null, 2)}

📊 STYLE B ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(styleB, null, 2)}

🎯 COMPARISON CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Visual Appeal (1-10)
2. Accessibility Score (WCAG compliance)
3. Brand Consistency
4. User Experience Impact
5. Web3/Crypto Market Appeal
6. Technical Implementation Complexity
7. Cross-Device Compatibility
8. Performance Implications

Please provide a detailed comparison with scores, pros/cons, and a recommended hybrid approach that combines the best of both styles.`;
  }

  /**
   * Private helper methods
   */
  private static getBaseSystemPrompt(complexity: 'beginner' | 'intermediate' | 'advanced'): string {
    const prompts = {
      beginner: `You are a friendly Web3 wallet design assistant. Help users create beautiful wallet customizations with simple, clear explanations.`,
      intermediate: `You are an expert Web3 wallet design AI. Provide detailed styling recommendations with professional insights and technical guidance.`,
      advanced: `You are an elite Web3 wallet design AI with deep expertise in UI/UX, color theory, accessibility, and cutting-edge design trends.`
    };

    return `${prompts[complexity]}

🎯 RESPONSE FORMAT REQUIREMENT:
You MUST respond with this enhanced JSON structure:

\`\`\`json
{
  "analysis": {
    "userIntent": "clear description of what user wants to achieve",
    "identifiedElements": ["list", "of", "affected", "elements"],
    "styleDirection": "overall style approach being taken",
    "confidenceScore": 0.0-1.0,
    "reasoningSteps": ["step 1", "step 2", "step 3"]
  },
  "actions": [{
    "type": "color_change|font_change|layout_change|component_update|animation_add",
    "target": "specific element or global",
    "description": "what this action accomplishes",
    "impact": "low|medium|high",
    "reversible": true|false
  }],
  "elements": {
    "colors": {
      "primary": {"value": "#hex", "accessibility": {"contrastRatio": 4.5, "wcagLevel": "AA"}},
      "background": {"value": "#hex", "accessibility": {"contrastRatio": 1.0, "wcagLevel": "AA"}},
      "text": {"value": "#hex", "accessibility": {"contrastRatio": 7.0, "wcagLevel": "AA"}},
      "accent": {"value": "#hex", "accessibility": {"contrastRatio": 4.5, "wcagLevel": "AA"}}
    },
    "typography": {
      "fontFamilies": {
        "primary": {"family": "font name", "weights": [400, 600], "source": "google|system"}
      }
    }
  },
  "metadata": {
    "styleReasoning": "detailed explanation of design choices",
    "nftReady": true|false,
    "accessibilityScore": 1-10,
    "appliedOptimizations": ["list", "of", "optimizations"],
    "qualityMetrics": {
      "accessibility": {"score": 1-10, "issues": [], "improvements": []},
      "performance": {"score": 1-10},
      "design": {"consistency": 1-10, "harmony": 1-10, "usability": 1-10},
      "overall": 1-10
    }
  }
}
\`\`\``;
  }

  private static buildContextPrompt(config: PromptConfig): string {
    return `🔍 CURRENT WALLET CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Type: ${config.context.walletType}
• Active Layer: ${config.context.activeLayer}
• Active Screen: ${config.context.activeScreen}
• Current Theme: ${config.context.currentStyle?.theme || 'not set'}
• Animation Preference: ${config.context.currentStyle?.animations?.enabled ? 'enabled' : 'disabled'}
• User Level: ${config.complexity}
• Available Elements: ${config.context.availableElements?.length || 0} elements
• Customizable Screens: ${config.context.customizableScreens?.length || 0} screens

📱 CURRENT STYLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(config.context.currentStyle, null, 2)}`;
  }

  private static buildExamplesPrompt(designExamples: any[], chosenStyle?: any): string {
    if (designExamples.length === 0) {
      return '📚 DESIGN EXAMPLES: No premium examples loaded';
    }

    let prompt = `📚 DESIGN EXAMPLES AVAILABLE: ${designExamples.length} premium styles loaded\n`;
    
    if (chosenStyle) {
      prompt += `🎯 SELECTED STYLE REFERENCE: ${chosenStyle.id}\n`;
      prompt += `Style Details: ${JSON.stringify(chosenStyle, null, 2)}\n`;
    }

    prompt += `\nExample Styles Available: ${designExamples.map(ex => ex.id || 'unnamed').join(', ')}`;
    return prompt;
  }

  private static buildConstraintsPrompt(config: PromptConfig): string {
    const walletConstraints = {
      phantom: ['Supports custom CSS', 'Limited animation options', 'Good color customization'],
      metamask: ['Basic theming only', 'Limited customization', 'Focus on accessibility'],
      solflare: ['Good customization support', 'Responsive design friendly'],
      backpack: ['Modern customization features', 'Animation support', 'Gaming-friendly']
    };

    const constraints = walletConstraints[config.context.walletType as keyof typeof walletConstraints] || ['Standard customization support'];

    return `⚠️ TECHNICAL CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Wallet Limitations: ${constraints.join(', ')}
• Accessibility Required: WCAG AA minimum
• Performance: Keep animations lightweight
• Compatibility: Support major browsers
• User Experience: Maintain intuitive navigation`;
  }

  /**
   * Get available wow effects with detailed information
   */
  static getAvailableWowEffects(): Array<{
    id: string;
    name: string;
    description: string;
    preview: string[];
    intensity: string[];
    bestFor: string[];
    performance: 'low' | 'medium' | 'high';
  }> {
    return [
      {
        id: 'cyberpunk',
        name: 'Cyberpunk Matrix',
        description: 'Futuristic neon with matrix-style glows and digital effects',
        preview: ['#00ff41', '#ff0080', '#0080ff'],
        intensity: ['medium', 'dramatic', 'extreme'],
        bestFor: ['Gaming wallets', 'Tech enthusiasts', 'NFT traders'],
        performance: 'medium'
      },
      {
        id: 'luxury',
        name: 'Premium Gold',
        description: 'Elegant luxury with gold accents and sophisticated styling',
        preview: ['#ffd700', '#c9b037', '#000000'],
        intensity: ['subtle', 'medium', 'dramatic'],
        bestFor: ['High-value portfolios', 'Premium users', 'Business wallets'],
        performance: 'low'
      },
      {
        id: 'neon',
        name: 'Electric Neon',
        description: 'Vibrant electric colors with pulsing glow effects',
        preview: ['#ff006e', '#00f5ff', '#39ff14'],
        intensity: ['medium', 'dramatic', 'extreme'],
        bestFor: ['Party themes', 'Creative users', 'Social trading'],
        performance: 'high'
      },
      {
        id: 'cosmic',
        name: 'Cosmic Space',
        description: 'Deep space theme with stellar gradients and cosmic effects',
        preview: ['#4c1d95', '#7c3aed', '#a855f7'],
        intensity: ['subtle', 'medium', 'dramatic'],
        bestFor: ['Long-term holders', 'Meditation apps', 'Cosmic themes'],
        performance: 'medium'
      },
      {
        id: 'minimal',
        name: 'Ultra Minimal',
        description: 'Clean and sophisticated simplicity with perfect balance',
        preview: ['#f8fafc', '#64748b', '#1e293b'],
        intensity: ['subtle', 'medium'],
        bestFor: ['Professional use', 'Focus apps', 'Clean design lovers'],
        performance: 'low'
      },
      {
        id: 'retro',
        name: 'Retro 80s',
        description: 'Nostalgic 80s aesthetic with vintage colors and effects',
        preview: ['#ff6b35', '#f7931e', '#ffcd3c'],
        intensity: ['medium', 'dramatic'],
        bestFor: ['Retro enthusiasts', 'Gaming themes', 'Nostalgic users'],
        performance: 'medium'
      },
      {
        id: 'gaming',
        name: 'Gaming RGB',
        description: 'High-energy gaming aesthetic with RGB lighting effects',
        preview: ['#00ff00', '#ff0000', '#0000ff'],
        intensity: ['dramatic', 'extreme'],
        bestFor: ['Gamers', 'Streamers', 'Competitive users'],
        performance: 'high'
      },
      {
        id: 'professional',
        name: 'Corporate Pro',
        description: 'Professional business aesthetic with trustworthy appeal',
        preview: ['#1e40af', '#374151', '#f3f4f6'],
        intensity: ['subtle', 'medium'],
        bestFor: ['Business users', 'Corporate wallets', 'Professional traders'],
        performance: 'low'
      }
    ];
  }

  /**
   * Generate prompts for different wallet types
   */
  static getWalletSpecificPrompts(): { [walletType: string]: string } {
    return {
      phantom: `🟣 PHANTOM WALLET OPTIMIZATION:
• Leverage Phantom's excellent color customization support
• Utilize smooth animation capabilities
• Focus on Solana ecosystem branding
• Emphasize clean, modern design principles
• Support both mobile and desktop experiences`,

      metamask: `🦊 METAMASK WALLET OPTIMIZATION:
• Work within MetaMask's theming limitations
• Prioritize accessibility and readability
• Focus on Ethereum ecosystem colors
• Ensure cross-browser compatibility
• Maintain familiar UX patterns`,

      solflare: `☀️ SOLFLARE WALLET OPTIMIZATION:
• Leverage Solflare's responsive design support
• Incorporate Solana-themed elements
• Focus on mobile-first design
• Utilize good customization features
• Emphasize performance and speed`,

      backpack: `🎒 BACKPACK WALLET OPTIMIZATION:
• Take advantage of modern customization features
• Incorporate gaming and social elements
• Use advanced animation support
• Focus on community and social aspects
• Emphasize cutting-edge design trends`
    };
  }
}

// Legacy support functions
export function buildAdvancedWalletSystemPrompt(
  walletContext: any, 
  designExamples: any[], 
  chosenStyle: any
): string {
  const config: PromptConfig = {
    type: 'customization',
    context: walletContext,
    userRequest: '',
    complexity: 'intermediate'
  };
  
  return AdvancedPromptBuilder.buildAdvancedWalletSystemPrompt(config, designExamples, chosenStyle);
}

export function buildUserMessage(
  content: string, 
  walletElement?: string, 
  imageUrl?: string
): string {
  return AdvancedPromptBuilder.buildUserMessage(content, {
    walletElement,
    imageUrl
  });
}

export function buildWowEffectPrompt(
  effectType: string,
  walletContext: any,
  intensity: 'subtle' | 'medium' | 'dramatic' = 'medium'
): string {
  const config: WowEffectConfig = {
    effectType: effectType as any,
    intensity,
    targetElements: ['global'],
    preserveUsability: true,
    nftReady: true
  };
  
  return AdvancedPromptBuilder.buildWowEffectPrompt(config, walletContext);
}

export function getAvailableWowEffects() {
  return AdvancedPromptBuilder.getAvailableWowEffects();
}
