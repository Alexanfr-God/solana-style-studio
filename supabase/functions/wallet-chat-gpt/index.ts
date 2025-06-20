
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase secrets.',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      content, 
      imageUrl, 
      walletElement, 
      walletContext 
    } = await req.json();

    console.log('🤖 Processing wallet chat request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext
    });

    // Build system prompt based on wallet context with language detection
    const systemPrompt = buildWalletSystemPrompt(walletContext);
    
    // Build user message with context
    const userMessage = buildUserMessage(content, walletElement, imageUrl);

    // Create messages array with proper structure for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Handle image if provided - fix the structure for GPT-4 Vision API
    if (imageUrl) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { 
            type: 'image_url', 
            image_url: { 
              url: imageUrl,
              detail: 'low'
            }
          }
        ]
      };
    }

    console.log('📤 Sending request to OpenAI with model: gpt-4o');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    // Try to extract style changes from the response
    const styleChanges = extractStyleChanges(aiResponse, walletContext);

    console.log('✅ GPT response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      styleChanges,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in wallet-chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildWalletSystemPrompt(walletContext: any): string {
  return `You are an AI assistant specialized in Web3 wallet UI customization. Your role is to help users customize their wallet interface through conversational interaction.

IMPORTANT LANGUAGE RULE: Always respond in the same language as the user's input. If the user writes in English, respond in English. If the user writes in Russian, respond in Russian. If the user writes in Spanish, respond in Spanish, etc.

WALLET CONTEXT:
- Current wallet type: ${walletContext?.walletType || 'Phantom'}
- Active layer: ${walletContext?.activeLayer || 'wallet'}
- Current style: ${JSON.stringify(walletContext?.currentStyle || {})}

CAPABILITIES:
1. Analyze wallet screenshots and suggest improvements
2. Modify specific UI elements (colors, fonts, layout, backgrounds)
3. Apply style presets and themes
4. Customize login screens and main wallet interfaces
5. Generate CSS/styling code for implementation

COMMUNICATION STYLE:
- Be conversational and helpful
- Ask clarifying questions when needed
- Provide specific, actionable suggestions
- Explain changes in simple terms
- Use emoji occasionally to make it friendly

WHEN USER UPLOADS IMAGE:
- Analyze the visual elements, colors, style
- Suggest specific customizations based on the image
- Offer to apply similar styling to their wallet

WHEN USER SELECTS ELEMENT:
- Focus on that specific UI component
- Provide targeted customization options
- Ask what aspect they want to change

Always end your responses with a question or suggestion for next steps to keep the conversation flowing.`;
}

function buildUserMessage(content: string, walletElement?: string, imageUrl?: string): string {
  let message = content;

  if (walletElement) {
    message = `I want to customize the "${walletElement}" element. ${content}`;
  }

  if (imageUrl) {
    message += '\n\nI\'ve uploaded an image for inspiration. Please analyze it and suggest how to apply similar styling to my wallet.';
  }

  return message;
}

function extractStyleChanges(response: string, walletContext: any): any {
  // Simple pattern matching for style suggestions
  // In a production app, you might want more sophisticated parsing
  
  const colorRegex = /#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g;
  const colors = response.match(colorRegex);
  
  if (colors && colors.length > 0) {
    return {
      layer: walletContext?.activeLayer || 'wallet',
      styles: {
        backgroundColor: colors[0],
        accentColor: colors[1] || colors[0],
      }
    };
  }
  
  // Check for specific style keywords
  if (response.toLowerCase().includes('dark theme') || response.toLowerCase().includes('black background')) {
    return {
      layer: walletContext?.activeLayer || 'wallet',
      styles: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
      }
    };
  }
  
  if (response.toLowerCase().includes('light theme') || response.toLowerCase().includes('white background')) {
    return {
      layer: walletContext?.activeLayer || 'wallet',
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#000000',
      }
    };
  }
  
  return null;
}
