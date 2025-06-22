// Enhanced prompt building utilities with human-friendly responses

import { WalletContext, WowEffect } from '../types/wallet.ts';
import { DesignSystem } from '../types/styles.ts';

// Enhanced system prompt that returns both human response and technical JSON
export const ENHANCED_SYSTEM_PROMPT = `
You are an ELITE Web3 Wallet Design AI with personality and expertise.

🎯 YOUR MISSION: Transform wallets with stunning designs while maintaining friendly conversation.

🎨 YOUR PERSONALITY:
- Enthusiastic about design and Web3
- Helpful and encouraging
- Professional yet approachable
- Always explain your choices in simple terms

📋 RESPONSE FORMAT:
Always provide TWO parts in your response:

1. HUMAN RESPONSE (first part):
Write a friendly, conversational explanation of what you're doing. Include:
- Greeting or acknowledgment
- What you understood from the request
- What changes you're making and why
- Any suggestions or alternatives
- Encouragement or next steps

2. TECHNICAL JSON (second part):
After your human response, include the JSON in a code block:

\`\`\`json
{
  "analysis": "Technical analysis of the request",
  "actions": ["list", "of", "technical", "actions"],
  "elements": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex"
    },
    "typography": {
      "header": "Font Name",
      "body": "Font Name"
    },
    "effects": [
      {
        "type": "animation|gradient|glow|shadow",
        "target": "element selector",
        "properties": {}
      }
    ],
    "spacing": {
      "small": "8px",
      "medium": "16px",
      "large": "24px"
    }
  },
  "metadata": {
    "style_reasoning": "Why these choices work together",
    "nft_ready": true,
    "performance_impact": "low|medium|high",
    "wow_factor": 8
  }
}
\`\`\`

🎯 IMPORTANT RULES:
1. ALWAYS start with a human-friendly response
2. ALWAYS include the JSON block after
3. Make suggestions sound exciting and achievable
4. If unsure, ask clarifying questions in a friendly way
5. Celebrate the user's creative choices
`;

// Dynamic Chain of Thought prompt
export function buildDynamicCOT(walletType: string, currentState: any, userRequest: string): string {
  return `
🔍 ANALYZING YOUR REQUEST:

CURRENT CONTEXT:
- Wallet: ${walletType}
- Current Theme: ${detectTheme(currentState)}
- User Request: "${userRequest}"
- Active Effects: ${currentState.wowEffects?.activeEffects?.length || 0}

STEP-BY-STEP REASONING:
1. INTENT ANALYSIS: ${analyzeIntent(userRequest)}
2. STYLE DIRECTION: ${determineStyleDirection(userRequest)}
3. COLOR HARMONY: ${suggestColorHarmony(userRequest, currentState)}
4. EFFECT SELECTION: ${selectAppropriateEffects(userRequest)}
5. PERFORMANCE BALANCE: ${balancePerformance(userRequest)}

Let me create something amazing for you! 🚀
`;
}

// Build advanced wallet system prompt with context
export function buildAdvancedWalletSystemPrompt(
  walletContext: WalletContext,
  designExamples: any[],
  chosenStyle: any
): string {
  const contextInfo = `
WALLET INFORMATION:
- Type: ${walletContext.walletType}
- Name: ${walletContext.walletName}
- Layers: ${walletContext.layers.map(l => l.name).join(', ')}
- Capabilities: ${Object.entries(walletContext.capabilities)
    .filter(([_, v]) => v)
    .map(([k]) => k)
    .join(', ')}

CURRENT STYLE:
${JSON.stringify(walletContext.currentStyle, null, 2)}

AVAILABLE EFFECTS:
${walletContext.wowEffects.availableEffects.map(e => `- ${e.name}: ${e.description}`).join('\n')}

${designExamples.length > 0 ? `
INSPIRATION LIBRARY:
${designExamples.slice(0, 5).map(e => `- ${e.id}: ${e.description}`).join('\n')}
` : ''}

${chosenStyle ? `
SELECTED STYLE TEMPLATE:
- Name: ${chosenStyle.id}
- Mood: ${chosenStyle.mood}
- Colors: ${JSON.stringify(chosenStyle.colors)}
` : ''}
`;

  return ENHANCED_SYSTEM_PROMPT + '\n\n' + contextInfo;
}

// Build user message with context
export function buildUserMessage(
  content: string,
  walletElement?: any,
  imageUrl?: string,
  options: any = {}
): string {
  let message = content;
  
  if (walletElement) {
    message = `I want to customize the "${walletElement.name}" element. ${content}`;
  }

  if (imageUrl) {
    message += '\n\nI uploaded an image for inspiration. Please analyze it and create a similar vibe for my wallet.';
  }

  if (options.wowEffects) {
    message += `\n\nI want to apply these effects: ${options.wowEffects.map(e => e.name).join(', ')}`;
  }

  if (options.mode === 'wow-analysis') {
    message += '\n\nShow me some amazing effects that would make my wallet stand out!';
  }

  return message;
}

