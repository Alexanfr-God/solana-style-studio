
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ChatHandler } from './modules/chatHandler.ts'
import { ImageGenerator } from './modules/imageGenerator.ts'
import { StyleAnalyzer } from './modules/styleAnalyzer.ts'
import { WalletElementsManager } from './modules/walletElementsManager.ts'
import { WalletManager } from './modules/walletManager.ts'
import { PosterGeneration } from './modules/posterGeneration.ts'
import { IconManager } from './modules/iconManager.ts'
import { IconChatHandler } from './modules/iconChatHandler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { message, mode, context, user_id, file_data, file_name } = await req.json()
    
    console.log('🚀 Wallet Chat GPT Request:', { mode, message: message?.substring(0, 100), user_id, file_name })

    // Инициализация всех менеджеров
    const chatHandler = new ChatHandler()
    const imageGenerator = new ImageGenerator()
    const styleAnalyzer = new StyleAnalyzer()
    const walletElementsManager = new WalletElementsManager(supabaseClient)
    const walletManager = new WalletManager(supabaseClient)
    const posterGeneration = new PosterGeneration(supabaseClient)
    const iconManager = new IconManager(supabaseClient)
    const iconChatHandler = new IconChatHandler(iconManager)

    let response = { success: false, data: null, error: null }

    // Проверяем, является ли запрос связанным с иконками
    const iconContext = iconChatHandler.analyzeIconRequest(message)
    
    if (iconContext) {
      console.log('🎨 Icon request detected:', iconContext)
      
      // Обработка иконок
      if (iconContext.action === 'replace' && file_data) {
        // Замена одной иконки
        try {
          const fileBuffer = new Uint8Array(Buffer.from(file_data, 'base64'))
          const file = new File([fileBuffer], file_name || 'icon.svg', { type: 'image/svg+xml' })
          
          if (iconContext.element_name) {
            // Найти element_id по имени
            const iconsByCategory = await iconManager.getIconsByCategory()
            let targetElementId = null
            
            Object.values(iconsByCategory).forEach(icons => {
              const found = icons.find(icon => 
                icon.storage_file_name.includes(iconContext.element_name!) ||
                icon.name.toLowerCase().includes(iconContext.element_name!)
              )
              if (found) targetElementId = found.id
            })
            
            if (targetElementId) {
              const result = await iconManager.replaceUserIcon(user_id, targetElementId, file)
              response = {
                success: true,
                data: {
                  type: 'icon_replaced',
                  message: `✅ Иконка "${iconContext.element_name}" успешно заменена!`,
                  icon_data: result
                },
                error: null
              }
            } else {
              response = {
                success: false,
                data: null,
                error: `❌ Иконка "${iconContext.element_name}" не найдена`
              }
            }
          }
        } catch (error) {
          response = {
            success: false,
            data: null,
            error: `❌ Ошибка при замене иконки: ${error.message}`
          }
        }
      } else if (iconContext.action === 'batch_replace' && file_data && iconContext.icon_group) {
        // Групповая замена иконок
        try {
          const fileBuffer = new Uint8Array(Buffer.from(file_data, 'base64'))
          const file = new File([fileBuffer], file_name || 'icon.svg', { type: 'image/svg+xml' })
          
          const results = await iconManager.batchReplaceIcons(user_id, iconContext.icon_group, file)
          response = {
            success: true,
            data: {
              type: 'icons_batch_replaced',
              message: `✅ Группа иконок "${iconContext.icon_group}" заменена! Обновлено: ${results.length} иконок`,
              icons_data: results
            },
            error: null
          }
        } catch (error) {
          response = {
            success: false,
            data: null,
            error: `❌ Ошибка при групповой замене: ${error.message}`
          }
        }
      } else {
        // Обычные запросы по иконкам (список, помощь, информация)
        const iconResponse = await iconChatHandler.generateIconResponse(iconContext, user_id)
        response = {
          success: true,
          data: {
            type: 'icon_info',
            message: iconResponse
          },
          error: null
        }
      }
    } else {
      // Существующая обработка других запросов
      switch (mode) {
        case 'style-analysis':
          if (file_data) {
            const analysis = await styleAnalyzer.analyzeImage(file_data)
            response = {
              success: true,
              data: {
                type: 'style_analysis',
                analysis: analysis
              },
              error: null
            }
          }
          break

        case 'image-generation':
          const imageResult = await imageGenerator.generateImage(message, context)
          response = {
            success: true,
            data: {
              type: 'generated_image',
              image_url: imageResult.image_url,
              prompt: imageResult.prompt
            },
            error: null
          }
          break

        case 'poster-generation':
          const posterResult = await posterGeneration.generatePoster(message, context)
          response = {
            success: true,
            data: {
              type: 'generated_poster',
              poster_url: posterResult.poster_url,
              prompt: posterResult.prompt
            },
            error: null
          }
          break

        case 'wallet-elements':
          const elementsResult = await walletElementsManager.getElementsInfo(message)
          response = {
            success: true,
            data: {
              type: 'wallet_elements',
              elements: elementsResult
            },
            error: null
          }
          break

        case 'chat':
        default:
          const chatResponse = await chatHandler.processMessage(message, context)
          response = {
            success: true,
            data: {
              type: 'chat_response',
              message: chatResponse.message,
              suggestions: chatResponse.suggestions
            },
            error: null
          }
          break
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Error in wallet-chat-gpt:', error)
    return new Response(
      JSON.stringify({
        success: false,
        data: null,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
