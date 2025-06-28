
// Enhanced Image generation with direct API calls - Leonardo.ai integration

// ========== ЗАГРУЗКА ПРИМЕРОВ ИЗ SUPABASE ==========
let LEARNED_STYLES = null; // Кэш загруженных примеров

async function loadPosterExamples(supabase) {
  if (LEARNED_STYLES) return LEARNED_STYLES; // Используем кэш
  
  try {
    console.log('📚 Loading poster examples from Supabase...');
    const examples = {};
    
    // Загружаем все примеры poster-001 до poster-010
    for (let i = 1; i <= 10; i++) {
      const posterId = `poster-${String(i).padStart(3, '0')}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('ai-examples-json')
          .download(`${posterId}/metadata.json`);
        
        if (data && !error) {
          const metadata = JSON.parse(await data.text());
          examples[posterId] = {
            id: posterId,
            prompt: metadata.description || '',
            style: metadata.background?.style || '',
            mood: metadata.background?.mood || '',
            colors: metadata.background?.colors || {},
            character: metadata.character || '',
            composition: metadata.composition || ''
          };
          console.log(`✅ Loaded ${posterId}:`, metadata.character);
        }
      } catch (e) {
        console.warn(`Failed to load ${posterId}`);
      }
    }
    
    LEARNED_STYLES = examples;
    console.log(`📊 Loaded ${Object.keys(examples).length} poster examples`);
    return examples;
    
  } catch (error) {
    console.error('❌ Error loading examples:', error);
    return {};
  }
}

// ========== COT & RUG SYSTEM С ОБУЧЕНИЕМ ==========
const POSTER_TEMPLATES = {
  superhero: {
    style: "heroic pose with chest out, slight low angle view, radiating light beams background",
    colors: "bold primary colors, high contrast, vibrant",
    effects: "speed lines, energy aura, dramatic lighting"
  },
  political: {
    style: "dignified portrait, formal pose, flag elements in background",
    colors: "patriotic colors (red white blue), gold accents",
    effects: "subtle glow, sharp shadows, professional lighting"
  },
  sports: {
    style: "victory pose, action moment, emotional expression, stadium atmosphere",
    colors: "team colors, bright highlights, dynamic contrast",
    effects: "motion blur, light rays, celebratory mood"
  },
  cartoon: {
    style: "exaggerated proportions, dynamic pose, big expressions",
    colors: "vibrant saturated colors, complementary scheme",
    effects: "cel shading, bold outlines, comic book style"
  }
};

// Функция улучшения промпта с COT & RUG + ОБУЧЕНИЕ НА ПРИМЕРАХ
async function enhancePosterPrompt(userPrompt, generator, supabase) {
  console.log('🎨 Enhancing prompt with COT & RUG + learned examples...');
  
  // Загружаем примеры если еще не загружены
  const examples = await loadPosterExamples(supabase);
  
  // Анализируем запрос
  const analysis = {
    hasCharacter: /trump|superman|messi|ronaldo|batman|spiderman/i.test(userPrompt),
    style: detectStyle(userPrompt),
    mood: detectMood(userPrompt),
    matchedExample: findBestExample(userPrompt, examples)
  };
  
  // Если нашли похожий пример, используем его стиль
  if (analysis.matchedExample) {
    console.log(`🎯 Using learned style from ${analysis.matchedExample.id}`);
    const example = analysis.matchedExample;
    
    let enhanced = userPrompt;
    enhanced += `, ${example.style}, ${example.mood} mood`;
    
    // Добавляем цвета из примера
    if (example.colors) {
      const colorDesc = Object.entries(example.colors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      enhanced += `, color scheme: ${colorDesc}`;
    }
    
    enhanced += `, professional poster illustration, vector art style with bold black outlines`;
    return enhanced;
  }
  
  // Иначе используем шаблоны
  const template = POSTER_TEMPLATES[analysis.style] || POSTER_TEMPLATES.cartoon;
  
  // Строим улучшенный промпт
  let enhanced = userPrompt;
  enhanced += `, professional poster illustration, vector art style with bold black outlines (3px), ${template.style}, ${template.colors}, ${template.effects}`;
  enhanced += `, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements`;
  
  // Специфика для генератора
  if (generator === 'leonardo') {
    enhanced += `, in the style of modern vector posters, clean illustration, high quality digital art`;
  } else {
    enhanced += `, poster art, vector style, bold design`;
  }
  
  console.log('✨ Enhanced prompt:', enhanced);
  return enhanced;
}

// Поиск наиболее подходящего примера
function findBestExample(userPrompt, examples) {
  const lower = userPrompt.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  
  Object.values(examples).forEach(example => {
    let score = 0;
    
    // Проверяем совпадение персонажа
    if (example.character && lower.includes(example.character.toLowerCase())) {
      score += 10;
    }
    
    // Проверяем совпадение стиля
    if (example.style && lower.includes(example.style.toLowerCase())) {
      score += 5;
    }
    
    // Проверяем настроение
    if (example.mood && lower.includes(example.mood.toLowerCase())) {
      score += 3;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = example;
    }
  });
  
  return bestScore > 0 ? bestMatch : null;
}

function detectStyle(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('superhero') || lower.includes('hero')) return 'superhero';
  if (lower.includes('president') || lower.includes('trump')) return 'political';
  if (lower.includes('sport') || lower.includes('champion')) return 'sports';
  return 'cartoon';
}

function detectMood(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes('power') || lower.includes('strong')) return 'powerful';
  if (lower.includes('fun') || lower.includes('happy')) return 'playful';
  if (lower.includes('serious')) return 'serious';
  return 'confident';
}

// ========== LEONARDO.AI INTEGRATION ==========

export async function generateImageWithLeonardo(prompt, supabase, options = {}) {
  try {
    console.log('🎨 Leonardo.ai generation with DIRECT API CALL...');
    console.log('Original prompt:', prompt);
    
    // ПРИМЕНЯЕМ COT & RUG + ОБУЧЕНИЕ НА ПРИМЕРАХ
    const enhancedPrompt = await enhancePosterPrompt(prompt, 'leonardo', supabase);
    
    // Get Leonardo API key from environment
    const leonardoApiKey = Deno.env.get('LEONARDO_API_KEY');
    if (!leonardoApiKey) {
      throw new Error('Leonardo API key not configured');
    }

    console.log('📤 Calling Leonardo.ai API directly...');

    // Step 1: Create generation request
    const generationResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${leonardoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Phoenix model ID
        width: 1024,
        height: 1024,
        num_images: 1,
        guidance_scale: 7,
        num_inference_steps: 15,
        presetStyle: "DYNAMIC"
      })
    });

    if (!generationResponse.ok) {
      const errorData = await generationResponse.json();
      throw new Error(`Leonardo API error: ${errorData.error?.message || generationResponse.statusText}`);
    }

    const generationData = await generationResponse.json();
    const generationId = generationData.sdGenerationJob.generationId;
    
    console.log('🔄 Generation started, ID:', generationId);

    // Step 2: Poll for completion
    let generationComplete = false;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (!generationComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          'Authorization': `Bearer ${leonardoApiKey}`,
        }
      });
      
      if (!statusResponse.ok) {
        throw new Error('Failed to check generation status');
      }
      
      const statusData = await statusResponse.json();
      const generation = statusData.generations_by_pk;
      
      if (generation.status === 'COMPLETE') {
        generationComplete = true;
        
        if (generation.generated_images && generation.generated_images.length > 0) {
          const imageUrl = generation.generated_images[0].url;
          
          const result = {
            success: true,
            imageUrl: imageUrl,
            mode: 'leonardo',
            dimensions: { width: 1024, height: 1024 },
            metadata: {
              generatedAt: new Date().toISOString(),
              originalPrompt: prompt,
              enhancedPrompt: enhancedPrompt,
              posterOptimized: true,
              generationId: generationId
            }
          };

          console.log('✅ Leonardo.ai image generated successfully!');
          return result;
        } else {
          throw new Error('No images generated');
        }
      } else if (generation.status === 'FAILED') {
        throw new Error('Leonardo generation failed');
      }
      
      attempts++;
      console.log(`⏳ Waiting for generation completion... (${attempts}/${maxAttempts})`);
    }
    
    if (!generationComplete) {
      throw new Error('Generation timeout - please try again');
    }

  } catch (error) {
    console.error('❌ Leonardo generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'leonardo'
    };
  }
}

export async function generateImageWithReplicate(prompt, supabase, options = {}) {
  try {
    console.log('🎨 Replicate generation with DIRECT API CALL...');
    console.log('Original prompt:', prompt);
    
    // ПРИМЕНЯЕМ COT & RUG + ОБУЧЕНИЕ НА ПРИМЕРАХ
    const enhancedPrompt = await enhancePosterPrompt(prompt, 'replicate', supabase);
    
    // Get Replicate API key from environment
    const replicateApiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!replicateApiKey) {
      throw new Error('Replicate API key not configured');
    }

    console.log('📤 Calling Replicate API directly...');

    // Direct API call to Replicate
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt: enhancedPrompt,
          go_fast: true,
          megapixels: "1",
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          num_inference_steps: 4
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Replicate API error: ${errorData.detail || response.statusText}`);
    }

    const prediction = await response.json();
    
    // Wait for completion
    let completedPrediction = prediction;
    while (completedPrediction.status === 'starting' || completedPrediction.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        }
      });
      
      completedPrediction = await statusResponse.json();
    }

    if (completedPrediction.status === 'failed') {
      throw new Error(`Replicate generation failed: ${completedPrediction.error}`);
    }

    const generatedImageUrl = completedPrediction.output?.[0];
    if (!generatedImageUrl) {
      throw new Error('No image URL returned from Replicate');
    }

    const result = {
      success: true,
      imageUrl: generatedImageUrl,
      mode: 'replicate',
      layerOptimized: true,
      metadata: {
        generatedAt: new Date().toISOString(),
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        posterOptimized: true
      }
    };

    console.log('✅ Replicate image generated successfully!');
    return result;

  } catch (error) {
    console.error('❌ Replicate generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'replicate'
    };
  }
}

