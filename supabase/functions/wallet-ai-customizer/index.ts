
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { WalletAPIClient } from "./core/wallet-api-client.ts";
import { ImageProcessor } from "./core/image-processor.ts";
import { N8NConductor } from "./core/n8n-conductor.ts";
import { LearningCollector } from "./core/learning-collector.ts";
import { NFTStub } from "./services/nft-stub.ts";
import { ValidationService } from "./services/validation.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

// Initialize services
const walletAPI = new WalletAPIClient();
const imageProcessor = new ImageProcessor();
const n8nConductor = new N8NConductor();
const learningCollector = new LearningCollector();
const nftStub = new NFTStub();
const validator = new ValidationService();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    log('Router', 'INFO', `Processing request: ${req.method} ${path}`);

    switch (path) {
      case '/customize-wallet':
        return await handleCustomizeWallet(req);
      
      case '/rate-result':
        return await handleRateResult(req);
      
      case '/nft-prepare':
        return await handleNFTPrepare(req);
      
      case '/health':
        return await handleHealth(req);
      
      default:
        return new Response(
          JSON.stringify({
            error: 'Not Found',
            availableEndpoints: [
              '/customize-wallet',
              '/rate-result', 
              '/nft-prepare',
              '/health'
            ]
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    log('Router', 'ERROR', 'Unhandled error', { error: error.message });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleCustomizeWallet(req: Request) {
  const sessionId = crypto.randomUUID();
  log('CustomizeWallet', 'INFO', 'Starting wallet customization', { sessionId });
  
  try {
    // Parse form data
    const formData = await req.formData();
    const walletId = formData.get('walletId') as string;
    const imageFile = formData.get('image') as File;
    const customPrompt = formData.get('customPrompt') as string || '';
    
    // Validate inputs
    const validation = await validator.validateCustomizeRequest({
      walletId,
      imageFile,
      customPrompt
    });
    
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: validation.error
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 1: Get wallet structure
    log('CustomizeWallet', 'INFO', 'Fetching wallet structure', { walletId });
    const walletStructure = await walletAPI.getWalletStructure(walletId);
    
    // Step 2: Process image
    log('CustomizeWallet', 'INFO', 'Processing user image');
    const imageData = await imageProcessor.processUploadedImage(imageFile);
    
    // Step 3: Save user session
    log('CustomizeWallet', 'INFO', 'Saving user session');
    await learningCollector.collectUserSession({
      sessionId,
      walletId,
      customPrompt,
      imageInfo: {
        size: imageData.imageSize,
        format: imageData.format
      }
    });
    
    // Step 4: Send to N8N
    log('CustomizeWallet', 'INFO', 'Triggering N8N customization');
    const result = await n8nConductor.triggerCustomization({
      sessionId,
      walletStructure,
      imageData: imageData.base64Data,
      customPrompt,
      walletId
    });
    
    log('CustomizeWallet', 'INFO', 'Customization completed', { sessionId });
    
    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    log('CustomizeWallet', 'ERROR', 'Customization failed', { 
      sessionId, 
      error: error.message 
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        sessionId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleRateResult(req: Request) {
  log('RateResult', 'INFO', 'Processing user rating');
  
  try {
    const { sessionId, rating, feedback } = await req.json();
    
    await learningCollector.saveUserRating(sessionId, rating, feedback);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    log('RateResult', 'ERROR', 'Failed to save rating', { error: error.message });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleNFTPrepare(req: Request) {
  log('NFTPrepare', 'INFO', 'Preparing NFT metadata');
  
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sessionId required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const nftData = await nftStub.prepareMetadata(sessionId);
    
    return new Response(
      JSON.stringify(nftData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    log('NFTPrepare', 'ERROR', 'NFT preparation failed', { error: error.message });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleHealth(req: Request) {
  log('Health', 'INFO', 'Health check requested');
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        walletAPI: 'ready',
        imageProcessor: 'ready',
        n8nConductor: 'ready',
        learningCollector: 'ready',
        nftStub: 'ready'
      }
    };
    
    return new Response(
      JSON.stringify(health),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
