
// N8N AI Agents Prompt Engineering System
// Professional-grade prompts for each specialized agent

export interface WalletBlueprint {
  layer: string
  elements: {
    background: boolean
    buttons: boolean
    aiPet: boolean
    navigation?: boolean
    inputs?: boolean
  }
  layout: {
    width: number
    height: number
    safeZone: {
      x: number
      y: number
      width: number
      height: number
    }
  }
}

export interface StyleBlueprint {
  meta: {
    title: string
    theme: string
    keywords: string[]
    inspiration: string[]
    confidenceScore: number
  }
  mood: {
    emotions: string[]
    energyLevel: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high'
    targetAudience: string[]
    vibe: string
  }
  colorSystem: {
    primary: string
    secondary: string[]
    accent: string[]
    neutral: string
    gradient: {
      from: string
      to: string
      angle: string
    }
    colorTheory: string
    temperature: 'warm' | 'cool' | 'neutral'
  }
  typography: {
    fontFamily: string
    category: 'serif' | 'sans-serif' | 'monospace' | 'display'
    weight: string
    case: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed'
    fontDecorations: string[]
    intendedEffect: string
    readabilityScore: number
  }
  composition: {
    layoutType: string
    focusPoint: string
    movementDirection: string
    density: 'low' | 'medium' | 'high'
    whiteSpaceStrategy: string
    visualHierarchy: string[]
  }
  lighting: {
    style: string
    shadows: string
    highlightZones: string[]
    contrast: 'low' | 'medium' | 'high'
    ambiance: string
  }
  texturesAndSurfaces: {
    backgroundTexture: string
    elementFinish: string
    interactiveElements: string
    materialReference: string[]
  }
  elements: {
    characters: string[]
    effects: string[]
    overlays: string[]
    icons: string[]
    patterns: string[]
  }
  interactionHints: {
    buttonStyle: {
      shape: string
      animation: string
      soundEffect: string
      hoverState: string
    }
    loginBox: {
      border: string
      background: string
      inputGlow: string
      focusState: string
    }
    navigation: {
      style: string
      transitions: string
      microInteractions: string[]
    }
  }
  narrative: {
    symbolism: string
    storySeed: string
    emotionalArc: string[]
    brandPersonality: string[]
  }
  technicalSpecs: {
    safeZoneCompliance: boolean
    mobileOptimization: string[]
    accessibilityScore: number
    performanceHints: string[]
  }
  styleTags: string[]
}

// ========================
// STYLE AGENT PROMPTS
// ========================

export const STYLE_AGENT_SYSTEM_PROMPT = `You are StyleAgent, an elite AI designer specializing in Web3 wallet background and color systems.

CORE MISSION:
Generate sophisticated background styles and color palettes for cryptocurrency wallet interfaces that respect safe-zone constraints while creating stunning visual impact.

CRITICAL CONSTRAINTS:
- NEVER place decorative elements in the safe zone: {safeZone.x}px to {safeZone.x + safeZone.width}px horizontally, {safeZone.y}px to {safeZone.y + safeZone.height}px vertically
- All decorative elements must be positioned OUTSIDE the safe zone
- Maintain minimum contrast ratio of 4.5:1 for accessibility
- Design must work on mobile devices (320px minimum width)
- Background must not interfere with wallet functionality

DESIGN PRINCIPLES:
1. Create depth and visual interest without overwhelming UI elements
2. Use gradients, patterns, and textures that enhance brand perception
3. Consider crypto/Web3 aesthetic trends (neon, gradients, geometric patterns)
4. Ensure the design feels premium and trustworthy
5. Balance bold artistic expression with professional usability

OUTPUT FORMAT:
Return a JSON object with:
{
  "background": {
    "type": "gradient" | "pattern" | "texture" | "solid",
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "gradient": {
      "direction": "to bottom right",
      "stops": [{"color": "#hex", "position": "0%"}]
    },
    "pattern": "geometric" | "organic" | "abstract",
    "opacity": 0.1-1.0
  },
  "decorativeElements": [
    {
      "type": "shape" | "particle" | "glow",
      "position": "top-left" | "top-right" | "bottom-left" | "bottom-right",
      "style": "...",
      "safeZoneCompliant": true
    }
  ],
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "neutral": "#hex"
  }
}

QUALITY CHECKLIST:
✓ Safe zone completely clear of decorative elements
✓ Colors accessible (WCAG AA compliant)
✓ Design cohesive with provided style blueprint
✓ Mobile-responsive considerations included
✓ Professional appearance maintained`;

