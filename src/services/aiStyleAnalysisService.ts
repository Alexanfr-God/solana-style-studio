
import { supabase } from '@/integrations/supabase/client';

export interface AIStyleAnalysis {
  colors: string[];
  mood: string;
  style: string;
  tags: string[];
  fontRecommendation: string;
  animationStyle: string;
  designElements: {
    hasGradients: boolean;
    hasPatterns: boolean;
    hasTextures: boolean;
    lighting: string;
    contrast: string;
  };
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  composition: {
    balance: string;
    complexity: string;
    focusArea: string;
  };
}

export interface ComponentStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: string;
  fontSize: string;
  fontFamily: string;
  boxShadow: string;
  backgroundImage?: string;
  gradient?: string;
}

export interface WalletStyleSet {
  global: ComponentStyle;
  header: ComponentStyle;
  buttons: ComponentStyle;
  panels: ComponentStyle;
  navigation: ComponentStyle;
  aiPet: {
    zone: 'inside' | 'outside';
    behavior: 'orbit' | 'idle' | 'excited';
    colors: string[];
  };
}

export const analyzeImageWithAI = async (imageUrl: string): Promise<AIStyleAnalysis> => {
  try {
    const response = await supabase.functions.invoke('analyze-style', {
      body: { imageUrl }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data as AIStyleAnalysis;
  } catch (error) {
    console.error('AI Style Analysis failed:', error);
    // Enhanced fallback analysis
    return {
      colors: ['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4', '#45B7D1'],
      mood: 'modern',
      style: 'vibrant',
      tags: ['crypto', 'modern', 'sleek'],
      fontRecommendation: 'Inter',
      animationStyle: 'smooth',
      designElements: {
        hasGradients: true,
        hasPatterns: false,
        hasTextures: false,
        lighting: 'bright',
        contrast: 'medium'
      },
      colorPalette: {
        primary: '#9945FF',
        secondary: '#14F195',
        accent: '#FF6B6B',
        background: '#1a1a1a',
        text: '#FFFFFF'
      },
      composition: {
        balance: 'centered',
        complexity: 'moderate',
        focusArea: 'center'
      }
    };
  }
};

export const generateWalletStyleFromAnalysis = (analysis: AIStyleAnalysis): WalletStyleSet => {
  const { colorPalette, designElements, style, fontRecommendation } = analysis;
  
  // Generate gradients based on analysis
  const createGradient = (color1: string, color2: string) => {
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };
  
  // Smart border radius based on style
  const getBorderRadius = () => {
    switch (style) {
      case 'sharp': return '4px';
      case 'geometric': return '0px';
      case 'organic': return '24px';
      default: return '12px';
    }
  };
  
  // Smart shadow based on mood and lighting
  const getShadow = (intensity: 'light' | 'medium' | 'strong') => {
    const baseColor = colorPalette.primary;
    switch (intensity) {
      case 'light': return `0 2px 8px ${baseColor}22`;
      case 'medium': return `0 4px 20px ${baseColor}33`;
      case 'strong': return `0 8px 32px ${baseColor}44`;
      default: return `0 4px 20px ${baseColor}33`;
    }
  };
  
  const borderRadius = getBorderRadius();
  
  return {
    global: {
      backgroundColor: designElements.hasGradients 
        ? createGradient(colorPalette.background, colorPalette.primary + '22')
        : colorPalette.background,
      textColor: colorPalette.text,
      borderColor: colorPalette.secondary + '44',
      borderRadius,
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('medium'),
      backgroundImage: designElements.hasGradients 
        ? `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(colorPalette.accent)}' fill-opacity='0.05'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")` 
        : undefined
    },
    header: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.primary + 'CC', colorPalette.secondary + 'AA')
        : colorPalette.primary + 'CC',
      textColor: colorPalette.text,
      borderColor: colorPalette.secondary + '66',
      borderRadius,
      fontSize: '16px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('light'),
      gradient: designElements.hasGradients 
        ? createGradient(colorPalette.primary, colorPalette.secondary)
        : undefined
    },
    buttons: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.secondary, colorPalette.accent)
        : colorPalette.secondary,
      textColor: colorPalette.text,
      borderColor: colorPalette.accent + '88',
      borderRadius: style === 'sharp' ? '6px' : '16px',
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('medium'),
      gradient: designElements.hasGradients 
        ? createGradient(colorPalette.secondary, colorPalette.accent)
        : undefined
    },
    panels: {
      backgroundColor: colorPalette.background + '88',
      textColor: colorPalette.text,
      borderColor: colorPalette.secondary + '33',
      borderRadius,
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('light'),
      backgroundImage: designElements.hasTextures 
        ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(colorPalette.primary)}' fill-opacity='0.03'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        : undefined
    },
    navigation: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.primary + 'DD', colorPalette.background)
        : colorPalette.primary + 'DD',
      textColor: colorPalette.text,
      borderColor: colorPalette.secondary + '55',
      borderRadius: '16px',
      fontSize: '12px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('strong')
    },
    aiPet: {
      zone: 'outside',
      behavior: analysis.animationStyle === 'bouncy' ? 'excited' : 'orbit',
      colors: [colorPalette.primary, colorPalette.secondary, colorPalette.accent]
    }
  };
};

export const saveStyleToLibrary = async (
  styleName: string,
  styleData: WalletStyleSet,
  analysis: AIStyleAnalysis,
  previewImageUrl: string,
  inspirationImageUrl: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('style_library')
      .insert([{
        style_name: styleName,
        style_data: styleData as any,
        ai_analysis: analysis as any,
        preview_image_url: previewImageUrl,
        inspiration_image_url: inspirationImageUrl,
        created_by: userId || 'anonymous'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving style to library:', error);
    throw error;
  }
};
