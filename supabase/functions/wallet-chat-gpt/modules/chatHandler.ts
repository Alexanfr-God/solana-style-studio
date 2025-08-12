
import "https://deno.land/x/xhr@0.1.0/mod.ts";

export interface ChatRequest {
  content: string;
  imageUrl?: string;
  walletContext?: any;
  sessionId?: string;
  mode?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  styleChanges?: any;
}

export async function handleChatWithGPT(request: ChatRequest): Promise<ChatResponse> {
  try {
    console.log('💬 Processing chat request:', {
      content: request.content,
      hasImage: !!request.imageUrl,
      mode: request.mode
    });

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENA_API_KEY');
    
    if (!openAiApiKey) {
      console.error('❌ OpenAI API key not found');
      return {
        success: false,
        error: 'OpenAI API key not configured'
      };
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for a crypto wallet customization platform. Help users with wallet styling, design, and general questions about their wallet interface.'
      },
      {
        role: 'user',
        content: request.content
      }
    ];

    // Add image analysis if image is provided
    if (request.imageUrl) {
      messages[1].content = [
        {
          type: 'text',
          text: request.content
        },
        {
          type: 'image_url',
          image_url: {
            url: request.imageUrl
          }
        }
      ];
    }

    console.log('📤 Sending request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');

    const aiResponse = data.choices?.[0]?.message?.content || 'Sorry, I could not process your request.';

    return {
      success: true,
      response: aiResponse,
      styleChanges: null // Can be extended later for style modifications
    };

  } catch (error) {
    console.error('💥 Chat handler error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process chat request'
    };
  }
}
