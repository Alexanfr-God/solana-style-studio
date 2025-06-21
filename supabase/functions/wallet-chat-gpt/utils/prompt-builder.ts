
// Fixed prompt building utilities with working system prompt
export function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  const FIXED_SYSTEM_PROMPT = `
You are an ELITE Web3 Wallet Design AI.

CRITICAL: Always return this EXACT JSON format:

\`\`\`json
{
  "styleChanges": {
    "layer": "wallet",
    "target": "global",
    "changes": {
      "backgroundColor": "#hex_color",
      "accentColor": "#hex_color", 
      "textColor": "#hex_color",
      "buttonColor": "#hex_color"
    },
    "reasoning": "explanation of changes"
  }
}
\`\`\`

NEVER use other formats like "elements" or "analysis" - ONLY styleChanges!

Examples:
- User: "make it red" → backgroundColor: "#ff0000"
- User: "dark theme" → backgroundColor: "#1a1a1a", textColor: "#ffffff"
- User: "bitcoin style" → backgroundColor: "#f7931a", accentColor: "#000000"

Always include the JSON block in your response!
`;

  return `${FIXED_SYSTEM_PROMPT}

CURRENT WALLET CONTEXT:
- Wallet type: ${walletContext?.walletType || 'Phantom'}
- Active layer: ${walletContext?.activeLayer || 'wallet'}
- Current styles: ${JSON.stringify(walletContext?.currentStyle || {})}

${chosenStyle ? `CHOSEN STYLE: ${chosenStyle.id}` : ''}

DESIGN EXAMPLES AVAILABLE: ${designExamples.length} premium styles loaded
CRITICAL: ALWAYS respond with the JSON structure above for proper frontend integration!`;
}

export function buildUserMessage(content: string, walletElement?: string, imageUrl?: string): string {
  let message = content;
  
  if (walletElement) {
    message = `I want to customize element "${walletElement}". ${content}`;
  }

  if (imageUrl) {
    message += '\n\nI uploaded an image for inspiration. Please analyze it and suggest how to apply similar styling to my wallet.';
  }
  
  return message;
}

export function buildWowEffectPrompt(
  effectType: string,
  walletContext: any,
  intensity: 'subtle' | 'medium' | 'dramatic' = 'medium'
): string {
  const effectDefinitions = {
    cyberpunk: {
      colors: ['#00ff41', '#ff0080', '#0080ff', '#ffff00'],
      description: 'futuristic neon cyberpunk aesthetic with glowing elements',
      effects: 'neon glows, electric gradients, matrix-style animations'
    },
    luxury: {
      colors: ['#ffd700', '#c9b037', '#000000', '#ffffff'],
      description: 'premium luxury design with gold accents and elegant typography',
      effects: 'metallic gradients, subtle shadows, refined animations'
    },
    neon: {
      colors: ['#ff006e', '#00f5ff', '#39ff14', '#ff073a'],
      description: 'vibrant neon aesthetic with electric colors',
      effects: 'bright neon glows, electric animations, pulsing effects'
    },
    cosmic: {
      colors: ['#4c1d95', '#7c3aed', '#a855f7', '#c084fc'],
      description: 'cosmic space theme with stellar gradients',
      effects: 'stellar gradients, particle effects, cosmic animations'
    },
    minimal: {
      colors: ['#f8fafc', '#64748b', '#1e293b', '#0f172a'],
      description: 'clean minimal design with perfect spacing',
      effects: 'subtle shadows, smooth transitions, clean lines'
    },
    retro: {
      colors: ['#ff6b35', '#f7931e', '#ffcd3c', '#c5d86d'],
      description: 'retro 80s aesthetic with vintage colors',
      effects: 'retro gradients, vintage animations, nostalgic feel'
    }
  };

  const effect = effectDefinitions[effectType] || effectDefinitions.neon;
  
  const intensityModifiers = {
    subtle: 'gentle and refined',
    medium: 'noticeable and appealing',
    dramatic: 'bold and striking'
  };

  const intensityDescription = intensityModifiers[intensity];

  return `
Create a WOW-EFFECT ${effect.description} for ${walletContext?.walletType || 'Phantom'} wallet.

EFFECT SPECIFICATIONS:
- Style: ${effectType.toUpperCase()}
- Intensity: ${intensity.toUpperCase()} (${intensityDescription})
- Target: ${walletContext?.activeLayer || 'wallet'} layer
- Colors: ${effect.colors.join(', ')}
- Effects: ${effect.effects}

DESIGN REQUIREMENTS:
1. Make it NFT-ready and Web3 premium looking
2. Ensure excellent contrast and readability
3. Apply ${intensityDescription} visual impact
4. Maintain wallet functionality and usability
5. Create cohesive color harmony
6. Add appropriate visual effects: ${effect.effects}

CURRENT WALLET STATE:
- Background: ${walletContext?.currentStyle?.backgroundColor || '#1a1a1a'}
- Primary: ${walletContext?.currentStyle?.primaryColor || '#9945ff'}
- Accent: ${walletContext?.currentStyle?.accentColor || '#00d4ff'}

Transform this wallet into a ${intensityDescription} ${effectType} masterpiece that will make users say WOW!

CRITICAL: Return the exact JSON format specified in the system prompt with the wow-effect styling applied.
`;
}

export function getAvailableWowEffects(): Array<{id: string, name: string, description: string, preview: string[]}> {
  return [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Matrix',
      description: 'Futuristic neon with matrix-style glows',
      preview: ['#00ff41', '#ff0080', '#0080ff']
    },
    {
      id: 'luxury',
      name: 'Premium Gold',
      description: 'Elegant luxury with gold accents',
      preview: ['#ffd700', '#c9b037', '#000000']
    },
    {
      id: 'neon',
      name: 'Electric Neon',
      description: 'Vibrant electric colors with glow effects',
      preview: ['#ff006e', '#00f5ff', '#39ff14']
    },
    {
      id: 'cosmic',
      name: 'Cosmic Space',
      description: 'Deep space with stellar gradients',
      preview: ['#4c1d95', '#7c3aed', '#a855f7']
    },
    {
      id: 'minimal',
      name: 'Ultra Minimal',
      description: 'Clean and sophisticated simplicity',
      preview: ['#f8fafc', '#64748b', '#1e293b']
    },
    {
      id: 'retro',
      name: 'Retro 80s',
      description: 'Nostalgic 80s with vintage colors',
      preview: ['#ff6b35', '#f7931e', '#ffcd3c']
    }
  ];
}
