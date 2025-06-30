import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createWalletManager, type WalletAIContext } from './walletManager.ts';
import { createStyleAnalyzer, type StyleAnalysis } from './styleAnalyzer.ts';
import { AdvancedJSONParser } from '../utils/json-parser.ts';
import { createAdvancedPromptBuilder } from '../utils/prompt-builder.ts';

export interface ChatContext {
  userId?: string;
  sessionId: string;
  walletType: string;
  activeScreen?: string;
  conversationHistory: ChatMessage[];
  currentTask?: TaskType;
  stylePreferences?: StyleAnalysis;
  userProfile?: UserProfile;
  contextMemory: ContextMemory;
  settings: ChatSettings;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    imageUrl?: string;
    generatedElements?: string[];
    styleChanges?: any;
    actions?: string[];
  };
}

export interface UserProfile {
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    style: 'minimal' | 'colorful' | 'professional' | 'gaming';
    language: string;
  };
  history: {
    totalSessions: number;
    favoriteColors: string[];
    commonRequests: string[];
    lastActive: string;
  };
}

export interface ContextMemory {
  recentIntents: Array<{ intent: string; timestamp: string; confidence: number }>;
  mentionedElements: Set<string>;
  appliedStyles: Map<string, any>;
  userGoals: string[];
  conversationFlow: string[];
}

export interface ChatSettings {
  maxHistoryLength: number;
  intentThreshold: number;
  enableSuggestions: boolean;
  enableProactiveHelp: boolean;
  responseStyle: 'casual' | 'professional' | 'technical';
}

export type TaskType = 
  | 'style_analysis' 
  | 'element_customization' 
  | 'image_generation' 
  | 'general_chat'
  | 'tutorial'
  | 'troubleshooting'
  | 'comparison'
  | 'export_settings';

export interface IntentDetectionResult {
  type: TaskType;
  confidence: number;
  elements?: string[];
  action?: string;
  priority: 'low' | 'medium' | 'high';
  requiresImage?: boolean;
  suggestedResponses?: string[];
}

export interface ChatResponse {
  success: boolean;
  message: string;
  action: TaskType;
  data: any;
  suggestions?: string[];
  followUpQuestions?: string[];
  tutorialSteps?: string[];
  context: ChatContext;
  metadata: {
    intent: IntentDetectionResult;
    processingTime: number;
    confidence: number;
  };
}

