// Enhanced Image generation with DALL-E and Replicate + POSTER QUALITY SYSTEM

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
  if (generator === 'dalle') {
    enhanced += `, in the style of modern vector posters, clean illustration, Adobe Illustrator quality`;
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

// ========== ОСНОВНЫЕ ФУНКЦИИ ГЕНЕРАЦИИ ==========

// Configuration for wallet layers
const WALLET_LAYERS = {
  LAYER_1: {
    name: 'unlock-layer',
    description: 'Layer with unlock button',
    aspectRatio: '16:9',
    suggestedSize: { width: 1920, height: 1080 }
  },
  LAYER_2: {
    name: 'balance-layer', 
    description: 'Layer with balance display',
    aspectRatio: '16:9',
    suggestedSize: { width: 1920, height: 1080 }
  }
};

// Enhanced prompt templates for wow effects
const WOW_EFFECT_TEMPLATES = {
  neon: 'neon glowing effects, cyberpunk style, vibrant colors',
  holographic: 'holographic, iridescent, prismatic light effects',
  particle: 'particle effects, sparkles, magical dust, ethereal',
  gradient: 'smooth gradient transitions, color flow, ambient',
  geometric: 'geometric patterns, sacred geometry, mathematical beauty',
  nature: 'organic patterns, natural textures, biomorphic designs',
  tech: 'futuristic tech patterns, circuit boards, digital matrix',
  abstract: 'abstract art, fluid dynamics, artistic expression'
};

export async function generateImageWithDALLE(prompt, supabase, options = {}) {
  try {
    console.log('🖼️ DALL-E generation with POSTER QUALITY...');
    console.log('Original prompt:', prompt);
    
    // ПРИМЕНЯЕМ COT & RUG + ОБУЧЕНИЕ НА ПРИМЕРАХ
    const enhancedPrompt = await enhancePosterPrompt(prompt, 'dalle', supabase);
    
    // Use Supabase Edge Function
    const requestBody = {
      prompt: enhancedPrompt,
      mode: 'image_generation',
      size: '1024x1024', // Квадрат лучше для постеров
      quality: 'hd',
      style: 'vivid' // Яркие цвета для постеров
    };

    console.log('📤 Sending to generate-style:', requestBody);

    const imageResponse = await supabase.functions.invoke('generate-style', {
      body: requestBody
    });

    if (imageResponse?.error) {
      throw new Error(`DALL-E generation failed: ${imageResponse.error.message}`);
    }

    const generatedImageUrl = imageResponse?.data?.imageUrl;
    
    if (!generatedImageUrl) {
      throw new Error('No image URL returned from DALL-E service');
    }

    const result = processDALLEResponse({ imageUrl: generatedImageUrl }, options);
    
    if (result.success) {
      console.log('✅ DALL-E POSTER generated successfully!');
      return {
        ...result,
        metadata: {
          ...result.metadata,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
          posterOptimized: true
        }
      };
    }

  } catch (error) {
    console.error('❌ DALL-E generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'dalle'
    };
  }
}

export async function generateImageWithReplicate(prompt, supabase, options = {}) {
  try {
    console.log('🎨 Replicate generation with POSTER QUALITY...');
    console.log('Original prompt:', prompt);
    
    // ПРИМЕНЯЕМ COT & RUG + ОБУЧЕНИЕ НА ПРИМЕРАХ
    const enhancedPrompt = await enhancePosterPrompt(prompt, 'replicate', supabase);
    
    const requestBody = {
      prompt: enhancedPrompt,
      // Параметры для качества
      width: 1024,
      height: 1024,
      guidance_scale: 7.5,
      num_inference_steps: 50, // Больше шагов = лучше качество
      scheduler: "DPMSolverMultistep"
    };

    console.log('📤 Sending to generate-wallet-mask-v3:', requestBody);

    const imageResponse = await supabase.functions.invoke('generate-wallet-mask-v3', {
      body: requestBody
    });

    if (imageResponse?.error) {
      throw new Error(`Replicate generation failed: ${imageResponse.error.message}`);
    }

    const generatedImageUrl = imageResponse?.data?.output?.[0];
    
    if (!generatedImageUrl) {
      throw new Error('No image URL returned from Replicate service');
    }

    const result = processReplicateResponse({ output: [generatedImageUrl] }, options);
    
    if (result.success) {
      console.log('✅ Replicate POSTER generated successfully!');
      return {
        ...result,
        metadata: {
          ...result.metadata,
          originalPrompt: prompt,
          enhancedPrompt: enhancedPrompt,
          posterOptimized: true
        }
      };
    }

  } catch (error) {
    console.error('❌ Replicate generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'replicate'
    };
  }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function processDALLEResponse(data, options) {
  const generatedImageUrl = data?.imageUrl;
  
  if (!generatedImageUrl) {
    return {
      success: false,
      error: 'No image URL returned from DALL-E service'
    };
  }
  
  const result = {
    success: true,
    imageUrl: generatedImageUrl,
    mode: 'dalle',
    dimensions: { width: 1024, height: 1024 }
  };
  
  // If multi-layer was requested, provide layer configuration
  if (options.multiLayer) {
    result.layers = [
      {
        id: 'layer1',
        name: WALLET_LAYERS.LAYER_1.name,
        imageUrl: generatedImageUrl,
        cropConfig: {
          x: 0,
          y: 0,
          width: '100%',
          height: '50%'
        },
        opacity: 1
      },
      {
        id: 'layer2',
        name: WALLET_LAYERS.LAYER_2.name,
        imageUrl: generatedImageUrl,
        cropConfig: {
          x: 0,
          y: '50%',
          width: '100%',
          height: '50%'
        },
        opacity: 1
      }
    ];
  }
  
  // Add metadata
  result.metadata = {
    generatedAt: new Date().toISOString(),
    style: 'vivid'
  };
  
  return result;
}

function processReplicateResponse(data, options) {
  const generatedImageUrl = data?.output?.[0];
  
  if (!generatedImageUrl) {
    return {
      success: false,
      error: 'No image URL returned from Replicate service'
    };
  }
  
  const result = {
    success: true,
    imageUrl: generatedImageUrl,
    mode: 'replicate',
    layerOptimized: true
  };
  
  // Add optimization data for proper display
  result.displayOptimization = {
    cssRules: {
      objectFit: 'cover',
      objectPosition: 'center',
      width: '100%',
      height: '100%'
    },
    containerSettings: {
      overflow: 'hidden',
      position: 'relative'
    }
  };
  
  // Add metadata
  result.metadata = {
    generatedAt: new Date().toISOString(),
    optimizationApplied: true
  };
  
  return result;
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
  "Trump cartoon": "Donald Trump, professional poster illustration, vector art style with bold black outlines (3px), dignified portrait, formal pose, flag elements in background, patriotic colors (red white blue), gold accents, subtle glow, sharp shadows, professional lighting, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, Adobe Illustrator quality",
  
  "Superman hero": "Superman, professional poster illustration, vector art style with bold black outlines (3px), heroic pose with chest out, slight low angle view, radiating light beams background, bold primary colors, high contrast, vibrant, speed lines, energy aura, dramatic lighting, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, Adobe Illustrator quality",
  
  "Messi champion": "Lionel Messi, professional poster illustration, vector art style with bold black outlines (3px), victory pose, action moment, emotional expression, stadium atmosphere, team colors, bright highlights, dynamic contrast, motion blur, light rays, celebratory mood, digital illustration, high contrast, professional quality, suitable for wallet background, centered composition with dynamic elements, in the style of modern vector posters, clean illustration, Adobe Illustrator quality"
};
