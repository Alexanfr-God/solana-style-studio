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
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  animation?: string;
  border?: string;
  backgroundImage?: string;
  backdropFilter?: string;
  transition?: string;
  opacity?: string;
}

export interface WalletStyleSet {
  global: ComponentStyle;
  header: ComponentStyle;
  buttons: ComponentStyle;
  panels: ComponentStyle;
  navigation: ComponentStyle;
  inputs: ComponentStyle;
  cards: ComponentStyle;
  overlays: ComponentStyle;
  containers: ComponentStyle;
  searchInputs: ComponentStyle;
  aiPet: {
    zone: 'inside' | 'outside';
    bodyType: 'phantom' | 'lottie';
    emotion: 'idle' | 'happy' | 'excited' | 'sleepy' | 'suspicious' | 'sad' | 'wink';
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
  const { colorPalette, designElements, style, fontRecommendation, animationStyle } = analysis;
  
  // Enhanced gradient creation with multiple variations
  const createGradient = (color1: string, color2: string, direction = '135deg') => {
    return `linear-gradient(${direction}, ${color1}, ${color2})`;
  };
  
  const createRadialGradient = (color1: string, color2: string) => {
    return `radial-gradient(circle at center, ${color1}, ${color2})`;
  };
  
  // Smart border radius based on style analysis
  const getBorderRadius = (variant: 'small' | 'medium' | 'large') => {
    const baseRadius = {
      sharp: { small: '2px', medium: '4px', large: '8px' },
      geometric: { small: '0px', medium: '0px', large: '0px' },
      organic: { small: '12px', medium: '20px', large: '32px' },
      default: { small: '6px', medium: '12px', large: '18px' }
    };
    return baseRadius[style as keyof typeof baseRadius]?.[variant] || baseRadius.default[variant];
  };
  
  // Enhanced shadow system with multiple intensities and colors
  const getShadow = (intensity: 'subtle' | 'medium' | 'strong' | 'glow', baseColor = colorPalette.primary) => {
    const shadows = {
      subtle: `0 1px 3px ${baseColor}15, 0 1px 2px ${baseColor}10`,
      medium: `0 4px 12px ${baseColor}25, 0 2px 4px ${baseColor}15`,
      strong: `0 8px 24px ${baseColor}35, 0 4px 8px ${baseColor}20`,
      glow: `0 0 20px ${baseColor}40, 0 0 40px ${baseColor}20, 0 4px 12px ${baseColor}25`
    };
    return shadows[intensity];
  };
  
  // Animation transitions based on style
  const getTransition = (type: 'fast' | 'smooth' | 'bouncy') => {
    const transitions = {
      fast: 'all 0.15s ease-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      bouncy: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    };
    return transitions[animationStyle as keyof typeof transitions] || transitions.smooth;
  };
  
  // Backdrop filter based on design elements
  const getBackdropFilter = (strength: 'light' | 'medium' | 'strong') => {
    const filters = {
      light: 'blur(8px) saturate(120%)',
      medium: 'blur(12px) saturate(150%)',
      strong: 'blur(20px) saturate(180%)'
    };
    return filters[strength];
  };

  return {
    global: {
      backgroundColor: designElements.hasGradients 
        ? createGradient(colorPalette.background, colorPalette.primary + '22')
        : colorPalette.background,
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('medium'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('medium'),
      backgroundImage: designElements.hasGradients 
        ? `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(colorPalette.accent)}' fill-opacity='0.05'%3E%3Cpath d='m0 40l40-40h-40z'/%3E%3C/g%3E%3C/svg%3E")` 
        : undefined,
      transition: getTransition('smooth'),
      backdropFilter: getBackdropFilter('light')
    },
    header: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.primary + 'CC', colorPalette.secondary + 'AA')
        : colorPalette.primary + 'CC',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('small'),
      fontSize: '16px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('subtle'),
      gradient: designElements.hasGradients 
        ? createGradient(colorPalette.primary, colorPalette.secondary)
        : undefined,
      backdropFilter: getBackdropFilter('medium'),
      transition: getTransition('fast')
    },
    buttons: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.secondary, colorPalette.accent)
        : colorPalette.secondary,
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('medium'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('medium'),
      gradient: designElements.hasGradients 
        ? createGradient(colorPalette.secondary, colorPalette.accent, '45deg')
        : undefined,
      transition: getTransition('bouncy')
    },
    panels: {
      backgroundColor: colorPalette.background + '88',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('medium'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('subtle'),
      backgroundImage: designElements.hasTextures 
        ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(colorPalette.primary)}' fill-opacity='0.03'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        : undefined,
      backdropFilter: getBackdropFilter('light'),
      transition: getTransition('smooth')
    },
    navigation: {
      backgroundColor: designElements.hasGradients
        ? createGradient(colorPalette.primary + 'DD', colorPalette.background)
        : colorPalette.primary + 'DD',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('large'),
      fontSize: '12px',
      fontFamily: fontRecommendation,
      boxShadow: getShadow('strong'),
      backdropFilter: getBackdropFilter('strong'),
      transition: getTransition('smooth')
    },
    inputs: {
      backgroundColor: colorPalette.background + 'AA',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('small'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      border: `1px solid ${colorPalette.secondary}44`,
      boxShadow: getShadow('subtle'),
      transition: getTransition('fast')
    },
    cards: {
      backgroundColor: colorPalette.background + '66',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('medium'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      border: `1px solid ${colorPalette.primary}33`,
      boxShadow: getShadow('medium'),
      backdropFilter: getBackdropFilter('medium'),
      transition: getTransition('smooth')
    },
    overlays: {
      backgroundColor: colorPalette.background + 'E6',
      backdropFilter: getBackdropFilter('strong'),
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('glow'),
      border: `1px solid ${colorPalette.primary}22`,
      textColor: colorPalette.text,
      fontFamily: fontRecommendation,
      transition: getTransition('smooth')
    },
    containers: {
      backgroundColor: designElements.hasGradients
        ? createRadialGradient(colorPalette.background + 'CC', colorPalette.primary + '11')
        : colorPalette.background + 'BB',
      borderRadius: getBorderRadius('large'),
      border: `1px solid ${colorPalette.secondary}33`,
      boxShadow: getShadow('medium'),
      backdropFilter: getBackdropFilter('light'),
      textColor: colorPalette.text,
      fontFamily: fontRecommendation,
      transition: getTransition('smooth')
    },
    searchInputs: {
      backgroundColor: colorPalette.background + 'DD',
      textColor: colorPalette.text,
      borderRadius: getBorderRadius('large'),
      fontSize: '14px',
      fontFamily: fontRecommendation,
      border: `2px solid ${colorPalette.primary}22`,
      boxShadow: getShadow('medium'),
      backdropFilter: getBackdropFilter('light'),
      transition: getTransition('fast')
    },
    aiPet: {
      zone: 'outside',
      bodyType: 'phantom',
      emotion: animationStyle === 'bouncy' ? 'excited' : 'idle'
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
