import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

// Simplified N8N Integration
class SimpleN8NConductor {
  private n8nWebhookUrl: string;
  
  constructor() {
    this.n8nWebhookUrl = 'https://wacocu.app.n8n.cloud/webhook/wallet-customizer-v2';
    log('SimpleN8NConductor', 'INFO', 'Initialized with webhook URL', { 
      hasWebhookUrl: !!this.n8nWebhookUrl 
    });
  }

  // Create simplified payload - only essential data
  createSimplifiedPayload(params: {
    sessionId: string,
    imageUrl: string,
    prompt: string,
    walletType: string
  }) {
    const { sessionId, imageUrl, prompt, walletType } = params;
    
    log('SimpleN8NConductor', 'INFO', 'Creating simplified payload', { 
      sessionId, 
      walletType,
      hasImageUrl: !!imageUrl,
      promptLength: prompt.length 
    });

    return {
      sessionId,
      timestamp: new Date().toISOString(),
      imageUrl,
      prompt,
      walletType
    };
  }

  // Send request to N8N and return response directly
  async processWithN8N(payload: any) {
    log('SimpleN8NConductor', 'INFO', 'Sending request to N8N', {
      sessionId: payload.sessionId,
      webhookUrl: this.n8nWebhookUrl
    });
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`N8N webhook returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      log('SimpleN8NConductor', 'INFO', 'N8N response received', {
        sessionId: payload.sessionId,
        success: result.success,
        processingTime: `${processingTime}ms`
      });

      return {
        success: true,
        result: result.result || result,
        processingTime,
        sessionId: payload.sessionId
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      log('SimpleN8NConductor', 'ERROR', 'N8N request failed', {
        sessionId: payload.sessionId,
        error: error.message,
        processingTime: `${processingTime}ms`
      });

      return {
        success: false,
        error: error.message,
        processingTime,
        sessionId: payload.sessionId
      };
    }
  }
}

// Initialize simple conductor
const n8nConductor = new SimpleN8NConductor();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log('WalletCustomizer', 'INFO', `Processing request: ${req.method} ${req.url}`);

    const url = new URL(req.url);
    
    // Main customization endpoint
    if (req.method === 'POST' && (url.pathname === '/' || url.pathname === '/customize')) {
      return await handleSimpleCustomization(req);
    }
    
    // Health check
    if (url.pathname === '/health') {
      return await handleHealth(req);
    }
    
    // Default response
    return new Response(
      JSON.stringify({
        error: 'Endpoint not found',
        availableEndpoints: [
          'POST / - Wallet customization with image URL',
          'GET /health - Health check'
        ]
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    log('WalletCustomizer', 'ERROR', 'Unhandled error', { error: error.message });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simplified customization handler
async function handleSimpleCustomization(req: Request) {
  const sessionId = crypto.randomUUID();
  log('SimpleCustomization', 'INFO', 'Starting simplified wallet customization', { sessionId });
  
  try {
    // Parse form data
    const formData = await req.formData();
    const walletId = formData.get('walletId') as string || 'phantom';
    const imageUrl = formData.get('imageUrl') as string;
    const customPrompt = formData.get('customPrompt') as string || 'Create a modern professional design';
    
    // Validate required fields
    if (!imageUrl) {
      log('SimpleCustomization', 'ERROR', 'Missing required imageUrl parameter');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'imageUrl parameter is required'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    log('SimpleCustomization', 'INFO', 'Received parameters', { 
      sessionId,
      walletId, 
      imageUrl: imageUrl.substring(0, 100) + '...',
      promptLength: customPrompt.length 
    });

    // Create simplified payload
    const payload = n8nConductor.createSimplifiedPayload({
      sessionId,
      imageUrl,
      prompt: customPrompt,
      walletType: walletId
    });

    // Send to N8N and get result directly
    const n8nResult = await n8nConductor.processWithN8N(payload);

    log('SimpleCustomization', 'INFO', 'Customization completed', { 
      sessionId, 
      success: n8nResult.success,
      processingTime: n8nResult.processingTime 
    });

    // Return N8N response directly
    return new Response(JSON.stringify(n8nResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    log('SimpleCustomization', 'ERROR', 'Customization failed', { 
      sessionId, 
      error: error.message 
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      sessionId,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Simple health check
async function handleHealth(req: Request) {
  log('Health', 'INFO', 'Health check requested');
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '3.0-simplified',
      services: {
        n8nConductor: 'ready'
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