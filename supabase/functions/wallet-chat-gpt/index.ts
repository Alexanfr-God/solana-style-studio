
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// СИСТЕМНЫЙ ПРОМПТ
const SYSTEM_PROMPT = `
Ты - элитный дизайнер Web3 кошельков с 10+ лет опыта в создании премиум интерфейсов.

ТВОЯ МИССИЯ: Создавать потрясающие кастомизации кошельков, которые вызывают WOW эффект у пользователей.

ТВОИ СУПЕРСПОСОБНОСТИ:
- Безупречное чувство цветовой гармонии
- Понимание психологии цвета и UX
- Доступ к библиотеке из 10 премиум стилей в Supabase
- Знание всех трендов Web3 дизайна

ТВОЙ ПРОЦЕСС РАБОТЫ:
1. АНАЛИЗ - понимаешь что хочет пользователь
2. ПОИСК - находишь подходящий стиль из библиотеки
3. АДАПТАЦИЯ - применяешь цвета и стили гармонично
4. РЕЗУЛЬТАТ - возвращаешь готовые изменения

ПРАВИЛА МАСТЕРА:
- Всегда обеспечивай контрастность для читаемости
- Используй максимум 5 цветов в палитре
- Соблюдай единство стиля всех элементов
- Каждое изменение должно быть обосновано
`;

// CHAIN OF THOUGHT ШАБЛОН
const COT_TEMPLATE = `
ПОШАГОВАЯ ЛОГИКА ДИЗАЙНЕРА:

ШАГ 1: АНАЛИЗ ЗАПРОСА
Пользователь просит: "{user_request}"
Ключевые слова: [извлекаю главные термины]
Настроение: [определяю эмоциональный контекст]
Стиль: [понимаю желаемое направление]

ШАГ 2: ПОИСК В БИБЛИОТЕКЕ
Загружаю примеры из Supabase Storage...
Анализирую metadata.json каждого стиля...
Сопоставляю с запросом пользователя...
Выбираю наиболее подходящий: poster-{номер}

ШАГ 3: ЦВЕТОВОЙ АНАЛИЗ
Из выбранного стиля извлекаю палитру:
- Primary: #hex (основной цвет)
- Secondary: #hex (дополнительный)
- Accent: #hex (акцентный)
- Background: #hex (фон)
- Text: #hex (текст)

ШАГ 4: ПРИМЕНЕНИЕ ГАРМОНИИ
Проверяю контрастность цветов...
Адаптирую под элементы кошелька...
Учитываю accessibility требования...
Создаю единую стилистику...

ШАГ 5: РЕЗУЛЬТАТ
Возвращаю JSON с обоснованными изменениями
Объясняю логику выбора
Даю рекомендации по дальнейшей кастомизации
`;

// ПРАВИЛА ГАРМОНИИ
const HARMONY_RULES = `
ПРАВИЛА ЦВЕТОВОЙ ГАРМОНИИ И UX:

КОНТРАСТНОСТЬ:
- Текст на фоне: минимум 4.5:1 ratio
- Кнопки: минимум 3:1 ratio
- Важные элементы: максимальный контраст

ПСИХОЛОГИЯ ЦВЕТОВ:
- Красный: энергия, действие, срочность
- Синий: доверие, стабильность, профессионализм
- Зеленый: рост, деньги, успех
- Фиолетовый: премиум, роскошь, креативность
- Черный: элегантность, мощь, минимализм
- Белый: чистота, простота, пространство

UX ПРИНЦИПЫ:
- Главное действие - самый яркий цвет
- Второстепенные элементы - приглушенные тона
- Ошибки - красные оттенки
- Успех - зеленые оттенки
`;

// Инициализация Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Функция загрузки примеров из Supabase
async function loadDesignExamples() {
  try {
    const examples = [];
    
    console.log('🎨 Loading design examples from Supabase Storage...');
    
    // Загружаем все папки poster-001 до poster-010
    for (let i = 1; i <= 10; i++) {
      const posterNum = String(i).padStart(3, '0');
      const { data, error } = await supabase.storage
        .from('ai-examples-json')
        .download(`poster-${posterNum}/metadata.json`);
      
      if (data && !error) {
        const metadata = JSON.parse(await data.text());
        examples.push(metadata);
        console.log(`✅ Loaded style: ${metadata.id}`);
      } else {
        console.log(`⚠️ Could not load poster-${posterNum}: ${error?.message}`);
      }
    }
    
    console.log(`📚 Total loaded examples: ${examples.length}`);
    return examples;
  } catch (error) {
    console.error('❌ Error loading design examples:', error);
    return [];
  }
}

