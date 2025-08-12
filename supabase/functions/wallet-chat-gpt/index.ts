
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import modules
import { createImageGenerationManager } from './modules/imageGenerator.ts';
import { handleChatWithGPT } from './modules/chatHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`🚀 Wallet Chat GPT Request received`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { 
      content, 
      mode, 
      imageUrl, 
      walletContext, 
      sessionId,
      isImageGeneration = false,
      debugMode = false
    } = requestBody;

    console.log(`🚀 Processing request: {
  mode: "${mode}",
  message: "${content}",
  isImageGeneration: ${isImageGeneration}
}`);

    // Check for required API keys
    const openAiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('OPENA_API_KEY');
    const leonardoKey = Deno.env.get('LEONARDO_API_KEY');
    const replicateKey = Deno.env.get('REPLICATE_API_KEY');

    console.log('🔑 API Keys status:', {
      openAI: !!openAiKey,
      leonardo: !!leonardoKey,
      replicate: !!replicateKey
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle image generation requests
    const isImageGenerationMode = mode === 'leonardo' || mode === 'replicate' || isImageGeneration;
    
    if (isImageGenerationMode) {
      console.log(`🎨 Handling image generation with mode: ${mode}`);
      
      // Check if the required API key exists for the selected generator
      if (mode === 'leonardo' && !leonardoKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Leonardo API key not configured',
          mode: mode
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (mode === 'replicate' && !replicateKey) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Replicate API key not configured',
          mode: mode
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const imageManager = createImageGenerationManager(supabaseUrl, supabaseKey);
      
      const imageRequest = {
        prompt: content,
        style: 'digital art',
        type: 'wallet_background',
        dimensions: { width: 1024, height: 1024 },
        generator: mode as 'leonardo' | 'replicate',
        options: {
          enhancePrompt: true,
          optimizeForWallet: true,
          highQuality: true
        }
      };

      console.log(`📋 Image generation request:`, imageRequest);

      const imageResult = await imageManager.generateImage(imageRequest);
      
      console.log(`📊 Image generation result:`, imageResult);

      if (imageResult.success && imageResult.imageUrl) {
        return new Response(JSON.stringify({
          success: true,
          imageUrl: imageResult.imageUrl,
          data: {
            imageUrl: imageResult.imageUrl
          },
          metadata: imageResult.metadata,
          mode: mode
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.error(`❌ Image generation failed:`, imageResult.error);
        return new Response(JSON.stringify({
          success: false,
          error: imageResult.error || 'Image generation failed',
          mode: mode
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle regular chat
    console.log('💬 Handling chat request...');
    
    if (!openAiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'OpenAI API key not configured for chat functionality'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const chatResult = await handleChatWithGPT({
      content,
      imageUrl,
      walletContext,
      sessionId,
      mode: 'analysis'
    });

    return new Response(JSON.stringify(chatResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Edge Function Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
