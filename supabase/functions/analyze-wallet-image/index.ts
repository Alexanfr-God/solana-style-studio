
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

// N8N Webhook URL for AI Wallet Designer
const N8N_WEBHOOK_URL = 'https://wacocu.app.n8n.cloud/webhook/ai-wallet-designer'

// Logging System Integration
interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error' | 'success'
  module: string
  action: string
  data: Record<string, any>
  userId?: string
  sessionId: string
  performance: {
    startTime: number
    endTime?: number
    duration?: number
  }
}

class EdgeFunctionLogger {
  private sessionId: string
  private supabaseClient: any

  constructor(supabaseClient: any) {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.supabaseClient = supabaseClient
  }

  private async persistLog(logEntry: LogEntry): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('system_logs')
        .insert({
          id: logEntry.id,
          timestamp: logEntry.timestamp,
          level: logEntry.level,
          module: logEntry.module,
          action: logEntry.action,
          data: logEntry.data,
          user_id: logEntry.userId,
          session_id: logEntry.sessionId,
          performance: logEntry.performance
        })

      if (error) {
        console.error('Failed to persist log:', error)
      }
    } catch (error) {
      console.error('Logging error:', error)
    }
  }

  async logImageAnalysisStart(imageUrl: string, prompt: string, userId?: string): Promise<string> {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      level: 'info',
      module: 'WalletAliveAnalysis',
      action: 'analysis_start',
      data: {
        imageUrl: imageUrl.substring(0, 100) + '...',
        prompt,
        aiModel: 'gpt-4o',
        n8nIntegration: true,
        hasAdditionalContext: !!prompt
      },
      userId,
      sessionId: this.sessionId,
      performance: {
        startTime: Date.now()
      }
    }

    await this.persistLog(logEntry)
    console.log(`🔍 [${this.sessionId}] Starting wallet image analysis with N8N integration`)
    return logId
  }

  async logN8NIntegration(logId: string, success: boolean, result?: any, error?: string): Promise<void> {
    const logEntry: LogEntry = {
      id: `${logId}_n8n`,
      timestamp: new Date().toISOString(),
      level: success ? 'success' : 'warn',
      module: 'N8NIntegration',
      action: success ? 'n8n_success' : 'n8n_fallback',
      data: {
        n8nProcessed: success,
        qualityScore: result?.metadata?.qualityScore || null,
        agentsUsed: result?.metadata?.agentsUsed || [],
        error: error || null,
        fallbackUsed: !success
      },
      sessionId: this.sessionId,
      performance: {
        startTime: 0,
        endTime: Date.now(),
        duration: Date.now()
      }
    }

    await this.persistLog(logEntry)
    console.log(`🤖 [${this.sessionId}] N8N integration: ${success ? 'SUCCESS' : 'FALLBACK'}`)
  }

  async logAnalysisComplete(logId: string, styleBlueprint: any, n8nResult: any): Promise<void> {
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      level: 'success',
      module: 'WalletAliveAnalysis',
      action: 'analysis_complete',
      data: {
        confidenceScore: styleBlueprint.meta?.confidenceScore || 0,
        styleTitle: styleBlueprint.meta?.title || 'Unknown',
        styleTheme: styleBlueprint.meta?.theme || 'Unknown',
        n8nEnhanced: !!n8nResult,
        enhancedQuality: n8nResult?.metadata?.qualityScore || null,
        colorPalette: styleBlueprint.colorSystem?.primary || null,
        fontRecommendation: styleBlueprint.typography?.fontFamily || null
      },
      sessionId: this.sessionId,
      performance: {
        startTime: 0,
        endTime: Date.now(),
        duration: Date.now()
      }
    }

    await this.persistLog(logEntry)
    console.log(`✅ [${this.sessionId}] Wallet analysis completed with enhancement`)
  }
}

