
// AI агент для обработки команд пользователя
import { tools, setAllLayersPrimaryButtons, setAllLayersTextColor, setAllLayersBackground, setAllFonts } from './tools';
import { LAYER_ALIASES, UILayer } from './routes';
import { useThemeStore } from '@/state/themeStore';

function resolveLayer(text: string): UILayer {
  const lower = text.toLowerCase();
  for (const [key, layer] of Object.entries(LAYER_ALIASES)) {
    if (lower.includes(key)) return layer;
  }
  // если не найдено — wallet как дефолт
  return 'wallet';
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           /\.(png|jpg|jpeg|webp|gif)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

// Проверка на массовые команды (все слои)
function isGlobalCommand(text: string): boolean {
  const lower = text.toLowerCase();
  // EN маркеры
  const enMarkers = ['all', 'every', 'entire', 'whole wallet', 'global', 'everything'];
  // RU маркеры  
  const ruMarkers = ['все', 'весь', 'весь кошелёк', 'глобально', 'всё'];
  
  return [...enMarkers, ...ruMarkers].some(marker => lower.includes(marker));
}

// Simple localization function
function getLocalizedMessage(key: string, lang: 'en' | 'ru' = 'en', params?: Record<string, string>): string {
  const messages = {
    en: {
      backgroundUpdated: `Updated ${params?.layer} layer background${params?.type === 'image' ? ' (image)' : ` to ${params?.color}`}`,
      backgroundNotFound: `Couldn't find suitable background in ${params?.layer} layer. Be more specific (e.g., "home background", "lock background").`,
      buttonUpdated: `Made ${params?.layer} layer button → ${params?.color}`,
      buttonNotFound: `Couldn't find suitable button in ${params?.layer} layer. Be more specific (e.g., "swap button", "send button").`,
      textUpdated: `Text on ${params?.layer} layer is now ${params?.color}`,
      textNotFound: `Couldn't find suitable text in ${params?.layer} layer. Be more specific (e.g., "home text", "header text").`,
      fontUpdated: `Interface font: ${params?.font}`,
      // Массовые операции
      allButtonsUpdated: `All wallet buttons are now ${params?.color}`,
      allTextUpdated: `All wallet text is now ${params?.color}`,
      allBackgroundsUpdated: `All wallet backgrounds are now ${params?.color}`,
      allFontsUpdated: `All wallet fonts changed to ${params?.font}`,
      darkThemeApplied: `Dark theme applied: backgrounds ${params?.bg}, text ${params?.text}`,
      helpMessage: `What would you like to change? Command examples:
• "swap button #FF5C00" - button color
• "home background #0A0C10" - background color
• "lock background https://site.com/bg.jpg" - background image
• "home text #FFFFFF" - text color
• "font: Sora" - font family
• "Make ALL buttons #FF5C00" - all buttons
• "Change ALL text to white" - all text
• Available layers: home, lock, swap, send, receive, buy, search, dropdown`
    },
    ru: {
      backgroundUpdated: `Обновил фон слоя ${params?.layer}${params?.type === 'image' ? ' (картинка)' : ` на ${params?.color}`}`,
      backgroundNotFound: `Не нашёл подходящее место для фона в слое ${params?.layer}. Скажи точнее (например: "фон home", "фон lock").`,
      buttonUpdated: `Сделал кнопку слоя ${params?.layer} → ${params?.color}`,
      buttonNotFound: `Не нашёл подходящую кнопку в слое ${params?.layer}. Скажи точнее (например: "кнопка swap", "кнопка send").`,
      textUpdated: `Текст на слое ${params?.layer} теперь ${params?.color}`,
      textNotFound: `Не нашёл подходящий текст в слое ${params?.layer}. Скажи точнее (например: "текст home", "текст заголовка").`,
      fontUpdated: `Шрифт интерфейса: ${params?.font}`,
      // Массовые операции
      allButtonsUpdated: `Все кнопки кошелька теперь ${params?.color}`,
      allTextUpdated: `Весь текст кошелька теперь ${params?.color}`,
      allBackgroundsUpdated: `Все фоны кошелька теперь ${params?.color}`,
      allFontsUpdated: `Все шрифты изменены на ${params?.font}`,
      darkThemeApplied: `Тёмная тема применена: фоны ${params?.bg}, текст ${params?.text}`,
      helpMessage: `Что изменить? Примеры команд:
• "кнопка swap #FF5C00" - цвет кнопки
• "фон home #0A0C10" - цвет фона
• "фон lock https://site.com/bg.jpg" - картинка фона  
• "текст home #FFFFFF" - цвет текста
• "шрифт: Sora" - семейство шрифта
• "ВСЕ кнопки #FF5C00" - все кнопки
• "ВЕСЬ текст белый" - весь текст
• Доступные слои: home, lock, swap, send, receive, buy, search, dropdown`
    }
  };

  return messages[lang][key] || messages.en[key] || key;
}

export async function handleUserMessage(input: string, lang: 'en' | 'ru' = 'en'): Promise<{message: string, patch: any[]}> {
  const theme = useThemeStore.getState().theme;
  const text = input.trim();
  const lower = text.toLowerCase();

  const hex = lower.match(/#([0-9a-f]{6})\b/i)?.[0] || null;
  const urlMatch = lower.match(/https?:\/\/\S+\.(png|jpg|jpeg|webp|gif)/i)?.[0];
  const url = urlMatch && isValidImageUrl(urlMatch) ? urlMatch : null;

  const isGlobal = isGlobalCommand(lower);
  const layer = resolveLayer(lower);

  // Массовые команды - приоритет
  if (isGlobal) {
    // Комбинированная команда (dark theme)
    if ((/dark theme|тёмная тема/.test(lower)) && hex) {
      const bgHex = hex;
      const textHex = lower.match(/#([0-9a-f]{6})\b/ig)?.[1] ? `#${lower.match(/#([0-9a-f]{6})\b/ig)?.[1]}` : '#FFFFFF';
      
      const bgPatch = setAllLayersBackground(bgHex, theme);
      const textPatch = setAllLayersTextColor(textHex, theme);
      const patch = [...bgPatch, ...textPatch];
      
      if (!patch.length) {
        return { message: 'Could not apply dark theme - no suitable elements found', patch: [] };
      }
      
      return { 
        message: getLocalizedMessage('darkThemeApplied', lang, { bg: bgHex, text: textHex }), 
        patch 
      };
    }

    // Все кнопки
    if ((/button|кнопк/.test(lower)) && hex) {
      const patch = setAllLayersPrimaryButtons(hex, theme);
      
      if (!patch.length) {
        return { message: 'No buttons found to update', patch: [] };
      }
      
      return { 
        message: getLocalizedMessage('allButtonsUpdated', lang, { color: hex }), 
        patch 
      };
    }

    // Весь текст
    if ((/text|текст/.test(lower)) && hex) {
      const patch = setAllLayersTextColor(hex, theme);
      
      if (!patch.length) {
        return { message: 'No text elements found to update', patch: [] };
      }
      
      return { 
        message: getLocalizedMessage('allTextUpdated', lang, { color: hex }), 
        patch 
      };
    }

    // Все фоны
    if ((/background|фон/.test(lower)) && hex) {
      const patch = setAllLayersBackground(hex, theme);
      
      if (!patch.length) {
        return { message: 'No background elements found to update', patch: [] };
      }
      
      return { 
        message: getLocalizedMessage('allBackgroundsUpdated', lang, { color: hex }), 
        patch 
      };
    }
  }

  // Одиночные команды (существующая логика)
  if ((/фон|background/.test(lower)) && (hex || url)) {
    const patch = url
      ? tools.setBackgroundImage(layer, url, theme)
      : tools.setBackgroundColor(layer, hex!, theme);
    
    if (!patch.length) {
      return { 
        message: getLocalizedMessage('backgroundNotFound', lang, { layer }), 
        patch: [] 
      };
    }
    
    return { 
      message: getLocalizedMessage('backgroundUpdated', lang, { 
        layer, 
        type: url ? 'image' : 'color',
        color: hex || undefined
      }), 
      patch 
    };
  }

  if ((/button|кнопк/.test(lower)) && hex) {
    const patch = tools.setPrimaryButtonBg(layer, hex, theme);
    
    if (!patch.length) {
      return { 
        message: getLocalizedMessage('buttonNotFound', lang, { layer }), 
        patch: [] 
      };
    }
    
    return { 
      message: getLocalizedMessage('buttonUpdated', lang, { layer, color: hex }), 
      patch 
    };
  }

  if ((/текст|text/.test(lower)) && hex) {
    const patch = tools.setTextColor(layer, hex, theme);
    
    if (!patch.length) {
      return { 
        message: getLocalizedMessage('textNotFound', lang, { layer }), 
        patch: [] 
      };
    }
    
    return { 
      message: getLocalizedMessage('textUpdated', lang, { layer, color: hex }), 
      patch 
    };
  }

  const font = lower.match(/\b(font|шрифт)\s*:?\s*([a-z0-9 \-]+)\b/i)?.[2] || null;
  if (font) {
    const patch = isGlobal ? setAllFonts(font, theme) : tools.setFontFamily(font);
    return { 
      message: isGlobal 
        ? getLocalizedMessage('allFontsUpdated', lang, { font })
        : getLocalizedMessage('fontUpdated', lang, { font }), 
      patch 
    };
  }

  // ничего не распознали — справочник команд
  return { 
    message: getLocalizedMessage('helpMessage', lang), 
    patch: [] 
  };
}