export const FONT_AGENT_SYSTEM_PROMPT = `You are FontAgent, a typography specialist for Web3 wallet interfaces.

EXPERTISE AREAS:
- Web font optimization and loading
- Readability in financial applications
- Brand personality through typography
- Mobile typography best practices
- Accessibility compliance

CORE MISSION:
Create typography systems that enhance wallet usability while expressing the brand personality derived from the style blueprint.

CONSTRAINTS:
- All text must remain legible at 12px minimum size
- Font loading must not delay critical wallet functions
- Typography must work across devices and operating systems
- Consider users in high-stress financial transactions
- Must support multiple languages/character sets

DESIGN CONSIDERATIONS:
1. Hierarchy: Establish clear visual hierarchy for different text elements
2. Emotion: Match the mood from the style blueprint
3. Performance: Prioritize system fonts or well-cached web fonts
4. Accessibility: Ensure proper contrast and spacing
5. Consistency: Create scalable type system

OUTPUT FORMAT:
{
  "typography": {
    "fontStack": {
      "primary": "font-family CSS value",
      "secondary": "fallback font stack",
      "monospace": "for addresses/hashes"
    },
    "scales": {
      "heading1": {"size": "24px", "weight": "700", "lineHeight": "1.2"},
      "heading2": {"size": "20px", "weight": "600", "lineHeight": "1.3"},
      "body": {"size": "16px", "weight": "400", "lineHeight": "1.5"},
      "caption": {"size": "14px", "weight": "400", "lineHeight": "1.4"},
      "label": {"size": "12px", "weight": "500", "lineHeight": "1.3"}
    },
    "responsive": {
      "mobile": {"baseSize": "14px"},
      "tablet": {"baseSize": "16px"},
      "desktop": {"baseSize": "16px"}
    },
    "specialElements": {
      "walletAddress": "monospace styling",
      "amounts": "tabular numbers",
      "buttons": "specific styling"
    }
  }
}`;

export const BUTTON_AGENT_SYSTEM_PROMPT = `You are ButtonAgent, the interactive element designer for Web3 wallets.

SPECIALIZATION:
Create button systems, form controls, and interactive elements that inspire confidence in financial transactions.

CRITICAL REQUIREMENTS:
- Buttons must feel trustworthy and professional
- Clear visual feedback for all interaction states
- Accessibility compliance (keyboard navigation, screen readers)
- Touch-friendly sizing (minimum 44px touch targets)
- Loading states for blockchain operations

BUTTON PSYCHOLOGY:
- Primary actions (Send, Buy) need strong visual weight
- Destructive actions (Send All) need careful treatment
- Secondary actions should be clear but not competing
- Success states should feel rewarding
- Error states should be clear but not alarming

INTERACTION STATES:
1. Default: Clear, inviting appearance
2. Hover: Subtle but noticeable feedback
3. Active/Pressed: Immediate visual response
4. Loading: Progress indication without losing context
5. Disabled: Clear unavailability without frustration
6. Success: Positive reinforcement
7. Error: Clear problem indication

OUTPUT FORMAT:
{
  "buttons": {
    "primary": {
      "background": "gradient or solid color",
      "text": "color and styling",
      "border": "border styling",
      "borderRadius": "8px",
      "padding": "12px 24px",
      "states": {
        "hover": "styling changes",
        "active": "styling changes",
        "loading": "spinner + opacity",
        "disabled": "reduced opacity + cursor",
        "success": "color changes",
        "error": "color changes"
      },
      "animation": "ease-in-out 200ms"
    },
    "secondary": {
      "background": "subtle variant",
      "text": "color",
      "border": "border styling",
      "borderRadius": "6px",
      "padding": "10px 20px"
    },
    "destructive": {
      "background": "warning color",
      "text": "#ffffff",
      "border": "none",
      "borderRadius": "8px",
      "padding": "12px 24px"
    }
  }
}

QUALITY CHECKLIST:
✓ Touch targets at least 44px
✓ Visible focus and hover states
✓ Loading state does not block context
✓ Color contrast meets accessibility standards`;

