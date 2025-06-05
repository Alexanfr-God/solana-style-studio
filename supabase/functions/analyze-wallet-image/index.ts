
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'

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
const SYSTEM_PROMPT = `You are an elite AI Art Director and UX Designer specializing in Web3 wallet customization. Your expertise spans luxury fashion, meme culture, crypto aesthetics, and user interface design.

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

Remember: This analysis will be used by AI agents to create a cohesive, professional wallet skin that users will want to mint as NFTs.`

const USER_PROMPT_TEMPLATE = `Analyze this image for Web3 wallet skin generation:

Context: This image will inspire the visual design of a cryptocurrency wallet interface. The wallet consists of multiple layers (login, home, send, receive, settings) with the following constraints:

- Center area (safe zone) must remain clear for UI elements
- Decorative styling applied to edges and background
- Must maintain professional appearance while incorporating the image's aesthetic
- Target audience: Web3 natives, crypto enthusiasts, NFT collectors

Please provide a comprehensive StyleBlueprint that captures:
1. The essence and mood of this image
2. Specific color palette with hex codes
3. Typography that matches the aesthetic
4. Interactive element styling
5. Cultural/community references
6. Technical implementation guidance

Focus on creating a design system that would make users say "WOW" when they see their customized wallet.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req: Request) {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

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

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })

    // Construct enhanced prompt
    let enhancedPrompt = USER_PROMPT_TEMPLATE
    
    if (additionalContext) {
      enhancedPrompt += `\n\nAdditional Context: ${additionalContext}`
    }
    
    if (walletBlueprint) {
      enhancedPrompt += `\n\nWallet Structure: ${JSON.stringify(walletBlueprint, null, 2)}`
    }

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

    // Add timestamp and processing metadata
    const finalResult = {
      success: true,
      timestamp: new Date().toISOString(),
      imageUrl,
      styleBlueprint,
      processingMeta: {
        model: "gpt-4o",
        promptVersion: "v2.0",
        confidenceScore: styleBlueprint.meta?.confidenceScore || 0.8,
        processingTime: Date.now()
      }
    }

    // Save to Supabase for learning/analytics
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('style_library')
        .insert({
          style_name: `${styleBlueprint.meta?.title || 'AI Analysis'} - ${styleBlueprint.meta?.theme || 'Custom'}`,
          style_data: styleBlueprint,
          ai_analysis: styleBlueprint,
          inspiration_image_url: imageUrl,
          created_by: "ai-style-blueprint-v2"
        })
    } catch (dbError) {
      console.warn('Failed to save to database:', dbError)
    }

    // Send webhook if provided (for n8n integration)
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'style_analysis_complete',
            data: finalResult,
            timestamp: new Date().toISOString()
          })
        })
        console.log('Webhook sent successfully to:', webhookUrl)
      } catch (webhookError) {
        console.warn('Failed to send webhook:', webhookError)
        // Don't fail the request if webhook fails
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
    console.error('Error in image analysis:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
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
