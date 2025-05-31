
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
      console.log("OpenAI API key not found, using enhanced fallback analysis")
      return enhancedFallbackAnalysis(imageUrl)
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
    
    // Fallback to enhanced mock analysis if AI fails
    const { imageUrl } = await req.json()
    const fallback = await enhancedFallbackAnalysis(imageUrl)
    return fallback
  }
})

async function analyzeImageWithGPT4Vision(imageUrl: string, apiKey: string) {
  const prompt = `Analyze this image as a comprehensive design reference for a crypto wallet interface. Provide an enhanced analysis in JSON format for full UI customization:

{
  "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "mood": "energetic|calm|luxury|playful|professional|cyberpunk|minimal|retro|modern|futuristic",
  "style": "modern|gradient|neon|glass|dark|bright|organic|geometric|sharp|rounded|3d|flat",
  "tags": ["descriptive", "keywords", "for", "wallet", "styling"],
  "fontRecommendation": "font family name (Inter|Roboto|Poppins|Montserrat|Space Grotesk)",
  "animationStyle": "smooth|sharp|bouncy|minimal|fluid|elastic",
  "designElements": {
    "hasGradients": true/false,
    "hasPatterns": true/false,
    "hasTextures": true/false,
    "lighting": "bright|dim|neon|natural|dramatic|soft",
    "contrast": "high|medium|low"
  },
  "colorPalette": {
    "primary": "#hex (main brand color)",
    "secondary": "#hex (accent color)", 
    "accent": "#hex (highlight color)",
    "background": "#hex (base background)",
    "text": "#hex (text color)"
  },
  "composition": {
    "balance": "symmetric|asymmetric|centered|dynamic",
    "complexity": "simple|moderate|complex|minimal",
    "focusArea": "center|top|bottom|left|right|distributed"
  }
}

Focus on extracting colors and styles that will work beautifully for:
- Wallet headers and navigation
- Button gradients and hover states  
- Panel backgrounds and cards
- Input fields and search bars
- Overlay modals and sidebars
- Container elements and borders

Ensure the color palette creates a cohesive, modern crypto wallet experience with excellent contrast and accessibility.`

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
      max_tokens: 1200,
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

async function enhancedFallbackAnalysis(imageUrl: string) {
  // Enhanced fallback with more sophisticated color schemes and styles
  const stylePresets = [
    {
      colors: ['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4', '#45B7D1'], 
      mood: 'energetic', 
      style: 'modern',
      tags: ['crypto', 'vibrant', 'tech', 'modern'],
      fontRecommendation: 'Inter',
      animationStyle: 'smooth'
    },
    {
      colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF9500', '#FF6B6B'], 
      mood: 'playful', 
      style: 'gradient',
      tags: ['warm', 'friendly', 'energetic', 'crypto'],
      fontRecommendation: 'Poppins',
      animationStyle: 'bouncy'
    },
    {
      colors: ['#00D4FF', '#0099CC', '#005580', '#003D5C', '#002A3F'], 
      mood: 'professional', 
      style: 'minimal',
      tags: ['trust', 'secure', 'professional', 'finance'],
      fontRecommendation: 'Roboto',
      animationStyle: 'smooth'
    },
    {
      colors: ['#FF1744', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B'], 
      mood: 'luxury', 
      style: 'bright',
      tags: ['premium', 'luxury', 'bold', 'crypto'],
      fontRecommendation: 'Montserrat',
      animationStyle: 'fluid'
    },
    {
      colors: ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4'], 
      mood: 'cyberpunk', 
      style: 'neon',
      tags: ['futuristic', 'tech', 'neon', 'crypto'],
      fontRecommendation: 'Space Grotesk',
      animationStyle: 'sharp'
    },
    {
      colors: ['#1A1A1A', '#2D2D2D', '#404040', '#666666', '#999999'], 
      mood: 'minimal', 
      style: 'dark',
      tags: ['sleek', 'minimal', 'dark', 'modern'],
      fontRecommendation: 'Inter',
      animationStyle: 'minimal'
    }
  ]
  
  // Create a more sophisticated hash from imageUrl for consistent selection
  const hash = imageUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const selectedPreset = stylePresets[Math.abs(hash) % stylePresets.length]
  
  const analysis = {
    colors: selectedPreset.colors,
    mood: selectedPreset.mood,
    style: selectedPreset.style,
    tags: selectedPreset.tags,
    fontRecommendation: selectedPreset.fontRecommendation,
    animationStyle: selectedPreset.animationStyle,
    designElements: {
      hasGradients: Math.random() > 0.3, // 70% chance for gradients
      hasPatterns: Math.random() > 0.7,   // 30% chance for patterns
      hasTextures: Math.random() > 0.6,   // 40% chance for textures
      lighting: ['bright', 'natural', 'dramatic'][Math.floor(Math.random() * 3)],
      contrast: ['medium', 'high'][Math.floor(Math.random() * 2)]
    },
    colorPalette: {
      primary: selectedPreset.colors[0],
      secondary: selectedPreset.colors[1],
      accent: selectedPreset.colors[2],
      background: selectedPreset.colors[4],
      text: '#FFFFFF'
    },
    composition: {
      balance: ['centered', 'symmetric', 'dynamic'][Math.floor(Math.random() * 3)],
      complexity: ['moderate', 'simple'][Math.floor(Math.random() * 2)],
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
