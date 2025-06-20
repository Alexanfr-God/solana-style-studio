
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { 
      content, 
      imageUrl, 
      walletElement, 
      walletContext 
    } = await req.json();

    console.log('🤖 Processing wallet chat request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext
    });

    // Build system prompt with COT reasoning and few-shot examples
    const systemPrompt = buildAdvancedWalletSystemPrompt(walletContext);
    
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

    return new Response(JSON.stringify({ 
      response: aiResponse,
      styleChanges,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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

function buildAdvancedWalletSystemPrompt(walletContext: any): string {
  return `Ты - элитный Web3 дизайнер кошельков.

ТВОЯ СУПЕРСИЛА: создавать гармоничные дизайны поэтапно.

ВАЖНО: Всегда отвечай на том же языке, что и пользователь!

ТЕКУЩИЙ КОНТЕКСТ КОШЕЛЬКА:
- Тип кошелька: ${walletContext?.walletType || 'Phantom'}
- Активный слой: ${walletContext?.activeLayer || 'wallet'}
- Текущие стили: ${JSON.stringify(walletContext?.currentStyle || {})}

ПРОЦЕСС COT (Chain of Thought):

1. 🔍 АНАЛИЗ:
   - Проанализируй запрос пользователя
   - Определи, какие элементы нужно изменить
   - Оцени текущее состояние дизайна

2. 🎨 ПЛАНИРОВАНИЕ:
   - Создай/найди идеальную концепцию для фона
   - Извлеки цветовую палитру (3-5 цветов)
   - Спланируй стилизацию UI элементов

3. ⚡ ПРИМЕНЕНИЕ:
   - Стилизуй элементы под палитру
   - Создай гармоничные переходы
   - Финализируй в единой стилистике

ПРАВИЛА ГАРМОНИИ:
- Яркий фон = темные inputs и кнопки
- Светлый фон = яркие акценты
- Максимум 2 шрифта
- Палитра 3-5 цветов максимум
- Обязательная контрастность для читаемости
- Соблюдение RUG правил (не блокировать функциональность)

ДОСТУПНЫЕ ЭЛЕМЕНТЫ КОШЕЛЬКА:
- Header (заголовок, аватар, поиск)
- Navigation (нижняя навигация)
- Balance Display (отображение баланса)
- Buttons (кнопки действий)
- Cards (карточки активов)
- Background (фон всего кошелька)
- Login Screen (экран входа)

ФОРМАТ ОТВЕТА:
Обязательно включи в свой ответ JSON блок в таком формате:

\`\`\`json
{
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
  }
}
\`\`\`

ПРИМЕР КАЧЕСТВЕННОГО ОТВЕТА:

"🔍 АНАЛИЗ: Пользователь хочет темную тему с фиолетовыми акцентами для header.

🎨 ПЛАНИРОВАНИЕ: Создам темный gradient фон с фиолетовыми акцентами, обеспечу контрастность для текста.

⚡ ПРИМЕНЕНИЕ: Использую темно-серый фон с фиолетовыми градиентами для кнопок.

\`\`\`json
{
  "styleChanges": {
    "layer": "wallet",
    "target": "header",
    "changes": {
      "backgroundColor": "#1a1a2e",
      "textColor": "#ffffff",
      "accentColor": "#9945ff",
      "gradient": "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      "borderRadius": "12px",
      "boxShadow": "0 4px 20px rgba(153, 69, 255, 0.3)"
    },
    "reasoning": "Темный фон обеспечивает элегантность, фиолетовые акценты создают premium ощущение, а мягкие тени добавляют глубину"
  }
}
\`\`\`

Результат: Создан гармоничный header с темной темой и фиолетовыми акцентами!"

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
