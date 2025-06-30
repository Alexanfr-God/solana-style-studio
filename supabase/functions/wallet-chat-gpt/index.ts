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

// ✅ ЭТАП 1: Функция валидации режима
function validateMode(mode: any): { isValid: boolean; mode: string; error?: string } {
  console.log('🔍 [ВАЛИДАЦИЯ] Входящий режим:', {
    value: mode,
    type: typeof mode,
    length: mode?.length,
    stringified: JSON.stringify(mode),
    bytes: mode ? Array.from(mode).map((c: string) => c.charCodeAt(0)) : []
  });
  
  if (!mode) {
    return { isValid: false, mode: 'unknown', error: 'Mode is null or undefined' };
  }
  
  const cleanMode = String(mode).trim().toLowerCase();
  const validModes = ['analysis', 'leonardo', 'replicate', 'structure', 'chat', 'style-analysis'];
  
  if (!validModes.includes(cleanMode)) {
    return { 
      isValid: false, 
      mode: cleanMode, 
      error: `Invalid mode: "${cleanMode}". Valid modes: ${validModes.join(', ')}` 
    };
  }
  
  return { isValid: true, mode: cleanMode };
}

// ✅ ЭТАП 2: Функция проверки генерации изображений
function isImageGenerationMode(mode: string): boolean {
  return mode === 'leonardo' || mode === 'replicate';
}

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
      chatHistory,
      isImageGeneration,
      debugMode
    } = body;

    // ✅ ЭТАП 1: ДЕТАЛЬНАЯ ДИАГНОСТИКА ВХОДЯЩИХ ДАННЫХ
    console.log('🚀 [ДИАГНОСТИКА] Enhanced wallet-chat-gpt запрос:');
    console.log('📋 [ДИАГНОСТИКА] Полное тело запроса:', JSON.stringify({
      content: content?.substring(0, 50) + '...',
      mode,
      isImageGeneration,
      debugMode,
      walletType: walletContext?.walletType,
      sessionId
    }, null, 2));

    // ✅ ВАЛИДАЦИЯ РЕЖИМА С ДЕТАЛЬНЫМ ЛОГИРОВАНИЕМ
    const validation = validateMode(mode);
    if (!validation.isValid) {
      console.error('❌ [КРИТИЧЕСКАЯ ОШИБКА] Неверный режим:', validation.error);
      return createErrorResponse(`Invalid mode: ${validation.error}`, 400);
    }
    
    const validatedMode = validation.mode;
    console.log('✅ [ВАЛИДАЦИЯ] Режим валиден:', validatedMode);

    // ✅ ЭТАП 2: ПРОВЕРКА НА ГЕНЕРАЦИЮ ИЗОБРАЖЕНИЙ
    const isGeneration = isImageGenerationMode(validatedMode);
    console.log('🎨 [МАРШРУТИЗАЦИЯ] Это генерация изображения?', isGeneration);
    
    if (isGeneration) {
      console.log('🎨 [МАРШРУТИЗАЦИЯ] НАПРАВЛЯЕМ В ГЕНЕРАЦИЮ БЕЗ JSON ПАРСИНГА');
    } else {
      console.log('🧠 [МАРШРУТИЗАЦИЯ] НАПРАВЛЯЕМ В АНАЛИЗ С JSON ПАРСИНГОМ');
    }

    // ✅ ЭТАП 3: СТРОГАЯ МАРШРУТИЗАЦИЯ БЕЗ DEFAULT FALLBACK
    switch (validatedMode) {
      case 'structure':
        console.log('🏗️ [РОУТИНГ] Обработка структуры');
        return await handleStructureMode(elementsManager, walletContext?.walletType || 'phantom');
      
      case 'chat':
        console.log('💬 [РОУТИНГ] Обработка чата');
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
        console.log('🎨 [РОУТИНГ] Обработка анализа стилей');
        return await handleStyleAnalysisMode(
          styleAnalyzer, 
          content, 
          imageUrl, 
          walletContext
        );
      
      case 'leonardo':
        console.log('🎨 [РОУТИНГ] LEONARDO - ЧИСТАЯ ГЕНЕРАЦИЯ БЕЗ JSON');
        return await handleImageGeneration('leonardo', content, supabase, promptBuilder);
      
      case 'replicate':
        console.log('🎨 [РОУТИНГ] REPLICATE - ЧИСТАЯ ГЕНЕРАЦИЯ БЕЗ JSON');
        return await handleImageGeneration('replicate', content, supabase, promptBuilder);
      
      case 'poster-generation':
        console.log('🎨 [РОУТИНГ] Обработка генерации постеров');
        return await handlePosterGeneration(
          posterGenerator, 
          content, 
          walletContext,
          body.posterConfig
        );
      
      case 'save-customization':
        console.log('💾 [РОУТИНГ] Сохранение кастомизации');
        return await handleSaveCustomization(
          storageManager,
          walletContext,
          body.customizations,
          userId
        );
      
      case 'load-customization':
        console.log('📂 [РОУТИНГ] Загрузка кастомизации');
        return await handleLoadCustomization(
          storageManager,
          walletContext?.walletType,
          userId
        );
      
      case 'analysis':
        console.log('🧠 [РОУТИНГ] ANALYSIS - ТОЛЬКО С JSON ПАРСИНГОМ');
        
        // ✅ ЭТАП 3: ЗАЩИТА - убедимся что команды генерации не попали сюда
        if (content && (
          content.toLowerCase().includes('generate') || 
          content.toLowerCase().includes('create image') ||
          content.toLowerCase().includes('генерировать') ||
          content.toLowerCase().includes('создать изображение')
        )) {
          console.error('❌ [ЗАЩИТА] Команда генерации попала в режим analysis!');
          console.error('❌ [ЗАЩИТА] Контент:', content);
          console.error('❌ [ЗАЩИТА] Режим:', validatedMode);
          
          return createErrorResponse(
            'Image generation command detected in analysis mode. Please select Leonardo or Replicate mode for image generation.',
            400
          );
        }
        
        return await handleAnalysisMode(
          content,
          imageUrl,
          walletContext,
          supabase,
          elementsManager,
          walletManager,
          promptBuilder
        );
      
      default:
        // ✅ ЭТАП 2: НЕТ FALLBACK НА ANALYSIS - ТОЛЬКО ОШИБКА
        console.error('❌ [МАРШРУТИЗАЦИЯ] Неизвестный режим попал в default:', validatedMode);
        return createErrorResponse(
          `Unsupported mode: "${validatedMode}". This is a routing error.`,
          400
        );
    }

  } catch (error) {
    console.error('💥 [ОШИБКА] Error in enhanced wallet-chat-gpt:', error);
    console.error('💥 [ОШИБКА] Error stack:', error.stack);
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
 * ✅ ЭТАП 3: ЧИСТАЯ ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ БЕЗ JSON ПАРСИНГА
 */
async function handleImageGeneration(
  mode: 'leonardo' | 'replicate', 
  prompt: string, 
  supabase: any,
  promptBuilder: any
) {
  try {
    console.log(`🖼️ [ГЕНЕРАЦИЯ] СТАРТ ${mode.toUpperCase()} - БЕЗ JSON ПАРСИНГА`);
    console.log(`📝 [ГЕНЕРАЦИЯ] Промпт: "${prompt}"`);
    
    // ✅ ЗАЩИТА: Убедимся что это не попало сюда случайно
    if (mode !== 'leonardo' && mode !== 'replicate') {
      console.error('❌ [ЗАЩИТА] Неверный режим в handleImageGeneration:', mode);
      throw new Error(`Invalid image generation mode: ${mode}`);
    }
    
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt is required for image generation');
    }
    
    // Check API key availability
    const apiKeyName = mode === 'leonardo' ? 'LEONARDO_API_KEY' : 'REPLICATE_API_KEY';
    const apiKey = Deno.env.get(apiKeyName);
    
    if (!apiKey) {
      console.error(`❌ [ГЕНЕРАЦИЯ] ${apiKeyName} not found in environment`);
      throw new Error(`${mode.charAt(0).toUpperCase() + mode.slice(1)} API key not configured`);
    }
    
    console.log(`✅ [ГЕНЕРАЦИЯ] ${apiKeyName} найден, начинаем генерацию...`);
    
    // ✅ Простое улучшение промпта для wallet контекста
    const enhancedPrompt = `${prompt}, digital wallet interface background, mobile app design, clean and modern, suitable for cryptocurrency wallet, high quality, detailed, artistic, vibrant colors, 4k resolution`;
    
    console.log(`🎯 [ГЕНЕРАЦИЯ] Enhanced prompt: ${enhancedPrompt}`);
    
    let result;
    if (mode === 'leonardo') {
      console.log(`🎨 [ГЕНЕРАЦИЯ] Вызываем generateImageWithLeonardo...`);
      result = await generateImageWithLeonardo(enhancedPrompt, supabase);
    } else {
      console.log(`🎨 [ГЕНЕРАЦИЯ] Вызываем generateImageWithReplicate...`);
      result = await generateImageWithReplicate(enhancedPrompt, supabase);
    }

    console.log(`🎯 [ГЕНЕРАЦИЯ] ${mode} результат:`, result.success ? 'SUCCESS' : 'FAILED');
    console.log(`🔍 [ГЕНЕРАЦИЯ] Result imageUrl:`, result.imageUrl);
    
    if (!result.success) {
      console.error(`❌ [ГЕНЕРАЦИЯ] ${mode} generation failed:`, result.error);
      throw new Error(result.error || 'Image generation failed');
    }

    // ✅ ЧЕТКАЯ структура ответа БЕЗ JSON парсинга
    const response: ImageGenerationResponse = {
      success: true,
      imageUrl: result.imageUrl,
      status: 'completed',
      data: {
        imageUrl: result.imageUrl // ✅ Дублируем для надежности
      },
      metadata: {
        prompt: enhancedPrompt,
        model: mode,
        dimensions: { width: 1024, height: 1024 }
      }
    };

    console.log(`✅ [ГЕНЕРАЦИЯ] Финальный ответ БЕЗ JSON:`, {
      success: response.success,
      imageUrl: response.imageUrl,
      'data.imageUrl': response.data?.imageUrl
    });

    return createSuccessResponse(response);
  } catch (error) {
    console.error(`💥 [ГЕНЕРАЦИЯ] Ошибка в ${mode} image generation:`, error);
    
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
 * ✅ ЭТАП 3: АНАЛИЗ - ТОЛЬКО ДЛЯ analysis С JSON ПАРСИНГОМ
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
    console.log('🧠 [АНАЛИЗ] Analysis mode: ТОЛЬКО JSON парсинг для стилей...');

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENA_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Detect user language
    const userLanguage = detectUserLanguage(content);
    console.log(`🌐 [АНАЛИЗ] Detected user language: ${userLanguage}`);

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

    console.log('🧠 [АНАЛИЗ] AI Response для JSON парсинга:', aiContent);

    // ✅ ЭТАП 3: Parse JSON ТОЛЬКО для analysis режима
    let parsedResponse = AdvancedJSONParser.parseAIResponse(aiContent);
    
    if (!parsedResponse || !AdvancedJSONParser.validateStyleStructure(parsedResponse.styleChanges || {})) {
      console.warn('⚠️ [АНАЛИЗ] Failed to parse AI JSON, using fallback');
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

    console.log('✅ [АНАЛИЗ] Analysis completed successfully with JSON parsing');

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
    console.error('❌ [АНАЛИЗ] Error in analysis mode:', error);
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
