
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ChatHandler } from './modules/chatHandler.ts'
import { createImageGenerationManager } from './modules/imageGenerator.ts'
import { StyleAnalyzer } from './modules/styleAnalyzer.ts'
import { WalletElementsManager } from './modules/walletElementsManager.ts'
import { WalletManager } from './modules/walletManager.ts'
import { createPosterGenerator } from './modules/posterGeneration.ts'
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const requestData = await req.json()
    
    // Normalize request data - handle both 'message' and 'content' fields
    const message = requestData.message || requestData.content || requestData.prompt
    const mode = requestData.mode || 'chat'
    const context = requestData.context || {}
    const user_id = requestData.user_id
    const file_data = requestData.file_data
    const file_name = requestData.file_name
    const isImageGeneration = requestData.isImageGeneration || mode === 'image-generation'
    
    console.log('🚀 Wallet Chat GPT Request:', { 
      mode, 
      message: message?.substring(0, 100), 
      user_id, 
      file_name,
      isImageGeneration 
    })

    // Initialize managers with correct parameters
    const chatHandler = new ChatHandler()
    const imageManager = createImageGenerationManager(supabaseUrl, supabaseKey)
    const styleAnalyzer = new StyleAnalyzer()
    const walletElementsManager = new WalletElementsManager(supabaseClient)
    const walletManager = new WalletManager(supabaseClient)
    const posterGenerator = createPosterGenerator(supabaseUrl, supabaseKey)
    const iconManager = new IconManager(supabaseClient)
    const iconChatHandler = new IconChatHandler(iconManager)

    let response = { success: false, data: null, error: null }

    // Check if this is an icon-related request
    const iconContext = iconChatHandler.analyzeIconRequest(message)
    
    if (iconContext) {
      console.log('🎨 Icon request detected:', iconContext)
      
      if (iconContext.action === 'replace' && file_data) {
        try {
          const fileBuffer = new Uint8Array(Buffer.from(file_data, 'base64'))
          const file = new File([fileBuffer], file_name || 'icon.svg', { type: 'image/svg+xml' })
          
          if (iconContext.element_name) {
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
      // Handle other request types
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
          try {
            const imageRequest = {
              prompt: message,
              style: context.style || 'poster',
              type: context.type || 'wallpaper',
              dimensions: context.dimensions || { width: 1024, height: 1024 },
              generator: context.generator || 'leonardo',
              options: {
                enhancePrompt: true,
                learnFromExamples: true,
                optimizeForWallet: true,
                highQuality: true
              }
            }
            
            const imageResult = await imageManager.generateImage(imageRequest)
            
            if (imageResult.success && imageResult.imageUrl) {
              response = {
                success: true,
                data: {
                  type: 'generated_image',
                  imageUrl: imageResult.imageUrl,
                  image_url: imageResult.imageUrl, // Also include legacy field name
                  prompt: message
                },
                error: null
              }
            } else {
              response = {
                success: false,
                data: null,
                error: imageResult.error || 'Image generation failed'
              }
            }
          } catch (error) {
            console.error('❌ Image generation error:', error)
            response = {
              success: false,
              data: null,
              error: error.message
            }
          }
          break

        case 'poster-generation':
          try {
            const posterConfig = {
              type: context.type || 'wallpaper',
              dimensions: context.dimensions || { width: 1024, height: 1024 },
              style: context.style || 'cartoon',
              elements: context.elements || [],
              colors: context.colors || [],
              mood: context.mood || 'powerful',
              composition: context.composition || 'centered',
              quality: context.quality || 'high'
            }
            
            const posterResult = await posterGenerator.generatePoster(posterConfig, message, {
              generator: context.generator || 'leonardo',
              saveToDatabase: false
            })
            
            if (posterResult.success && posterResult.imageUrl) {
              response = {
                success: true,
                data: {
                  type: 'generated_poster',
                  imageUrl: posterResult.imageUrl,
                  poster_url: posterResult.imageUrl, // Also include legacy field name
                  prompt: posterResult.metadata.enhancedPrompt
                },
                error: null
              }
            } else {
              response = {
                success: false,
                data: null,
                error: posterResult.error || 'Poster generation failed'
              }
            }
          } catch (error) {
            console.error('❌ Poster generation error:', error)
            response = {
              success: false,
              data: null,
              error: error.message
            }
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