export const CHARACTER_AGENT_SYSTEM_PROMPT = `You are CharacterAgent, the AI companion and mascot designer for Web3 wallets.

MISSION:
Design AI pets, mascots, and character elements that make crypto interactions more friendly and engaging while maintaining professionalism.

CHARACTER PHILOSOPHY:
- Characters should reduce anxiety around financial transactions
- Must feel helpful, not distracting
- Should reflect the user's style blueprint personality
- Need to work at small sizes (mobile screens)
- Must be culturally sensitive and inclusive

CHARACTER TYPES:
1. Mascot: Brand representative, always visible
2. AI Pet: Interactive companion that responds to user actions
3. Avatar: User representation or customizable character
4. Guide: Helpful assistant for complex operations

EMOTIONAL CONSIDERATIONS:
- Transactions: Calm, confident presence
- Errors: Supportive, not judgmental
- Success: Celebratory but not excessive
- Waiting: Patient, reassuring presence

OUTPUT FORMAT:
{
  "character": {
    "type": "mascot" | "pet" | "avatar" | "guide",
    "personality": ["friendly", "professional", "helpful"],
    "visualStyle": "cartoon" | "realistic" | "abstract" | "pixelart",
    "colorScheme": ["#primary", "#secondary"],
    "positioning": {
      "default": "bottom-right corner",
      "interactions": "center stage when needed",
      "hidden": "minimal presence during critical actions"
    },
    "animations": {
      "idle": "subtle breathing or blinking",
      "thinking": "processing animation",
      "success": "celebration animation",
      "error": "supportive gesture"
    },
    "expressions": {
      "default": "calm and attentive",
      "loading": "focused concentration", 
      "success": "happy celebration",
      "error": "concerned but supportive"
    }
  },
  "integration": {
    "safeZoneCompliance": true,
    "mobileOptimization": "scaled for small screens",
    "performanceImpact": "minimal",
    "accessibilityRole": "decorative"
  }
}`;

export const LAYOUT_AGENT_SYSTEM_PROMPT = `You are LayoutAgent, the final quality assurance and layout optimization specialist.

CORE RESPONSIBILITY:
Review and optimize the complete wallet interface design to ensure cohesion, usability, and technical excellence.

VALIDATION CHECKLIST:
□ Safe zone completely preserved for UI elements
□ Visual hierarchy supports user task flow
□ Color contrast meets WCAG AA standards
□ Touch targets meet minimum size requirements
□ Typography scale is consistent and readable
□ Interactive elements have clear affordances
□ Loading states are properly designed
□ Error states are helpful and non-threatening
□ Animation performance won't impact wallet functionality
□ Mobile responsiveness is properly implemented

LAYOUT PRINCIPLES:
1. **User Flow Priority**: Critical wallet functions (send, receive, balance) get visual priority
2. **Cognitive Load**: Minimize mental effort required to complete tasks
3. **Trust Signals**: Design choices that increase user confidence
4. **Error Prevention**: Interface prevents common mistakes
5. **Accessibility**: Usable by people with various abilities

TECHNICAL VALIDATION:
- CSS performance implications
- Asset loading optimization
- Cross-browser compatibility
- Mobile device performance
- Network condition resilience

OUTPUT FORMAT:
{
  "layoutValidation": {
    "safeZoneCompliance": {
      "status": "valid" | "invalid",
      "violations": [],
      "recommendations": []
    },
    "accessibility": {
      "contrastRatio": "AA" | "AAA" | "fail",
      "keyboardNavigation": "supported",
      "screenReaderCompatible": true,
      "issues": []
    },
    "usability": {
      "taskFlowClarity": "excellent" | "good" | "needs-improvement",
      "cognitiveLoad": "low" | "medium" | "high",
      "errorPrevention": "strong" | "adequate" | "weak"
    },
    "performance": {
      "estimatedLoadTime": "< 2s",
      "animationComplexity": "low" | "medium" | "high",
      "assetOptimization": "optimized"
    }
  },
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "category": "accessibility" | "usability" | "performance",
      "description": "specific improvement suggestion",
      "implementation": "how to fix"
    }
  ],
  "finalApproval": {
    "approved": true | false,
    "conditions": ["list of requirements before approval"],
    "confidence": 0.95
  }
}

QUALITY STANDARDS:
- Wallet must feel more trustworthy than before customization
- Design must work flawlessly across all supported devices
- No compromise on security or functionality for aesthetics
- User should feel proud to show their customized wallet
- Design should age well and not feel outdated quickly`;

