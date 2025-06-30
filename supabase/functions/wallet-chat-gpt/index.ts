// ====== Enhanced index.ts ======
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import unified modules
import { createWalletElementsManager } from './modules/walletElementsManager.ts';
import { createWalletManager } from './modules/walletManager.ts';
import { createChatHandler, type ChatContext } from './modules/chatHandler.ts';
import { createStyleAnalyzer } from './modules/styleAnalyzer.ts';
import { createPosterGenerator } from './modules/posterGeneration.ts';
import { createStorageManager } from './utils/storage-manager.ts';
import { createAdvancedPromptBuilder, AdvancedPromptBuilder, detectUserLanguage, getLocalizedExample } from './utils/prompt-builder.ts';
import { AdvancedJSONParser } from './utils/json-parser.ts';
import { generateImageWithLeonardo, generateImageWithReplicate } from './modules/imageGenerator.ts';

// Types
import type { 
  APIResponse, 
  StyleChangeResponse, 
  ImageGenerationResponse,
  ChatResponse 
} from './types/responses.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main serve function
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
    const chatHandler = createChatHandler(supabaseUrl, supabaseKey);
    const styleAnalyzer = createStyleAnalyzer(supabaseUrl, supabaseKey);
    const posterGenerator = createPosterGenerator(supabaseUrl, supabaseKey);
    const storageManager = createStorageManager(supabaseUrl, supabaseKey);
    const promptBuilder = createAdvancedPromptBuilder();

    const body = await req.json();
    const { 
      content, 
      imageUrl, 
      walletContext, 
      mode, 
      sessionId,
      userId,
      chatHistory 
    } = body;

    console.log('🚀 Enhanced wallet-chat-gpt called with:', {
      mode,
      hasContent: !!content,
      hasImage: !!imageUrl,
      walletType: walletContext?.walletType,
      activeLayer: walletContext?.activeLayer,
      sessionId,
      userId,
      contentPreview: content?.substring(0, 50) + '...'
    });

    // Route to appropriate handler based on mode
    switch (mode) {
      case 'structure':
        return await handleStructureMode(elementsManager, walletContext?.walletType || 'phantom');
      
      case 'chat':
        return await handleChatMode(
          chatHandler, 
          content, 
          imageUrl, 
          walletContext, 
          sessionId, 
          chatHistory,
          storageManager
        );
      
      case 'style-analysis':
        return await handleStyleAnalysisMode(
          styleAnalyzer, 
          content, 
          imageUrl, 
          walletContext
        );
      
      case 'leonardo':
        console.log('🎨 Handling Leonardo.ai generation request...');
        return await handleImageGeneration('leonardo', content, supabase, promptBuilder);
      
      case 'replicate':
        console.log('🎨 Handling Replicate generation request...');
        return await handleImageGeneration('replicate', content, supabase, promptBuilder);
      
      case 'poster-generation':
        return await handlePosterGeneration(
          posterGenerator, 
          content, 
          walletContext,
          body.posterConfig
        );
      
      case 'save-customization':
        return await handleSaveCustomization(
          storageManager,
          walletContext,
          body.customizations,
          userId
        );
      
      case 'load-customization':
        return await handleLoadCustomization(
          storageManager,
          walletContext?.walletType,
          userId
        );
      
      case 'analysis':
      default:
        return await handleAnalysisMode(
          content,
          imageUrl,
          walletContext,
          supabase,
          elementsManager,
          walletManager,
          promptBuilder
        );
    }

  } catch (error) {
    console.error('💥 Error in enhanced wallet-chat-gpt:', error);
    console.error('💥 Error stack:', error.stack);
    return createErrorResponse(error.message, 500);
  }
});

// ====== Mode Handlers ======

/**
 * Handle structure mode - return wallet elements
 */
