
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiOrchestrator } from "./core/ai-orchestrator.ts";
import { walletAnalyzer } from "./ai-agents/wallet-analyzer.ts";
import { imageAnalyzer } from "./ai-agents/image-analyzer.ts";
import { customizationAI } from "./ai-agents/customization-ai.ts";

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
    const url = new URL(req.url);
    const path = url.pathname;

    // Route to appropriate handler
    if (path.includes('/analyze-wallet')) {
      const { walletData } = await req.json();
      const result = await walletAnalyzer.analyzeWallet(walletData);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.includes('/analyze-image')) {
      const { imageUrl } = await req.json();
      const result = await imageAnalyzer.analyzeImage(imageUrl);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path.includes('/customize')) {
      const { designRequest } = await req.json();
      const result = await customizationAI.generateCustomization(designRequest);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default orchestrator endpoint
    const requestData = await req.json();
    const result = await aiOrchestrator.process(requestData);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI Wallet Designer:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