export class ChatHandler {
  private supabase: any;
  private walletManager: any;
  private styleAnalyzer: any;
  private promptBuilder: any;
  private intentCache: Map<string, IntentDetectionResult> = new Map();
  private conversationCache: Map<string, ChatContext> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.walletManager = createWalletManager(supabaseUrl, supabaseKey);
    this.styleAnalyzer = createStyleAnalyzer(supabaseUrl, supabaseKey);
    this.promptBuilder = createAdvancedPromptBuilder();
  }

  /**
   * Обновление памяти контекста
   */
  updateContextMemory(context: ChatContext, message: string): void {
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
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    context.contextMemory.recentIntents = context.contextMemory.recentIntents.filter(
      intent => new Date(intent.timestamp).getTime() > oneHourAgo
    );
  }

  /**
   * Анализ совместимости стиля с кошельком
   */
  analyzeStyleCompatibility(analysis: StyleAnalysis, walletContext: WalletAIContext): any {
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

  /**
   * Генерация рекомендаций по стилю
   */
  generateStyleRecommendations(analysis: StyleAnalysis, userProfile?: UserProfile): string[] {
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

  /**
   * Генерация умных стилей на основе запроса и контекста
   */
  private async generateSmartStyleChanges(
    message: string,
    context: ChatContext,
    aiContext: WalletAIContext,
    intent: IntentDetectionResult
  ): Promise<any> {
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

  /**
   * Генерация следующих предложений для пользователя
   */
  private generateNextStepSuggestions(styleChanges: any, aiContext: WalletAIContext): string[] {
    return [
      'Попробовать другой цвет кнопок',
      'Настроить анимации элементов',
      'Сохранить текущие настройки',
      'Вернуться к предыдущему стилю'
    ];
  }

  /**
   * Анализ запроса на генерацию изображения
   */
  private analyzeImageGenerationRequest(message: string, context: ChatContext): any {
    // Пример анализа запроса
    return {
      type: 'фон',
      description: message,
      style: context.stylePreferences?.theme || 'light'
    };
  }

  /**
   * Генерация шагов обучения
   */
  private generateTutorialSteps(message: string, context: ChatContext): { goal: string; steps: string[] } {
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

  /**
   * Идентификация проблемы для устранения неполадок
   */
  private identifyIssue(message: string): string {
    // Пример простой идентификации
    if (message.toLowerCase().includes('не работает')) {
      return 'Функция не работает';
    }
    return 'Неизвестная проблема';
  }

  /**
   * Генерация решений для устранения неполадок
   */
  private async generateSolutions(issue: string, context: ChatContext): Promise<string[]> {
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

  /**
   * Извлечение типов кошельков из сообщения для сравнения
   */
  private extractWalletTypesFromMessage(message: string): string[] {
    const wallets = [];
    const knownWallets = ['MetaMask', 'Trust Wallet', 'Coinbase Wallet', 'Rainbow', 'Phantom'];
    knownWallets.forEach(wallet => {
      if (message.toLowerCase().includes(wallet.toLowerCase())) {
        wallets.push(wallet);
      }
    });
    return wallets;
  }

  /**
   * Генерация проактивных предложений
   */
  private async generateProactiveSuggestions(context: ChatContext, intent: IntentDetectionResult): Promise<string[]> {
    if (!context.settings.enableProactiveHelp) return [];
    // Пример генерации предложений
    return [
      'Хотите посмотреть примеры стилей?',
      'Могу помочь с настройкой анимаций',
      'Нужна помощь с экспортом настроек?'
    ];
  }

  /**
   * Генерация follow-up вопросов
   */
  private generateFollowUpQuestions(intent: IntentDetectionResult, data: any): string[] {
    if (intent.type === 'style_analysis') {
      return ['Хотите применить этот стиль?', 'Нужно ли настроить цвета вручную?'];
    }
    if (intent.type === 'element_customization') {
      return ['Хотите изменить другие элементы?', 'Нужно ли сохранить изменения?'];
    }
    return [];
  }

  /**
   * Получение fallback ответа для общего чата
   */
  private getFallbackChatResponse(message: string, context: ChatContext): ChatResponse {
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

  /**
   * Получение релевантной информации о кошельке
   */
  private async getRelevantWalletInfo(walletType: string): Promise<any> {
    // Пример получения информации
    return {
      name: walletType,
      version: '1.2.3',
      features: ['darkMode', 'customColors', 'animations']
    };
  }

  /**
   * Генерация контекстных предложений
   */
  private async generateContextualSuggestions(context: ChatContext): Promise<string[]> {
    return [
      'Попробуйте изменить цвет кнопок',
      'Добавьте анимацию для улучшения UX',
      'Сравните ваш кошелек с другими популярными'
    ];
  }

  /**
   * Основной обработчик диалога с расширенной логикой
   */
  async handleChat(
    message: string, 
    context: ChatContext,
    imageUrl?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    console.log('💬 Processing enhanced chat message...');
    
    try {
      // Обновляем контекст памяти
      this.updateContextMemory(context, message);

      // Определяем намерение пользователя с кешированием
      const intent = await this.detectUserIntentEnhanced(message, context, imageUrl);
      
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

      // Маршрутизируем по намерению с расширенной логикой
      let response;
      switch (intent.type) {
        case 'style_analysis':
          response = await this.handleStyleAnalysisEnhanced(message, imageUrl, context, intent);
          break;
        case 'element_customization':
          response = await this.handleElementCustomizationEnhanced(message, context, intent);
          break;
        case 'image_generation':
          response = await this.handleImageGenerationEnhanced(message, context, intent);
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
   * Расширенное определение намерения пользователя с ML-подходом
   */
  private async detectUserIntentEnhanced(
    message: string, 
    context: ChatContext,
    imageUrl?: string
  ): Promise<IntentDetectionResult> {
    const cacheKey = `${message.toLowerCase().slice(0, 50)}_${!!imageUrl}`;
    
    if (this.intentCache.has(cacheKey)) {
      return this.intentCache.get(cacheKey)!;
    }

    const openaiApiKey = Deno.env.get('OPENA_API_KEY');
    if (!openaiApiKey) {
      return this.getFallbackIntent(message, imageUrl);
    }

    try {
      // Анализируем контекст разговора
      const recentIntents = context.contextMemory.recentIntents.slice(-3);
      const mentionedElements = Array.from(context.contextMemory.mentionedElements);
      const conversationFlow = context.contextMemory.conversationFlow.slice(-5);

      const contextPrompt = `
      Conversation Context:
      - Recent intents: ${recentIntents.map(i => i.intent).join(', ')}
      - Mentioned elements: ${mentionedElements.join(', ')}
      - Conversation flow: ${conversationFlow.join(' → ')}
      - User complexity level: ${context.userProfile?.preferences.complexity || 'intermediate'}
      - Has image: ${!!imageUrl}
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'system',
            content: `You are an expert intent classifier for Web3 wallet customization. 
            
            Analyze user messages and return JSON:
            {
              "type": "style_analysis|element_customization|image_generation|tutorial|troubleshooting|comparison|export_settings|general_chat",
              "confidence": 0.0-1.0,
              "elements": ["button", "background", etc.],
              "action": "change_color|resize|generate_image|etc.",
              "priority": "low|medium|high",
              "requiresImage": boolean,
              "suggestedResponses": ["response1", "response2"]
            }
            
            Consider context and conversation flow for better accuracy.`
          }, {
            role: 'user',
            content: `${contextPrompt}\n\nUser message: "${message}"`
          }],
          max_tokens: 300,
          temperature: 0.3
        })
      });

      if (response.ok) {
        const aiResponse = await response.json();
        const content = aiResponse.choices[0].message.content;
        
        const intent = AdvancedJSONParser.parseAIResponse(content);
        if (intent && intent.type) {
          // Кешируем результат
          this.intentCache.set(cacheKey, intent);
          
          // Обновляем память контекста
          context.contextMemory.recentIntents.push({
            intent: intent.type,
            timestamp: new Date().toISOString(),
            confidence: intent.confidence
          });

          return intent;
        }
      }
      
      return this.getFallbackIntent(message, imageUrl);
      
    } catch (error) {
      console.error('Error detecting intent:', error);
      return this.getFallbackIntent(message, imageUrl);
    }
  }

  /**
   * Fallback intent detection using keyword matching
   */
  private getFallbackIntent(message: string, imageUrl?: string): IntentDetectionResult {
    const msg = message.toLowerCase();
    
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
    
    // Image generation keywords
    if (msg.includes('создай') || msg.includes('генер') || msg.includes('изображение') || msg.includes('картинк')) {
      return {
        type: 'image_generation',
        confidence: 0.6,
        priority: 'medium'
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
   * Извлечение упоминаний элементов из сообщения
   */
  extractElementsFromMessage(message: string): string[] {
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
  private async handleStyleAnalysisEnhanced(
    message: string, 
    imageUrl: string | undefined, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
    console.log('🎨 Handling enhanced style analysis...');
    
    let analysis: StyleAnalysis;
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
  private async handleElementCustomizationEnhanced(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
    console.log('🔧 Handling enhanced element customization...');
    
    // Получаем AI контекст для кошелька
    const aiContext = await this.walletManager.createWalletAIContext(
      context.walletType, 
      context.activeScreen
    );

    // Создаем умные стили на основе предпочтений и запроса
    const styleChanges = await this.generateSmartStyleChanges(message, context, aiContext, intent);

    // Обновляем память о примененных стилях
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
   * Расширенная обработка генерации изображений
   */
  private async handleImageGenerationEnhanced(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
    console.log('🖼️ Handling enhanced image generation...');
    
    // Анализируем запрос на генерацию
    const generationRequest = this.analyzeImageGenerationRequest(message, context);
    
    return {
      message: `Создаю ${generationRequest.type} для вашего кошелька! 🎨
      
📝 **Запрос**: ${generationRequest.description}
🎭 **Стиль**: ${generationRequest.style}
⏱️ **Время**: ~30-60 секунд
      
Пока изображение генерируется, могу подготовить стили для интеграции.`,
      data: {
        action: 'generate_image',
        request: generationRequest,
        status: 'processing',
        estimatedTime: '30-60 seconds'
      }
    };
  }

  /**
   * Обработка режима обучения
   */
  private async handleTutorialMode(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
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
  private async handleTroubleshooting(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
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
  private async handleWalletComparison(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
    console.log('⚖️ Handling wallet comparison...');
    
    const walletsToCompare = this.extractWalletTypesFromMessage(message);
    if (walletsToCompare.length < 2) {
      walletsToCompare.push(context.walletType);
    }
    
    const comparison = await this.walletManager.compareWallets(
      walletsToCompare[0], 
      walletsToCompare[1]
    );
    
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
  private async handleExportSettings(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
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
  private async handleGeneralChatEnhanced(
    message: string, 
    context: ChatContext,
    intent: IntentDetectionResult
  ) {
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
          'Content-Type': 'application/json',
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

  /**
   * Построение персонализированного системного промпта
   */
  private buildPersonalizedSystemPrompt(context: ChatContext): string {
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

Всегда предлагай конкретные действия и будь готов к follow-up вопросам.`;
  }
}

// Factory function for creating ChatHandler instance
export function createChatHandler(supabaseUrl: string, supabaseKey: string) {
  return new ChatHandler(supabaseUrl, supabaseKey);
}