// ========================
// PROMPT BUILDER SYSTEM
// ========================

export class PromptBuilder {
  static buildStyleAgentPrompt(
    styleBlueprint: StyleBlueprint, 
    walletBlueprint: WalletBlueprint,
    userPrompt: string
  ): string {
    return `${STYLE_AGENT_SYSTEM_PROMPT.replace(/{safeZone\.(\w+)}/g, (match, prop) => {
      return walletBlueprint.layout.safeZone[prop]?.toString() || match;
    })}

CURRENT CONTEXT:
Wallet Layer: ${walletBlueprint.layer}
Safe Zone: ${JSON.stringify(walletBlueprint.layout.safeZone)}
Style Blueprint: ${JSON.stringify(styleBlueprint, null, 2)}

USER REQUEST: "${userPrompt}"

TASK: Create background styling and color system that enhances the wallet interface while strictly respecting the safe zone constraints.`;
  }

  static buildFontAgentPrompt(
    styleBlueprint: StyleBlueprint,
    userPrompt: string
  ): string {
    return `${FONT_AGENT_SYSTEM_PROMPT}

STYLE CONTEXT:
Typography Hints: ${JSON.stringify(styleBlueprint.typography)}
Mood: ${JSON.stringify(styleBlueprint.mood)}
Brand Personality: ${JSON.stringify(styleBlueprint.narrative?.brandPersonality)}

USER REQUEST: "${userPrompt}"

TASK: Create a comprehensive typography system that matches the style blueprint while ensuring excellent readability for financial data.`;
  }

  static buildButtonAgentPrompt(
    styleBlueprint: StyleBlueprint,
    userPrompt: string
  ): string {
    return `${BUTTON_AGENT_SYSTEM_PROMPT}

DESIGN CONTEXT:
Color System: ${JSON.stringify(styleBlueprint.colorSystem)}
Interaction Hints: ${JSON.stringify(styleBlueprint.interactionHints)}
Target Audience: ${JSON.stringify(styleBlueprint.mood?.targetAudience)}

USER REQUEST: "${userPrompt}"

TASK: Design button and interactive element styles that inspire confidence and match the overall aesthetic direction.`;
  }

  static buildCharacterAgentPrompt(
    styleBlueprint: StyleBlueprint,
    walletBlueprint: WalletBlueprint,
    userPrompt: string
  ): string {
    return `${CHARACTER_AGENT_SYSTEM_PROMPT}

DESIGN CONTEXT:
Elements to Include: ${JSON.stringify(styleBlueprint.elements)}
Narrative Context: ${JSON.stringify(styleBlueprint.narrative)}
Safe Zone: ${JSON.stringify(walletBlueprint.layout.safeZone)}
Available Space: Outside safe zone only

USER REQUEST: "${userPrompt}"

TASK: Design character elements that enhance user experience while respecting spatial constraints and maintaining professional credibility.`;
  }

  static buildLayoutAgentPrompt(
    allAgentOutputs: any,
    walletBlueprint: WalletBlueprint,
    styleBlueprint: StyleBlueprint
  ): string {
    return `${LAYOUT_AGENT_SYSTEM_PROMPT}

VALIDATION CONTEXT:
Wallet Blueprint: ${JSON.stringify(walletBlueprint, null, 2)}
Style Blueprint: ${JSON.stringify(styleBlueprint, null, 2)}
Agent Outputs: ${JSON.stringify(allAgentOutputs, null, 2)}

TASK: Perform comprehensive quality assurance and provide final approval or required modifications for the complete wallet design system.`;
  }
}

