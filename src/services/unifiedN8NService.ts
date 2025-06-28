
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedN8NRequest {
  sessionId: string;
  imageUrl: string;
  prompt: string;
  walletType: string;
}

export interface UnifiedN8NResponse {
  success: boolean;
  generatedStyles?: any;
  aiAnalysis?: any;
  error?: string;
  processingTime?: number;
}

class UnifiedN8NService {
  /**
   * Execute wallet customization using the unified wallet-chat-gpt function
   */
  async executeCustomization(
    sessionId: string,
    imageUrl: string,
    prompt: string,
    walletType: string
  ): Promise<UnifiedN8NResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting unified wallet customization...', {
        sessionId,
        walletType,
        hasImage: !!imageUrl,
        prompt: prompt.substring(0, 100) + '...'
      });

      // Call the unified wallet-chat-gpt function
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          content: prompt,
          imageUrl: imageUrl,
          walletContext: {
            walletType: walletType,
            activeLayer: 'wallet',
            sessionId: sessionId
          },
          mode: 'analysis' // Use analysis mode for style generation
        }
      });

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      if (error) {
        console.error('❌ Unified customization error:', error);
        throw new Error(`Customization failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Customization failed:', data?.error);
        throw new Error(data?.error || 'Unknown customization error');
      }

      console.log('✅ Unified customization completed:', {
        sessionId,
        processingTime: `${processingTime}ms`,
        hasStyleChanges: !!data.styleChanges
      });

      // Transform the response to match the expected format
      const result: UnifiedN8NResponse = {
        success: true,
        generatedStyles: data.styleChanges || {},
        aiAnalysis: {
          style: 'AI Generated',
          colors: data.styleChanges?.backgroundColor ? [data.styleChanges.backgroundColor] : [],
          recommendations: data.response || 'AI analysis completed'
        },
        processingTime
      };

      return result;

    } catch (error) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      console.error('💥 Error in unified customization:', {
        error: error.message,
        sessionId,
        processingTime: `${processingTime}ms`
      });
      
      return {
        success: false,
        error: error.message,
        processingTime
      };
    }
  }

  /**
   * Get customization status (for polling)
   */
  async getCustomizationStatus(sessionId: string): Promise<{ status: string; progress?: number }> {
    try {
      // Since we're using direct API calls, customization is immediate
      // This method is kept for compatibility
      return {
        status: 'completed',
        progress: 100
      };
    } catch (error) {
      console.error('💥 Error getting customization status:', error);
      return {
        status: 'error'
      };
    }
  }

  /**
   * Cancel customization (for compatibility)
   */
  async cancelCustomization(sessionId: string): Promise<boolean> {
    try {
      console.log('🛑 Canceling customization:', sessionId);
      // Since we're using direct API calls, there's nothing to cancel
      return true;
    } catch (error) {
      console.error('💥 Error canceling customization:', error);
      return false;
    }
  }
}

// Create and export service instance
export const unifiedN8NService = new UnifiedN8NService();

// Export types
export type { UnifiedN8NRequest, UnifiedN8NResponse };
