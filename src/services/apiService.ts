
import { LayerType, WalletStyle } from '../stores/customizationStore';
import { supabase } from '@/integrations/supabase/client';
import { aiRequestService } from './aiRequestService';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log(`Generating style for ${layer} with prompt: ${prompt}`);
    
    // Security: Get current user and ensure authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication required. Please log in to generate styles.');
    }
    
    const userId = user.id;
    console.log('✅ Authenticated user for style generation:', userId);
    
    // Security: Input validation
    if (!prompt && !image) {
      throw new Error('Either a prompt or an image is required for style generation.');
    }
    
    if (prompt && typeof prompt !== 'string') {
      throw new Error('Prompt must be a string.');
    }
    
    if (prompt && prompt.length > 500) {
      throw new Error('Prompt is too long. Please keep it under 500 characters.');
    }
    
    if (image && typeof image !== 'string') {
      throw new Error('Image must be a valid URL string.');
    }
    
    // Security: Validate layer type
    const validLayers: LayerType[] = ['login', 'wallet'];
    if (!validLayers.includes(layer)) {
      throw new Error('Invalid layer type specified.');
    }

    // Create a pending AI request with user validation
    const requestData = await aiRequestService.createRequest({
      prompt: prompt || '',
      image_url: image,
      layer_type: layer,
      status: 'pending'
    });

    console.log('📝 Created AI request:', requestData?.id);

    // Security: Get session for authenticated request
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found. Please log in again.');
    }

    // Call our edge function with authentication
    const { data, error } = await supabase.functions.invoke('generate-style', {
      body: {
        prompt: prompt || '',
        image_url: image,
        layer_type: layer,
        user_id: userId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      // Provide user-friendly error messages
      if (error.message?.includes('Authentication required')) {
        throw new Error('Please log in to generate styles.');
      } else if (error.message?.includes('Rate limit exceeded')) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      } else {
        throw new Error('Failed to generate style. Please try again.');
      }
    }

    console.log('Generated style data:', data);
    
    // Map the style result to our WalletStyle format
    const generatedStyle: WalletStyle = {
      backgroundColor: data.style?.backgroundColor || '#131313',
      backgroundImage: data.style?.backgroundImage,
      accentColor: data.style?.accentColor || '#9945FF',
      textColor: data.style?.textColor || '#FFFFFF',
      buttonColor: data.style?.buttonColor || '#9945FF',
      buttonTextColor: data.style?.buttonTextColor || '#FFFFFF',
      borderRadius: data.style?.borderRadius || '12px',
      fontFamily: data.style?.fontFamily || 'Inter, sans-serif',
      boxShadow: data.style?.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: data.style?.styleNotes
    };

    console.log('✅ Style generation completed for user:', userId);
    return generatedStyle;
    
  } catch (error) {
    console.error('Error generating style:', error);
    
    // Security: Don't expose internal errors to users
    const userFriendlyMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
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
        styleNotes: `Error: ${userFriendlyMessage} (using default style)`
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
        styleNotes: `Error: ${userFriendlyMessage} (using default style)`
      };
    }
  }
}
