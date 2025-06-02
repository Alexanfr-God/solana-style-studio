
import { LayerType, WalletStyle } from '../stores/customizationStore';
import { supabase } from '@/integrations/supabase/client';
import { aiRequestService } from './aiRequestService';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    console.log(`Generating style for ${layer} with prompt: ${prompt}`);
    
    // Получаем текущего пользователя из Supabase auth (который связан с Phantom кошельком)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Phantom wallet authentication required. Please connect your wallet and sign the message.');
    }
    
    const userId = user.id;
    console.log('✅ Authenticated Phantom wallet user:', userId);
    console.log('💰 Wallet address:', user.user_metadata?.wallet_address);
    
    // Валидация входных данных
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
    
    // Валидация типа слоя
    const validLayers: LayerType[] = ['login', 'wallet'];
    if (!validLayers.includes(layer)) {
      throw new Error('Invalid layer type specified.');
    }

    // Создаем запрос с валидацией пользователя
    const requestData = await aiRequestService.createRequest({
      prompt: prompt || '',
      image_url: image,
      layer_type: layer,
      status: 'pending'
    });

    console.log('📝 Created AI request:', requestData?.id);

    // Получаем сессию для аутентифицированного запроса
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session found. Please connect your Phantom wallet again.');
    }

    // Вызываем edge function с аутентификацией
    const { data, error } = await supabase.functions.invoke('generate-style', {
      body: {
        prompt: prompt || '',
        image_url: image,
        layer_type: layer,
        user_id: userId,
        wallet_address: user.user_metadata?.wallet_address
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      // Предоставляем пользователю понятные сообщения об ошибках
      if (error.message?.includes('Authentication required')) {
        throw new Error('Please connect your Phantom wallet and sign the message.');
      } else if (error.message?.includes('Rate limit exceeded')) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
      } else {
        throw new Error('Failed to generate style. Please try again.');
      }
    }

    console.log('Generated style data:', data);
    
    // Преобразуем результат стиля в формат WalletStyle
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

    console.log('✅ Style generation completed for Phantom wallet user:', userId);
    return generatedStyle;
    
  } catch (error) {
    console.error('Error generating style:', error);
    
    // Не раскрываем внутренние ошибки пользователям
    const userFriendlyMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Возвращаем стиль по умолчанию в случае ошибки
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
