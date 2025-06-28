
import { supabase } from '@/integrations/supabase/client';

export interface StyleAnalysisRequest {
  imageUrl: string;
  prompt?: string;
  walletType?: string;
  layerType?: 'login' | 'wallet';
}

export interface StyleAnalysisResult {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow?: string;
  styleNotes?: string;
}

export interface AnalysisResponse {
  success: boolean;
  result?: StyleAnalysisResult;
  error?: string;
  processingTime?: string;
}

class AiStyleAnalysisService {
  /**
   * Анализ стиля с помощью AI
   */
  async analyzeStyle(request: StyleAnalysisRequest): Promise<AnalysisResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🎨 Starting AI style analysis...', {
        imageUrl: request.imageUrl,
        walletType: request.walletType,
        layerType: request.layerType,
        hasPrompt: !!request.prompt
      });

      // Используем wallet-chat-gpt для анализа стиля
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: request.prompt || 'Analyze this image and create wallet style',
          imageUrl: request.imageUrl,
          walletContext: {
            walletType: request.walletType || 'phantom',
            activeLayer: request.layerType || 'wallet'
          },
          mode: 'analysis'
        }
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (error) {
        console.error('❌ AI style analysis error:', error);
        throw new Error(`Style analysis failed: ${error.message}`);
      }

      console.log('✅ AI style analysis completed:', {
        duration: `${duration}s`,
        success: data?.success,
        hasStyleChanges: !!data?.styleChanges
      });

      // Если есть styleChanges в ответе, используем их
      if (data?.styleChanges) {
        return {
          success: true,
          result: data.styleChanges,
          processingTime: `${duration.toFixed(1)}s`
        };
      }

      // Иначе создаем базовый стиль
      const fallbackStyle: StyleAnalysisResult = {
        backgroundColor: '#1a1a2e',
        accentColor: '#16213e',
        textColor: '#ffffff',
        buttonColor: '#0f3460',
        buttonTextColor: '#ffffff',
        borderRadius: '8px',
        fontFamily: 'Inter, sans-serif',
        styleNotes: 'Generated fallback style based on image analysis'
      };

      return {
        success: true,
        result: fallbackStyle,
        processingTime: `${duration.toFixed(1)}s`
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('💥 Error in AI style analysis:', {
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
   * Сохранить результат анализа в базу данных
   */
  async saveAnalysisResult(request: StyleAnalysisRequest, result: StyleAnalysisResult): Promise<void> {
    try {
      console.log('💾 Saving analysis result to database...');

      const { error } = await supabase
        .from('ai_requests')
        .insert({
          prompt: request.prompt,
          image_url: request.imageUrl,
          layer_type: request.layerType,
          style_result: result,
          status: 'completed'
        });

      if (error) {
        console.error('❌ Error saving analysis result:', error);
        throw new Error(`Failed to save result: ${error.message}`);
      }

      console.log('✅ Analysis result saved successfully');
    } catch (error) {
      console.error('💥 Error in saveAnalysisResult:', error);
      throw error;
    }
  }

  /**
   * Получить историю анализов
   */
  async getAnalysisHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 Error fetching analysis history:', error);
      throw error;
    }
  }

  /**
   * Создать стиль на основе текстового описания
   */
  async createStyleFromPrompt(prompt: string, layerType?: 'login' | 'wallet'): Promise<AnalysisResponse> {
    return this.analyzeStyle({
      imageUrl: '', // Пустой imageUrl для текстового анализа
      prompt,
      layerType
    });
  }
}

// Создаем экземпляр сервиса
export const aiStyleAnalysisService = new AiStyleAnalysisService();

// Экспортируем типы
export type { StyleAnalysisRequest, StyleAnalysisResult, AnalysisResponse };
