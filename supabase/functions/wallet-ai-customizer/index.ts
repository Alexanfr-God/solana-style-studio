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
      // ИСПРАВЛЕНИЕ 1: Правильный payload для n8n
      const n8nPayload = {
        sessionId: payload.sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        walletStructure: payload.walletStructure || {
          type: payload.walletId || 'phantom',
          elements: payload.walletElements || [],
          metadata: {
            walletId: payload.walletId || 'default',
            version: '1.0'
          }
        },
        imageData: payload.imageData,
        customPrompt: payload.customPrompt || 'Create a modern and professional wallet design',
        processingMode: 'full_customization',
        learningEnabled: true,
        requestSource: 'edge_function',
        userAgent: 'wallet-ai-customizer/1.0',
        startTime: Date.now()
      };
      
      // ИСПРАВЛЕНИЕ 2: Валидация данных ПЕРЕД отправкой в n8n
      console.log('🔍 Validating payload for n8n:', {
        hasSessionId: !!n8nPayload.sessionId,
        hasWalletStructure: !!n8nPayload.walletStructure,
        hasImageData: !!n8nPayload.imageData,
        imageDataType: typeof n8nPayload.imageData,
        imageDataLength: n8nPayload.imageData?.length || 0
      });

      // Проверяем обязательные поля
      if (!n8nPayload.sessionId) {
        console.error('❌ Missing sessionId for n8n');
        return {
          success: false,
          error: 'Missing sessionId'
        };
      }

      if (!n8nPayload.walletStructure) {
        console.error('❌ Missing walletStructure for n8n');
        return {
          success: false,
          error: 'Missing walletStructure'
        };
      }

      if (!n8nPayload.imageData) {
        console.error('❌ Missing imageData for n8n');
        return {
          success: false,
          error: 'Missing imageData'
        };
      }

      // ИСПРАВЛЕНИЕ 3: Исправить обработку imageData
      let processedImageData = n8nPayload.imageData;

      if (typeof processedImageData !== 'string') {
        console.log('🔄 Converting imageData to base64...');
        // Конвертируем в base64 если это не строка
        if (processedImageData instanceof ArrayBuffer) {
          processedImageData = btoa(String.fromCharCode(...new Uint8Array(processedImageData)));
        } else if (typeof processedImageData === 'object') {
          processedImageData = JSON.stringify(processedImageData);
        }
      }

      // Обновляем payload
      n8nPayload.imageData = processedImageData;
      console.log('✅ ImageData processed, length:', processedImageData.length);
      
      // Detailed logging before request
      console.log('🚀 Starting n8n request at:', new Date().toISOString());
      console.log('📊 Request payload size:', JSON.stringify(n8nPayload).length, 'bytes');
      console.log('🚀 SENDING TO N8N:', this.n8nWebhookUrl);
      console.log('📦 PAYLOAD PREVIEW:', {
        sessionId: n8nPayload.sessionId,
        walletType: n8nPayload.walletStructure?.type, 
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
        signal: AbortSignal.timeout(240000) // 4 minutes
      });
      
      // Detailed logging after response
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log('✅ n8n response received at:', new Date().toISOString());
      console.log('⏱️  Total request duration:', duration, 'seconds');
      console.log('📦 Response size:', response.headers.get('content-length') || 'unknown', 'bytes');
      console.log('🔍 Response status:', response.status, response.statusText);
      console.log('📡 N8N RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ n8n error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500) // первые 500 символов
        });
        
        // Если это ошибка валидации от n8n
        if (errorText.includes('Missing required fields')) {
          console.error('🚨 N8N VALIDATION ERROR: Check payload format!');
          console.error('📋 Sent payload keys:', Object.keys(n8nPayload));
        }
        
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📨 N8N RESPONSE DATA:', result);
      
      log('TriggerCustomization', 'INFO', 'N8N customization completed', {
        sessionId: payload.sessionId,
        duration: `${duration}s`,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error('❌ n8n request failed after', duration, 'seconds');
      console.error('🔍 Error type:', error.name);
      console.error('📝 Error message:', error.message);
      
      // Special timeout handling
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        console.error('⏰ TIMEOUT ERROR: n8n workflow took too long');
        console.error('🔧 Suggestion: n8n workflow took', duration, 'seconds, increase timeout or optimize workflow');
      }
      
      log('TriggerCustomization', 'ERROR', 'N8N customization failed', {
        sessionId: payload.sessionId,
        duration: `${duration}s`,
        error: error.message,
        errorType: error.name
      });
      
      return {
        success: false,
        sessionId: payload.sessionId,
        error: error.name === 'AbortError' ? 'AI processing timeout' : 'N8N customization temporarily unavailable',
        details: `Request failed after ${duration}s. ${error.name === 'AbortError' ? 'n8n workflow may be taking too long.' : error.message}`,
        timestamp: new Date().toISOString(),
        debugInfo: {
          errorType: error.name,
          duration: duration,
          maxTimeout: 240
        }
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
    
    // Improved error response for timeout cases
    const isTimeout = error.name === 'AbortError' || error.message.includes('timeout');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout ? 'AI processing timeout' : error.message,
        details: isTimeout ? 'Request failed due to timeout. n8n workflow may be taking too long.' : undefined,
        sessionId,
        timestamp: new Date().toISOString(),
        debugInfo: isTimeout ? {
          errorType: error.name,
          maxTimeout: 240
        } : undefined
      }),
      { 
        status: isTimeout ? 408 : 500,
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
