import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = 'https://opxordptvpvzmhakvdde.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9weG9yZHB0dnB2em1oYWt2ZGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTY2NjgsImV4cCI6MjA2MjI5MjY2OH0.uHDqEycZqhQ02zMvmikDjMXsqeVU792Ei61ceavk6iw'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Получаем список всех папок в training-data
    const { data: folders, error: foldersError } = await supabase.storage
      .from('ai-fewshots')
      .list('training-data', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (foldersError) {
      throw new Error(`Error listing folders: ${foldersError.message}`)
    }

    const results = []
    
    // Обрабатываем каждую папку
    for (const folder of folders) {
      if (!folder.name) continue
      
      const elementType = detectElementType(folder.name)
      if (!elementType) continue

      try {
        const result = await processElementFolder(supabase, folder.name, elementType)
        if (result) {
          results.push(result)
        }
      } catch (error) {
        console.error(`Error processing folder ${folder.name}:`, error)
        results.push({
          folder: folder.name,
          elementType,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processedFolders: results.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to auto-convert training data',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Определение типа элемента по названию папки
function detectElementType(folderName: string): string | null {
  const name = folderName.toLowerCase()
  
  if (name.includes('background')) return 'backgrounds'
  if (name.includes('font')) return 'fonts'
  if (name.includes('button')) return 'buttons'
  if (name.includes('icon')) return 'icons'
  if (name.includes('container')) return 'containers'
  if (name.includes('border')) return 'borders'
  if (name.includes('input')) return 'inputs'
  if (name.includes('card')) return 'cards'
  if (name.includes('navigation') || name.includes('nav')) return 'navigation'
  if (name.includes('header')) return 'headers'
  if (name.includes('footer')) return 'footers'
  
  return null
}

// Обработка папки с элементами
async function processElementFolder(supabase: any, folderName: string, elementType: string) {
  // Ищем папку с описаниями
  const descriptionFolderName = `${folderName}-description`
  
  const { data: descriptionFiles, error: descError } = await supabase.storage
    .from('ai-fewshots')
    .list(`training-data/${descriptionFolderName}`, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' }
    })

  if (descError || !descriptionFiles || descriptionFiles.length === 0) {
    console.log(`No description files found for ${folderName}`)
    return null
  }

  const examples = []

  // Обрабатываем каждый файл с описанием
  for (const file of descriptionFiles) {
    if (!file.name.endsWith('.rtf')) continue

    try {
      // Читаем RTF файл
      const { data: rtfData, error: rtfError } = await supabase.storage
        .from('ai-fewshots')
        .download(`training-data/${descriptionFolderName}/${file.name}`)

      if (rtfError) {
        console.error(`Error downloading ${file.name}:`, rtfError)
        continue
      }

      // Извлекаем текст из RTF
      const rtfText = await rtfData.text()
      const cleanText = rtfText
        .replace(/\\[a-z]+\d*/g, ' ')
        .replace(/[{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      // Анализируем описание в зависимости от типа элемента
      const analysis = analyzeByElementType(cleanText, elementType)
      
      // Создаем пример для конкретного типа элемента
      const example = createExampleByType(analysis, elementType, file.name)
      
      if (example) {
        examples.push(example)
      }

    } catch (error) {
      console.error(`Error processing ${file.name}:`, error)
    }
  }

  if (examples.length === 0) {
    return null
  }

  // Создаем финальный JSON
  const elementName = extractElementName(folderName)
  const finalJson = {
    category: elementType,
    elementName: elementName,
    created: new Date().toISOString(),
    examples: examples,
    metadata: {
      totalExamples: examples.length,
      source: `training-data/${folderName}`,
      description: `Auto-generated ${elementType} examples`
    }
  }

  // Сохраняем JSON в Storage
  const jsonBlob = new Blob([JSON.stringify(finalJson, null, 2)], {
    type: 'application/json'
  })

  const jsonPath = `prompts/${elementType}/${elementName}.json`
  
  const { error: uploadError } = await supabase.storage
    .from('ai-fewshots')
    .upload(jsonPath, jsonBlob, {
      cacheControl: '3600',
      upsert: true
    })

  if (uploadError) {
    throw new Error(`Error uploading JSON: ${uploadError.message}`)
  }

  return {
    folder: folderName,
    elementType,
    elementName,
    jsonPath,
    examplesCount: examples.length,
    success: true
  }
}

// Анализ описания в зависимости от типа элемента
function analyzeByElementType(text: string, elementType: string) {
  const lowercaseText = text.toLowerCase()
  const colors = extractColors(text)
  
  const baseAnalysis = {
    description: text.substring(0, 150) + "...",
    colors: colors,
    text: text
  }

  switch (elementType) {
    case 'backgrounds':
      return {
        ...baseAnalysis,
        styleType: detectStyleType(lowercaseText),
        mood: detectMood(lowercaseText),
        opacity: 0.3,
        blur: "slight",
        contrast: "medium",
        pattern: detectPattern(lowercaseText)
      }
      
    case 'fonts':
      return {
        ...baseAnalysis,
        fontFamily: detectFontFamily(lowercaseText),
        fontWeight: detectFontWeight(lowercaseText),
        fontSize: detectFontSize(lowercaseText),
        letterSpacing: detectLetterSpacing(lowercaseText),
        textAlign: detectTextAlign(lowercaseText)
      }
      
    case 'buttons':
      return {
        ...baseAnalysis,
        buttonStyle: detectButtonStyle(lowercaseText),
        size: detectSize(lowercaseText),
        borderRadius: detectBorderRadius(lowercaseText),
        padding: detectPadding(lowercaseText),
        hoverEffect: detectHoverEffect(lowercaseText)
      }
      
    case 'icons':
      return {
        ...baseAnalysis,
        iconStyle: detectIconStyle(lowercaseText),
        iconSet: detectIconSet(lowercaseText),
        size: detectSize(lowercaseText),
        strokeWidth: detectStrokeWidth(lowercaseText)
      }

    default:
      return baseAnalysis
  }
}

// Создание примера в зависимости от типа элемента
function createExampleByType(analysis: any, elementType: string, fileName: string) {
  const baseExample = {
    fileName: fileName,
    input: {
      description: analysis.description,
      dominantColors: analysis.colors,
      elementType: elementType
    }
  }

  switch (elementType) {
    case 'backgrounds':
      return {
        ...baseExample,
        input: {
          ...baseExample.input,
          styleType: analysis.styleType,
          moodProfile: analysis.mood,
          targetElement: "background"
        },
        expectedPrompt: `Generate a ${analysis.styleType}-style background with ${analysis.description}. Use ${analysis.colors.join(', ')} color palette. Create a ${analysis.mood} atmosphere.`,
        modifications: {
          opacity: analysis.opacity,
          blur: analysis.blur,
          contrast: analysis.contrast,
          pattern: analysis.pattern
        }
      }
      
    case 'fonts':
      return {
        ...baseExample,
        input: {
          ...baseExample.input,
          fontFamily: analysis.fontFamily,
          fontWeight: analysis.fontWeight,
          fontSize: analysis.fontSize
        },
        expectedCSS: {
          fontFamily: analysis.fontFamily,
          fontWeight: analysis.fontWeight,
          fontSize: analysis.fontSize,
          letterSpacing: analysis.letterSpacing,
          textAlign: analysis.textAlign,
          color: analysis.colors[0] || '#000000'
        }
      }
      
    case 'buttons':
      return {
        ...baseExample,
        input: {
          ...baseExample.input,
          buttonStyle: analysis.buttonStyle,
          size: analysis.size
        },
        expectedCSS: {
          style: analysis.buttonStyle,
          borderRadius: analysis.borderRadius,
          padding: analysis.padding,
          backgroundColor: analysis.colors[0] || '#3B82F6',
          color: analysis.colors[1] || '#FFFFFF',
          hoverEffect: analysis.hoverEffect
        }
      }

    default:
      return baseExample
  }
}

// Вспомогательные функции для извлечения данных
function extractElementName(folderName: string): string {
  return folderName.replace(/^[a-zA-Z-]*/, '').replace(/\d+$/, '') || folderName
}

function detectStyleType(text: string): string {
  if (text.includes("nature") || text.includes("organic")) return "nature"
  if (text.includes("cyber") || text.includes("digital")) return "cyberpunk"
  if (text.includes("minimal") || text.includes("clean")) return "minimal"
  if (text.includes("luxury") || text.includes("elegant")) return "luxury"
  return "abstract"
}

function detectMood(text: string): string {
  if (text.includes("energetic") || text.includes("vibrant")) return "energetic"
  if (text.includes("mysterious") || text.includes("dark")) return "mysterious"
  if (text.includes("playful") || text.includes("fun")) return "playful"
  return "calm"
}

function detectPattern(text: string): string {
  if (text.includes("gradient")) return "gradient"
  if (text.includes("geometric")) return "geometric"
  if (text.includes("organic")) return "organic"
  return "none"
}

function detectFontFamily(text: string): string {
  if (text.includes("serif")) return "serif"
  if (text.includes("mono")) return "monospace"
  return "sans-serif"
}

function detectFontWeight(text: string): string {
  if (text.includes("bold") || text.includes("thick")) return "bold"
  if (text.includes("light") || text.includes("thin")) return "light"
  return "normal"
}

function detectFontSize(text: string): string {
  if (text.includes("large") || text.includes("big")) return "large"
  if (text.includes("small") || text.includes("tiny")) return "small"
  return "medium"
}

function detectLetterSpacing(text: string): string {
  if (text.includes("wide") || text.includes("spaced")) return "wide"
  if (text.includes("tight") || text.includes("condensed")) return "tight"
  return "normal"
}

function detectTextAlign(text: string): string {
  if (text.includes("center")) return "center"
  if (text.includes("right")) return "right"
  return "left"
}

function detectButtonStyle(text: string): string {
  if (text.includes("outline") || text.includes("border")) return "outline"
  if (text.includes("ghost") || text.includes("transparent")) return "ghost"
  if (text.includes("gradient")) return "gradient"
  return "solid"
}

function detectSize(text: string): string {
  if (text.includes("large") || text.includes("big")) return "large"
  if (text.includes("small") || text.includes("tiny")) return "small"
  return "medium"
}

function detectBorderRadius(text: string): string {
  if (text.includes("rounded") || text.includes("round")) return "rounded"
  if (text.includes("sharp") || text.includes("square")) return "none"
  return "medium"
}

function detectPadding(text: string): string {
  if (text.includes("spacious") || text.includes("large padding")) return "large"
  if (text.includes("compact") || text.includes("small padding")) return "small"
  return "medium"
}

function detectHoverEffect(text: string): string {
  if (text.includes("glow") || text.includes("shadow")) return "glow"
  if (text.includes("scale") || text.includes("grow")) return "scale"
  if (text.includes("fade")) return "fade"
  return "darken"
}

function detectIconStyle(text: string): string {
  if (text.includes("outline") || text.includes("stroke")) return "outline"
  if (text.includes("filled") || text.includes("solid")) return "filled"
  return "outline"
}

function detectIconSet(text: string): string {
  if (text.includes("feather")) return "feather"
  if (text.includes("heroicons")) return "heroicons"
  if (text.includes("lucide")) return "lucide"
  return "default"
}

function detectStrokeWidth(text: string): string {
  if (text.includes("thick") || text.includes("bold")) return "2"
  if (text.includes("thin") || text.includes("light")) return "1"
  return "1.5"
}

function extractColors(text: string): string[] {
  const colorMap: { [key: string]: string } = {
    'blue': '#3B82F6', 'red': '#EF4444', 'green': '#10B981',
    'purple': '#8B5CF6', 'orange': '#F97316', 'yellow': '#EAB308',
    'pink': '#EC4899', 'cyan': '#06B6D4', 'gray': '#6B7280',
    'black': '#000000', 'white': '#FFFFFF', 'brown': '#A16207',
    'indigo': '#6366F1', 'violet': '#7C3AED', 'rose': '#F43F5E'
  }

  const foundColors: string[] = []
  const lowercaseText = text.toLowerCase()

  for (const [colorName, colorCode] of Object.entries(colorMap)) {
    if (lowercaseText.includes(colorName)) {
      foundColors.push(colorCode)
    }
  }

  if (foundColors.length === 0) {
    return ['#6B7280', '#374151', '#F3F4F6']
  }

  return foundColors.slice(0, 3)
}