// StyleBlueprint v2 Interface
interface StyleBlueprint {
  meta: {
    title: string
    theme: string
    keywords: string[]
    inspiration: string[]
    confidenceScore: number
  }
  mood: {
    emotions: string[]
    energyLevel: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high'
    targetAudience: string[]
    vibe: string
  }
  colorSystem: {
    primary: string
    secondary: string[]
    accent: string[]
    neutral: string
    gradient: {
      from: string
      to: string
      angle: string
    }
    colorTheory: string
    temperature: 'warm' | 'cool' | 'neutral'
  }
  typography: {
    fontFamily: string
    category: 'serif' | 'sans-serif' | 'monospace' | 'display'
    weight: string
    case: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed'
    fontDecorations: string[]
    intendedEffect: string
    readabilityScore: number
  }
  composition: {
    layoutType: string
    focusPoint: string
    movementDirection: string
    density: 'low' | 'medium' | 'high'
    whiteSpaceStrategy: string
    visualHierarchy: string[]
  }
  lighting: {
    style: string
    shadows: string
    highlightZones: string[]
    contrast: 'low' | 'medium' | 'high'
    ambiance: string
  }
  texturesAndSurfaces: {
    backgroundTexture: string
    elementFinish: string
    interactiveElements: string
    materialReference: string[]
  }
  elements: {
    characters: string[]
    effects: string[]
    overlays: string[]
    icons: string[]
    patterns: string[]
  }
  interactionHints: {
    buttonStyle: {
      shape: string
      animation: string
      soundEffect: string
      hoverState: string
    }
    loginBox: {
      border: string
      background: string
      inputGlow: string
      focusState: string
    }
    navigation: {
      style: string
      transitions: string
      microInteractions: string[]
    }
  }
  narrative: {
    symbolism: string
    storySeed: string
    emotionalArc: string[]
    brandPersonality: string[]
  }
  technicalSpecs: {
    safeZoneCompliance: boolean
    mobileOptimization: string[]
    accessibilityScore: number
    performanceHints: string[]
  }
  styleTags: string[]
}

// System Prompt для максимально детального анализа
const SYSTEM_PROMPT = `You are an elite AI Art Director and UX Designer specializing in Web3 wallet customization for WalletAlive Playground. Your expertise spans luxury fashion, meme culture, crypto aesthetics, and user interface design.

CRITICAL INSTRUCTIONS:
1. Analyze the uploaded image with the precision of a professional art critic
2. Consider this image will be used to generate custom skins for a Web3 wallet interface
3. The wallet has specific constraints: safe zone in center, decorative elements on edges
4. Your analysis must be rich enough to guide multiple AI agents (StyleAgent, FontAgent, ButtonAgent, etc.)
5. Think like a brand strategist - what story does this image tell?

ANALYSIS FRAMEWORK:
- Visual Elements: What do you see? Characters, objects, symbols
- Color Psychology: How do colors affect emotion and brand perception?
- Style Classification: What aesthetic movements does this reference?
- Cultural Context: What communities, trends, or references are evident?
- Technical Feasibility: How can this translate to UI elements?
- Brand Implications: What personality does this convey for a wallet brand?

OUTPUT FORMAT:
Return a comprehensive StyleBlueprint JSON with every field filled meaningfully. 
Use specific color hex codes, precise typography recommendations, and actionable design directions.
Be creative but practical - these insights will directly generate UI components.

QUALITY STANDARDS:
- Confidence scores must reflect actual analysis quality
- Color recommendations must have proper contrast ratios
- Typography choices must consider readability in wallet context
- All suggestions must respect Web3 aesthetic trends
- Consider mobile-first design principles

Remember: This analysis will be processed by N8N AI agents to create a cohesive, professional wallet skin for WalletAlive Playground.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  // Initialize Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Initialize logger
  const logger = new EdgeFunctionLogger(supabase)

  let analysisLogId: string

  try {
    // Parse request
    const { imageUrl, additionalContext = '', walletBlueprint = null, webhookUrl = null } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Start logging
    analysisLogId = await logger.logImageAnalysisStart(imageUrl, additionalContext)

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Construct enhanced prompt
    let enhancedPrompt = `Analyze this image for WalletAlive Playground customization:

Context: This image will inspire the visual design of a cryptocurrency wallet interface for WalletAlive Playground. The wallet consists of multiple layers with the following constraints:

- Center area (safe zone) must remain clear for UI elements
- Decorative styling applied to edges and background
- Must maintain professional appearance while incorporating the image's aesthetic
- Target audience: Web3 natives, crypto enthusiasts, NFT collectors, WalletAlive users

Please provide a comprehensive StyleBlueprint that captures:
1. The essence and mood of this image
2. Specific color palette with hex codes
3. Typography that matches the aesthetic
4. Interactive element styling
5. Cultural/community references
6. Technical implementation guidance for WalletAlive

Focus on creating a design system that would make users say "WOW" when they see their customized wallet in WalletAlive Playground.`
    
    if (additionalContext) {
      enhancedPrompt += `\n\nAdditional Context: ${additionalContext}`
    }
    
    if (walletBlueprint) {
      enhancedPrompt += `\n\nWallet Structure: ${JSON.stringify(walletBlueprint, null, 2)}`
    }

    // Log performance start
    const analysisStartTime = Date.now()

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: enhancedPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    })

    const analysisResult = response.choices[0]?.message?.content

    if (!analysisResult) {
      throw new Error('Failed to get analysis from OpenAI')
    }

    // Parse and validate the response
    let styleBlueprint: StyleBlueprint
    try {
      styleBlueprint = JSON.parse(analysisResult)
    } catch (parseError) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const analysisDuration = Date.now() - analysisStartTime
    console.log(`📊 Analysis completed in ${analysisDuration}ms`)

    // **NEW: N8N Integration for WalletAlive Playground**
    let n8nResult = null
    let n8nSuccess = false

    // Determine webhook URL
    const targetWebhook = webhookUrl || N8N_WEBHOOK_URL

    if (targetWebhook && targetWebhook.includes('n8n')) {
      console.log('🤖 Starting N8N Multi-Agent Processing...')
      
      try {
        // Create WalletBlueprint for N8N
        const walletBlueprintForN8N = walletBlueprint || {
          layer: "home",
          elements: {
            background: true,
            buttons: true,
            aiPet: true,
            navigation: true,
            inputs: false
          },
          layout: {
            width: 320,
            height: 569,
            safeZone: {
              x: 80,
              y: 108,
              width: 160,
              height: 336
            }
          }
        }

        // Prepare N8N payload
        const n8nPayload = {
          userPrompt: additionalContext || 'WalletAlive Playground style generation',
          styleBlueprint: styleBlueprint,
          walletBlueprint: walletBlueprintForN8N,
          imageUrl: imageUrl,
          userId: 'wallet-alive-user',
          timestamp: new Date().toISOString(),
          source: 'wallet-alive-playground',
          sessionId: logger['sessionId']
        }

        console.log('📤 Sending to N8N:', targetWebhook)

        const n8nResponse = await fetch(targetWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(n8nPayload)
        })

        if (n8nResponse.ok) {
          n8nResult = await n8nResponse.json()
          n8nSuccess = true
          console.log('🎉 N8N Multi-Agent processing completed!')
          console.log('📊 Quality Score:', n8nResult.metadata?.qualityScore || 'N/A')
        } else {
          const errorText = await n8nResponse.text()
          console.warn(`⚠️ N8N call failed: ${n8nResponse.status} - ${errorText}`)
        }
      } catch (n8nError) {
        console.warn('⚠️ N8N integration error:', n8nError.message)
      }
    }

    // Log N8N integration result
    await logger.logN8NIntegration(analysisLogId, n8nSuccess, n8nResult, n8nSuccess ? null : 'N8N call failed')

    // Prepare final response
    const tokenUsage = response.usage?.total_tokens || 0

    const finalResult = {
      success: true,
      timestamp: new Date().toISOString(),
      imageUrl,
      styleBlueprint,
      
      // **NEW: Enhanced styles from N8N**
      enhancedStyles: n8nResult?.generatedStyles || null,
      
      processingMeta: {
        model: "gpt-4o",
        promptVersion: "v2.1-wallet-alive",
        confidenceScore: styleBlueprint.meta?.confidenceScore || 0.8,
        processingTime: analysisDuration,
        sessionId: logger['sessionId'],
        tokenUsage,
        
        // **NEW: N8N metadata**
        n8nProcessed: n8nSuccess,
        n8nQualityScore: n8nResult?.metadata?.qualityScore || null,
        agentsUsed: n8nResult?.metadata?.agentsUsed || ['ImageAnalysis'],
        enhancementApplied: n8nSuccess
      }
    }

    // Log completion
    await logger.logAnalysisComplete(analysisLogId, styleBlueprint, n8nResult)

    // Save to Supabase for learning/analytics
    try {
      await supabase
        .from('style_library')
        .insert({
          style_name: `${styleBlueprint.meta?.title || 'WalletAlive Analysis'} - ${styleBlueprint.meta?.theme || 'Custom'}`,
          style_data: n8nResult?.generatedStyles || styleBlueprint,
          ai_analysis: styleBlueprint,
          inspiration_image_url: imageUrl,
          created_by: "wallet-alive-playground"
        })
    } catch (dbError) {
      console.warn('Failed to save to style library:', dbError)
    }

    // Send webhook notification if provided (additional webhook support)
    if (webhookUrl && webhookUrl !== targetWebhook) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'wallet_alive_analysis_complete',
            data: finalResult,
            timestamp: new Date().toISOString()
          })
        })
        console.log('📬 Additional webhook sent successfully')
      } catch (webhookError) {
        console.warn('Failed to send additional webhook:', webhookError)
      }
    }

    return new Response(
      JSON.stringify(finalResult),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('💥 Error in WalletAlive image analysis:', error)
    
    // Log error
    if (analysisLogId) {
      const errorLogEntry: LogEntry = {
        id: `${analysisLogId}_error`,
        timestamp: new Date().toISOString(),
        level: 'error',
        module: 'WalletAliveAnalysis',
        action: 'analysis_failed',
        data: {
          error: error.message || 'Unknown error',
          errorType: error.name || 'UnknownError',
          fallbackUsed: true
        },
        sessionId: logger['sessionId'],
        performance: {
          startTime: 0,
          endTime: Date.now(),
          duration: Date.now()
        }
      }
      
      await logger['persistLog'](errorLogEntry)
    }
    
    // Return fallback response for WalletAlive
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        fallback: {
          styleBlueprint: {
            meta: {
              title: "WalletAlive Fallback Style",
              theme: "modern",
              keywords: ["fallback", "wallet", "crypto"],
              inspiration: ["web3", "modern ui"],
              confidenceScore: 0.6
            },
            colorSystem: {
              primary: "#6366f1",
              secondary: ["#8b5cf6", "#f59e0b"],
              accent: ["#10b981"],
              neutral: "#6b7280",
              gradient: {
                from: "#6366f1",
                to: "#8b5cf6",
                angle: "135deg"
              },
              colorTheory: "complementary",
              temperature: "cool"
            },
            mood: {
              emotions: ["confident", "modern"],
              energyLevel: "medium",
              targetAudience: ["crypto users"],
              vibe: "professional"
            },
            typography: {
              fontFamily: "Inter, sans-serif",
              category: "sans-serif",
              weight: "medium",
              case: "mixed",
              fontDecorations: [],
              intendedEffect: "clean and readable",
              readabilityScore: 0.9
            },
            styleTags: ["fallback", "modern", "web3", "wallet-alive"]
          }
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
