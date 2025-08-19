
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Импорт модулей
import { ChatHandler } from './modules/chatHandler.ts'
import { ImageGenerator } from './modules/imageGenerator.ts'
import { StyleAnalyzer } from './modules/styleAnalyzer.ts'
import { WalletManager } from './modules/walletManager.ts'
import { WalletElementsManager } from './modules/walletElementsManager.ts'
import { IconManager } from './modules/iconManager.ts'
import { IconChatHandler } from './modules/iconChatHandler.ts'

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Проверка фичефлагов для ассетов
const isAssetsEnabled = (): boolean => {
  return Deno.env.get('ASSETS_ENABLED') === 'true';
};

const isIconLibEnabled = (): boolean => {
  return Deno.env.get('ICON_LIB_ENABLED') === 'true';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Инициализация Supabase клиента
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Парсинг тела запроса
    const { message, mode = 'chat', user_id, file_data, file_name, ...otherParams } = await req.json()
    
    console.log('🚀 Wallet ChatGPT called:', { mode, user_id, message: message?.slice(0, 100) + '...' })

    // Проверка ассет-функций на уровне Edge Function
    if (mode === 'icons' || mode === 'assets' || message?.toLowerCase().includes('иконк')) {
      if (!isIconLibEnabled()) {
        console.log('🚫 Icon/Asset functionality disabled via feature flag')
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Icon and asset management functionality is currently disabled',
          code: 'FEATURE_DISABLED'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    // Инициализация менеджеров
    const chatHandler = new ChatHandler()
    const imageGenerator = new ImageGenerator()
    const styleAnalyzer = new StyleAnalyzer()
    const walletManager = new WalletManager(supabase)
    const walletElementsManager = new WalletElementsManager(supabase)
    const iconManager = new IconManager(supabase)
    const iconChatHandler = new IconChatHandler(iconManager)

    let result;

    // Обработка по режимам
    switch (mode) {
      case 'chat':
        console.log('💬 Processing chat request...')
        
        // Проверка на ассет-команды в чате
        const iconContext = iconChatHandler.analyzeIconRequest(message || '');
        if (iconContext && !isIconLibEnabled()) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Icon functionality is currently disabled',
            code: 'FEATURE_DISABLED'
          }), {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        if (iconContext) {
          // Обработка иконочных команд через IconChatHandler
          if (file_data && file_name) {
            // Обработка загрузки файла иконки
            console.log('📁 Processing icon file upload...')
            result = await iconChatHandler.handleIconFileUpload(message, file_data, file_name, user_id)
          } else {
            // Обработка текстовых команд по иконкам
            const response = await iconChatHandler.generateIconResponse(iconContext, user_id)
            result = {
              success: true,
              data: {
                message: response,
                mode: 'chat'
              }
            }
          }
        } else {
          // Обычный чат
          result = await chatHandler.processMessage({
            message,
            user_id,
            file_data,
            file_name,
            supabase,
            styleAnalyzer,
            imageGenerator,
            walletManager,
            walletElementsManager
          })
        }
        break

      case 'generate_image':
        console.log('🎨 Processing image generation...')
        result = await imageGenerator.generateImage({
          prompt: message,
          user_id,
          supabase,
          ...otherParams
        })
        break

      case 'analyze_style':
        console.log('🔍 Processing style analysis...')
        result = await styleAnalyzer.analyzeWalletStyle({
          message,
          user_id,
          supabase,
          ...otherParams
        })
        break

      case 'wallet_operation':
        console.log('💳 Processing wallet operation...')
        result = await walletManager.handleWalletOperation({
          message,
          user_id,
          supabase,
          ...otherParams
        })
        break

      case 'elements':
        console.log('🧩 Processing elements operation...')
        result = await walletElementsManager.handleElementsOperation({
          message,
          user_id,
          supabase,
          ...otherParams
        })
        break

      case 'icons':
        // Дополнительная проверка на уровне mode
        if (!isIconLibEnabled()) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Icon management functionality is currently disabled',
            code: 'FEATURE_DISABLED'
          }), {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        console.log('🎯 Processing icons operation...')
        result = await iconManager.handleIconOperation({
          message,
          user_id,
          file_data,
          file_name,
          supabase,
          ...otherParams
        })
        break

      default:
        console.log('❓ Unknown mode:', mode)
        result = {
          success: false,
          error: `Unknown mode: ${mode}`,
          available_modes: ['chat', 'generate_image', 'analyze_style', 'wallet_operation', 'elements', 'icons']
        }
    }

    console.log('✅ Request processed successfully')
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('💥 Error in wallet-chat-gpt:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
})
