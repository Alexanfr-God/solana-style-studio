
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawingImage, safeZone } = await req.json();
    
    console.log(`Received request to generate mask from drawing`);
    
    if (!drawingImage) {
      throw new Error("No drawing image provided");
    }
    
    // 1. First use GPT-4o to analyze the drawing and create a description
    const drawingDescription = await analyzeDrawingWithGPT(drawingImage);
    console.log("Drawing description:", drawingDescription);
    
    // 2. Generate the mask image based on the description using DALL-E with strict transparency rules
    const generatedImageUrl = await generateMaskWithDALLE(drawingDescription);
    console.log("Generated mask URL:", generatedImageUrl);
    
    // 3. Return the generated image and metadata
    const responseData = {
      mask_image_url: generatedImageUrl,
      layout_json: {
        layout: {
          top: drawingDescription.includes("top") ? "Decorative elements on top" : null,
          bottom: drawingDescription.includes("bottom") ? "Decorative elements on bottom" : null,
          left: drawingDescription.includes("left") ? "Decorative elements on left" : null,
          right: drawingDescription.includes("right") ? "Decorative elements on right" : null,
          core: "untouched"
        },
        style: drawingDescription.includes("abstract") ? "abstract" : "character-based",
        color_palette: ["#f4d03f", "#222222", "#ffffff"],
      }
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/**
 * Analyzes the user's drawing with GPT-4o Vision to create a descriptive prompt
 */
async function analyzeDrawingWithGPT(drawingImageBase64: string): Promise<string> {
  try {
    // Extract the base64 content from data URL if needed
    const base64Content = drawingImageBase64.split(',')[1] || drawingImageBase64;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `🎯 КОНТЕКСТ АНАЛИЗА РИСУНКА ДЛЯ МАСКИ КОШЕЛЬКА:

ВЫ АНАЛИЗИРУЕТЕ: Пользовательский рисунок на холсте с интерфейсом кошелька в центре.

📐 ЧТО ВИДИТЕ:
- Квадратный холст 1024x1024 пикселя
- В ЦЕНТРЕ: Интерфейс демо-кошелька (320x569 пикселей) - ЭТО НЕ ЧАСТЬ МАСКИ!
- ВОКРУГ КОШЕЛЬКА: Красные линии/рисунки пользователя - ИЗ ЭТОГО ДЕЛАЕМ МАСКУ!

🎨 ВАША ЗАДАЧА:
Опишите ТОЛЬКО красные элементы вокруг кошелька как основу для декоративной маски.
Игнорируйте интерфейс кошелька в центре - он останется видимым.

📋 ПРАВИЛА ОПИСАНИЯ:
- Описывайте положение элементов: "сверху", "снизу", "слева", "справа"
- Указывайте стиль: мультяшный, мемный, абстрактный
- Описывайте формы: уши, лапы, рога, узоры, рамки
- НЕ УПОМИНАЙТЕ кошелек или интерфейс - только декоративные элементы

🎯 ПРИМЕР ХОРОШЕГО ОПИСАНИЯ:
"Сверху два треугольных уха в мультяшном стиле, снизу две округлые лапы, по бокам волнистые узоры. Стиль: игривый мемный котик."

АНАЛИЗИРУЙТЕ РИСУНОК И СОЗДАЙТЕ ОПИСАНИЕ ДЛЯ DALL-E:`
          },
          {
            role: "user", 
            content: [
              {
                type: "text", 
                text: "Проанализируй этот рисунок. В центре видишь интерфейс кошелька (НЕ трогай его!), а вокруг красные линии - это моя маска. Опиши ТОЛЬКО красные элементы для создания декоративной маски."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Content}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("Unexpected response from OpenAI:", data);
      throw new Error("Failed to analyze drawing");
    }
    
    // Extract the description from GPT's response
    const description = data.choices[0].message.content;
    return description;
  } catch (error) {
    console.error("Error analyzing drawing with GPT:", error);
    throw new Error("Failed to analyze drawing: " + error.message);
  }
}

/**
 * Generates a polished mask image using DALL-E with strict transparency requirements
 */
async function generateMaskWithDALLE(description: string): Promise<string> {
  try {
    // Create a very specific prompt that enforces transparency rules
    const prompt = `🎯 СОЗДАНИЕ МАСКИ КОШЕЛЬКА - СТРОГИЕ ТРЕБОВАНИЯ:

📝 ОПИСАНИЕ ОТ ПОЛЬЗОВАТЕЛЯ: "${description}"

📐 ОБЯЗАТЕЛЬНЫЕ ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ:
- Размер: 1024x1024 пикселя, PNG с прозрачностью
- ЦЕНТРАЛЬНАЯ ПРОЗРАЧНАЯ ЗОНА: 320x569 пикселей (ТОЧНО ПО ЦЕНТРУ)
- Координаты прозрачной зоны: X=352, Y=227.5 (от левого верхнего угла)
- В ЦЕНТРЕ НЕ ДОЛЖНО БЫТЬ НИЧЕГО - полная прозрачность

🎨 ПРАВИЛА ДИЗАЙНА:
- Создайте декоративную маску на основе описания
- Все элементы размещайте ТОЛЬКО вокруг центральной прозрачной зоны
- Сверху: элементы над прозрачной зоной
- Снизу: элементы под прозрачной зоной  
- По бокам: элементы слева и справа от прозрачной зоны
- Стиль: яркий, мемный, мультяшный, впечатляющий

⚠️ КРИТИЧЕСКИ ВАЖНО:
Центральный прямоугольник 320x569px ДОЛЖЕН быть полностью прозрачным (alpha=0).
Это "окно" для интерфейса кошелька, которое должно оставаться видимым.

🎭 ДУМАЙТЕ О МАСКЕ КАК О:
- Декоративной рамке вокруг кошелька
- Костюме для кошелька
- Обложке с вырезом в центре

Создайте PNG с альфа-каналом и строгой прозрачностью в центре!`;
    
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        response_format: "url"
      })
    });

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.error("Unexpected response from DALL-E:", data);
      throw new Error("Failed to generate image");
    }
    
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw new Error("Failed to generate image: " + error.message);
  }
}