async function handleStructureMode(elementsManager: any, walletType: string) {
  try {
    console.log('🏗️ Structure mode: loading wallet elements...');
    
    const elements = await elementsManager.loadAllElements();
    const statistics = elementsManager.getElementsStatistics(elements);
    const grouped = elementsManager.groupElementsByScreen(elements);

    const response: APIResponse = {
      success: true,
      data: {
        walletElements: elements,
        statistics,
        grouped,
        walletType,
        mode: 'structure'
      },
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error in structure mode:', error);
    return createErrorResponse(`Structure mode error: ${error.message}`, 500);
  }
}

/**
 * Handle chat mode with enhanced conversation management
 */
async function handleChatMode(
  chatHandler: any,
  content: string,
  imageUrl: string | undefined,
  walletContext: any,
  sessionId: string,
  chatHistory: any[],
  storageManager: any
) {
  try {
    console.log('💬 Chat mode: processing conversation...');

    // Load existing chat history if sessionId provided
    let conversationHistory = chatHistory || [];
    if (sessionId && !chatHistory?.length) {
      conversationHistory = await storageManager.loadChatHistory(sessionId);
    }

    // Create chat context
    const context: ChatContext = {
      walletType: walletContext?.walletType || 'phantom',
      activeScreen: walletContext?.activeLayer,
      conversationHistory,
      currentTask: undefined
    };

    // Process chat message
    const result = await chatHandler.handleChat(content, context, imageUrl);

    // Save updated chat history
    if (sessionId) {
      await storageManager.saveChatHistory(
        sessionId,
        result.context?.conversationHistory || conversationHistory,
        context.walletType
      );
    }

    const response: ChatResponse = {
      success: result.success,
      response: result.response,
      action: result.action,
      data: result.data,
      suggestions: result.data?.suggestions
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error in chat mode:', error);
    return createErrorResponse(`Chat error: ${error.message}`, 500);
  }
}

/**
 * Handle style analysis mode
 */
async function handleStyleAnalysisMode(
  styleAnalyzer: any,
  content: string,
  imageUrl: string | undefined,
  walletContext: any
) {
  try {
    console.log('🎨 Style analysis mode...');

    let analysis;
    if (imageUrl) {
      analysis = await styleAnalyzer.analyzeImageStyle(imageUrl);
    } else if (content) {
      analysis = await styleAnalyzer.analyzeTextStyle(content);
    } else {
      throw new Error('Either content or imageUrl is required for style analysis');
    }

    const response: APIResponse = {
      success: true,
      data: {
        styleAnalysis: analysis,
        walletType: walletContext?.walletType,
        mode: 'style-analysis'
      },
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error in style analysis mode:', error);
    return createErrorResponse(`Style analysis error: ${error.message}`, 500);
  }
}

/**
 * Handle image generation with enhanced error handling
 */
async function handleImageGeneration(
  mode: 'leonardo' | 'replicate', 
  prompt: string, 
  supabase: any,
  promptBuilder: any
) {
  try {
    console.log(`🖼️ Image generation mode: ${mode}`);
    console.log(`📝 Prompt: "${prompt}"`);
    
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required for image generation');
    }
    
    // Check API key availability
    const apiKeyName = mode === 'leonardo' ? 'LEONARDO_API_KEY' : 'REPLICATE_API_KEY';
    const apiKey = Deno.env.get(apiKeyName);
    
    if (!apiKey) {
      console.error(`❌ ${apiKeyName} not found in environment`);
      const response: ImageGenerationResponse = {
        success: false,
        error: `${mode.charAt(0).toUpperCase() + mode.slice(1)} API key not configured`,
        status: 'failed',
        metadata: {
          prompt,
          model: mode,
          dimensions: { width: 1024, height: 1024 }
        }
      };
      return createErrorResponse(response.error!, 400, response);
    }
    
    console.log(`✅ ${apiKeyName} found, proceeding with generation...`);
    
    // Simple prompt enhancement for wallet context (instead of buildImagePrompt)
    const enhancedPrompt = `${prompt}, digital wallet interface background, mobile app design, clean and modern, suitable for cryptocurrency wallet, high quality, detailed, artistic, vibrant colors, 4k resolution`;
    
    let result;
    if (mode === 'leonardo') {
      result = await generateImageWithLeonardo(enhancedPrompt, supabase);
    } else {
      result = await generateImageWithReplicate(enhancedPrompt, supabase);
    }

    console.log(`🎯 ${mode} generation result:`, result.success ? 'SUCCESS' : 'FAILED');
    
    if (!result.success) {
      console.error(`❌ ${mode} generation failed:`, result.error);
    }

    const response: ImageGenerationResponse = {
      success: result.success,
      imageUrl: result.imageUrl,
      status: result.success ? 'completed' : 'failed',
      error: result.error,
      data: {
        imageUrl: result.imageUrl // Убедимся что imageUrl находится в data
      },
      metadata: {
        prompt: enhancedPrompt,
        model: mode,
        dimensions: { width: 1024, height: 1024 }
      }
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error(`💥 Error in ${mode} image generation:`, error);
    console.error(`💥 Error details:`, error.stack);
    
    const response: ImageGenerationResponse = {
      success: false,
      error: error.message,
      status: 'failed',
      data: {
        imageUrl: null
      },
      metadata: {
        prompt,
        model: mode,
        dimensions: { width: 1024, height: 1024 }
      }
    };
    
    return createErrorResponse(error.message, 500, response);
  }
}

/**
 * Handle poster generation
 */
async function handlePosterGeneration(
  posterGenerator: any,
  content: string,
  walletContext: any,
  posterConfig: any
) {
  try {
    console.log('🎨 Poster generation mode...');

    if (!posterConfig) {
      throw new Error('Poster configuration is required');
    }

    const result = await posterGenerator.generatePoster(posterConfig, {
      walletType: walletContext?.walletType,
      content
    });

    const response: APIResponse = {
      success: result.success,
      data: result,
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error in poster generation:', error);
    return createErrorResponse(`Poster generation error: ${error.message}`, 500);
  }
}

/**
 * Handle saving customization
 */
async function handleSaveCustomization(
  storageManager: any,
  walletContext: any,
  customizations: any,
  userId?: string
) {
  try {
    console.log('💾 Saving wallet customization...');

    const saved = await storageManager.saveWalletCustomization(
      walletContext?.walletType || 'phantom',
      customizations,
      userId
    );

    const response: APIResponse = {
      success: true,
      data: { saved },
      message: 'Customization saved successfully',
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error saving customization:', error);
    return createErrorResponse(`Save error: ${error.message}`, 500);
  }
}

/**
 * Handle loading customization
 */
async function handleLoadCustomization(
  storageManager: any,
  walletType: string,
  userId?: string
) {
  try {
    console.log('📂 Loading wallet customization...');

    const customization = await storageManager.loadWalletCustomization(
      walletType || 'phantom',
      userId
    );

    const response: APIResponse = {
      success: true,
      data: { customization },
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(response);
  } catch (error) {
    console.error('❌ Error loading customization:', error);
    return createErrorResponse(`Load error: ${error.message}`, 500);
  }
}

/**
 * Handle analysis mode - the main AI processing (legacy support)
 */
async function handleAnalysisMode(
  content: string,
  imageUrl: string | undefined,
  walletContext: any,
  supabase: any,
  elementsManager: any,
  walletManager: any,
  promptBuilder: any
) {
  try {
    console.log('🤖 Analysis mode: processing with AI...');

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENA_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Detect user language
    const userLanguage = detectUserLanguage(content);
    console.log(`🌐 Detected user language: ${userLanguage}`);

    // Create enhanced wallet context
    const walletType = walletContext?.walletType || 'phantom';
    const aiContext = await walletManager.createWalletAIContext(walletType, walletContext?.activeLayer);

    // Build the AI prompt using prompt builder
    const customizationPrompt = AdvancedPromptBuilder.buildCustomizationPrompt(
      content,
      aiContext.customizableElements || [],
      walletContext?.currentStyles || {}
    );

    const systemPrompt = `You are a Web3 wallet customization expert. You help users customize their ${walletType} wallet interface.

WALLET CONTEXT:
- Wallet Type: ${walletType}
- Active Layer: ${walletContext?.activeLayer || 'wallet'}
- Total Elements: ${aiContext.statistics.total}
- Customizable Elements: ${aiContext.statistics.customizable}
- Available Screens: ${aiContext.availableScreens?.join(', ') || 'main'}

${customizationPrompt}

IMPORTANT: Always respond with valid JSON containing:
{
  "success": true,
  "response": "Technical response for system processing",
  "userText": "Human-friendly explanation for the user in the same language as their input",
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
}

LANGUAGE INSTRUCTION: Respond in the same language as the user's input. User language detected: ${userLanguage}

The userText field should contain a friendly, conversational explanation in the user's language of what changes were made. English example: "Done! I added a beautiful gradient and changed the button colors. How do you like the result?" Russian example: "Готово! Я добавил красивый градиент и изменил цвета кнопок. Как вам результат?"`;

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

    // Parse JSON from AI response using AdvancedJSONParser
    let parsedResponse = AdvancedJSONParser.parseAIResponse(aiContent);
    
    if (!parsedResponse || !AdvancedJSONParser.validateStyleStructure(parsedResponse.styleChanges || {})) {
      console.warn('⚠️ Failed to parse AI JSON or invalid structure, using fallback');
      const fallbackMessage = getLocalizedExample(userLanguage);
      parsedResponse = {
        success: true,
        response: aiContent,
        userText: fallbackMessage,
        styleChanges: AdvancedJSONParser.createFallbackStyles('dark')
      };
    }

    // Normalize colors
    if (parsedResponse.styleChanges) {
      parsedResponse.styleChanges = AdvancedJSONParser.normalizeColors(parsedResponse.styleChanges);
    }

    console.log('✅ Analysis completed successfully');

    const finalResponse: StyleChangeResponse = {
      success: parsedResponse.success,
      response: generateHumanFriendlyMessage(parsedResponse, userLanguage),
      userText: parsedResponse.userText,
      styleChanges: parsedResponse.styleChanges,
      affectedElements: parsedResponse.affectedElements,
      preview: true
    };

    return createSuccessResponse(finalResponse);

  } catch (error) {
    console.error('❌ Error in analysis mode:', error);
    return createErrorResponse(`Analysis error: ${error.message}`, 500);
  }
}

// ====== Helper Functions ======

/**
 * Generate human-friendly message from AI response
 */
function generateHumanFriendlyMessage(parsedResponse: any, userLanguage: string = 'en'): string {
  // First, try to get human text from response fields
  if (parsedResponse.userText && typeof parsedResponse.userText === 'string') {
    return parsedResponse.userText;
  }
  
  if (parsedResponse.response && typeof parsedResponse.response === 'string' && 
      !parsedResponse.response.startsWith('{') && !parsedResponse.response.startsWith('[')) {
    return parsedResponse.response;
  }

  // If we have styleChanges, generate a friendly message
  if (parsedResponse.styleChanges) {
    const changes = parsedResponse.styleChanges;
    
    // Generate message based on detected language
    if (userLanguage === 'ru') {
      let message = "Готово! Я обновил дизайн вашего кошелька. ";
      
      if (changes.backgroundColor) {
        message += `Установил новый фон (${changes.backgroundColor}). `;
      }
      if (changes.accentColor) {
        message += `Добавил акцентный цвет (${changes.accentColor}). `;
      }
      if (changes.styleNotes) {
        message += changes.styleNotes;
      } else {
        message += "Как вам новый стиль?";
      }
      
      return message;
    } else {
      // Default to English
      let message = "Done! I updated your wallet design. ";
      
      if (changes.backgroundColor) {
        message += `Set new background (${changes.backgroundColor}). `;
      }
      if (changes.accentColor) {
        message += `Added accent color (${changes.accentColor}). `;
      }
      if (changes.styleNotes) {
        message += changes.styleNotes;
      } else {
        message += "How do you like the new style?";
      }
      
      return message;
    }
  }

  // Fallback message based on language
  return userLanguage === 'ru' 
    ? "Изменения применены! Посмотрите на обновленный дизайн кошелька."
    : "Changes applied! Check out the updated wallet design.";
}

/**
 * Extract human message from various response formats
 */
function extractHumanMessage(content: any, userLanguage: string = 'en'): string {
  if (typeof content === 'string') {
    // Check if it's JSON
    try {
      const parsed = JSON.parse(content);
      return generateHumanFriendlyMessage(parsed, userLanguage);
    } catch {
      // It's already a human message
      return content;
    }
  }
  
  if (typeof content === 'object' && content !== null) {
    return generateHumanFriendlyMessage(content, userLanguage);
  }
  
  return userLanguage === 'ru' 
    ? "Понял вас! Работаю над улучшением дизайна."
    : "Got it! Working on improving the design.";
}

/**
 * Create success response
 */
function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create error response
 */
function createErrorResponse(
  error: string, 
  status: number = 500, 
  additionalData: any = {}
): Response {
  const errorResponse: APIResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  return new Response(
    JSON.stringify(errorResponse),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

// ====== System Prompts Library ======
export const SYSTEM_PROMPTS = {
  WALLET_CUSTOMIZER: `You are an expert Web3 wallet interface designer. You specialize in creating beautiful, functional, and user-friendly customizations for cryptocurrency wallets.

Your expertise includes:
- Color theory and palette generation
- Typography selection for crypto interfaces
- UI/UX best practices for Web3
- Accessibility and usability principles
- Modern design trends (glassmorphism, neumorphism, gradients)

Always provide specific, actionable style recommendations with exact CSS values.`,

  STYLE_ANALYZER: `You are a professional UI/UX designer with expertise in analyzing visual styles and extracting design patterns.

When analyzing images or descriptions:
1. Identify dominant color palettes (primary, secondary, accent colors)
2. Determine visual theme and mood
3. Extract typography characteristics
4. Note spacing, layout, and structural patterns
5. Suggest appropriate border radius and effects

Provide structured, implementable design tokens.`,

  CHAT_ASSISTANT: `You are a friendly and helpful Web3 wallet customization assistant. You guide users through personalizing their wallet interface with enthusiasm and clarity.

Your communication style:
- Conversational and approachable
- Clear explanations of design concepts
- Proactive suggestions for improvements
- Educational about design principles
- Encouraging experimentation

Always ask clarifying questions when requests are ambiguous.`,

  IMAGE_GENERATOR: `You are an AI prompt engineer specializing in generating high-quality images for Web3 and cryptocurrency applications.

Your prompts should:
- Be specific and detailed
- Include relevant style keywords
- Specify quality requirements
- Consider aspect ratios and dimensions
- Include negative prompts to avoid unwanted elements

Focus on modern, professional, and visually striking designs.`
};

// ====== Enhanced Error Handling ======
class WalletCustomizerError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletCustomizerError';
  }
}

// ====== Rate Limiting (Optional) ======
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, limit: number = 60, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// ====== Health Check Endpoint ======
export async function handleHealthCheck(): Promise<Response> {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      supabase: !!Deno.env.get('SUPABASE_URL'),
      openai: !!Deno.env.get('OPENA_API_KEY'),
      leonardo: !!Deno.env.get('LEONARDO_API_KEY'),
      replicate: !!Deno.env.get('REPLICATE_API_KEY')
    }
  };

  return createSuccessResponse(health);
}
