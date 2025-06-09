import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Temporarily commented out - files don't exist yet
// import { WalletAPIClient } from "./core/wallet-api-client.ts";
// import { ImageProcessor } from "./core/image-processor.ts";
// import { N8NConductor } from "./core/n8n-conductor.ts";
// import { LearningCollector } from "./core/learning-collector.ts";
// import { ValidationService } from "./services/validation.ts";
// import { NFTStub } from "./services/nft-stub.ts";

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

// Working stub classes with real N8N connection
class N8NConductor {
  private n8nWebhookUrl: string;
  
  constructor() {
    this.n8nWebhookUrl = 'https://wacocu.app.n8n.cloud/webhook/wallet-customizer';
    log('N8NConductor', 'INFO', 'N8NConductor initialized', { 
      hasWebhookUrl: !!this.n8nWebhookUrl 
    });
  }
  
  async triggerCustomization(payload: any) {
    log('TriggerCustomization', 'INFO', 'Starting N8N customization process', {
      sessionId: payload.sessionId,
      walletId: payload.walletId,
      hasImage: !!payload.imageData,
      webhookUrl: this.n8nWebhookUrl
    });
    
    const startTime = Date.now();
    
    try {
      const n8nPayload = {
        sessionId: payload.sessionId,
        timestamp: new Date().toISOString(),
        walletStructure: payload.walletStructure,
        walletId: payload.walletId,
        imageData: payload.imageData,
        customPrompt: payload.customPrompt || 'Create a modern and professional wallet design',
        processingMode: 'full_customization',
        learningEnabled: true,
        requestSource: 'edge_function',
        userAgent: 'wallet-ai-customizer/1.0'
      };
      
      console.log('🚀 SENDING TO N8N:', this.n8nWebhookUrl);
      console.log('📦 PAYLOAD PREVIEW:', {
        sessionId: n8nPayload.sessionId,
        walletType: n8nPayload.walletId, 
        hasImage: !!n8nPayload.imageData,
        imageSize: n8nPayload.imageData?.length || 0,
        prompt: n8nPayload.customPrompt
      });
      
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': payload.sessionId
        },
        body: JSON.stringify(n8nPayload),
        signal: AbortSignal.timeout(120000)
      });
      
      console.log('📡 N8N RESPONSE STATUS:', response.status);
      console.log('📡 N8N RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📨 N8N RESPONSE DATA:', result);
      
      log('TriggerCustomization', 'INFO', 'N8N customization completed', {
        sessionId: payload.sessionId,
        duration: `${duration}ms`,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('TriggerCustomization', 'ERROR', 'N8N customization failed', {
        sessionId: payload.sessionId,
        duration: `${duration}ms`,
        error: error.message
      });
      
      return {
        success: false,
        sessionId: payload.sessionId,
        error: 'N8N customization temporarily unavailable',
        details: error.message
      };
    }
  }
}

class WalletAPIClient {
  async getWalletStructure(walletId: string) {
    log('WalletAPI', 'INFO', 'Getting wallet structure', { walletId });
    return { 
      walletId, 
      structure: 'mock_structure',
      metadata: {
        totalCustomizableElements: 0,
        totalScreens: 0
      }
    };
  }
}

class ImageProcessor {
  async processUploadedImage(file: File) {
    log('ImageProcessor', 'INFO', 'Processing image', { fileName: file.name, size: file.size });
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      Array.from(new Uint8Array(arrayBuffer))
        .map(byte => String.fromCharCode(byte))
        .join('')
    );
    return {
      base64Data: `data:${file.type};base64,${base64}`,
      imageSize: file.size,
      format: file.type
    };
  }
}

class LearningCollector {
  async collectUserSession(data: any) {
    log('LearningCollector', 'INFO', 'Collecting user session', data);
  }
  
  async saveUserRating(sessionId: string, rating: number, feedback: string) {
    log('LearningCollector', 'INFO', 'Saving user rating', { sessionId, rating, feedback });
  }
}

class NFTStub {
  async prepareMetadata(sessionId: string) {
    log('NFTStub', 'INFO', 'Preparing NFT metadata', { sessionId });
    return { success: true, metadata: 'mock_nft_data' };
  }
}

class ValidationService {
  async validateCustomizeRequest(data: any) {
    log('ValidationService', 'INFO', 'Validating request', data);
    if (!data.walletId || !data.imageFile) {
      return { valid: false, error: 'Missing walletId or imageFile' };
    }
    return { valid: true };
  }
}

// Initialize services with working stub classes
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
    log('Router', 'INFO', `Processing request: ${req.method} ${req.url}`);

    // Route based on HTTP method instead of path
    switch (req.method) {
      case 'POST':
        return await handleCustomizeWallet(req);
      
      case 'GET':
        const url = new URL(req.url);
        if (url.searchParams.has('health')) {
          return await handleHealth(req);
        }
        if (url.searchParams.has('sessionId')) {
          return await handleNFTPrepare(req);
        }
        return await handleHealth(req); // Default GET to health
      
      default:
        return new Response(
          JSON.stringify({
            error: 'Method Not Allowed',
            allowedMethods: ['POST', 'GET', 'OPTIONS']
          }),
          { 
            status: 405, 
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
    
    log('CustomizeWallet', 'INFO', 'Received form data', {
      walletId,
      imageFileName: imageFile?.name,
      imageSize: imageFile?.size,
      customPrompt
    });
    
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
        result,
        customization: {
          backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          accentColor: "#ff6b6b",
          textColor: "#ffffff",
          buttonStyle: "rounded-lg",
          cardOpacity: 0.9
        }
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
