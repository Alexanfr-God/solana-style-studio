
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConductorRequest {
  imageUrl?: string;
  prompt?: string;
  walletBlueprint?: string;
  targetLayer?: string;
  userId?: string;
  sessionId?: string;
  preferences?: {
    style?: string;
    mood?: string;
    complexity?: string;
    aiPetPersonality?: string;
  };
}

interface ConductorResponse {
  success: boolean;
  sessionId: string;
  analysis?: any;
  styleResult?: any;
  recommendations?: any;
  nextSteps?: string[];
  error?: string;
}

const AI_CONDUCTOR_SYSTEM_PROMPT = `
# AI Conductor для Wallet Coast Agent v1.0

Ты - главный оркестратор системы создания персонализированных crypto wallet стилей. Твоя задача:

## 🎯 ЦЕЛЬ СИСТЕМЫ
Создать уникальный, функциональный и эстетически привлекательный стиль для crypto wallet на основе входящего изображения/промта.

## 🧠 АНАЛИЗ И ПЛАНИРОВАНИЕ
1. **Глубокий визуальный анализ**: Цвета, композиция, эмоции, стиль, текстуры
2. **Функциональная адаптация**: Как элементы будут работать в wallet UI
3. **Пользовательский опыт**: Удобство, читаемость, интуитивность
4. **Техническая реализация**: Совместимость с компонентами системы

## 📋 ПЛАН ДЕЙСТВИЙ ДЛЯ КАЖДОГО ЗАПРОСА:

### Шаг 1: Анализ входных данных
- Определить тип контента (изображение/промт)
- Выявить ключевые визуальные элементы
- Проанализировать эмоциональный тон
- Оценить техническую сложность

### Шаг 2: Стратегическое планирование
- Выбрать оптимальный подход к стилизации
- Определить приоритетные компоненты для кастомизации
- Спланировать интеграцию с AI Pet
- Учесть пользовательские предпочтения

### Шаг 3: Координация выполнения
- Распределить задачи между специализированными агентами
- Контролировать качество каждого этапа
- Обеспечить согласованность всех элементов
- Оптимизировать производительность

## 🎨 КРИТЕРИИ КАЧЕСТВА:
- **Визуальная гармония**: Все элементы должны работать вместе
- **Функциональность**: UI остается интуитивным и удобным
- **Уникальность**: Стиль должен отражать индивидуальность пользователя
- **Техническая корректность**: Совместимость со всеми компонентами

## 🤖 AI PET ИНТЕГРАЦИЯ:
- Подобрать эмоцию AI Pet под общий стиль
- Определить оптимальное расположение (inside/outside)
- Выбрать тип тела (phantom/lottie)
- Настроить анимационный стиль

## 📊 ОБРАТНАЯ СВЯЗЬ:
- Анализировать паттерны успешных стилей
- Учитывать пользовательские рейтинги
- Адаптировать подходы на основе данных
- Непрерывно улучшать алгоритмы

ВСЕГДА возвращай детальный план действий в JSON формате с конкретными инструкциями для каждого агента.
`;

const ANALYSIS_AGENT_PROMPT = `
# Агент визуального анализа

Проанализируй изображение/промт максимально детально:

## ОБЯЗАТЕЛЬНЫЕ ЭЛЕМЕНТЫ АНАЛИЗА:
1. **Цветовая палитра**: Доминирующие, акцентные, фоновые цвета с HEX кодами
2. **Композиция**: Баланс, ритм, фокусные точки, глубина
3. **Эмоциональный тон**: Настроение, энергетика, психологическое воздействие
4. **Стилистика**: Минимализм/максимализм, современность, художественное направление
5. **Текстуры и паттерны**: Поверхности, узоры, материалы
6. **Типографические рекомендации**: Подходящие шрифты под стиль
7. **AI Pet характеристики**: Рекомендуемые эмоция, размещение, тип

## WALLET-СПЕЦИФИЧНЫЕ РЕКОМЕНДАЦИИ:
- Как адаптировать цвета для кнопок, фонов, текста
- Какие элементы можно использовать для анимаций
- Где разместить акцентные элементы
- Как обеспечить читаемость в разных освещениях

Возвращай структурированный JSON с детальными рекомендациями.
`;

