
import { LayerType, WalletStyle } from '../stores/customizationStore';
import { supabase } from '@/integrations/supabase/client';
import { aiRequestService } from './aiRequestService';
import { n8nAgentService } from './n8nAgentService';
import { analyzeImageWithBlueprint, extractAgentInstructions } from './styleBlueprintService';
import { frontendLogger } from './frontendLogger';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log(`🎨 Starting enhanced AI generation for ${layer} with prompt: ${prompt}`);
    
    await frontendLogger.logStyleGeneration(prompt, !!image);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Create a pending AI request
    const requestData = await aiRequestService.createRequest({
      prompt,
      image_url: image,
      layer_type: layer,
      status: 'pending'
    });

    // Step 1: Analyze image if provided to get StyleBlueprint
    let styleBlueprint = null;
    if (image) {
      console.log('📊 Analyzing image with StyleBlueprint...');
      try {
        const analysis = await analyzeImageWithBlueprint(image, prompt);
        styleBlueprint = analysis.styleBlueprint;
        console.log('✅ StyleBlueprint generated:', styleBlueprint);
      } catch (error) {
        console.warn('⚠️ StyleBlueprint analysis failed, using fallback:', error);
        styleBlueprint = createFallbackStyleBlueprint(prompt);
      }
    } else {
      console.log('🎯 Creating StyleBlueprint from prompt only...');
      styleBlueprint = createFallbackStyleBlueprint(prompt);
    }

    // Step 2: Create WalletBlueprint based on layer
    const walletBlueprint = {
      layer,
      elements: {
        background: true,
        buttons: true,
        aiPet: layer === 'wallet', // AI pets only on wallet layer
        navigation: layer === 'wallet',
        inputs: layer === 'login'
      },
      layout: {
        width: 320,
        height: 569,
        safeZone: {
          x: 20,
          y: 50,
          width: 280,
          height: 469
        }
      }
    };

    console.log('🏗️ Wallet Blueprint created:', walletBlueprint);

    // Step 3: Execute N8N Agent Pipeline
    console.log('🤖 Starting N8N Multi-Agent Pipeline...');
    const pipelineResult = await n8nAgentService.executeAgentPipeline(
      styleBlueprint,
      walletBlueprint,
      prompt
    );

    if (pipelineResult.success) {
      console.log('🎉 Multi-agent pipeline completed successfully!');
      await frontendLogger.logStyleApplication('N8N Multi-Agent Design', pipelineResult.finalOutput);
      
      // Update AI request with success
      await aiRequestService.createRequest({
        prompt,
        image_url: image,
        layer_type: layer,
        status: 'completed',
        style_result: pipelineResult.finalOutput
      });

      return pipelineResult.finalOutput;
    } else {
      console.warn('⚠️ Multi-agent pipeline had errors, using fallback generation');
      
      // Fallback to original generation method
      const fallbackStyle = await generateStyleFallback(prompt, image, layer);
      
      await frontendLogger.logStyleApplication('Fallback Generation', fallbackStyle);
      
      return fallbackStyle;
    }
    
  } catch (error) {
    console.error('💥 Enhanced generation failed:', error);
    
    await frontendLogger.logUserError(
      'ENHANCED_GENERATION_ERROR',
      error.message,
      'api_service'
    );
    
    // Return fallback style
    return generateStyleFallback(prompt, image, layer);
  }
}

