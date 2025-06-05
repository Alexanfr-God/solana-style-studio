
import { supabase } from '@/integrations/supabase/client';

export interface ConductorRequest {
  imageUrl?: string;
  prompt?: string;
  walletBlueprint?: string;
  targetLayer?: string;
  userId?: string;
  sessionId?: string;
  preferences?: {
    style?: string;
    mood?: string;
    complexity?: string;
    aiPetPersonality?: string;
  };
}

export interface ConductorResponse {
  success: boolean;
  sessionId: string;
  analysis?: any;
  styleResult?: any;
  recommendations?: any;
  nextSteps?: string[];
  error?: string;
}

export interface AIRecommendations {
  styleImprovements: string[];
  aiPetCustomization: {
    recommendedEmotion: string;
    customAnimations: string[];
    interactionTriggers: string[];
  };
  userExperienceEnhancements: string[];
  accessibilityNotes: string[];
  performanceOptimizations: string[];
  futureIterations: string[];
}

export class AIConductorService {
  
  /**
   * Основной метод для запуска AI Conductor
   */
  static async runConductor(request: ConductorRequest): Promise<ConductorResponse> {
    try {
      console.log('🎭 Starting AI Conductor with request:', request);
      
      const { data, error } = await supabase.functions.invoke('ai-conductor', {
        body: request
      });

      if (error) {
        console.error('AI Conductor error:', error);
        throw new Error(error.message);
      }

      console.log('✅ AI Conductor completed successfully:', data);
      return data as ConductorResponse;
      
    } catch (error) {
      console.error('AI Conductor service error:', error);
      return {
        success: false,
        sessionId: request.sessionId || '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Анализ изображения с помощью AI Conductor
   */
  static async analyzeImageWithConductor(
    imageUrl: string, 
    preferences?: ConductorRequest['preferences']
  ): Promise<ConductorResponse> {
    return this.runConductor({
      imageUrl,
      prompt: 'Analyze this image for wallet styling',
      targetLayer: 'global',
      preferences
    });
  }

  /**
   * Генерация стиля на основе промта
   */
  static async generateStyleWithConductor(
    prompt: string,
    targetLayer: string = 'global',
    preferences?: ConductorRequest['preferences']
  ): Promise<ConductorResponse> {
    return this.runConductor({
      prompt,
      targetLayer,
      preferences
    });
  }

  /**
   * Комбинированный анализ изображения и промта
   */
  static async analyzeImageAndPrompt(
    imageUrl: string,
    prompt: string,
    targetLayer: string = 'global',
    preferences?: ConductorRequest['preferences']
  ): Promise<ConductorResponse> {
    return this.runConductor({
      imageUrl,
      prompt,
      targetLayer,
      preferences
    });
  }

  /**
   * Получение сессии по ID
   */
  static async getSession(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching session:', error);
      return null;
    }
  }

  /**
   * Получение истории сессий пользователя
   */
  static async getUserSessions(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Сохранение пользовательской обратной связи
   */
  static async saveFeedback(
    sessionId: string,
    rating: number,
    feedback?: string,
    improvements?: string[]
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('save-feedback', {
        body: {
          sessionId,
          rating,
          feedback,
          improvements,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving feedback:', error);
      throw error;
    }
  }

  /**
   * Применение стиля к кошельку
   */
  static async applyStyleToWallet(sessionId: string, walletId: string) {
    try {
      const session = await this.getSession(sessionId);
      if (!session?.style_result) {
        throw new Error('No style result found in session');
      }

      // Здесь можно добавить логику применения стиля к конкретному кошельку
      console.log('Applying style to wallet:', walletId, session.style_result);
      
      return {
        success: true,
        appliedStyle: session.style_result,
        walletId
      };
    } catch (error) {
      console.error('Error applying style to wallet:', error);
      throw error;
    }
  }

  /**
   * Получение рекомендаций AI Pet
   */
  static extractAIPetRecommendations(conductorResponse: ConductorResponse) {
    const recommendations = conductorResponse.recommendations as AIRecommendations;
    return recommendations?.aiPetCustomization || {
      recommendedEmotion: 'idle',
      customAnimations: ['subtle bounce'],
      interactionTriggers: ['wallet unlock']
    };
  }

  /**
   * Создание конфигурации AI Pet на основе стиля
   */
  static createAIPetConfig(conductorResponse: ConductorResponse) {
    const aiPetRec = this.extractAIPetRecommendations(conductorResponse);
    const analysis = conductorResponse.analysis;
    
    return {
      emotion: aiPetRec.recommendedEmotion as any,
      zone: 'inside' as const,
      bodyType: 'phantom' as const,
      customAnimations: aiPetRec.customAnimations,
      interactionTriggers: aiPetRec.interactionTriggers,
      colorScheme: analysis?.colors?.primary || '#9945FF',
      personality: aiPetRec.recommendedEmotion
    };
  }
}

export default AIConductorService;
