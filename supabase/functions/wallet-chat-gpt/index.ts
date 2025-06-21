
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import modules
import { processGPTChat } from './modules/chatHandler.ts';
import { generateImageWithDALLE, generateImageWithReplicate } from './modules/imageGenerator.ts';
import { validateWalletContext, createDefaultWalletContext } from './modules/walletManager.ts';
import { loadDesignExamples, chooseStyle } from './utils/storage-manager.ts';
import { fixedStyleExtraction } from './utils/json-parser.ts';

// Import types
import type { WalletContext } from './types/wallet.ts';
import type { GPTResponse } from './types/responses.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing wallet chat request...');

    // Get and validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();
    if (!openAIApiKey || !openAIApiKey.startsWith('sk-')) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured or invalid format',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request data
    let content, imageUrl, walletElement, walletContext, sessionId, walletType, userPrompt, mode;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const requestData = await req.json();
      content = requestData.content;
      imageUrl = requestData.imageUrl;
      walletElement = requestData.walletElement;
      walletContext = requestData.walletContext;
      mode = requestData.mode || 'analysis';
    } else {
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      imageUrl = formData.get('imageUrl') as string;
      userPrompt = formData.get('customPrompt') as string || formData.get('prompt') as string;
      walletType = formData.get('walletType') as string;
      mode = formData.get('mode') as string || 'analysis';
      
      content = userPrompt;
      walletContext = { walletType, activeLayer: 'wallet' };
    }

    console.log('🤖 Processing request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext,
      mode,
      sessionId,
      walletType
    });

    // ROUTER: Handle different modes
    if (mode === 'dalle') {
      const result = await generateImageWithDALLE(content, supabase);
      
      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          response: `I've generated an image based on your request: "${content}". You can apply it as a background to your wallet or download it.`,
          imageUrl: result.imageUrl,
          mode: 'dalle'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (mode === 'replicate') {
      const result = await generateImageWithReplicate(content, supabase);
      
      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          response: `I've generated an image based on your request: "${content}". You can apply it as a background to your wallet or download it.`,
          imageUrl: result.imageUrl,
          mode: 'replicate'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // DEFAULT: Style analysis mode
    console.log('🧠 Processing style analysis mode...');

    // Validate wallet context
    const validatedWalletContext = validateWalletContext(walletContext);

    // Load design examples
    const designExamples = await loadDesignExamples(supabase);
    
    // Choose appropriate style
    let chosenStyle = null;
    if (designExamples.length > 0 && content) {
      chosenStyle = chooseStyle(content, designExamples);
      console.log('🎨 Chosen style:', chosenStyle?.id || 'none');
    }

    // Process GPT chat
    const result = await processGPTChat(
      content,
      validatedWalletContext,
      walletElement,
      imageUrl,
      designExamples,
      chosenStyle,
      openAIApiKey
    );

    console.log('✅ GPT response generated:', result.success);
    console.log('🎨 StyleChanges extracted:', result.styleChanges ? 'YES' : 'NO');

    // Ensure we return the correct format that frontend expects
    return new Response(JSON.stringify({
      response: result.response,
      styleChanges: result.styleChanges, // This is the key format frontend expects
      success: result.success,
      mode: result.mode || 'analysis'
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
