import { supabase } from '@/integrations/supabase/client';

export interface ImageAnalysisRequest {
  imageUrl: string;
  walletType?: string;
  analysisType?: 'style' | 'structure' | 'elements';
}

export interface ImageAnalysisResult {
  colors: {
    dominant: string[];
    accent: string;
    background: string;
    text: string;
  };
  style: {
    theme: string;
    mood: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  suggestions: {
    backgroundColor: string;
    accentColor: string;
    textColor: string;
    buttonColor: string;
    styleNotes: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  result?: ImageAnalysisResult;
  error?: string;
  processingTime?: string;
}

class WalletImageAnalysisService {
  /**
   * Анализ изображения для создания стиля кошелька через llm-patch
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🖼️ Starting wallet image analysis via llm-patch...', {
        imageUrl: request.imageUrl,
        walletType: request.walletType,
        analysisType: request.analysisType
      });

      // Используем llm-patch для анализа изображения вместо legacy wallet-chat-gpt
      const { data, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          prompt: `Analyze this image and extract colors and style for ${request.walletType || 'phantom'} wallet design`,
          imageUrl: request.imageUrl,
          contextData: {
            walletType: request.walletType || 'phantom',
            activeLayer: 'wallet',
            analysisType: request.analysisType || 'style'
          },
          mode: 'image_analysis'
        }
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (error) {
        console.error('❌ Image analysis error:', error);
        throw new Error(`Image analysis failed: ${error.message}`);
      }

      console.log('✅ Image analysis completed via llm-patch:', {
        duration: `${duration}s`,
        success: data?.success
      });

      // Преобразуем ответ в нужный формат
      let result: ImageAnalysisResult;

      if (data?.patch) {
        // Если есть patch с изменениями стиля, используем их
        const patch = data.patch;
        result = {
          colors: {
            dominant: [patch.backgroundColor || '#1a1a2e', patch.accentColor || '#16213e'],
            accent: patch.accentColor || '#16213e',
            background: patch.backgroundColor || '#1a1a2e',
            text: patch.textColor || '#ffffff'
          },
          style: {
            theme: 'modern',
            mood: 'professional',
            complexity: 'moderate' as const
          },
          suggestions: {
            backgroundColor: patch.backgroundColor || '#1a1a2e',
            accentColor: patch.accentColor || '#16213e',
            textColor: patch.textColor || '#ffffff',
            buttonColor: patch.buttonColor || '#0f3460',
            styleNotes: data.explanation || 'Generated from image analysis via llm-patch'
          }
        };
      } else {
        // Создаем базовый результат анализа
        result = {
          colors: {
            dominant: ['#1a1a2e', '#16213e'],
            accent: '#16213e',
            background: '#1a1a2e',
            text: '#ffffff'
          },
          style: {
            theme: 'dark',
            mood: 'modern',
            complexity: 'simple' as const
          },
          suggestions: {
            backgroundColor: '#1a1a2e',
            accentColor: '#16213e',
            textColor: '#ffffff',
            buttonColor: '#0f3460',
            styleNotes: 'Default dark theme based on image analysis'
          }
        };
      }

      return {
        success: true,
        result,
        processingTime: `${duration.toFixed(1)}s`
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('💥 Error in wallet image analysis:', {
        error: error.message,
        duration: `${duration}s`
      });
      
      return {
        success: false,
        error: error.message,
        processingTime: `${duration.toFixed(1)}s`
      };
    }
  }

  /**
   * Сохранить результат анализа изображения
   */
  async saveImageAnalysis(request: ImageAnalysisRequest, result: ImageAnalysisResult): Promise<void> {
    try {
      console.log('💾 Saving image analysis result...');

      // Convert ImageAnalysisResult to compatible JSON format
      const jsonResult = {
        colors: result.colors,
        style: result.style,
        suggestions: result.suggestions
      };

      const { error } = await supabase
        .from('ai_requests')
        .insert({
          image_url: request.imageUrl,
          layer_type: 'image_analysis',
          style_result: jsonResult,
          status: 'completed'
        });

      if (error) {
        console.error('❌ Error saving image analysis:', error);
        throw new Error(`Failed to save analysis: ${error.message}`);
      }

      console.log('✅ Image analysis saved successfully');
    } catch (error) {
      console.error('💥 Error in saveImageAnalysis:', error);
      throw error;
    }
  }

  /**
   * Получить историю анализов изображений
   */
  async getImageAnalysisHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('layer_type', 'image_analysis')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch image analysis history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 Error fetching image analysis history:', error);
      throw error;
    }
  }

  /**
   * Быстрый анализ для извлечения основных цветов
   */
  async quickColorAnalysis(imageUrl: string): Promise<{ primary: string; secondary: string; accent: string }> {
    try {
      const analysis = await this.analyzeImage({ imageUrl, analysisType: 'style' });
      
      if (analysis.success && analysis.result) {
        return {
          primary: analysis.result.colors.background,
          secondary: analysis.result.colors.dominant[1] || analysis.result.colors.accent,
          accent: analysis.result.colors.accent
        };
      }

      // Возвращаем цвета по умолчанию
      return {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460'
      };
    } catch (error) {
      console.error('💥 Error in quick color analysis:', error);
      return {
        primary: '#1a1a2e',
        secondary: '#16213e',
        accent: '#0f3460'
      };
    }
  }
}

export const walletImageAnalysisService = new WalletImageAnalysisService();
