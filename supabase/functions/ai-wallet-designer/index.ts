
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { aiOrchestrator } from "./core/ai-orchestrator.ts";
import type { AIRequest } from "./types/ai.types.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

// Test data for system testing
const TEST_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const TEST_WALLET_STRUCTURE = {
  metadata: {
    walletType: "phantom",
    version: "1.0.0",
    totalScreens: 1,
    totalCustomizableElements: 3,
    lastUpdated: new Date().toISOString()
  },
  screens: [
    {
      screenId: "home",
      description: "Main wallet screen",
      priority: "HIGH" as const,
      elements: {
        "balance": {
          elementType: "text",
          currentStyles: { color: "#FFFFFF", fontSize: "24px" },
          customizable: true,
          aiInstructions: { styleAgent: "balance-text", priority: "HIGH" }
        },
        "send-button": {
          elementType: "button",
          currentStyles: { backgroundColor: "#9945FF", borderRadius: "8px" },
          customizable: true,
          aiInstructions: { styleAgent: "action-button", priority: "HIGH" }
        },
        "background": {
          elementType: "container",
          currentStyles: { backgroundColor: "#131313" },
          customizable: true,
          aiInstructions: { styleAgent: "background", priority: "MEDIUM" }
        }
      }
    }
  ],
  elements: []
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    log('Router', 'INFO', `Processing request: ${req.method} ${path}`);

    switch (path) {
      case '/test-system':
        return await handleTestSystem(req);
      
      case '/analyze-image':
        return await handleAnalyzeImage(req);
      
      case '/wallet-analysis':
        return await handleWalletAnalysis(req);
      
      case '/style-generation':
        return await handleStyleGeneration(req);
      
      case '/full-customization':
        return await handleFullCustomization(req);
      
      case '/health':
        return await handleHealth(req);
      
      case '/status':
        return await handleStatus(req);
      
      default:
        log('Router', 'WARN', `Unknown path requested: ${path}`);
        return new Response(JSON.stringify({ 
          error: 'Not Found',
          path,
          availableEndpoints: [
            '/test-system',
            '/analyze-image',
            '/wallet-analysis', 
            '/style-generation',
            '/full-customization',
            '/health',
            '/status'
          ]
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    log('Router', 'ERROR', 'Unhandled error in main router', { error: error.message, stack: error.stack });
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleTestSystem(req: Request): Promise<Response> {
  log('TestSystem', 'INFO', 'Starting comprehensive system test');
  
  const testSteps = [];
  let currentStep = '';
  
  try {
    // Step 1: Test Image Analysis
    currentStep = 'image_analysis';
    log('TestSystem', 'INFO', 'Testing image analysis');
    const startTime1 = Date.now();
    
    try {
      const imageResult = await aiOrchestrator.process({
        type: 'image_analysis',
        walletType: 'phantom',
        imageUrl: TEST_IMAGE_BASE64
      });
      
      testSteps.push({
        step: currentStep,
        success: imageResult.success,
        duration: Date.now() - startTime1,
        result: imageResult.data,
        error: imageResult.error
      });
      
      log('TestSystem', imageResult.success ? 'INFO' : 'ERROR', `Image analysis completed: ${imageResult.success}`, imageResult);
    } catch (error) {
      testSteps.push({
        step: currentStep,
        success: false,
        duration: Date.now() - startTime1,
        result: null,
        error: error.message
      });
      log('TestSystem', 'ERROR', 'Image analysis failed', { error: error.message });
    }

    // Step 2: Test Wallet Analysis
    currentStep = 'wallet_analysis';
    log('TestSystem', 'INFO', 'Testing wallet analysis');
    const startTime2 = Date.now();
    
    try {
      const walletResult = await aiOrchestrator.process({
        type: 'wallet_analysis',
        walletType: 'phantom'
      });
      
      testSteps.push({
        step: currentStep,
        success: walletResult.success,
        duration: Date.now() - startTime2,
        result: walletResult.data,
        error: walletResult.error
      });
      
      log('TestSystem', walletResult.success ? 'INFO' : 'ERROR', `Wallet analysis completed: ${walletResult.success}`, walletResult);
    } catch (error) {
      testSteps.push({
        step: currentStep,
        success: false,
        duration: Date.now() - startTime2,
        result: null,
        error: error.message
      });
      log('TestSystem', 'ERROR', 'Wallet analysis failed', { error: error.message });
    }

    // Step 3: Test Style Generation
    currentStep = 'style_generation';
    log('TestSystem', 'INFO', 'Testing style generation');
    const startTime3 = Date.now();
    
    try {
      const styleResult = await aiOrchestrator.process({
        type: 'style_generation',
        walletType: 'phantom',
        imageUrl: TEST_IMAGE_BASE64,
        customPrompt: 'Create a modern, minimalist style'
      });
      
      testSteps.push({
        step: currentStep,
        success: styleResult.success,
        duration: Date.now() - startTime3,
        result: styleResult.data,
        error: styleResult.error
      });
      
      log('TestSystem', styleResult.success ? 'INFO' : 'ERROR', `Style generation completed: ${styleResult.success}`, styleResult);
    } catch (error) {
      testSteps.push({
        step: currentStep,
        success: false,
        duration: Date.now() - startTime3,
        result: null,
        error: error.message
      });
      log('TestSystem', 'ERROR', 'Style generation failed', { error: error.message });
    }

    // Step 4: Test Full Customization
    currentStep = 'full_customization';
    log('TestSystem', 'INFO', 'Testing full customization');
    const startTime4 = Date.now();
    
    let finalResult = null;
    try {
      const fullResult = await aiOrchestrator.process({
        type: 'full_customization',
        walletType: 'phantom',
        imageUrl: TEST_IMAGE_BASE64,
        customPrompt: 'Create a comprehensive wallet theme'
      });
      
      finalResult = fullResult.data;
      testSteps.push({
        step: currentStep,
        success: fullResult.success,
        duration: Date.now() - startTime4,
        result: fullResult.data,
        error: fullResult.error
      });
      
      log('TestSystem', fullResult.success ? 'INFO' : 'ERROR', `Full customization completed: ${fullResult.success}`, fullResult);
    } catch (error) {
      testSteps.push({
        step: currentStep,
        success: false,
        duration: Date.now() - startTime4,
        result: null,
        error: error.message
      });
      log('TestSystem', 'ERROR', 'Full customization failed', { error: error.message });
    }

    const overallSuccess = testSteps.every(step => step.success);
    const totalDuration = testSteps.reduce((sum, step) => sum + step.duration, 0);
    
    log('TestSystem', 'INFO', `System test completed. Overall success: ${overallSuccess}, Total duration: ${totalDuration}ms`);

    return new Response(JSON.stringify({
      success: overallSuccess,
      totalDuration,
      steps: testSteps,
      finalResult,
      summary: {
        total: testSteps.length,
        passed: testSteps.filter(s => s.success).length,
        failed: testSteps.filter(s => !s.success).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('TestSystem', 'ERROR', 'System test failed with unexpected error', { 
      error: error.message, 
      currentStep,
      completedSteps: testSteps.length 
    });
    
    return new Response(JSON.stringify({
      success: false,
      error: 'System test failed',
      details: error.message,
      currentStep,
      completedSteps: testSteps
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleAnalyzeImage(req: Request): Promise<Response> {
  log('AnalyzeImage', 'INFO', 'Processing image analysis request');
  
  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const walletType = formData.get('walletType') as string || 'phantom';
    
    if (!imageFile) {
      log('AnalyzeImage', 'ERROR', 'No image provided in request');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No image provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const imageUrl = `data:${imageFile.type};base64,${base64}`;
    
    log('AnalyzeImage', 'INFO', `Processing image analysis for ${walletType}`, { 
      imageSize: imageFile.size,
      imageType: imageFile.type 
    });

    const result = await aiOrchestrator.process({
      type: 'image_analysis',
      walletType,
      imageUrl
    });

    log('AnalyzeImage', result.success ? 'INFO' : 'ERROR', `Image analysis completed: ${result.success}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('AnalyzeImage', 'ERROR', 'Failed to process image analysis', { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleWalletAnalysis(req: Request): Promise<Response> {
  log('WalletAnalysis', 'INFO', 'Processing wallet analysis request');
  
  try {
    const { walletType } = await req.json();
    
    if (!walletType) {
      log('WalletAnalysis', 'ERROR', 'No wallet type provided');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Wallet type is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await aiOrchestrator.process({
      type: 'wallet_analysis',
      walletType
    });

    log('WalletAnalysis', result.success ? 'INFO' : 'ERROR', `Wallet analysis completed: ${result.success}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('WalletAnalysis', 'ERROR', 'Failed to process wallet analysis', { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleStyleGeneration(req: Request): Promise<Response> {
  log('StyleGeneration', 'INFO', 'Processing style generation request');
  
  try {
    const requestData = await req.json();
    
    const result = await aiOrchestrator.process({
      type: 'style_generation',
      ...requestData
    });

    log('StyleGeneration', result.success ? 'INFO' : 'ERROR', `Style generation completed: ${result.success}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('StyleGeneration', 'ERROR', 'Failed to process style generation', { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleFullCustomization(req: Request): Promise<Response> {
  log('FullCustomization', 'INFO', 'Processing full customization request');
  
  try {
    const requestData = await req.json();
    
    const result = await aiOrchestrator.process({
      type: 'full_customization',
      ...requestData
    });

    log('FullCustomization', result.success ? 'INFO' : 'ERROR', `Full customization completed: ${result.success}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('FullCustomization', 'ERROR', 'Failed to process full customization', { error: error.message });
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleHealth(req: Request): Promise<Response> {
  log('Health', 'INFO', 'Processing health check');
  
  try {
    // TODO: Add actual health checks for AI APIs and database
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        orchestrator: 'healthy',
        openai: 'unknown',
        anthropic: 'unknown',
        database: 'unknown',
        walletAPI: 'unknown'
      }
    };

    log('Health', 'INFO', 'Health check completed', health);

    return new Response(JSON.stringify(health), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('Health', 'ERROR', 'Health check failed', { error: error.message });
    return new Response(JSON.stringify({ 
      status: 'unhealthy',
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleStatus(req: Request): Promise<Response> {
  log('Status', 'INFO', 'Processing status check');
  
  try {
    const status = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() || 'unknown',
      environment: 'edge-function',
      endpoints: [
        '/test-system',
        '/analyze-image',
        '/wallet-analysis',
        '/style-generation', 
        '/full-customization',
        '/health',
        '/status'
      ]
    };

    log('Status', 'INFO', 'Status check completed', status);

    return new Response(JSON.stringify(status), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    log('Status', 'ERROR', 'Status check failed', { error: error.message });
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
