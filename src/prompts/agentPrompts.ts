
// Enhanced Prompt Building System for Wallet AI Customization
// Removed N8N dependencies - now focuses on pure prompt engineering

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

// Basic prompt building utilities
export class PromptBuilder {
  static buildStylePrompt(
    styleBlueprint: StyleBlueprint, 
    walletBlueprint: WalletBlueprint,
    userPrompt: string
  ): string {
    return `Style Analysis Context:
Wallet Layer: ${walletBlueprint.layer}
Safe Zone: ${JSON.stringify(walletBlueprint.layout.safeZone)}
Style Blueprint: ${JSON.stringify(styleBlueprint, null, 2)}
User Request: "${userPrompt}"

Please provide styling recommendations that enhance the wallet interface.`;
  }

  static buildStructurePrompt(
    walletBlueprint: WalletBlueprint,
    userPrompt: string
  ): string {
    return `Wallet Structure Analysis:
Elements: ${JSON.stringify(walletBlueprint.elements)}
Layout: ${JSON.stringify(walletBlueprint.layout)}
User Request: "${userPrompt}"

Please analyze the wallet structure and provide recommendations.`;
  }
}
