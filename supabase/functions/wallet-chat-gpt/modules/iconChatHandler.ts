import { IconManager } from './iconManager.ts';

export interface IconChatContext {
  action: 'list' | 'replace' | 'batch_replace' | 'info' | 'help';
  category?: string;
  element_id?: string;
  icon_group?: string;
  element_name?: string;
}

export class IconChatHandler {
  private iconManager: IconManager;

  constructor(iconManager: IconManager) {
    this.iconManager = iconManager;
  }

  // Проверка флагов
  private checkIconLibEnabled(): boolean {
    return Deno.env.get('ICON_LIB_ENABLED') === 'true';
  }

  // Анализ сообщения пользователя на предмет работы с иконками
  analyzeIconRequest(message: string): IconChatContext | null {
    // Ранняя проверка флага
    if (!this.checkIconLibEnabled()) {
      console.log('🚫 Icon analysis blocked - feature disabled');
      return null;
    }

    const lowerMessage = message.toLowerCase();
    
    // Паттерны для определения действий с иконками
    const patterns = {
      list: [
        'покажи иконки', 'список иконок', 'какие иконки', 'show icons', 'list icons',
        'иконки навигации', 'иконки sidebar', 'иконки поиска'
      ],
      replace: [
        'поменяй иконку', 'замени иконку', 'change icon', 'replace icon',
        'обнови иконку', 'загрузи иконку'
      ],
      batch_replace: [
        'поменяй все иконки', 'замени группу иконок', 'change all icons',
        'replace group', 'групповая замена'
      ],
      info: [
        'информация об иконке', 'детали иконки', 'icon info', 'icon details'
      ],
      help: [
        'помощь с иконками', 'как работать с иконками', 'icon help', 'help icons'
      ]
    };

    // Определяем действие
    let action: IconChatContext['action'] | null = null;
    for (const [key, patternList] of Object.entries(patterns)) {
      if (patternList.some(pattern => lowerMessage.includes(pattern))) {
        action = key as IconChatContext['action'];
        break;
      }
    }

    if (!action) return null;

    // Определяем категорию или элемент
    const categories = {
      'navigation': ['навигация', 'navigation', 'nav', 'home', 'apps', 'swap', 'history'],
      'sidebar': ['sidebar', 'сайдбар', 'боковая панель', 'close', 'add', 'edit', 'settings'],
      'search': ['поиск', 'search', 'magnify', 'recent', 'trending'],
      'actions': ['действия', 'actions', 'send', 'receive', 'buy'],
      'receive': ['receive', 'получить', 'qr', 'copy', 'sol', 'usdc', 'usdt'],
      'system': ['system', 'система', 'header', 'swap-settings'],
      'dropdown': ['dropdown', 'выпадающий']
    };

    let category: string | undefined;
    let element_name: string | undefined;

    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        category = cat;
        // Попробуем найти конкретное имя элемента
        if (lowerMessage.includes('home')) element_name = 'home';
        else if (lowerMessage.includes('send')) element_name = 'send';
        else if (lowerMessage.includes('qr')) element_name = 'qr';
        break;
      }
    }

    // Определяем группу для групповой замены
    const iconGroups = ['search', 'swap', 'qr', 'copy'];
    let icon_group: string | undefined;
    for (const group of iconGroups) {
      if (lowerMessage.includes(group)) {
        icon_group = group;
        break;
      }
    }

    return {
      action,
      category,
      element_name,
      icon_group
    };
  }

  // Обработка запроса на список иконок
  async handleListIcons(context: IconChatContext): Promise<string> {
    if (!this.checkIconLibEnabled()) {
      return "❌ Функция управления иконками отключена в текущей конфигурации системы.";
    }

    try {
      const iconsByCategory = await this.iconManager.getIconsByCategory();
      const variants = await this.iconManager.getIconVariants();
      
      let response = "📱 **ДОСТУПНЫЕ ИКОНКИ ДЛЯ КАСТОМИЗАЦИИ**\n\n";
      
      if (context.category) {
        // Показать иконки конкретной категории
        const categoryIcons = iconsByCategory[context.category] || [];
        if (categoryIcons.length > 0) {
          response += `🎯 **${context.category.toUpperCase()}** (${categoryIcons.length} иконок):\n`;
          categoryIcons.forEach(icon => {
            response += `  • **${icon.name}** - \`${icon.storage_file_name}\`\n`;
          });
        } else {
          response += `❌ Категория "${context.category}" не найдена или пуста\n`;
        }
      } else {
        // Показать все категории
        Object.entries(iconsByCategory).forEach(([category, icons]) => {
          if (icons.length > 0) {
            response += `📁 **${category.toUpperCase()}** (${icons.length} иконок)\n`;
            icons.forEach(icon => {
              response += `  • **${icon.name}** - \`${icon.storage_file_name}\`\n`;
            });
            response += "\n";
          }
        });
      }
      
      // Добавить информацию о группах дублирующихся иконок
      if (variants.length > 0) {
        response += "\n🔗 **ГРУППЫ ДУБЛИРУЮЩИХСЯ ИКОНОК**:\n";
        variants.forEach(variant => {
          response += `  • **${variant.group_name}**: ${variant.element_ids.length} элементов\n`;
        });
      }
      
      response += "\n💡 **Команды для работы с иконками:**\n";
      response += "• `поменяй иконку home` - заменить конкретную иконку\n";
      response += "• `покажи иконки navigation` - показать иконки категории\n";
      response += "• `замени группу search` - заменить группу дублирующихся иконок\n";
      
      return response;
    } catch (error) {
      console.error('❌ Error in handleListIcons:', error);
      return "❌ Ошибка при получении списка иконок. Попробуйте позже.";
    }
  }

  // Обработка запроса на помощь
  handleIconHelp(): string {
    if (!this.checkIconLibEnabled()) {
      return "❌ Функция управления иконками отключена в текущей конфигурации системы.";
    }

    const storageStructure = this.iconManager.getStorageStructure();
    
    let response = "🎨 **ПОМОЩЬ ПО РАБОТЕ С ИКОНКАМИ**\n\n";
    
    response += "📋 **Доступные команды:**\n";
    response += "• `покажи иконки` - список всех иконок\n";
    response += "• `покажи иконки navigation` - иконки категории\n";
    response += "• `поменяй иконку home` - заменить иконку\n";
    response += "• `замени группу qr` - заменить группу иконок\n";
    response += "• `помощь с иконками` - эта справка\n\n";
    
    response += "📁 **Структура Storage (wallet-icons):**\n";
    Object.entries(storageStructure).forEach(([folder, files]) => {
      response += `\n📂 **${folder}/**\n`;
      files.forEach(file => {
        response += `  └── ${file}\n`;
      });
    });
    
    response += "\n🔗 **Группы дублирующихся иконок:**\n";
    response += "• **search** - поиск (magnify.svg)\n";
    response += "• **swap** - обмен (swap.svg)\n";
    response += "• **qr** - QR коды (qr-main.svg)\n";
    response += "• **copy** - копирование (copy.svg)\n\n";
    
    response += "💡 **Принцип работы:**\n";
    response += "1. Дублирующиеся иконки используют один файл\n";
    response += "2. При замене группы - обновляются все связанные элементы\n";
    response += "3. Пользовательские иконки сохраняются в `custom-icons/`\n";
    
    return response;
  }

  // Генерация ответа для чата
  async generateIconResponse(context: IconChatContext, userId?: string): Promise<string> {
    if (!this.checkIconLibEnabled()) {
      return "❌ Функция управления иконками отключена в текущей конфигурации системы. Обратитесь к администратору для получения доступа.";
    }

    switch (context.action) {
      case 'list':
        return await this.handleListIcons(context);
      
      case 'help':
        return this.handleIconHelp();
      
      case 'replace':
        return "📤 Для замены иконки загрузите файл SVG и укажите какую иконку заменить. Например: 'поменяй иконку home на эту'";
      
      case 'batch_replace':
        return "📤 Для групповой замены иконок загрузите файл SVG и укажите группу. Например: 'замени группу search на эту иконку'";
      
      case 'info':
        if (context.element_name) {
          return `ℹ️ Получаю информацию об иконке "${context.element_name}"...`;
        }
        return "ℹ️ Укажите название иконки для получения информации";
      
      default:
        return "❓ Не понял запрос по иконкам. Напишите 'помощь с иконками' для справки";
    }
  }

  // Обработка загрузки файла иконки
  async handleIconFileUpload(message: string, fileData: string, fileName: string, userId: string): Promise<any> {
    if (!this.checkIconLibEnabled()) {
      return {
        success: false,
        error: 'Icon library functionality is currently disabled',
        code: 'FEATURE_DISABLED'
      };
    }

    try {
      console.log('📁 Processing icon file upload:', { fileName, userId, messageLength: message.length });
      
      // Здесь можно добавить логику обработки загруженного файла иконки
      // Например, вызвать методы iconManager для замены иконок
      
      return {
        success: true,
        data: {
          message: `Файл ${fileName} успешно загружен и обработан`,
          file_name: fileName,
          user_id: userId
        }
      };
    } catch (error) {
      console.error('❌ Error in handleIconFileUpload:', error);
      return {
        success: false,
        error: error.message || 'Failed to process icon file upload'
      };
    }
  }
}
