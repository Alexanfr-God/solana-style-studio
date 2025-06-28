
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import our unified modules
import { createWalletElementsManager } from './modules/walletElementsManager.ts';
import { createWalletManager } from './modules/walletManager.ts';
import { generateImageWithDALLE, generateImageWithReplicate } from './modules/imageGenerator.ts';

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize managers
    const elementsManager = createWalletElementsManager(supabaseUrl, supabaseKey);
    const walletManager = createWalletManager(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { content, imageUrl, walletContext, mode } = body;

    console.log('🚀 Wallet-chat-gpt called with:', {
      mode,
      hasContent: !!content,
      hasImage: !!imageUrl,
      walletType: walletContext?.walletType,
      activeLayer: walletContext?.activeLayer
    });

    // Handle different modes
    switch (mode) {
      case 'structure':
        return await handleStructureMode(elementsManager, walletContext?.walletType || 'phantom');
      
      case 'dalle':
        return await handleImageGeneration('dalle', content, supabase);
      
      case 'replicate':
        return await handleImageGeneration('replicate', content, supabase);
      
      case 'analysis':
      default:
        return await handleAnalysisMode(
          content,
          imageUrl,
          walletContext,
          supabase,
          elementsManager,
          walletManager
        );
    }

  } catch (error) {
    console.error('💥 Error in wallet-chat-gpt:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Internal server error in wallet-chat-gpt function'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Handle structure mode - return wallet elements
async function handleStructureMode(elementsManager: any, walletType: string) {
  try {
    console.log('🏗️ Structure mode: loading wallet elements...');
    
    const elements = await elementsManager.loadAllElements();
    const statistics = elementsManager.getElementsStatistics(elements);
    const grouped = elementsManager.groupElementsByScreen(elements);

    return new Response(
      JSON.stringify({
        success: true,
        walletElements: elements,
        statistics,
        grouped,
        walletType,
        mode: 'structure'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in structure mode:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: 'structure'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle image generation
async function handleImageGeneration(mode: 'dalle' | 'replicate', prompt: string, supabase: any) {
  try {
    console.log(`🖼️ Image generation mode: ${mode}`);
    
    let result;
    if (mode === 'dalle') {
      result = await generateImageWithDALLE(prompt, supabase);
    } else {
      result = await generateImageWithReplicate(prompt, supabase);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`❌ Error in ${mode} image generation:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle analysis mode - the main AI processing
async function handleAnalysisMode(
  content: string,
  imageUrl: string | undefined,
  walletContext: any,
  supabase: any,
  elementsManager: any,
  walletManager: any
) {
  try {
    console.log('🤖 Analysis mode: processing with AI...');

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENA_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create enhanced wallet context
    const walletType = walletContext?.walletType || 'phantom';
    const aiContext = await walletManager.createWalletAIContext(walletType, walletContext?.activeLayer);

    // Build the AI prompt
    const systemPrompt = `You are a Web3 wallet customization expert. You help users customize their ${walletType} wallet interface.

WALLET CONTEXT:
- Wallet Type: ${walletType}
- Active Layer: ${walletContext?.activeLayer || 'wallet'}
- Total Elements: ${aiContext.statistics.total}
- Customizable Elements: ${aiContext.statistics.customizable}
- Available Screens: ${aiContext.availableScreens?.join(', ') || 'main'}

TASK: Analyze the user's request and provide style changes in JSON format.

IMPORTANT: Always respond with JSON containing:
{
  "success": true,
  "response": "Friendly response to user",
  "userText": "User-friendly explanation",
  "styleChanges": {
    "backgroundColor": "#hexcolor",
    "accentColor": "#hexcolor", 
    "textColor": "#hexcolor",
    "buttonColor": "#hexcolor",
    "buttonTextColor": "#hexcolor",
    "borderRadius": "8px",
    "fontFamily": "Inter, sans-serif",
    "styleNotes": "Description of applied style"
  }
}`;

    const userMessage = imageUrl 
      ? `${content}\n\nI've also provided an image for style inspiration.`
      : content;

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Add image if provided
    if (imageUrl) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      };
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const aiResponse = await response.json();
    const aiContent = aiResponse.choices[0].message.content;

    console.log('🤖 AI Response:', aiContent);

    // Try to parse JSON from AI response
    let parsedResponse;
    try {
      // Extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a basic response
        parsedResponse = {
          success: true,
          response: aiContent,
          userText: aiContent,
          styleChanges: {
            backgroundColor: '#1a1a2e',
            accentColor: '#16213e',
            textColor: '#ffffff',
            buttonColor: '#0f3460',
            buttonTextColor: '#ffffff',
            borderRadius: '8px',
            fontFamily: 'Inter, sans-serif',
            styleNotes: 'AI generated style based on your request'
          }
        };
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse AI JSON, using fallback');
      parsedResponse = {
        success: true,
        response: aiContent,
        userText: aiContent,
        styleChanges: {
          backgroundColor: '#1a1a2e',
          accentColor: '#16213e',
          textColor: '#ffffff',
          buttonColor: '#0f3460',
          buttonTextColor: '#ffffff',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          styleNotes: 'AI generated style based on your request'
        }
      };
    }

    console.log('✅ Analysis completed successfully');

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in analysis mode:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        mode: 'analysis'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
