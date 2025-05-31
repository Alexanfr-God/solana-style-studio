
import { supabase } from '@/integrations/supabase/client';

export interface AIStyleAnalysis {
  colors: string[];
  mood: string;
  style: string;
  tags: string[];
  fontRecommendation: string;
  animationStyle: string;
}

export interface ComponentStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: string;
  fontSize: string;
  fontFamily: string;
  boxShadow: string;
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
    // Fallback analysis
    return {
      colors: ['#9945FF', '#14F195', '#FF6B6B'],
      mood: 'modern',
      style: 'vibrant',
      tags: ['crypto', 'modern', 'sleek'],
      fontRecommendation: 'Inter',
      animationStyle: 'smooth'
    };
  }
};

export const generateWalletStyleFromAnalysis = (analysis: AIStyleAnalysis): WalletStyleSet => {
  const [primary, secondary, accent] = analysis.colors;
  
  return {
    global: {
      backgroundColor: primary,
      textColor: '#FFFFFF',
      borderColor: secondary,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: analysis.fontRecommendation,
      boxShadow: `0 4px 20px ${primary}33`
    },
    header: {
      backgroundColor: `${primary}CC`,
      textColor: '#FFFFFF',
      borderColor: secondary,
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: analysis.fontRecommendation,
      boxShadow: `0 2px 10px ${primary}22`
    },
    buttons: {
      backgroundColor: secondary,
      textColor: '#FFFFFF',
      borderColor: accent,
      borderRadius: analysis.style === 'sharp' ? '6px' : '16px',
      fontSize: '14px',
      fontFamily: analysis.fontRecommendation,
      boxShadow: `0 2px 8px ${secondary}44`
    },
    panels: {
      backgroundColor: `${primary}11`,
      textColor: '#FFFFFF',
      borderColor: `${secondary}33`,
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: analysis.fontRecommendation,
      boxShadow: `0 1px 4px ${primary}22`
    },
    navigation: {
      backgroundColor: `${primary}DD`,
      textColor: '#FFFFFF',
      borderColor: secondary,
      borderRadius: '16px',
      fontSize: '12px',
      fontFamily: analysis.fontRecommendation,
      boxShadow: `0 2px 12px ${primary}44`
    },
    aiPet: {
      zone: 'outside',
      behavior: 'orbit',
      colors: [primary, secondary, accent]
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
    // Используем прямой SQL запрос через rpc для обхода проблемы с типами
    const { data, error } = await supabase.rpc('insert_style_to_library', {
      p_style_name: styleName,
      p_style_data: styleData,
      p_ai_analysis: analysis,
      p_preview_image_url: previewImageUrl,
      p_inspiration_image_url: inspirationImageUrl,
      p_created_by: userId || 'anonymous'
    });

    if (error) {
      // Если RPC функция не существует, используем обычный insert
      console.log('RPC function not found, using direct insert');
      
      const { data: insertData, error: insertError } = await supabase
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

      if (insertError) throw insertError;
      return insertData;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving style to library:', error);
    throw error;
  }
};
