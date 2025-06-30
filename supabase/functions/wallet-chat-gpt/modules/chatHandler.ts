import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWalletManager } from './walletManager.ts';
import { createStyleAnalyzer } from './styleAnalyzer.ts';
import { AdvancedJSONParser } from '../utils/json-parser.ts';
import { createAdvancedPromptBuilder } from '../utils/prompt-builder.ts';

export class ChatHandler {
  supabase;
  walletManager;
  styleAnalyzer;
  promptBuilder;
  intentCache = new Map();
  conversationCache = new Map();

  constructor(supabaseUrl, supabaseKey) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.walletManager = createWalletManager(supabaseUrl, supabaseKey);
    this.styleAnalyzer = createStyleAnalyzer(supabaseUrl, supabaseKey);
    this.promptBuilder = createAdvancedPromptBuilder();
  }

  /**
   * Обновление памяти контекста
   */
  updateContextMemory(context, message) {
    // Инициализируем contextMemory если его нет
    if (!context.contextMemory) {
      context.contextMemory = {
        conversationFlow: [],
        mentionedElements: new Set(),
        recentIntents: [],
        appliedStyles: new Map()
      };
    }

    // Обновляем поток разговора
    context.contextMemory.conversationFlow.push(message.slice(0, 30));
    if (context.contextMemory.conversationFlow.length > 10) {
      context.contextMemory.conversationFlow = context.contextMemory.conversationFlow.slice(-10);
    }

    // Извлекаем упоминания элементов
    const elements = this.extractElementsFromMessage(message.toLowerCase());
    elements.forEach(el => context.contextMemory.mentionedElements.add(el));

    // Ограничиваем размер множества
    if (context.contextMemory.mentionedElements.size > 20) {
      const elementsArray = Array.from(context.contextMemory.mentionedElements);
      context.contextMemory.mentionedElements = new Set(elementsArray.slice(-20));
    }

    // Очищаем старые намерения (старше 1 часа)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    context.contextMemory.recentIntents = context.contextMemory.recentIntents.filter(
      intent => new Date(intent.timestamp).getTime() > oneHourAgo
    );
  }

  /**
   * ✅ ОСНОВНОЙ ОБРАБОТЧИК БЕЗ АВТОПЕРЕНАПРАВЛЕНИЯ НА ГЕНЕРАЦИЮ
   */
  async handleChat(message, context, imageUrl) {
    const startTime = Date.now();
    console.log('💬 Processing enhanced chat message...');
    console.log('🚫 [CHAT] Image generation allowed:', context.settings?.allowImageGeneration || false);

    try {
      // Инициализируем дефолтные настройки если их нет
      if (!context.settings) {
        context.settings = {
          allowImageGeneration: false, // ✅ ПО УМОЛЧАНИЮ ЗАПРЕЩЕНО!
          maxHistoryLength: 50,
          enableProactiveHelp: true,
          responseStyle: 'casual'
        };
      }

      // Обновляем контекст памяти
      this.updateContextMemory(context, message);

      // ✅ ВАЖНО: Определяем намерение БЕЗ автоперенаправления на генерацию
      const intent = await this.detectUserIntentSafe(message, context, imageUrl);

      // Добавляем сообщение в историю
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      context.conversationHistory.push({
        id: messageId,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: intent.type,
          confidence: intent.confidence,
          imageUrl
        }
      });

      // Обрезаем историю до максимальной длины
      if (context.conversationHistory.length > context.settings.maxHistoryLength) {
        context.conversationHistory = context.conversationHistory.slice(-context.settings.maxHistoryLength);
      }

      // ✅ БЕЗОПАСНАЯ МАРШРУТИЗАЦИЯ - БЕЗ ГЕНЕРАЦИИ ИЗОБРАЖЕНИЙ
      let response;
      switch (intent.type) {
        case 'style_analysis':
          response = await this.handleStyleAnalysisEnhanced(message, imageUrl, context, intent);
          break;
          
        case 'element_customization':
          response = await this.handleElementCustomizationEnhanced(message, context, intent);
          break;
          
        case 'image_generation':
          // ✅ БЛОКИРУЕМ ГЕНЕРАЦИЮ В ЧАТЕ!
          console.log('🚫 [CHAT] Image generation blocked - redirecting to proper mode');
          response = await this.handleImageGenerationBlocked(message, context, intent);
          break;
          
        case 'tutorial':
          response = await this.handleTutorialMode(message, context, intent);
          break;
          
        case 'troubleshooting':
          response = await this.handleTroubleshooting(message, context, intent);
          break;
          
        case 'comparison':
          response = await this.handleWalletComparison(message, context, intent);
          break;
          
        case 'export_settings':
          response = await this.handleExportSettings(message, context, intent);
          break;
          
        case 'general_chat':
        default:
          response = await this.handleGeneralChatEnhanced(message, context, intent);
          break;
      }

      // Добавляем ответ в историю
      const responseMessageId = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      context.conversationHistory.push({
        id: responseMessageId,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: intent.type,
          confidence: intent.confidence,
          generatedElements: response.data?.affectedElements,
          styleChanges: response.data?.styleChanges,
          actions: response.data?.actions
        }
      });

      // Обновляем кеш контекста
      this.conversationCache.set(context.sessionId, context);

      // Генерируем проактивные предложения
      const suggestions = await this.generateProactiveSuggestions(context, intent);
      const followUpQuestions = this.generateFollowUpQuestions(intent, response.data);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        message: response.message,
        action: intent.type,
        data: response.data,
        suggestions,
        followUpQuestions,
        tutorialSteps: response.tutorialSteps,
        context,
        metadata: {
          intent,
          processingTime,
          confidence: intent.confidence
        }
      };

    } catch (error) {
      console.error('❌ Error in enhanced chat handler:', error);
      
      // Добавляем ошибку в историю для контекста
      context.conversationHistory.push({
        id: `error_${Date.now()}`,
        role: 'system',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        message: 'Извините, произошла ошибка при обработке вашего запроса. Давайте попробуем еще раз!',
        action: 'general_chat',
        data: { error: error.message },
        context,
        metadata: {
          intent: { type: 'general_chat', confidence: 0, priority: 'low' },
          processingTime: Date.now() - startTime,
          confidence: 0
        }
      };
    }
  }

  /**
   * ✅ БЕЗОПАСНОЕ ОПРЕДЕЛЕНИЕ НАМЕРЕНИЯ БЕЗ АВТОПЕРЕНАПРАВЛЕНИЯ
   */
  async detectUserIntentSafe(message, context, imageUrl) {
    const cacheKey = `${message.toLowerCase().slice(0, 50)}_${!!imageUrl}`;
    
    if (this.intentCache.has(cacheKey)) {
      return this.intentCache.get(cacheKey);
    }

    // ✅ ВАЖНО: НЕ ИСПОЛЬЗУЕМ OpenAI для определения намерений в чате
    // Это предотвращает автоматическое перенаправление на генерацию
    console.log('🛡️ [CHAT] Using safe fallback intent detection - NO AI redirection');
    
    const intent = this.getFallbackIntentSafe(message, imageUrl);
    
    // Кешируем результат
    this.intentCache.set(cacheKey, intent);
    
    // Обновляем память контекста
    if (!context.contextMemory) {
      context.contextMemory = {
        conversationFlow: [],
        mentionedElements: new Set(),
        recentIntents: [],
        appliedStyles: new Map()
      };
    }
    
    context.contextMemory.recentIntents.push({
      intent: intent.type,
      timestamp: new Date().toISOString(),
      confidence: intent.confidence
    });
    
    return intent;
  }

  /**
   * ✅ БЕЗОПАСНЫЙ FALLBACK БЕЗ ПЕРЕНАПРАВЛЕНИЯ НА ГЕНЕРАЦИЮ
   */
  getFallbackIntentSafe(message, imageUrl) {
    const msg = message.toLowerCase();
    
    // ✅ БЛОКИРУЕМ ДЕТЕКЦИЮ ГЕНЕРАЦИИ В ЧАТЕ
    const hasGenerationKeywords = (
      msg.includes('generate') || 
      msg.includes('create image') || 
      msg.includes('генерировать') || 
      msg.includes('создать изображение') ||
      msg.includes('сгенерируй') ||
      msg.includes('создай картинку')
    );
    
    if (hasGenerationKeywords) {
      console.log('🚫 [CHAT] Generation keywords detected but BLOCKED in chat mode');
      return {
        type: 'image_generation',
        confidence: 0.9,
        priority: 'high',
        blocked: true, // ✅ ВАЖНЫЙ ФЛАГ!
        reason: 'Image generation not allowed in chat mode'
      };
    }

    // Style analysis keywords
    if (imageUrl || msg.includes('анализ') || msg.includes('стиль') || msg.includes('цвет') || msg.includes('палитра')) {
      return {
        type: 'style_analysis',
        confidence: 0.7,
        priority: 'medium',
        requiresImage: !!imageUrl
      };
    }

    // Element customization keywords
    if (msg.includes('кнопк') || msg.includes('фон') || msg.includes('измени') || msg.includes('настрой')) {
      return {
        type: 'element_customization',
        confidence: 0.8,
        priority: 'high',
        elements: this.extractElementsFromMessage(msg)
      };
    }

    // Tutorial keywords
    if (msg.includes('как') || msg.includes('помощ') || msg.includes('научи') || msg.includes('объясни')) {
      return {
        type: 'tutorial',
        confidence: 0.7,
        priority: 'medium'
      };
    }

    return {
      type: 'general_chat',
      confidence: 0.5,
      priority: 'low'
    };
  }

  /**
   * ✅ ОБРАБОТКА ЗАБЛОКИРОВАННОЙ ГЕНЕРАЦИИ
   */
  async handleImageGenerationBlocked(message, context, intent) {
    console.log('🚫 [CHAT] Handling blocked image generation request');
    
    const language = message.includes('генер') || message.includes('создай') ? 'ru' : 'en';
    
    const responses = {
      ru: {
        message: `Я понял, что вы хотите создать изображение! 🎨
        
Для генерации изображений, пожалуйста, используйте специальный режим:
• **Leonardo режим** - для высокого качества и реалистичных изображений  
• **Replicate режим** - для быстрой генерации и стилизованных изображений

Переключитесь на один из этих режимов и повторите ваш запрос. В режиме чата я могу только помочь с настройками стилей кошелька.`,
        suggestions: [
          'Переключиться на Leonardo',
          'Переключиться на Replicate', 
          'Помочь с настройками цветов',
          'Показать примеры стилей'
        ]
      },
      en: {
        message: `I understand you want to create an image! 🎨
        
For image generation, please use the specialized mode:
• **Leonardo mode** - for high quality and realistic images
• **Replicate mode** - for fast generation and stylized images

Switch to one of these modes and repeat your request. In chat mode, I can only help with wallet style settings.`,
        suggestions: [
          'Switch to Leonardo',
          'Switch to Replicate',
          'Help with color settings', 
          'Show style examples'
        ]
      }
    };
    
    const response = responses[language];
    
    return {
      message: response.message,
      data: {
        action: 'mode_switch_required',
        requiredModes: ['leonardo', 'replicate'],
        originalRequest: message,
        suggestions: response.suggestions,
        blocked: true
      }
    };
  }

  /**
   * Извлечение упоминаний элементов из сообщения
   */
  extractElementsFromMessage(message) {
    const elements = [];
    const elementKeywords = {
      'кнопк': 'button',
      'фон': 'background', 
      'текст': 'text',
      'иконк': 'icon',
      'меню': 'navigation',
      'заголов': 'header',
      'подвал': 'footer'
    };

    for (const [keyword, element] of Object.entries(elementKeywords)) {
      if (message.includes(keyword)) {
        elements.push(element);
      }
    }
    
    return elements;
  }

  /**
   * Расширенная обработка анализа стилей
   */
  async handleStyleAnalysisEnhanced(message, imageUrl, context, intent) {
    console.log('🎨 Handling enhanced style analysis...');
    
    let analysis;
    if (imageUrl) {
      analysis = await this.styleAnalyzer.analyzeImageStyle(imageUrl);
    } else {
      analysis = await this.styleAnalyzer.analyzeTextStyle(message);
    }

    // Сохраняем предпочтения стиля в контекст
    context.stylePreferences = analysis;

    // Анализируем совместимость с текущим кошельком
    const walletContext = await this.walletManager.createWalletAIContext(context.walletType);
    const compatibility = this.analyzeStyleCompatibility(analysis, walletContext);

    // Генерируем персонализированные рекомендации
    const recommendations = this.generateStyleRecommendations(analysis, context.userProfile);

    return {
      message: `Отлично! Я проанализировал ${imageUrl ? 'изображение' : 'ваше описание'} и создал стильную палитру.
      
🎨 **Обнаруженный стиль**: ${analysis.theme} с настроением "${analysis.mood}"
🎯 **Совместимость**: ${compatibility.score}/10 с вашим ${context.walletType} кошельком
      
Хотите применить этот стиль или настроить детали?`,
      data: {
        styleAnalysis: analysis,
        compatibility,
        recommendations,
        suggestedActions: [
          'Применить ко всему кошельку',
          'Применить только к основным элементам', 
          'Настроить цвета вручную',
          'Посмотреть альтернативы'
        ]
      }
    };
  }

  /**
   * Расширенная обработка кастомизации элементов
   */
  async handleElementCustomizationEnhanced(message, context, intent) {
    console.log('🔧 Handling enhanced element customization...');
    
    // Получаем AI контекст для кошелька
    const aiContext = await this.walletManager.createWalletAIContext(context.walletType, context.activeScreen);
    
    // Создаем умные стили на основе предпочтений и запроса
    const styleChanges = await this.generateSmartStyleChanges(message, context, aiContext, intent);
    
    // Обновляем память о примененных стилях
    if (!context.contextMemory) {
      context.contextMemory = {
        conversationFlow: [],
        mentionedElements: new Set(),
        recentIntents: [],
        appliedStyles: new Map()
      };
    }
    
    context.contextMemory.appliedStyles.set(Date.now().toString(), styleChanges);
    
    // Добавляем упомянутые элементы в память
    if (intent.elements) {
      intent.elements.forEach(el => context.contextMemory.mentionedElements.add(el));
    }

    const affectedElements = intent.elements || ['background', 'buttons'];
    const complexity = aiContext.complexity;

    return {
      message: `Готово! Я применил изменения к ${affectedElements.join(', ')}. 
      
✨ **Изменения**: ${styleChanges.styleNotes}
🎯 **Затронуто элементов**: ${affectedElements.length}
      
${complexity === 'high' ? '💡 **Совет**: Ваш кошелек поддерживает много настроек - попробуйте поэкспериментировать!' : ''}

Как вам результат?`,
      data: {
        styleChanges,
        affectedElements, 
        preview: true,
        nextSuggestions: this.generateNextStepSuggestions(styleChanges, aiContext)
      }
    };
  }

  /**
   * Обработка режима обучения
   */
  async handleTutorialMode(message, context, intent) {
    console.log('📚 Handling tutorial mode...');
    
    const tutorialSteps = this.generateTutorialSteps(message, context);
    
    return {
      message: `Отлично! Давайте пошагово разберем, как ${tutorialSteps.goal}:`,
      data: {
        tutorial: tutorialSteps,
        currentStep: 0,
        totalSteps: tutorialSteps.steps.length
      },
      tutorialSteps: tutorialSteps.steps
    };
  }

  /**
   * Обработка устранения неполадок
   */
  async handleTroubleshooting(message, context, intent) {
    console.log('🔧 Handling troubleshooting...');
    
    const issue = this.identifyIssue(message);
    const solutions = await this.generateSolutions(issue, context);
    
    return {
      message: `Понял проблему! Вот несколько решений:`,
      data: {
        issue,
        solutions,
        priority: intent.priority
      }
    };
  }

  /**
   * Обработка сравнения кошельков
   */
  async handleWalletComparison(message, context, intent) {
    console.log('⚖️ Handling wallet comparison...');
    
    const walletsToCompare = this.extractWalletTypesFromMessage(message);
    if (walletsToCompare.length < 2) {
      walletsToCompare.push(context.walletType);
    }
    
    const comparison = await this.walletManager.compareWallets(walletsToCompare[0], walletsToCompare[1]);
    
    return {
      message: `Вот сравнение ${walletsToCompare[0]} и ${walletsToCompare[1]}:`,
      data: {
        comparison,
        wallets: walletsToCompare
      }
    };
  }

  /**
   * Обработка экспорта настроек
   */
  async handleExportSettings(message, context, intent) {
    console.log('📤 Handling export settings...');
    
    const exportData = await this.walletManager.exportWalletConfig(context.walletType);
    
    return {
      message: `Настройки экспортированы! Файл содержит все ваши кастомизации.`,
      data: {
        export: exportData,
        fileName: `${context.walletType}_settings_${new Date().toISOString().split('T')[0]}.json`
      }
    };
  }

  /**
   * Расширенная обработка общего чата
   */
  async handleGeneralChatEnhanced(message, context, intent) {
    console.log('💬 Handling enhanced general chat...');
    
    const openaiApiKey = Deno.env.get('OPENA_API_KEY');
    
    if (!openaiApiKey) {
      return this.getFallbackChatResponse(message, context);
    }

    try {
      // Создаем персонализированный промпт
      const systemPrompt = this.buildPersonalizedSystemPrompt(context);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...context.conversationHistory.slice(-5).map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: message }
          ],
          max_tokens: 400,
          temperature: 0.7
        })
      });

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;

      return {
        message: content,
        data: {
          suggestions: await this.generateContextualSuggestions(context),
          walletInfo: await this.getRelevantWalletInfo(context.walletType)
        }
      };
    } catch (error) {
      console.error('Error in general chat:', error);
      return this.getFallbackChatResponse(message, context);
    }
  }

  // ====== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ======

  analyzeStyleCompatibility(analysis, walletContext) {
    let score = 7; // Базовый балл
    
    // Проверяем поддержку темной/светлой темы
    if (analysis.theme === 'dark' && walletContext.walletConfiguration.capabilities.darkMode) {
      score += 1;
    }
    
    // Проверяем поддержку кастомных цветов
    if (walletContext.walletConfiguration.capabilities.customColors) {
      score += 1;
    }
    
    // Проверяем поддержку анимаций
    if (analysis.complexity === 'complex' && walletContext.walletConfiguration.capabilities.animations) {
      score += 1;
    }
    
    // Ограничиваем максимальным баллом
    score = Math.min(score, 10);
    
    return {
      score,
      supported: score >= 7,
      recommendations: score < 7 ? [
        'Некоторые элементы стиля могут быть упрощены для лучшей совместимости',
        'Рассмотрите альтернативные цветовые схемы'
      ] : [
        'Отличная совместимость!',
        'Все элементы стиля поддерживаются'
      ]
    };
  }

  generateStyleRecommendations(analysis, userProfile) {
    const recommendations = [];
    
    // На основе анализа стиля
    if (analysis.theme === 'dark') {
      recommendations.push('Темная тема отлично подходит для длительного использования');
    }
    
    if (analysis.mood === 'professional') {
      recommendations.push('Профессиональный стиль подчеркнет серьезность ваших криптоопераций');
    }
    
    // На основе профиля пользователя
    if (userProfile?.preferences.complexity === 'beginner') {
      recommendations.push('Начните с изменения основных цветов, затем переходите к деталям');
    }
    
    if (userProfile?.history.favoriteColors?.includes(analysis.colorPalette.primary)) {
      recommendations.push('Этот цвет отлично сочетается с вашими предпочтениями!');
    }
    
    return recommendations.slice(0, 3);
  }

  async generateSmartStyleChanges(message, context, aiContext, intent) {
    // Пример генерации изменений стиля на основе AI
    // Здесь можно использовать OpenAI или другую ML модель для генерации изменений
    // Для упрощения возвращаем фиктивный объект
    return {
      styleNotes: 'Изменены цвета кнопок и фона согласно запросу',
      changes: {
        buttonColor: '#FF5733',
        backgroundColor: '#1A1A1A'
      }
    };
  }

  generateNextStepSuggestions(styleChanges, aiContext) {
    return [
      'Попробовать другой цвет кнопок',
      'Настроить анимации элементов', 
      'Сохранить текущие настройки',
      'Вернуться к предыдущему стилю'
    ];
  }

  generateTutorialSteps(message, context) {
    return {
      goal: 'настроить цвета и элементы вашего кошелька',
      steps: [
        'Откройте настройки кошелька',
        'Выберите раздел "Внешний вид"',
        'Настройте основные цвета',
        'Сохраните изменения и проверьте результат'
      ]
    };
  }

  identifyIssue(message) {
    // Пример простой идентификации
    if (message.toLowerCase().includes('не работает')) {
      return 'Функция не работает';
    }
    return 'Неизвестная проблема';
  }

  async generateSolutions(issue, context) {
    // Пример генерации решений
    if (issue === 'Функция не работает') {
      return [
        'Перезапустите приложение',
        'Проверьте подключение к интернету',
        'Обновите кошелек до последней версии'
      ];
    }
    return ['Свяжитесь с поддержкой для дополнительной помощи'];
  }

  extractWalletTypesFromMessage(message) {
    const wallets = [];
    const knownWallets = ['MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'Rainbow', 'Phantom'];
    
    knownWallets.forEach(wallet => {
      if (message.toLowerCase().includes(wallet.toLowerCase())) {
        wallets.push(wallet);
      }
    });
    
    return wallets;
  }

  async generateProactiveSuggestions(context, intent) {
    if (!context.settings.enableProactiveHelp) return [];
    
    // Пример генерации предложений
    return [
      'Хотите посмотреть примеры стилей?',
      'Могу помочь с настройкой анимаций',
      'Нужна помощь с экспортом настроек?'
    ];
  }

  generateFollowUpQuestions(intent, data) {
    if (intent.type === 'style_analysis') {
      return [
        'Хотите применить этот стиль?',
        'Нужно ли настроить цвета вручную?'
      ];
    }
    
    if (intent.type === 'element_customization') {
      return [
        'Хотите изменить другие элементы?',
        'Нужно ли сохранить изменения?'
      ];
    }
    
    return [];
  }

  getFallbackChatResponse(message, context) {
    return {
      success: true,
      message: 'Извините, я пока не могу обработать этот запрос. Могу помочь с настройками кошелька или анализом стиля.',
      action: 'general_chat',
      data: {},
      context,
      metadata: {
        intent: { type: 'general_chat', confidence: 0, priority: 'low' },
        processingTime: 0,
        confidence: 0
      }
    };
  }

  async getRelevantWalletInfo(walletType) {
    // Пример получения информации
    return {
      name: walletType,
      version: '1.2.3',
      features: ['darkMode', 'customColors', 'animations']
    };
  }

  async generateContextualSuggestions(context) {
    return [
      'Попробуйте изменить цвет кнопок',
      'Добавьте анимацию для улучшения UX',
      'Сравните ваш кошелек с другими популярными'
    ];
  }

  buildPersonalizedSystemPrompt(context) {
    const userLevel = context.userProfile?.preferences.complexity || 'intermediate';
    const preferredStyle = context.userProfile?.preferences.style || 'modern';
    const responseStyle = context.settings.responseStyle || 'casual';
    
    return `Ты - эксперт по кастомизации Web3 кошельков, специализирующийся на ${context.walletType}.

Контекст пользователя:
- Уровень: ${userLevel}
- Предпочитаемый стиль: ${preferredStyle}
- Стиль общения: ${responseStyle}
- Активный экран: ${context.activeScreen || 'основной'}

${userLevel === 'beginner' ? 'Объясняй просто, избегай технических терминов.' : ''}
${userLevel === 'advanced' ? 'Можешь использовать технические детали и предлагать сложные решения.' : ''}

Отвечай ${responseStyle === 'casual' ? 'дружелюбно и непринужденно' : responseStyle === 'professional' ? 'формально и структурированно' : 'технически точно'}.

ВАЖНО: Ты НЕ можешь создавать изображения в режиме чата. Если пользователь просит создать изображение, направь его использовать Leonardo или Replicate режим.

Всегда предлагай конкретные действия и будь готов к follow-up вопросам.`;
  }
}

// Factory function for creating ChatHandler instance
export function createChatHandler(supabaseUrl, supabaseKey) {
  return new ChatHandler(supabaseUrl, supabaseKey);
}