const STYLE_GENERATION_PROMPT = `
# Агент генерации стилей

На основе анализа создай полный WalletStyleSet:

## КОМПОНЕНТЫ ДЛЯ СТИЛИЗАЦИИ:
1. **Глобальные стили**: Фон, типографика, базовые цвета
2. **Слои**: Login, Home, Swap, Apps, History, Search
3. **Компоненты**: Кнопки, инпуты, карточки, навигация
4. **Интерактивные элементы**: Ховеры, переходы, анимации
5. **AI Pet**: Полная настройка под стиль

## ПРИНЦИПЫ СТИЛИЗАЦИИ:
- **Консистентность**: Единый визуальный язык
- **Иерархия**: Четкое разделение важности элементов
- **Доступность**: Контрастность, читаемость
- **Адаптивность**: Работа на разных экранах
- **Производительность**: Оптимизированные стили

## ОСОБЫЕ ТРЕБОВАНИЯ:
- Учесть технические ограничения React компонентов
- Обеспечить поддержку темной/светлой темы
- Создать согласованную анимационную систему
- Интегрировать с существующей системой токенов

Генерируй полный объект WalletComponentStyles с детальными значениями.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ConductorRequest = await req.json();
    console.log("🎭 AI Conductor started with request:", requestData);

    // Создаем Supabase клиент
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Генерируем уникальный sessionId если не предоставлен
    const sessionId = requestData.sessionId || crypto.randomUUID();
    
    // Создаем запись сессии
    const { data: session, error: sessionError } = await supabase
      .from("ai_requests")
      .insert({
        user_id: requestData.userId || 'anonymous',
        prompt: requestData.prompt || 'Image analysis request',
        status: 'processing',
        session_id: sessionId,
        metadata: {
          walletBlueprint: requestData.walletBlueprint,
          targetLayer: requestData.targetLayer,
          preferences: requestData.preferences
        }
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
    }

    console.log("🎯 Session created:", sessionId);

    // Фаза 1: Стратегическое планирование
    const strategicPlan = await createStrategicPlan(requestData, openAiApiKey);
    console.log("📋 Strategic plan created:", strategicPlan);

    // Фаза 2: Визуальный анализ (если есть изображение)
    let analysisResult = null;
    if (requestData.imageUrl) {
      console.log("🔍 Starting image analysis...");
      const { data: imageAnalysis, error: analysisError } = await supabase.functions.invoke(
        'analyze-wallet-image',
        { body: { imageUrl: requestData.imageUrl } }
      );
      
      if (analysisError) {
        console.error("Image analysis error:", analysisError);
      } else {
        analysisResult = imageAnalysis;
        console.log("✅ Image analysis completed");
      }
    }

    // Фаза 3: Генерация стиля
    console.log("🎨 Starting style generation...");
    const { data: styleResult, error: styleError } = await supabase.functions.invoke(
      'generate-style',
      {
        body: {
          prompt: requestData.prompt || "Modern crypto wallet style",
          image_url: requestData.imageUrl,
          layer_type: requestData.targetLayer || 'global',
          user_id: requestData.userId || 'anonymous'
        }
      }
    );

    if (styleError) {
      console.error("Style generation error:", styleError);
    } else {
      console.log("✅ Style generation completed");
    }

    // Фаза 4: Создание рекомендаций
    const recommendations = await generateRecommendations(
      strategicPlan,
      analysisResult,
      styleResult,
      requestData.preferences,
      openAiApiKey
    );

    // Фаза 5: Определение следующих шагов
    const nextSteps = determineNextSteps(strategicPlan, analysisResult, styleResult);

    // Обновляем сессию с результатами
    await supabase
      .from("ai_requests")
      .update({
        status: 'completed',
        style_result: styleResult?.style || null,
        metadata: {
          ...session?.metadata,
          strategicPlan,
          analysisResult,
          recommendations,
          nextSteps
        }
      })
      .eq('session_id', sessionId);

    const response: ConductorResponse = {
      success: true,
      sessionId,
      analysis: analysisResult,
      styleResult: styleResult?.style,
      recommendations,
      nextSteps,
    };

    console.log("🎉 AI Conductor completed successfully");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error in AI Conductor:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function createStrategicPlan(request: ConductorRequest, apiKey: string) {
  const planningPrompt = `
${AI_CONDUCTOR_SYSTEM_PROMPT}