// Export helper function for frontend integration
export function getLayerOptimizationCSS(generator, layerId) {
  if (generator === 'replicate') {
    return `
      .wallet-layer-${layerId} {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .wallet-layer-${layerId} img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
    `;
  } else {
    return `
      .wallet-layer-${layerId} {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
    `;
  }
}

// ========== ПРИМЕРЫ ПРОМПТОВ ДЛЯ ТЕСТИРОВАНИЯ ==========
export const POSTER_PROMPT_EXAMPLES = {
  "Trump cartoon": "Donald Trump, professional poster illustration, vector art style with bold black outlines (3px), dignified portrait, formal pose, flag elements in background, patriotic colors (red white blue), gold accents, subtle glow, sharp shadows, professional lighting, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, high quality digital art",
  
  "Superman hero": "Superman, professional poster illustration, vector art style with bold black outlines (3px), heroic pose with chest out, slight low angle view, radiating light beams background, bold primary colors, high contrast, vibrant, speed lines, energy aura, dramatic lighting, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, high quality digital art",
  
  "Messi champion": "Lionel Messi, professional poster illustration, vector art style with bold black outlines (3px), victory pose, action moment, emotional expression, stadium atmosphere, team colors, bright highlights, dynamic contrast, motion blur, light rays, celebratory mood, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, high quality digital art"
};