async function generateStyleFallback(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log('🔄 Using fallback generation method...');
    
    // Call original Edge Function as fallback
    const { data, error } = await supabase.functions.invoke('generate-style', {
      body: {
        prompt,
        image_url: image,
        layer_type: layer,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to generate style: ' + error.message);
    }

    console.log('📦 Fallback generation completed:', data);
    
    // Map the style result to our WalletStyle format
    const generatedStyle: WalletStyle = {
      backgroundColor: data.style.backgroundColor || '#131313',
      backgroundImage: data.style.backgroundImage,
      accentColor: data.style.accentColor || '#9945FF',
      textColor: data.style.textColor || '#FFFFFF',
      buttonColor: data.style.buttonColor || '#9945FF',
      buttonTextColor: data.style.buttonTextColor || '#FFFFFF',
      borderRadius: data.style.borderRadius || '12px',
      fontFamily: data.style.fontFamily || 'Inter, sans-serif',
      boxShadow: data.style.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: data.style.styleNotes || 'Fallback generation'
    };

    return generatedStyle;
    
  } catch (fallbackError) {
    console.error('💥 Fallback generation also failed:', fallbackError);
    
    // Return absolute fallback
    return getAbsoluteFallbackStyle(layer);
  }
}

function createFallbackStyleBlueprint(prompt: string): any {
  // Create a basic StyleBlueprint based on prompt keywords
  const isNeon = prompt.toLowerCase().includes('neon');
  const isDark = prompt.toLowerCase().includes('dark');
  const isMinimal = prompt.toLowerCase().includes('minimal');
  
  return {
    meta: {
      title: 'AI Generated Style',
      theme: isNeon ? 'neon' : isDark ? 'dark' : isMinimal ? 'minimal' : 'modern',
      keywords: prompt.split(' ').slice(0, 5),
      inspiration: ['Web3', 'Modern UI'],
      confidenceScore: 0.7
    },
    mood: {
      emotions: ['confident', 'modern'],
      energyLevel: 'medium',
      targetAudience: ['crypto users'],
      vibe: isNeon ? 'futuristic' : isDark ? 'professional' : 'clean'
    },
    colorSystem: {
      primary: isNeon ? '#00ff88' : isDark ? '#1a1a1a' : '#9945FF',
      secondary: ['#14F195', '#F037A5'],
      accent: ['#9945FF'],
      neutral: '#FFFFFF',
      gradient: {
        from: '#9945FF',
        to: '#14F195',
        angle: '45deg'
      },
      colorTheory: 'complementary',
      temperature: isNeon ? 'cool' : 'neutral'
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      category: 'sans-serif',
      weight: 'normal',
      case: 'mixed',
      fontDecorations: [],
      intendedEffect: 'readable',
      readabilityScore: 0.9
    },
    // ... остальные поля с базовыми значениями
    composition: { layoutType: 'centered', focusPoint: 'center', movementDirection: 'vertical', density: 'medium', whiteSpaceStrategy: 'balanced', visualHierarchy: ['title', 'content', 'actions'] },
    lighting: { style: 'soft', shadows: 'subtle', highlightZones: ['primary actions'], contrast: 'medium', ambiance: 'professional' },
    texturesAndSurfaces: { backgroundTexture: 'smooth', elementFinish: 'matte', interactiveElements: 'subtle glow', materialReference: ['glass', 'metal'] },
    elements: { characters: [], effects: ['glow'], overlays: [], icons: ['wallet', 'crypto'], patterns: ['geometric'] },
    interactionHints: {
      buttonStyle: { shape: 'rounded', animation: 'smooth', soundEffect: 'none', hoverState: 'glow' },
      loginBox: { border: 'subtle', background: 'transparent', inputGlow: 'accent', focusState: 'highlight' },
      navigation: { style: 'minimal', transitions: 'smooth', microInteractions: ['hover', 'active'] }
    },
    narrative: { symbolism: 'trust', storySeed: 'modern finance', emotionalArc: ['welcome', 'confidence'], brandPersonality: ['professional', 'innovative'] },
    technicalSpecs: { safeZoneCompliance: true, mobileOptimization: ['responsive', 'touch-friendly'], accessibilityScore: 0.9, performanceHints: ['optimize-images', 'lazy-load'] },
    styleTags: ['web3', 'modern', 'professional']
  };
}

function getAbsoluteFallbackStyle(layer: LayerType): WalletStyle {
  console.log('🆘 Using absolute fallback style for:', layer);
  
  if (layer === 'login') {
    return {
      backgroundColor: '#131313',
      accentColor: '#9945FF',
      textColor: '#FFFFFF',
      buttonColor: '#9945FF',
      buttonTextColor: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: 'Absolute fallback - login style'
    };
  } else {
    return {
      backgroundColor: '#131313',
      accentColor: '#9945FF',
      textColor: '#FFFFFF',
      buttonColor: 'rgba(40, 40, 40, 0.8)',
      buttonTextColor: '#9945FF',
      borderRadius: '16px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: 'Absolute fallback - wallet style'
    };
  }
}