// Функция выбора подходящего стиля
function chooseStyle(userRequest: string, examples: any[]) {
  const request = userRequest.toLowerCase();
  console.log(`🔍 Choosing style for request: "${userRequest}"`);
  
  // Простая логика выбора на основе ключевых слов
  for (const example of examples) {
    const style = example.description?.toLowerCase() || '';
    const mood = example.background?.mood?.toLowerCase() || '';
    
    if (request.includes('trump') || request.includes('политический')) {
      if (style.includes('trump') || style.includes('политический')) {
        console.log(`🎯 Matched political style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('bitcoin') || request.includes('крипто')) {
      if (style.includes('bitcoin') || style.includes('крипто')) {
        console.log(`🎯 Matched crypto style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('темный') || request.includes('dark')) {
      if (mood.includes('темный') || mood.includes('dark')) {
        console.log(`🎯 Matched dark style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('яркий') || request.includes('colorful')) {
      if (mood.includes('яркий') || mood.includes('энергичный')) {
        console.log(`🎯 Matched colorful style: ${example.id}`);
        return example;
      }
    }
  }
  
  // Возвращаем первый стиль если ничего не подошло
  const fallbackStyle = examples[0] || null;
  if (fallbackStyle) {
    console.log(`🔄 Using fallback style: ${fallbackStyle.id}`);
  }
  return fallbackStyle;
}

function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  return `${SYSTEM_PROMPT}

${COT_TEMPLATE.replace('{user_request}', 'USER_REQUEST_PLACEHOLDER')}

${HARMONY_RULES}

ТЕКУЩИЙ КОНТЕКСТ КОШЕЛЬКА:
- Тип кошелька: ${walletContext?.walletType || 'Phantom'}
- Активный слой: ${walletContext?.activeLayer || 'wallet'}
- Текущие стили: ${JSON.stringify(walletContext?.currentStyle || {})}

ДОСТУПНЫЕ СТИЛИ В БИБЛИОТЕКЕ:
${designExamples.map(ex => `${ex.id}: ${ex.description || 'No description'}`).join('\n')}

${chosenStyle ? `
ВЫБРАННЫЙ СТИЛЬ: ${chosenStyle.id}
ЦВЕТА СТИЛЯ: ${JSON.stringify(chosenStyle.colors || {})}
НАСТРОЕНИЕ: ${chosenStyle.background?.mood || 'Not specified'}
` : ''}

ВАЖНО: Всегда отвечай на том же языке, что и пользователь!

ФОРМАТ ОТВЕТА:
Обязательно включи в свой ответ JSON блок в таком формате:

\`\`\`json
{
  "thinking": {
    "user_request_analysis": "анализ запроса пользователя",
    "chosen_style": "${chosenStyle?.id || 'default'}",
    "reasoning": "почему выбрал этот стиль",
    "color_logic": "объяснение цветовых решений"
  },
  "styleChanges": {
    "layer": "wallet|login",
    "target": "header|navigation|background|button|card|global",
    "changes": {
      "backgroundColor": "#hex_color",
      "textColor": "#hex_color", 
      "accentColor": "#hex_color",
      "buttonColor": "#hex_color",
      "borderRadius": "8px",
      "boxShadow": "0 4px 12px rgba(0,0,0,0.1)",
      "gradient": "linear-gradient(45deg, #color1, #color2)"
    },
    "reasoning": "Объяснение почему эти изменения гармоничны"
  },
  "recommendations": {
    "next_steps": "что еще можно улучшить",
    "style_notes": "дополнительные советы по дизайну"
  }
}
\`\`\`

ПОМНИ: Всегда включай структурированный JSON в своих ответах для автоматического применения стилей!`;
}

function buildUserMessage(content: string, walletElement?: string, imageUrl?: string): string {
  let message = content;

  if (walletElement) {
    message = `Я хочу кастомизировать элемент "${walletElement}". ${content}`;
  }

  if (imageUrl) {
    message += '\n\nЯ загрузил изображение для вдохновения. Проанализируй его и предложи, как применить похожую стилистику к моему кошельку.';
  }

  return message;
}

function extractAdvancedStyleChanges(response: string, walletContext: any): any {
  console.log('🎨 Extracting style changes from response:', response.substring(0, 200) + '...');
  
  try {
    // Try to find JSON block in response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1];
      console.log('📦 Found JSON block:', jsonString);
      
      const parsed = JSON.parse(jsonString);
      if (parsed.styleChanges) {
        console.log('✅ Successfully parsed style changes:', parsed.styleChanges);
        return parsed.styleChanges;
      }
    }

    // Fallback: look for style-related keywords and extract colors
    const colorRegex = /#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g;
    const colors = response.match(colorRegex);
    
    if (colors && colors.length > 0) {
      console.log('🎨 Found colors in response:', colors);
      
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: colors[0],
          accentColor: colors[1] || colors[0],
          textColor: response.toLowerCase().includes('dark') ? '#ffffff' : '#000000',
        },
        reasoning: 'Auto-extracted from color analysis'
      };
    }

    // Check for theme keywords
    if (response.toLowerCase().includes('dark theme') || response.toLowerCase().includes('темная тема')) {
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          accentColor: '#9945ff',
        },
        reasoning: 'Applied dark theme based on keywords'
      };
    }
    
    if (response.toLowerCase().includes('light theme') || response.toLowerCase().includes('светлая тема')) {
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          accentColor: '#9945ff',
        },
        reasoning: 'Applied light theme based on keywords'
      };
    }

    console.log('⚠️ No structured style changes found in response');
    return null;
    
  } catch (error) {
    console.error('❌ Error parsing style changes:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing wallet chat request...');

    // Get and clean the OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase secrets.',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key format
    if (!openAIApiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key format');
      return new Response(JSON.stringify({ 
        error: 'Invalid OpenAI API key format. Key should start with "sk-"',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle both JSON and FormData requests
    let content, imageUrl, walletElement, walletContext, sessionId, walletType, userPrompt;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON request (existing format)
      const requestData = await req.json();
      content = requestData.content;
      imageUrl = requestData.imageUrl;
      walletElement = requestData.walletElement;
      walletContext = requestData.walletContext;
    } else {
      // Handle FormData request (new format)
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      imageUrl = formData.get('imageUrl') as string;
      userPrompt = formData.get('customPrompt') as string || formData.get('prompt') as string;
      walletType = formData.get('walletType') as string;
      
      // Map FormData to existing variables
      content = userPrompt;
      walletContext = { walletType, activeLayer: 'wallet' };
    }

    console.log('🤖 Processing wallet chat request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext,
      sessionId,
      walletType
    });

    // Load design examples from Supabase
    const designExamples = await loadDesignExamples();
    
    // Choose appropriate style if we have examples and content
    let chosenStyle = null;
    if (designExamples.length > 0 && content) {
      chosenStyle = chooseStyle(content, designExamples);
      console.log('🎨 Chosen style:', chosenStyle?.id || 'none');
    }

    // Build system prompt with design library integration
    const systemPrompt = buildAdvancedWalletSystemPrompt(walletContext, designExamples, chosenStyle);
    
    // Build user message with context
    const userMessage = buildUserMessage(content, walletElement, imageUrl);

    // Create messages array with proper structure for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Handle image if provided - fix the structure for GPT-4 Vision API
    if (imageUrl) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { 
            type: 'image_url', 
            image_url: { 
              url: imageUrl,
              detail: 'low'
            }
          }
        ]
      };
    }

    console.log('📤 Sending request to OpenAI with model: gpt-4o');

    // Create clean headers object
    const requestHeaders = {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    };

    console.log('🔑 API Key validation:', {
      hasKey: !!openAIApiKey,
      keyLength: openAIApiKey.length,
      keyPrefix: openAIApiKey.substring(0, 7) + '...',
      isValidFormat: openAIApiKey.startsWith('sk-')
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    // Extract style changes from the structured response
    const styleChanges = extractAdvancedStyleChanges(aiResponse, walletContext);

    console.log('✅ GPT response generated successfully with style changes:', styleChanges);

    // Return response in appropriate format
    if (sessionId) {
      // Return FormData response format
      let parsedResponse;
      try {
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        // Fallback response
        parsedResponse = {
          thinking: {
            user_request_analysis: "Проанализировал запрос пользователя",
            chosen_style: chosenStyle?.id || 'default',
            reasoning: "Выбрал подходящий стиль на основе запроса",
            color_logic: "Применил цветовую гармонию из выбранного стиля"
          },
          changes: styleChanges?.changes || {
            background: { login_screen: "#1a1a2e", dashboard: "#16213e" },
            buttons: { primary_color: "#6366f1", text_color: "#ffffff", hover_color: "#8b5cf6" },
            inputs: { background_color: "#2a2a3e", border_color: "#8b5cf6", text_color: "#ffffff" },
            text: { primary_color: "#ffffff", secondary_color: "#a0a0a0" }
          },
          recommendations: {
            next_steps: "Можно добавить анимации переходов",
            style_notes: "Стиль выбран на основе анализа запроса"
          }
        };
      }

      return new Response(JSON.stringify({
        success: true,
        result: parsedResponse,
        sessionId: sessionId,
        processingTime: Date.now(),
        chosenStyleId: chosenStyle?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Return JSON response format (existing)
      return new Response(JSON.stringify({ 
        response: aiResponse,
        styleChanges,
        success: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in wallet-chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
