
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

    // TODO: Интегрировать с GPT-4 Vision API для реального анализа
    // Пока используем mock-анализ
    const mockAnalysis = {
      colors: extractColorsFromUrl(imageUrl),
      mood: determineMood(),
      style: determineStyle(),
      tags: generateTags(),
      fontRecommendation: recommendFont(),
      animationStyle: 'smooth'
    }

    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-style function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function extractColorsFromUrl(imageUrl: string): string[] {
  // Mock color extraction based on image name/path
  const colorSets = [
    ['#9945FF', '#14F195', '#FF6B6B'], // Purple, Green, Red
    ['#FF6B35', '#F7931E', '#FFD23F'], // Orange theme
    ['#00D4FF', '#0099CC', '#005580'], // Blue theme
    ['#FF1744', '#FF5722', '#FF9800'], // Red-Orange theme
    ['#9C27B0', '#673AB7', '#3F51B5'], // Purple theme
  ]
  
  const hash = imageUrl.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return colorSets[Math.abs(hash) % colorSets.length]
}

function determineMood(): string {
  const moods = ['modern', 'playful', 'elegant', 'vibrant', 'minimalist', 'retro']
  return moods[Math.floor(Math.random() * moods.length)]
}

function determineStyle(): string {
  const styles = ['cyber', 'neon', 'gradient', 'flat', 'glass', 'sharp', 'organic']
  return styles[Math.floor(Math.random() * styles.length)]
}

function generateTags(): string[] {
  const allTags = ['crypto', 'modern', 'sleek', 'futuristic', 'clean', 'artistic', 'bold', 'subtle']
  const numTags = Math.floor(Math.random() * 3) + 2
  return allTags.slice(0, numTags)
}

function recommendFont(): string {
  const fonts = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Open Sans']
  return fonts[Math.floor(Math.random() * fonts.length)]
}
