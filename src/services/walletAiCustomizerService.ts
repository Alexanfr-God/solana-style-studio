
import { supabase } from '@/integrations/supabase/client';

export async function customizeWalletWithAI(
  imageUrl: string,
  walletId: string = 'phantom',
  customPrompt: string = 'Create a modern professional design'
) {
  const startTime = Date.now();
  
  try {
    console.log('🎨 Starting wallet AI customization...', {
      imageUrl,
      walletId,
      promptLength: customPrompt.length,
      startTime: new Date().toISOString()
    });

    // Prepare FormData for the edge function
    const formData = new FormData();
    formData.append('walletId', walletId);
    formData.append('imageUrl', imageUrl);
    formData.append('customPrompt', customPrompt);

    console.log('📤 Sending request to wallet-ai-customizer edge function...');

    // Call the edge function using Supabase client with longer timeout
    const { data, error } = await supabase.functions.invoke('wallet-ai-customizer', {
      method: 'POST',
      body: formData,
    });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    if (error) {
      console.error('❌ Edge function error:', error);
      console.error('⏱️ Request failed after:', duration, 'seconds');
      
      // Улучшенная обработка различных типов ошибок
      if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
        throw new Error(`AI processing timeout after ${duration}s. The design analysis is taking longer than expected.`);
      } else if (error.message?.includes('NetworkError')) {
        throw new Error('Network connection error. Please check your internet and try again.');
      } else {
        throw new Error(`Edge function error: ${error.message}`);
      }
    }

    console.log('✅ AI Customization completed:', {
      duration: `${duration}s`,
      success: data?.success,
      hasResult: !!data?.result
    });
    
    // Добавляем информацию о времени обработки в результат
    if (data) {
      data.processingTime = `${duration.toFixed(1)}s`;
    }
    
    return data;

  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error('💥 Error in customizeWalletWithAI:', {
      error: error.message,
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
