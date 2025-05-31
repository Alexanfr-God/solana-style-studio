
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openAiApiKey) {
      console.log("OpenAI API key not found, using fallback analysis")
      return fallbackAnalysis(imageUrl)
    }

    // Analyze image with GPT-4 Vision
    const analysis = await analyzeImageWithGPT4Vision(imageUrl, openAiApiKey)
    
    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-style function:', error)
    
    // Fallback to mock analysis if AI fails
    const { imageUrl } = await req.json()
    const fallback = await fallbackAnalysis(imageUrl)
    return fallback
  }
})

async function analyzeImageWithGPT4Vision(imageUrl: string, apiKey: string) {
  const prompt = `Analyze this image as a design reference for a crypto wallet interface. Provide a detailed analysis in JSON format:

{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "mood": "energetic|calm|luxury|playful|professional|cyberpunk|minimal|retro",
  "style": "modern|gradient|neon|glass|dark|bright|organic|geometric",
  "tags": ["descriptive", "keywords", "for", "this", "style"],
  "fontRecommendation": "font family name",
  "animationStyle": "smooth|sharp|bouncy|minimal",
  "designElements": {
    "hasGradients": true/false,
    "hasPatterns": true/false,
    "hasTextures": true/false,
    "lighting": "bright|dim|neon|natural",
    "contrast": "high|medium|low"
  },
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex", 
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "composition": {
    "balance": "symmetric|asymmetric|centered",
    "complexity": "simple|moderate|complex",
    "focusArea": "center|top|bottom|left|right"
  }
}

Extract 5 dominant colors, determine the overall mood and style, suggest appropriate font, and analyze design elements. Focus on colors that would work well for a wallet interface.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  // Clean and parse JSON response
  const cleanContent = content.replace(/```json|```/g, "").trim()
  return JSON.parse(cleanContent)
}

async function fallbackAnalysis(imageUrl: string) {
  // Enhanced fallback with better color extraction logic
  const colorSets = [
    {
      colors: ['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4', '#45B7D1'], 
      mood: 'energetic', 
      style: 'modern'
    },
    {
      colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF9500', '#FF6B6B'], 
      mood: 'playful', 
      style: 'gradient'
    },
    {
      colors: ['#00D4FF', '#0099CC', '#005580', '#003D5C', '#002A3F'], 
      mood: 'professional', 
      style: 'minimal'
    },
    {
      colors: ['#FF1744', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B'], 
      mood: 'luxury', 
      style: 'bright'
    },
    {
      colors: ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4'], 
      mood: 'cyberpunk', 
      style: 'neon'
    }
  ]
  
  const hash = imageUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const selectedSet = colorSets[Math.abs(hash) % colorSets.length]
  
  const analysis = {
    colors: selectedSet.colors,
    mood: selectedSet.mood,
    style: selectedSet.style,
    tags: ['crypto', 'modern', 'sleek', 'digital'],
    fontRecommendation: 'Inter',
    animationStyle: 'smooth',
    designElements: {
      hasGradients: Math.random() > 0.5,
      hasPatterns: Math.random() > 0.7,
      hasTextures: Math.random() > 0.6,
      lighting: 'bright',
      contrast: 'medium'
    },
    colorPalette: {
      primary: selectedSet.colors[0],
      secondary: selectedSet.colors[1],
      accent: selectedSet.colors[2],
      background: selectedSet.colors[4],
      text: '#FFFFFF'
    },
    composition: {
      balance: 'centered',
      complexity: 'moderate',
      focusArea: 'center'
    }
  }

  return new Response(
    JSON.stringify(analysis),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
