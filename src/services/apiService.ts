
import { LayerType, WalletStyle } from '../stores/customizationStore';
import { supabase } from '@/integrations/supabase/client';
import { aiRequestService } from './aiRequestService';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log(`Generating style for ${layer} with prompt: ${prompt}`);
    
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

    // Call our edge function
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

    console.log('Generated style data:', data);
    
    // Map the style result to our WalletStyle format
    const generatedStyle: WalletStyle = {
      backgroundColor: data.style.backgroundColor || '#131313',
      backgroundImage: data.style.backgroundImage,
      accentColor: data.style.accentColor || '#9945FF',
      textColor: data.style.textColor || '#FFFFFF',
      buttonColor: data.style.buttonColor || '#9945FF',
      buttonTextColor: data.style.buttonTextColor || '#FFFFFF',
      borderRadius: data.style.borderRadius || '12px',
      fontFamily: data.style.fontFamily || 'Inter, sans-serif',
      boxShadow: data.style.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: data.style.styleNotes
    };

    return generatedStyle;
  } catch (error) {
    console.error('Error generating style:', error);
    // Return a default style in case of error
    if (layer === 'login') {
      return {
        backgroundColor: '#131313',
        accentColor: '#9945FF',
        textColor: '#FFFFFF',
        buttonColor: '#9945FF',
        buttonTextColor: '#000000',
        borderRadius: '100px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        styleNotes: 'default style (error fallback)'
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
        styleNotes: 'default style (error fallback)'
      };
    }
  }
}
