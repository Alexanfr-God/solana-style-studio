
import { supabase } from '@/integrations/supabase/client';

export async function customizeWalletWithAI(
  imageFile: File,
  walletId: string = 'phantom',
  customPrompt: string = 'Create a modern professional design'
) {
  try {
    console.log('🎨 Starting wallet AI customization...', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      walletId,
      promptLength: customPrompt.length
    });

    // Prepare FormData for the edge function
    const formData = new FormData();
    formData.append('walletId', walletId);
    formData.append('image', imageFile);
    formData.append('customPrompt', customPrompt);

    console.log('📤 Sending request to wallet-ai-customizer edge function...');

    // Call the edge function using Supabase client
    const { data, error } = await supabase.functions.invoke('wallet-ai-customizer', {
      method: 'POST',
      body: formData,
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log('✅ AI Customization completed:', data);
    return data;

  } catch (error) {
    console.error('💥 Error in customizeWalletWithAI:', error);
    throw error;
  }
}
