import { supabase } from '@/integrations/supabase/client';

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

export interface AnalysisResponse {
  success: boolean
  timestamp: string
  imageUrl: string
  styleBlueprint: StyleBlueprint
  processingMeta: {
    model: string
    promptVersion: string
    confidenceScore: number
    processingTime: number
  }
}

export async function analyzeImageWithBlueprint(
  imageUrl: string, 
  additionalContext?: string,
  walletBlueprint?: any,
  webhookUrl?: string
): Promise<AnalysisResponse> {
  try {
    console.log('Starting StyleBlueprint analysis for:', imageUrl);
    
    const { data, error } = await supabase.functions.invoke('analyze-wallet-image', {
      body: {
        imageUrl,
        additionalContext,
        walletBlueprint,
        webhookUrl
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to analyze image: ' + error.message);
    }

    console.log('StyleBlueprint analysis completed:', data);
    return data;
  } catch (error) {
    console.error('Error in StyleBlueprint analysis:', error);
    throw error;
  }
}

// Utility functions for converting StyleBlueprint to wallet styles
export function blueprintToWalletStyles(blueprint: StyleBlueprint) {
  return {
    // Global styles based on blueprint
    backgroundColor: blueprint.colorSystem.primary,
    backgroundImage: blueprint.colorSystem.gradient 
      ? `linear-gradient(${blueprint.colorSystem.gradient.angle}, ${blueprint.colorSystem.gradient.from}, ${blueprint.colorSystem.gradient.to})`
      : undefined,
    accentColor: blueprint.colorSystem.accent[0] || blueprint.colorSystem.primary,
    textColor: blueprint.lighting.contrast === 'high' ? '#FFFFFF' : '#000000',
    buttonColor: blueprint.colorSystem.secondary[0] || blueprint.colorSystem.primary,
    buttonTextColor: blueprint.lighting.contrast === 'high' ? '#000000' : '#FFFFFF',
    borderRadius: blueprint.interactionHints.buttonStyle.shape.includes('round') ? '100px' : '12px',
    fontFamily: blueprint.typography.fontFamily,
    boxShadow: blueprint.lighting.shadows || '0 4px 12px rgba(0, 0, 0, 0.25)',
    styleNotes: `${blueprint.meta.theme} - ${blueprint.mood.vibe} (Confidence: ${blueprint.meta.confidenceScore})`,
    // Add missing gradient property
    gradient: blueprint.colorSystem.gradient 
      ? `linear-gradient(${blueprint.colorSystem.gradient.angle}, ${blueprint.colorSystem.gradient.from}, ${blueprint.colorSystem.gradient.to})`
      : `linear-gradient(135deg, ${blueprint.colorSystem.accent[0] || blueprint.colorSystem.primary}, ${blueprint.colorSystem.primary})`
  };
}

// Multi-agent preparation functions
export function extractAgentInstructions(blueprint: StyleBlueprint) {
  return {
    styleAgent: {
      theme: blueprint.meta.theme,
      mood: blueprint.mood.vibe,
      colorSystem: blueprint.colorSystem,
      lighting: blueprint.lighting
    },
    fontAgent: {
      typography: blueprint.typography,
      readabilityScore: blueprint.typography.readabilityScore,
      targetAudience: blueprint.mood.targetAudience
    },
    buttonAgent: {
      buttonStyle: blueprint.interactionHints.buttonStyle,
      interactiveElements: blueprint.texturesAndSurfaces.interactiveElements,
      animations: blueprint.interactionHints.buttonStyle.animation
    },
    layoutAgent: {
      composition: blueprint.composition,
      safeZone: blueprint.technicalSpecs.safeZoneCompliance,
      mobileOptimization: blueprint.technicalSpecs.mobileOptimization
    },
    narrativeAgent: {
      narrative: blueprint.narrative,
      elements: blueprint.elements,
      culturalContext: blueprint.meta.inspiration
    }
  };
}
