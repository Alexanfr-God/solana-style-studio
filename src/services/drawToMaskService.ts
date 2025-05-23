
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Analyzes a user drawing and generates a polished mask for wallet customization
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🎨 === НАЧАЛО ГЕНЕРАЦИИ МАСКИ ===');
    console.log('Размер рисунка:', drawingImageBase64.length);
    console.log('Превью рисунка:', drawingImageBase64.substring(0, 100));
    
    // Create safe zone definition - for 1024x1024 square canvas with centered wallet
    const safeZone = {
      x: (1024 - 320) / 2,
      y: (1024 - 569) / 2,
      width: 320,
      height: 569
    };
    
    console.log('Безопасная зона кошелька:', safeZone);
    
    // Call the Supabase function with retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Попытка генерации ${attempts}/${maxAttempts}`);
      
      try {
        const requestPayload = {
          drawingImage: drawingImageBase64,
          safeZone,
          hd_quality: true
        };
        
        console.log('Отправка запроса в Supabase функцию...');
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
          body: requestPayload
        });

        const endTime = Date.now();
        console.log(`⏱️ Запрос выполнен за ${endTime - startTime}мс`);

        if (error) {
          console.error(`❌ Ошибка на попытке ${attempts}:`, error);
          console.error('Детали ошибки:', JSON.stringify(error, null, 2));
          if (attempts < maxAttempts) {
            console.log('🔄 Повторная попытка...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание 1 секунда перед повтором
            continue;
          }
          throw new Error(`Не удалось сгенерировать маску: ${error.message}`);
        }

        console.log('📦 Сырые данные ответа:', JSON.stringify(data, null, 2));

        if (!data || !data.mask_image_url) {
          console.error(`❌ Некорректные данные ответа на попытке ${attempts}:`, data);
          if (attempts < maxAttempts) {
            console.log('🔄 Повторная попытка...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание 1 секунда перед повтором
            continue;
          }
          return createFallbackResponse();
        }

        // Enhanced URL validation
        const imageUrl = data.mask_image_url;
        console.log('🖼️ Сгенерированный URL изображения:', imageUrl);
        console.log('Тип URL:', typeof imageUrl);
        console.log('Длина URL:', imageUrl.length);
        console.log('URL начинается с:', imageUrl.substring(0, 50));
        
        // Test URL accessibility
        console.log('🔍 Проверка доступности URL...');
        try {
          const testResponse = await fetch(imageUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // Избегаем CORS ошибок при проверке
          });
          console.log('Статус проверки URL:', testResponse.status);
          
          if (testResponse.status === 0) {
            console.log('✅ URL заблокирован CORS, но доступен (это нормально для внешних изображений)');
          } else if (!testResponse.ok) {
            console.warn(`⚠️ URL вернул статус ${testResponse.status}, но продолжаем`);
          } else {
            console.log('✅ URL доступен');
          }
        } catch (urlError) {
          console.error('❌ Тест доступности URL не удался:', urlError);
          console.log('🤷 Продолжаем в любом случае, возможно проблема с CORS');
        }

        const result = {
          imageUrl: imageUrl,
          layoutJson: data.layout_json || {}
        };

        console.log('✅ === УСПЕШНАЯ ГЕНЕРАЦИЯ МАСКИ ===');
        console.log('Финальный результат:', result);
        console.log('URL изображения для установки:', result.imageUrl);
        
        // Показать успешное уведомление
        toast.success('Маска успешно сгенерирована AI!', {
          description: 'Ваши красные линии превращены в декоративную маску'
        });
        
        return result;
      } catch (attemptError) {
        console.error(`❌ Ошибка во время попытки ${attempts}:`, attemptError);
        console.error('Стек ошибки попытки:', attemptError.stack);
        if (attempts < maxAttempts) {
          console.log('🔄 Повтор после ошибки...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание 1 секунда перед повтором
          continue;
        }
        
        // Если все попытки провалились, используем fallback
        console.log('💀 Все попытки провалились, используем fallback');
        toast.error('Ошибка генерации AI. Используется резервная маска.');
        return createFallbackResponse();
      }
    }
    
    // Это не должно выполняться из-за цикла while, но TypeScript требует return
    return createFallbackResponse();
    
  } catch (error) {
    console.error('💥 === ПРОВАЛ ГЕНЕРАЦИИ МАСКИ ===');
    console.error('Ошибка в drawToMaskService.generateMaskFromDrawing:', error);
    console.error('Стек ошибки:', error.stack);
    toast.error('Не удалось сгенерировать маску. Попробуйте снова.');
    return createFallbackResponse();
  }
}

/**
 * Creates a consistent fallback response when mask generation fails
 */
function createFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackMaskUrl = '/external-masks/abstract-mask.png';
  
  console.log('🚨 Используется резервная маска:', fallbackMaskUrl);
  
  return {
    imageUrl: fallbackMaskUrl,
    layoutJson: {
      layout: {
        top: "Декоративные элементы (резерв)",
        bottom: "Дополнительные декоративные элементы (резерв)",
        left: null,
        right: null,
        core: "untouched"
      },
      style: "abstract",
      color_palette: ["#6c5ce7", "#fd79a8", "#00cec9"]
    }
  };
}
