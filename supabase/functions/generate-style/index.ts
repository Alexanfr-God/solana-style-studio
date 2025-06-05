
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Конфигурация
const N8N_WEBHOOK_URL = 'https://wacocu.app.n8n.cloud/webhook-test/ai-wallet-designer';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Анализ изображения через GPT-4o
async function analyzeImageWithGPT4o(imageUrl: string, userPrompt: string): Promise<any> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

  const systemPrompt = `You are an elite AI Art Director analyzing images for Web3 wallet customization.

Return detailed StyleBlueprint in JSON format:
{
  "meta": {
    "title": "Style name",
    "theme": "Main theme",
    "keywords": ["keyword1", "keyword2"],
    "confidenceScore": 0.95
  },
  "colorSystem": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "neutral": "#hex"
  },
  "mood": {
    "emotions": ["emotion1", "emotion2"],
    "energyLevel": "medium",
    "targetAudience": ["audience"]
  },
  "typography": {
    "fontFamily": "Font name",
    "category": "sans-serif",
    "weight": "600",
    "intendedEffect": "modern and readable"
  },
  "elements": {
    "characters": ["character1"],
    "effects": ["effect1", "effect2"],
    "patterns": ["pattern1"]
  },
  "narrative": {
    "symbolism": "What image represents",
    "brandPersonality": ["trait1", "trait2"]
  },
  "styleTags": ["tag1", "tag2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image for Web3 wallet skin generation.\n\nUser Request: "${userPrompt}"\n\nProvide detailed StyleBlueprint for AI agents.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.7
    });

    const analysisResult = response.choices[0]?.message?.content;
    if (!analysisResult) throw new Error('No analysis result from OpenAI');

    return JSON.parse(analysisResult);
  } catch (error) {
    console.error('GPT-4o analysis failed:', error);
    
    // Fallback StyleBlueprint
    return {
      meta: {
        title: "Custom Wallet Style",
        theme: "User uploaded design",
        keywords: ["custom", "unique"],
        confidenceScore: 0.7
      },
      colorSystem: {
        primary: "#6366f1",
        secondary: "#8b5cf6", 
        accent: "#f59e0b",
        neutral: "#6b7280"
      },
      mood: {
        emotions: ["modern", "clean"],
        energyLevel: "medium",
        targetAudience: ["crypto users"]
      },
      typography: {
        fontFamily: "Inter",
        category: "sans-serif",
        weight: "500",
        intendedEffect: "modern and readable"
      },
      elements: {
        characters: [],
        effects: ["gradient"],
        patterns: ["minimal"]
      },
      narrative: {
        symbolism: "Personal expression",
        brandPersonality: ["modern", "trustworthy"]
      },
      styleTags: ["modern", "clean", "minimal"]
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { prompt, image_url, layer_type, user_id } = await req.json();

    console.log('🚀 Starting AI wallet generation...');
    console.log('📝 User prompt:', prompt);
    console.log('🖼️ Image URL:', image_url);
    console.log('🎯 Layer type:', layer_type);

    // Шаг 1: Анализ изображения (если есть)
    let styleBlueprint;
    if (image_url) {
      console.log('🧠 Analyzing image with GPT-4o...');
      styleBlueprint = await analyzeImageWithGPT4o(image_url, prompt);
      console.log('✅ Image analysis completed');
      console.log('📊 Confidence score:', styleBlueprint.meta?.confidenceScore);
    } else {
      console.log('📝 Creating StyleBlueprint from prompt only...');
      // Create basic blueprint from prompt
      styleBlueprint = {
        meta: {
          title: "Text-based Style",
          theme: prompt,
          keywords: prompt.split(' ').slice(0, 5),
          confidenceScore: 0.8
        },
        colorSystem: {
          primary: "#9945FF",
          secondary: "#14F195", 
          accent: "#F037A5",
          neutral: "#FFFFFF"
        },
        mood: {
          emotions: ["modern", "sleek"],
          energyLevel: "medium",
          targetAudience: ["crypto users"]
        },
        typography: {
          fontFamily: "Inter",
          category: "sans-serif",
          weight: "500",
          intendedEffect: "modern and readable"
        },
        elements: {
          characters: [],
          effects: ["gradient"],
          patterns: ["geometric"]
        },
        narrative: {
          symbolism: "Innovation",
          brandPersonality: ["modern", "trustworthy"]
        },
        styleTags: ["modern", "web3"]
      };
    }

    // Шаг 2: Подготовка данных для N8N
    const walletBlueprint = {
      layer: layer_type || "login",
      elements: { 
        background: true, 
        buttons: true, 
        aiPet: layer_type === 'wallet',
        navigation: layer_type === 'wallet',
        inputs: layer_type === 'login'
      },
      layout: {
        width: 320,
        height: 569,
        safeZone: { x: 20, y: 50, width: 280, height: 469 }
      }
    };

    const n8nPayload = {
      userPrompt: prompt,
      styleBlueprint: styleBlueprint,
      walletBlueprint: walletBlueprint,
      imageUrl: image_url,
      userId: user_id || 'anonymous',
      timestamp: new Date().toISOString(),
      source: 'lovable-app'
    };

    // Шаг 3: Отправка в N8N
    console.log('🤖 Sending to N8N agents...');
    
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      throw new Error(`N8N workflow failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    const walletSkin = await n8nResponse.json();
    
    console.log('🎉 N8N agents completed successfully');
    console.log('📊 Quality score:', walletSkin.metadata?.qualityScore);

    // Шаг 4: Преобразование результата в формат WalletStyle
    const finalStyle = {
      backgroundColor: walletSkin.generatedStyles?.background?.primaryColor || styleBlueprint.colorSystem.primary,
      backgroundImage: walletSkin.generatedStyles?.background?.gradient ? 
        `linear-gradient(${walletSkin.generatedStyles.background.gradient})` : 
        undefined,
      accentColor: walletSkin.generatedStyles?.colorPalette?.accent || styleBlueprint.colorSystem.accent,
      textColor: walletSkin.generatedStyles?.colorPalette?.neutral || styleBlueprint.colorSystem.neutral,
      buttonColor: walletSkin.generatedStyles?.buttons?.primary?.background || styleBlueprint.colorSystem.primary,
      buttonTextColor: walletSkin.generatedStyles?.buttons?.primary?.text || '#FFFFFF',
      borderRadius: walletSkin.generatedStyles?.buttons?.primary?.borderRadius || '12px',
      fontFamily: walletSkin.generatedStyles?.typography?.fontStack?.primary || styleBlueprint.typography.fontFamily,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: `N8N AI Multi-Agent Design (${walletSkin.metadata?.qualityScore || 0.8} quality score)`
    };

    return new Response(
      JSON.stringify({
        success: true,
        style: finalStyle,
        metadata: {
          processingTime: walletSkin.processingTime || 'unknown',
          agentsUsed: walletSkin.metadata?.agentsUsed || ['StyleAgent', 'FontAgent'],
          qualityScore: walletSkin.metadata?.qualityScore || 0.8,
          confidenceScore: styleBlueprint.meta?.confidenceScore || 0.7,
          n8nWorkflowUsed: true
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('❌ Error in AI wallet generation:', error);
    
    // Fallback к базовому стилю
    const fallbackStyle = {
      backgroundColor: '#131313',
      accentColor: '#9945FF',
      textColor: '#FFFFFF',
      buttonColor: '#9945FF',
      buttonTextColor: '#FFFFFF',
      borderRadius: '12px',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: `Fallback style (N8N error: ${error.message})`
    };

    return new Response(
      JSON.stringify({
        success: true,
        style: fallbackStyle,
        error: error.message,
        fallbackUsed: true
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
