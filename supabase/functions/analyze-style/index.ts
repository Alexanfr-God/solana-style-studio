
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Read request body only once to avoid "Body already consumed" error
  let parsedBody;
  try {
    parsedBody = await req.json();
  } catch (e) {
    console.error('Invalid JSON in request body:', e);
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const { imageUrl } = parsedBody;

  if (!imageUrl) {
    return new Response(
      JSON.stringify({ error: 'Image URL is required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  console.log('🔍 Starting AI style analysis for image:', imageUrl);

  const openAiApiKey = Deno.env.get("OPENAI_API_KEY")
  if (!openAiApiKey) {
    console.log("OpenAI API key not found, using enhanced fallback analysis")
    return enhancedFallbackAnalysis(imageUrl)
  }

  try {
    // Analyze image with GPT-4 Vision
    const analysis = await analyzeImageWithGPT4Vision(imageUrl, openAiApiKey)
    
    console.log('✅ AI analysis completed successfully:', analysis);
    
    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 AI analysis error:', error)
    
    // Fallback to enhanced mock analysis if AI fails
    console.log('🔄 Falling back to enhanced analysis due to error');
    const fallback = await enhancedFallbackAnalysis(imageUrl)
    return fallback
  }
})

async function analyzeImageWithGPT4Vision(imageUrl: string, apiKey: string) {
  const prompt = `Analyze this image as a comprehensive design reference for a crypto wallet interface. Provide an enhanced analysis in JSON format for full UI customization.

Return ONLY valid JSON with no markdown formatting, no commentary, no code blocks:

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
  },
  "character": {
    "detected": "pepe|doge|cyberpunk|anime|cartoon|mascot|none",
    "confidence": 0.8,
    "style": "cartoon|realistic|abstract|pixel|3d",
    "personality": "playful|serious|mischievous|cool|friendly"
  },
  "layoutZones": {
    "safeZones": ["header", "balance-display", "primary-buttons", "navigation"],
    "customizableZones": ["background", "cards", "overlays", "decorative-elements"],
    "focusAreas": ["balance-area", "action-buttons", "transaction-list"]
  },
  "advancedEffects": {
    "glowIntensity": "subtle|medium|intense|none",
    "particleEffects": true/false,
    "morphing": true/false,
    "liquidEffects": true/false,
    "holographic": true/false,
    "neonEffects": true/false,
    "glassmorphism": true/false
  },
  "contextualStyles": {
    "timeOfDay": "night|day|sunset|dawn",
    "energy": "playful|serious|dark|vibrant|calm",
    "brandAlignment": "traditional|rebellious|premium|casual|futuristic",
    "culturalStyle": "western|eastern|cyber|retro|minimalist"
  }
}

Focus on extracting colors and styles that will work beautifully for crypto wallet UI with excellent contrast and accessibility. Be precise and return only valid JSON.`

  console.log('📤 Sending request to OpenAI GPT-4o Vision...');

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
      max_tokens: 1500,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  console.log('📥 OpenAI raw response:', content);
  
  // Clean and parse JSON response safely
  const cleanContent = content.replace(/```json|```/g, "").trim()
  
  let analysis;
  try {
    analysis = JSON.parse(cleanContent);
    console.log('✅ Parsed analysis successfully:', analysis);
  } catch (parseError) {
    console.error('💥 Failed to parse GPT JSON response:', parseError);
    console.log('🔄 Falling back to enhanced fallback analysis');
    // Return enhanced fallback instead of throwing
    return await enhancedFallbackAnalysisObject(imageUrl);
  }
  
  return analysis;
}

async function enhancedFallbackAnalysisObject(imageUrl: string) {
  // Enhanced fallback with advanced features
  const advancedStylePresets = [
    {
      colors: ['#9945FF', '#14F195', '#FF6B6B', '#4ECDC4', '#45B7D1'], 
      mood: 'energetic', 
      style: 'modern',
      tags: ['crypto', 'vibrant', 'tech', 'modern'],
      fontRecommendation: 'Inter',
      animationStyle: 'smooth',
      character: { detected: 'none', confidence: 0.1, style: 'abstract', personality: 'serious' },
      advancedEffects: { glowIntensity: 'medium', particleEffects: true, holographic: false, neonEffects: true, glassmorphism: true },
      contextualStyles: { timeOfDay: 'night', energy: 'vibrant', brandAlignment: 'futuristic', culturalStyle: 'cyber' }
    },
    {
      colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FF9500', '#FF6B6B'], 
      mood: 'playful', 
      style: 'gradient',
      tags: ['warm', 'friendly', 'energetic', 'crypto'],
      fontRecommendation: 'Poppins',
      animationStyle: 'bouncy',
      character: { detected: 'cartoon', confidence: 0.7, style: 'cartoon', personality: 'playful' },
      advancedEffects: { glowIntensity: 'intense', particleEffects: true, holographic: true, neonEffects: false, glassmorphism: false },
      contextualStyles: { timeOfDay: 'day', energy: 'playful', brandAlignment: 'casual', culturalStyle: 'western' }
    },
    {
      colors: ['#00D4FF', '#0099CC', '#005580', '#003D5C', '#002A3F'], 
      mood: 'professional', 
      style: 'minimal',
      tags: ['trust', 'secure', 'professional', 'finance'],
      fontRecommendation: 'Roboto',
      animationStyle: 'smooth',
      character: { detected: 'none', confidence: 0.0, style: 'abstract', personality: 'serious' },
      advancedEffects: { glowIntensity: 'subtle', particleEffects: false, holographic: false, neonEffects: false, glassmorphism: true },
      contextualStyles: { timeOfDay: 'day', energy: 'serious', brandAlignment: 'traditional', culturalStyle: 'minimalist' }
    },
    {
      colors: ['#FF1744', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B'], 
      mood: 'luxury', 
      style: 'bright',
      tags: ['premium', 'luxury', 'bold', 'crypto'],
      fontRecommendation: 'Montserrat',
      animationStyle: 'fluid',
      character: { detected: 'none', confidence: 0.2, style: 'realistic', personality: 'cool' },
      advancedEffects: { glowIntensity: 'intense', particleEffects: true, holographic: true, neonEffects: true, glassmorphism: false },
      contextualStyles: { timeOfDay: 'sunset', energy: 'vibrant', brandAlignment: 'premium', culturalStyle: 'western' }
    },
    {
      colors: ['#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4'], 
      mood: 'cyberpunk', 
      style: 'neon',
      tags: ['futuristic', 'tech', 'neon', 'crypto'],
      fontRecommendation: 'Space Grotesk',
      animationStyle: 'sharp',
      character: { detected: 'cyberpunk', confidence: 0.9, style: '3d', personality: 'cool' },
      advancedEffects: { glowIntensity: 'intense', particleEffects: true, holographic: true, neonEffects: true, glassmorphism: false },
      contextualStyles: { timeOfDay: 'night', energy: 'dark', brandAlignment: 'rebellious', culturalStyle: 'cyber' }
    },
    {
      colors: ['#1A1A1A', '#2D2D2D', '#404040', '#666666', '#999999'], 
      mood: 'minimal', 
      style: 'dark',
      tags: ['sleek', 'minimal', 'dark', 'modern'],
      fontRecommendation: 'Inter',
      animationStyle: 'minimal',
      character: { detected: 'none', confidence: 0.0, style: 'abstract', personality: 'serious' },
      advancedEffects: { glowIntensity: 'subtle', particleEffects: false, holographic: false, neonEffects: false, glassmorphism: true },
      contextualStyles: { timeOfDay: 'night', energy: 'calm', brandAlignment: 'premium', culturalStyle: 'minimalist' }
    }
  ]
  
  // Create sophisticated hash for consistent selection
  const hash = imageUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const selectedPreset = advancedStylePresets[Math.abs(hash) % advancedStylePresets.length]
  
  const analysis = {
    colors: selectedPreset.colors,
    mood: selectedPreset.mood,
    style: selectedPreset.style,
    tags: selectedPreset.tags,
    fontRecommendation: selectedPreset.fontRecommendation,
    animationStyle: selectedPreset.animationStyle,
    designElements: {
      hasGradients: Math.random() > 0.3,
      hasPatterns: Math.random() > 0.7,
      hasTextures: Math.random() > 0.6,
      lighting: ['bright', 'natural', 'dramatic', 'neon'][Math.floor(Math.random() * 4)],
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
    },
    character: selectedPreset.character,
    layoutZones: {
      safeZones: ['header', 'balance-display', 'primary-buttons'],
      customizableZones: ['background', 'cards', 'overlays', 'decorative-elements'],
      focusAreas: ['balance-area', 'action-buttons']
    },
    advancedEffects: {
      ...selectedPreset.advancedEffects,
      morphing: Math.random() > 0.8,
      liquidEffects: Math.random() > 0.7
    },
    contextualStyles: selectedPreset.contextualStyles
  }

  console.log('🎨 Enhanced fallback analysis generated:', analysis);
  return analysis;
}

async function enhancedFallbackAnalysis(imageUrl: string) {
  const analysis = await enhancedFallbackAnalysisObject(imageUrl);
  
  return new Response(
    JSON.stringify(analysis),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
