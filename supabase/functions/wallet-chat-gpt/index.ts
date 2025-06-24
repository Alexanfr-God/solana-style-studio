
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import modules
import { processGPTChat } from './modules/chatHandler.ts';
import { generateImageWithDALLE, generateImageWithReplicate } from './modules/imageGenerator.ts';
import { validateWalletContext, createDefaultWalletContext } from './modules/walletManager.ts';
import { loadDesignExamples, chooseStyle } from './utils/storage-manager.ts';
import { fixedStyleExtraction } from './utils/json-parser.ts';
import { loadWalletElements, formatElementsForGPT } from './modules/walletElementsLoader.ts';

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
    console.log('🚀 Processing enhanced wallet chat request with improved element loading...');

    // Get and validate OpenAI API key
    const openAIApiKey = Deno.env.get('OPENA_API_KEY')?.trim();
    if (!openAIApiKey || !openAIApiKey.startsWith('sk-')) {
      console.error('❌ OPENA_API_KEY not configured or invalid format');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured or invalid format - check OPENA_API_KEY secret',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Using OPENA_API_KEY for OpenAI requests');

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

    // DEFAULT: Enhanced style analysis mode with improved element loading
    console.log('🧠 Processing enhanced style analysis mode with database integration...');

    // Validate wallet context
    const validatedWalletContext = validateWalletContext(walletContext);
    const currentWalletType = validatedWalletContext.walletType || 'phantom';

    // Load wallet elements using new improved loader
    const elementsData = await loadWalletElements(supabase, currentWalletType);
    
    if (elementsData.fallbackUsed) {
      console.warn('⚠️ Using fallback wallet elements due to database issues');
    }

    console.log(`📊 Loaded ${elementsData.elements.length} elements (fallback: ${elementsData.fallbackUsed})`);

    // Format elements for GPT
    const formattedElements = formatElementsForGPT(elementsData.elements, elementsData.instances);

    // Load comprehensive wallet structure (legacy support)
    const structureResponse = await supabase.functions.invoke('wallet-customization-structure', {
      method: 'GET'
    });

    let walletStructure = null;
    if (structureResponse.data?.success) {
      walletStructure = structureResponse.data.structure;
      console.log('✅ Additional wallet structure loaded');
    } else {
      console.warn('⚠️ Failed to load additional wallet structure, using primary data');
    }

    // Enhance wallet context with comprehensive data
    const enhancedWalletContext = {
      ...validatedWalletContext,
      walletStructure,
      registryElements: elementsData.elements,
      walletInstances: elementsData.instances,
      formattedElements,
      capabilities: {
        multiWalletSupport: true,
        structureAware: true,
        safeZoneRespect: true,
        collaborationReady: true,
        databaseIntegrated: !elementsData.fallbackUsed
      },
      metadata: {
        totalElements: elementsData.elements.length,
        interactiveElements: elementsData.elements.filter(e => e.is_interactive).length,
        customizableElements: elementsData.elements.filter(e => e.properties?.customizable).length,
        fallbackUsed: elementsData.fallbackUsed
      }
    };

    // Load design examples
    const designExamples = await loadDesignExamples(supabase);
    
    // Choose appropriate style
    let chosenStyle = null;
    if (designExamples.length > 0 && content) {
      chosenStyle = chooseStyle(content, designExamples);
      console.log('🎨 Chosen style:', chosenStyle?.id || 'none');
    }

    // Process GPT chat with enhanced context
    const result = await processGPTChat(
      content,
      enhancedWalletContext,
      walletElement,
      imageUrl,
      designExamples,
      chosenStyle,
      openAIApiKey
    );

    console.log('✅ Enhanced GPT response generated with database integration:', result.success);
    console.log('🎨 StyleChanges extracted:', result.styleChanges ? 'YES' : 'NO');

    // Return enhanced response format
    return new Response(JSON.stringify({
      response: result.response,
      styleChanges: result.styleChanges,
      success: result.success,
      mode: result.mode || 'analysis',
      metadata: {
        walletType: currentWalletType,
        structureAware: !!walletStructure,
        databaseIntegrated: !elementsData.fallbackUsed,
        elementsLoaded: elementsData.elements.length,
        instancesLoaded: elementsData.instances.length,
        enhancedAnalysis: true,
        fallbackUsed: elementsData.fallbackUsed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced wallet-chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