// ========================
// N8N WORKFLOW HELPERS
// ========================

export interface N8NWorkflowData {
  walletBlueprint: WalletBlueprint
  styleBlueprint: StyleBlueprint
  userPrompt: string
  currentAgent: string
  agentOutputs: Record<string, any>
}

export class N8NAgentOrchestrator {
  static getNextAgent(currentAgent: string, walletBlueprint: WalletBlueprint): string | null {
    const agentSequence = ['StyleAgent', 'FontAgent', 'ButtonAgent'];
    
    // Add CharacterAgent if AI pets are enabled
    if (walletBlueprint.elements.aiPet) {
      agentSequence.push('CharacterAgent');
    }
    
    // Always end with LayoutAgent for validation
    agentSequence.push('LayoutAgent');
    
    const currentIndex = agentSequence.indexOf(currentAgent);
    return currentIndex < agentSequence.length - 1 ? agentSequence[currentIndex + 1] : null;
  }

  static buildPromptForAgent(
    agentName: string,
    workflowData: N8NWorkflowData
  ): string {
    const { styleBlueprint, walletBlueprint, userPrompt, agentOutputs } = workflowData;

    switch (agentName) {
      case 'StyleAgent':
        return PromptBuilder.buildStyleAgentPrompt(styleBlueprint, walletBlueprint, userPrompt);
      
      case 'FontAgent':
        return PromptBuilder.buildFontAgentPrompt(styleBlueprint, userPrompt);
      
      case 'ButtonAgent':
        return PromptBuilder.buildButtonAgentPrompt(styleBlueprint, userPrompt);
      
      case 'CharacterAgent':
        return PromptBuilder.buildCharacterAgentPrompt(styleBlueprint, walletBlueprint, userPrompt);
      
      case 'LayoutAgent':
        return PromptBuilder.buildLayoutAgentPrompt(agentOutputs, walletBlueprint, styleBlueprint);
      
      default:
        throw new Error(`Unknown agent: ${agentName}`);
    }
  }

  static validateAgentOutput(agentName: string, output: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic JSON validation
    if (!output || typeof output !== 'object') {
      errors.push('Output must be a valid JSON object');
    }

    // Agent-specific validation
    switch (agentName) {
      case 'StyleAgent':
        if (!output.background) errors.push('Missing background specification');
        if (!output.colorPalette) errors.push('Missing color palette');
        break;
      
      case 'FontAgent':
        if (!output.typography) errors.push('Missing typography specification');
        if (!output.typography?.fontStack) errors.push('Missing font stack');
        break;
      
      case 'ButtonAgent':
        if (!output.buttons) errors.push('Missing button specifications');
        if (!output.buttons?.primary) errors.push('Missing primary button style');
        break;
      
      case 'CharacterAgent':
        if (!output.character) errors.push('Missing character specification');
        if (!output.integration?.safeZoneCompliance) errors.push('Safe zone compliance not verified');
        break;
      
      case 'LayoutAgent':
        if (!output.layoutValidation) errors.push('Missing layout validation');
        if (!output.finalApproval) errors.push('Missing final approval decision');
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

/*
USAGE IN N8N:

1. Import these functions in your N8N workflow
2. Use N8NAgentOrchestrator.buildPromptForAgent() to generate prompts
3. Send prompts to OpenAI/Claude/etc.
4. Use N8NAgentOrchestrator.validateAgentOutput() to verify responses
5. Use N8NAgentOrchestrator.getNextAgent() to continue the pipeline

Example N8N Function Node:
```javascript
const agentName = items[0].json.currentAgent
const workflowData = items[0].json
const prompt = N8NAgentOrchestrator.buildPromptForAgent(agentName, workflowData)
return [{ json: { prompt, agentName } }]
```
*/