// Build WOW effect prompt with enhanced options
export function buildWowEffectPrompt(
  walletContext: WalletContext,
  options: any = {}
): string {
  if (options.focusOnEffects) {
    return buildEffectAnalysisPrompt(walletContext);
  }
  
  if (options.applyMode) {
    return buildEffectApplicationPrompt(walletContext, options);
  }
  
  if (options.fusionMode) {
    return buildStyleFusionPrompt(walletContext, options);
  }

  // Default wow effect prompt
  return `
Create STUNNING visual effects for this ${walletContext.walletType} wallet!

🎨 AVAILABLE EFFECT CATEGORIES:
1. VISUAL EFFECTS
   - Gradients (linear, radial, conic, mesh)
   - Shadows (drop, inner, neon glow)
   - Filters (blur, brightness, contrast)
   
2. ANIMATIONS
   - Entrance (fade, slide, zoom, rotate)
   - Continuous (pulse, breathe, float)
   - Interactive (hover, click, drag)
   
3. ADVANCED EFFECTS
   - Particles (stars, bubbles, confetti)
   - 3D transforms (perspective, rotate3d)
   - Masks and clipping paths

4. PERFORMANCE MODES
   - Light: Subtle effects, great performance
   - Balanced: Moderate effects, good performance
   - Intense: Maximum wow, may impact performance

Remember to:
- Explain each effect in user-friendly terms
- Suggest combinations that work well together
- Consider performance implications
- Make it NFT-ready and unique!
`;
}

// Effect analysis prompt
function buildEffectAnalysisPrompt(walletContext: WalletContext): string {
  return `
Analyze this wallet and suggest AMAZING effects that would create a WOW factor!

Current wallet state:
${JSON.stringify(walletContext.currentStyle, null, 2)}

For each suggested effect:
1. Explain what it does in simple terms
2. Show which elements it would affect
3. Rate the wow factor (1-10)
4. Note performance impact
5. Suggest complementary effects

Categories to consider:
- 🌈 Color effects (gradients, color shifts)
- ✨ Glow effects (neon, soft glow, pulse)
- 🎬 Animations (smooth, eye-catching)
- 🎮 Interactive effects (hover, click responses)
- 🌟 Particle effects (if supported)
- 🎭 3D effects (if supported)

Make your suggestions exciting and help the user visualize the result!
`;
}

// Effect application prompt
function buildEffectApplicationPrompt(walletContext: WalletContext, options: any): string {
  const effects = options.effects || [];
  const targets = options.targetElements || [];
  
  return `
Apply these specific effects to the wallet:

EFFECTS TO APPLY:
${effects.map(e => `- ${e.name}: ${e.description}`).join('\n')}

TARGET ELEMENTS:
${targets.join(', ')}

APPLICATION INSTRUCTIONS:
1. Apply effects harmoniously
2. Ensure visual consistency
3. Maintain readability
4. Optimize for performance
5. Create smooth transitions

Explain what you're doing in friendly terms, then provide the technical implementation.
`;
}

// Style fusion prompt
function buildStyleFusionPrompt(walletContext: WalletContext, options: any): string {
  const styles = options.styles || [];
  
  return `
Create a UNIQUE fusion of these design styles:

STYLES TO FUSION:
${styles.map(s => `- ${s.id}: ${s.description}`).join('\n')}

FUSION GUIDELINES:
1. Take the best elements from each style
2. Create something new and unique
3. Maintain visual harmony
4. Balance all style influences
5. Add your creative touch

Current wallet: ${walletContext.walletType}

Explain your fusion approach and why it works!
`;
}

// Helper functions for dynamic prompts
function detectTheme(currentState: any): string {
  const bg = currentState.backgroundColor || '#000000';
  const isDark = isColorDark(bg);
  return isDark ? 'Dark Mode' : 'Light Mode';
}

function analyzeIntent(userRequest: string): string {
  const req = userRequest.toLowerCase();
  
  if (req.includes('wow') || req.includes('amazing') || req.includes('impressive')) {
    return 'User wants impressive visual effects';
  }
  if (req.includes('minimal') || req.includes('clean') || req.includes('simple')) {
    return 'User prefers minimal, clean design';
  }
  if (req.includes('dark') || req.includes('night')) {
    return 'User wants dark theme';
  }
  if (req.includes('bright') || req.includes('colorful') || req.includes('vibrant')) {
    return 'User wants vibrant, colorful design';
  }
  
  return 'User wants custom styling';
}

function determineStyleDirection(userRequest: string): string {
  const req = userRequest.toLowerCase();
  
  const styleMap = {
    'cyberpunk': 'Futuristic with neon accents',
    'minimal': 'Clean and sophisticated',
    'luxury': 'Premium with gold accents',
    'retro': 'Nostalgic 80s vibes',
    'cosmic': 'Space-themed with gradients',
    'nature': 'Organic and calming'
  };
  
  for (const [key, value] of Object.entries(styleMap)) {
    if (req.includes(key)) {
      return value;
    }
  }
  
  return 'Custom creative direction';
}

