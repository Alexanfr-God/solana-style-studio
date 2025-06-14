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

    // Получаем список всех файлов с описаниями
    const { data: descriptionFiles, error: descError } = await supabase.storage
      .from('ai-fewshots')
      .list('training-data/Image-background1-description', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (descError) {
      throw new Error(`Error listing description files: ${descError.message}`)
    }

    const fewShotExamples = []

    // Обрабатываем каждый файл с описанием
    for (const file of descriptionFiles) {
      if (!file.name.endsWith('.rtf')) continue

      // Извлекаем номер изображения из имени файла
      const imageNumber = file.name.match(/Image_(\d+)\.rtf/)?.[1]
      if (!imageNumber) continue

      try {
        // Читаем RTF файл
        const { data: rtfData, error: rtfError } = await supabase.storage
          .from('ai-fewshots')
          .download(`training-data/Image-background1-description/${file.name}`)

        if (rtfError) {
          console.error(`Error downloading ${file.name}:`, rtfError)
          continue
        }

        // Извлекаем текст из RTF (простое удаление RTF тегов)
        const rtfText = await rtfData.text()
        const cleanText = rtfText
          .replace(/\\[a-z]+\d*/g, ' ') // удаляем RTF команды
          .replace(/[{}]/g, ' ') // удаляем фигурные скобки
          .replace(/\s+/g, ' ') // убираем лишние пробелы
          .trim()

        // Анализируем описание для извлечения ключевых данных
        const analysis = analyzeDescription(cleanText)

        // Создаем few-shot пример
        const example = {
          input: {
            imageDescription: analysis.description,
            dominantColors: analysis.colors,
            styleType: analysis.styleType,
            targetElement: "background",
            moodProfile: analysis.mood
          },
          expectedPrompt: generateExpectedPrompt(analysis),
          modifications: {
            opacity: analysis.opacity || 0.3,
            blur: analysis.blur || "slight",
            contrast: analysis.contrast || "medium"
          }
        }

        fewShotExamples.push(example)
        console.log(`✅ Processed ${file.name}`)

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error)
      }
    }

    // Создаем итоговый JSON файл
    const finalJson = {
      category: "background_generation",
      created: new Date().toISOString(),
      examples: fewShotExamples,
      metadata: {
        totalExamples: fewShotExamples.length,
        source: "training-data/image-background1",
        description: "Auto-generated from user training data"
      }
    }

    // Сохраняем JSON в Storage
    const jsonBlob = new Blob([JSON.stringify(finalJson, null, 2)], {
      type: 'application/json'
    })

    const { error: uploadError } = await supabase.storage
      .from('ai-fewshots')
      .upload('prompts/background_generation.json', jsonBlob, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Error uploading JSON: ${uploadError.message}`)
    }

    return new Response(JSON.stringify({
      success: true,
      processedFiles: fewShotExamples.length,
      jsonPath: 'prompts/background_generation.json',
      examples: fewShotExamples
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to convert training data',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Функция анализа описания
function analyzeDescription(text: string) {
  const lowercaseText = text.toLowerCase()
  
  // Определение стиля
  let styleType = "abstract"
  if (lowercaseText.includes("nature") || lowercaseText.includes("forest") || lowercaseText.includes("organic")) {
    styleType = "nature"
  } else if (lowercaseText.includes("cyber") || lowercaseText.includes("digital") || lowercaseText.includes("tech")) {
    styleType = "cyberpunk"
  } else if (lowercaseText.includes("minimal") || lowercaseText.includes("clean") || lowercaseText.includes("simple")) {
    styleType = "minimal"
  } else if (lowercaseText.includes("luxury") || lowercaseText.includes("elegant") || lowercaseText.includes("gold")) {
    styleType = "luxury"
  }

  // Определение настроения
  let mood = "calm"
  if (lowercaseText.includes("energetic") || lowercaseText.includes("dynamic") || lowercaseText.includes("vibrant")) {
    mood = "energetic"
  } else if (lowercaseText.includes("mysterious") || lowercaseText.includes("dark")) {
    mood = "mysterious"
  } else if (lowercaseText.includes("playful") || lowercaseText.includes("fun")) {
    mood = "playful"
  }

  // Извлечение цветов (примерная логика)
  const colors = extractColors(text)

  return {
    description: text.substring(0, 100) + "...", // краткое описание
    colors: colors,
    styleType: styleType,
    mood: mood,
    opacity: 0.3,
    blur: "slight",
    contrast: "medium"
  }
}

// Функция извлечения цветов из текста
function extractColors(text: string): string[] {
  const colorMap: { [key: string]: string } = {
    'blue': '#3B82F6',
    'red': '#EF4444',
    'green': '#10B981',
    'purple': '#8B5CF6',
    'orange': '#F97316',
    'yellow': '#EAB308',
    'pink': '#EC4899',
    'cyan': '#06B6D4',
    'gray': '#6B7280',
    'black': '#000000',
    'white': '#FFFFFF'
  }

  const foundColors: string[] = []
  const lowercaseText = text.toLowerCase()

  for (const [colorName, colorCode] of Object.entries(colorMap)) {
    if (lowercaseText.includes(colorName)) {
      foundColors.push(colorCode)
    }
  }

  // Если цвета не найдены, используем дефолтные
  if (foundColors.length === 0) {
    return ['#6B7280', '#374151', '#F3F4F6']
  }

  return foundColors.slice(0, 3) // максимум 3 цвета
}

// Функция генерации ожидаемого промпта
function generateExpectedPrompt(analysis: any): string {
  return `Generate a ${analysis.styleType}-style background with ${analysis.description}. Use ${analysis.colors.join(', ')} color palette. Create a ${analysis.mood} atmosphere. Ensure the image works as a subtle background without overwhelming foreground UI elements.`
}