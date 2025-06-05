
import { LayerType, WalletStyle } from '../stores/customizationStore';
import { supabase } from '@/integrations/supabase/client';
import { aiRequestService } from './aiRequestService';
import { frontendLogger } from './frontendLogger';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log(`🎨 Starting N8N AI generation for ${layer} with prompt: ${prompt}`);
    
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

    console.log('🚀 Calling N8N-powered Edge Function...');

    // Call the updated Edge Function with N8N integration
    const { data, error } = await supabase.functions.invoke('generate-style', {
      body: {
        prompt,
        image_url: image,
        layer_type: layer,
        user_id: userId
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error('Failed to generate style: ' + error.message);
    }

    console.log('📦 N8N generation completed:', data);
    
    // Log the successful generation
    await frontendLogger.logStyleApplication(
      data.metadata?.n8nWorkflowUsed ? 'N8N Multi-Agent Design' : 'Standard Generation', 
      data.style
    );
    
    // Update AI request with success
    await aiRequestService.createRequest({
      prompt,
      image_url: image,
      layer_type: layer,
      status: 'completed',
      style_result: {
        ...data.style,
        metadata: data.metadata
      }
    });

    return data.style;
    
  } catch (error) {
    console.error('💥 N8N generation failed:', error);
    
    await frontendLogger.logUserError(
      'N8N_GENERATION_ERROR',
      error.message,
      'api_service'
    );
    
    // Return fallback style
    return getFallbackStyle(layer);
  }
}

function getFallbackStyle(layer: LayerType): WalletStyle {
  console.log('🆘 Using fallback style for:', layer);
  
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
      styleNotes: 'Fallback style - login'
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
      styleNotes: 'Fallback style - wallet'
    };
  }
}