function suggestColorHarmony(userRequest: string, currentState: any): string {
  const req = userRequest.toLowerCase();
  
  if (req.includes('monochrome') || req.includes('single color')) {
    return 'Monochromatic scheme with tonal variations';
  }
  if (req.includes('complementary') || req.includes('contrast')) {
    return 'Complementary colors for high contrast';
  }
  if (req.includes('analogous') || req.includes('harmony')) {
    return 'Analogous colors for harmony';
  }
  
  return 'Balanced color palette';
}

function selectAppropriateEffects(userRequest: string): string {
  const req = userRequest.toLowerCase();
  const effects = [];
  
  if (req.includes('glow') || req.includes('neon')) {
    effects.push('Neon glow effects');
  }
  if (req.includes('animate') || req.includes('motion')) {
    effects.push('Smooth animations');
  }
  if (req.includes('gradient')) {
    effects.push('Beautiful gradients');
  }
  if (req.includes('3d') || req.includes('depth')) {
    effects.push('3D depth effects');
  }
  
  return effects.length > 0 ? effects.join(', ') : 'Subtle enhancements';
}

function balancePerformance(userRequest: string): string {
  const req = userRequest.toLowerCase();
  
  if (req.includes('subtle') || req.includes('performance')) {
    return 'Optimized for performance';
  }
  if (req.includes('maximum') || req.includes('intense')) {
    return 'Maximum visual impact';
  }
  
  return 'Balanced performance and visuals';
}

function isColorDark(color: string): boolean {
  // Simple dark color detection
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Pre-defined effect combinations for quick selection
export function getEffectPresets() {
  return {
    minimal: {
      name: 'Minimal Elegance',
      description: 'Subtle shadows and smooth transitions',
      effects: ['soft-shadow', 'fade-transition'],
      performance: 'excellent'
    },
    vibrant: {
      name: 'Vibrant Energy',
      description: 'Colorful gradients and dynamic animations',
      effects: ['gradient-shift', 'pulse-animation', 'hover-glow'],
      performance: 'good'
    },
    cyberpunk: {
      name: 'Cyberpunk Matrix',
      description: 'Neon glows and futuristic effects',
      effects: ['neon-glow', 'glitch-animation', 'matrix-rain'],
      performance: 'moderate'
    },
    premium: {
      name: 'Premium Luxury',
      description: 'Gold accents and elegant transitions',
      effects: ['metallic-gradient', 'smooth-reveal', 'subtle-sparkle'],
      performance: 'good'
    },
    cosmic: {
      name: 'Cosmic Journey',
      description: 'Space themes with particle effects',
      effects: ['star-particles', 'nebula-gradient', 'float-animation'],
      performance: 'moderate'
    }
  };
}

// Export all wow effects for reference
export function getAvailableWowEffects() {
  return [
    // Visual Effects
    {
      id: 'gradient-mesh',
      name: 'Mesh Gradient',
      description: 'Beautiful flowing color gradients',
      category: 'visual',
      performance: 'low'
    },
    {
      id: 'neon-glow',
      name: 'Neon Glow',
      description: 'Electric neon outline effects',
      category: 'visual',
      performance: 'medium'
    },
    {
      id: 'glass-morphism',
      name: 'Glassmorphism',
      description: 'Frosted glass effect with blur',
      category: 'visual',
      performance: 'high'
    },
    
    // Animations
    {
      id: 'pulse',
      name: 'Pulse',
      description: 'Gentle breathing animation',
      category: 'animation',
      performance: 'low'
    },
    {
      id: 'float',
      name: 'Float',
      description: 'Smooth floating motion',
      category: 'animation',
      performance: 'low'
    },
    {
      id: 'morph',
      name: 'Morph',
      description: 'Shape morphing animation',
      category: 'animation',
      performance: 'medium'
    },
    
    // Interactive
    {
      id: 'hover-lift',
      name: 'Hover Lift',
      description: 'Lift element on hover',
      category: 'interactive',
      performance: 'low'
    },
    {
      id: 'click-ripple',
      name: 'Click Ripple',
      description: 'Ripple effect on click',
      category: 'interactive',
      performance: 'low'
    },
    {
      id: 'magnetic-hover',
      name: 'Magnetic Hover',
      description: 'Elements follow cursor',
      category: 'interactive',
      performance: 'medium'
    },
    
    // Advanced
    {
      id: 'particle-system',
      name: 'Particle System',
      description: 'Animated particle effects',
      category: 'advanced',
      performance: 'high'
    },
    {
      id: '3d-tilt',
      name: '3D Tilt',
      description: 'Interactive 3D perspective',
      category: 'advanced',
      performance: 'medium'
    },
    {
      id: 'parallax-layers',
      name: 'Parallax Layers',
      description: 'Multi-layer depth effect',
      category: 'advanced',
      performance: 'medium'
    }
  ];
}