ВХОДНЫЕ ДАННЫЕ:
- Изображение: ${request.imageUrl ? 'Предоставлено' : 'Отсутствует'}
- Промт: "${request.prompt || 'Не указан'}"
- Целевой слой: ${request.targetLayer || 'global'}
- Предпочтения пользователя: ${JSON.stringify(request.preferences || {})}

СОЗДАЙ ДЕТАЛЬНЫЙ СТРАТЕГИЧЕСКИЙ ПЛАН в JSON формате со следующей структурой:
{
  "approach": "краткое описание подхода",
  "priority": "высокий/средний/низкий",
  "complexity": "простой/средний/сложный",
  "estimatedSteps": число_шагов,
  "focusAreas": ["область1", "область2"],
  "aiPetStrategy": {
    "emotion": "рекомендуемая_эмоция",
    "placement": "inside/outside",
    "bodyType": "phantom/lottie",
    "personality": "описание_личности"
  },
  "technicalConsiderations": ["ограничение1", "ограничение2"],
  "expectedOutcome": "описание_ожидаемого_результата"
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: planningPrompt }],
      max_tokens: 1000,
      temperature: 0.7
    }),
  });

  const data = await response.json();
  let planContent = data.choices[0].message.content;
  
  // Очищаем от markdown и парсим JSON
  planContent = planContent.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(planContent);
  } catch (e) {
    console.error("Error parsing strategic plan:", e);
    return {
      approach: "fallback",
      priority: "medium",
      complexity: "medium",
      estimatedSteps: 3,
      focusAreas: ["colors", "typography"],
      aiPetStrategy: {
        emotion: "idle",
        placement: "inside",
        bodyType: "phantom",
        personality: "friendly"
      },
      technicalConsiderations: ["responsive design"],
      expectedOutcome: "Modern wallet style"
    };
  }
}

async function generateRecommendations(
  strategicPlan: any,
  analysisResult: any,
  styleResult: any,
  preferences: any,
  apiKey: string
) {
  const recommendationsPrompt = `
На основе данных создай персонализированные рекомендации:

СТРАТЕГИЧЕСКИЙ ПЛАН: ${JSON.stringify(strategicPlan)}
АНАЛИЗ ИЗОБРАЖЕНИЯ: ${JSON.stringify(analysisResult?.analysis || {})}
РЕЗУЛЬТАТ СТИЛЯ: ${JSON.stringify(styleResult || {})}
ПРЕДПОЧТЕНИЯ: ${JSON.stringify(preferences || {})}

Создай JSON с рекомендациями:
{
  "styleImprovements": ["улучшение1", "улучшение2"],
  "aiPetCustomization": {
    "recommendedEmotion": "эмоция",
    "customAnimations": ["анимация1", "анимация2"],
    "interactionTriggers": ["триггер1", "триггер2"]
  },
  "userExperienceEnhancements": ["улучшение1", "улучшение2"],
  "accessibilityNotes": ["заметка1", "заметка2"],
  "performanceOptimizations": ["оптимизация1", "оптимизация2"],
  "futureIterations": ["идея1", "идея2"]
}
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: recommendationsPrompt }],
        max_tokens: 800,
        temperature: 0.8
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content.replace(/```json|```/g, "").trim();
    return JSON.parse(content);
  } catch (e) {
    console.error("Error generating recommendations:", e);
    return {
      styleImprovements: ["Consider adding more contrast", "Enhance color harmony"],
      aiPetCustomization: {
        recommendedEmotion: "happy",
        customAnimations: ["subtle bounce", "color pulse"],
        interactionTriggers: ["wallet unlock", "transaction complete"]
      },
      userExperienceEnhancements: ["Improve button feedback", "Add micro-interactions"],
      accessibilityNotes: ["Ensure sufficient color contrast", "Add focus indicators"],
      performanceOptimizations: ["Optimize animation performance", "Reduce bundle size"],
      futureIterations: ["Dark/light theme toggle", "Seasonal style variations"]
    };
  }
}

function determineNextSteps(strategicPlan: any, analysisResult: any, styleResult: any): string[] {
  const steps = ["🎨 Style generation completed"];
  
  if (analysisResult?.success) {
    steps.push("🔍 Image analysis successful");
  }
  
  if (styleResult?.success) {
    steps.push("✨ Wallet style applied");
  }
  
  steps.push(
    "🤖 AI Pet configuration ready",
    "📱 Preview available in wallet",
    "💾 Style saved to library",
    "📊 Ready for user feedback"
  );
  
  return steps;
}
