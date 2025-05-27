
import { WalletAnalysis } from '@/stores/customizationStore';

export interface SmartPromptResult {
  enhancedPrompt: string;
  interactionType: string;
  targetElement?: string;
  suggestedZone: string;
}

export class LayoutAwarePromptBuilder {
  private walletAnalysis: WalletAnalysis;
  
  constructor(walletAnalysis: WalletAnalysis) {
    this.walletAnalysis = walletAnalysis;
  }

  // Анализирует пользовательский промпт и определяет тип взаимодействия
  analyzeUserIntent(userPrompt: string): SmartPromptResult {
    const prompt = userPrompt.toLowerCase();
    
    // Детектируем типы взаимодействий
    const interactionPatterns = {
      touch: ['touch', 'touches', 'touching', 'tap', 'taps', 'press', 'click'],
      embrace: ['embrace', 'hug', 'hugs', 'hugging', 'hold', 'holding', 'wrap'],
      point: ['point', 'points', 'pointing', 'show', 'shows', 'indicate'],
      protect: ['protect', 'guard', 'guards', 'shield', 'secure'],
      present: ['present', 'display', 'showcase', 'reveal'],
      sit: ['sit', 'sits', 'sitting', 'rest', 'lean', 'relax']
    };

    let detectedInteraction = 'embrace'; // default
    let targetElement = '';

    // Ищем тип взаимодействия
    for (const [interaction, keywords] of Object.entries(interactionPatterns)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        detectedInteraction = interaction;
        break;
      }
    }

    // Ищем целевые элементы UI
    const uiElementPatterns = {
      button: ['button', 'unlock', 'login', 'send', 'receive', 'swap'],
      balance: ['balance', 'money', 'sol', 'crypto', 'amount'],
      logo: ['logo', 'solana', 'brand', 'icon'],
      input: ['input', 'field', 'email', 'password', 'text'],
      header: ['header', 'top', 'navigation', 'nav'],
      transaction: ['transaction', 'history', 'payment', 'transfer']
    };

    for (const [element, keywords] of Object.entries(uiElementPatterns)) {
      if (keywords.some(keyword => prompt.includes(keyword))) {
        targetElement = element;
        break;
      }
    }

    // Определяем оптимальную зону для размещения
    const suggestedZone = this.determineBestZone(detectedInteraction, targetElement);

    // Строим enhanced prompt
    const enhancedPrompt = this.buildEnhancedPrompt(
      userPrompt, 
      detectedInteraction, 
      targetElement
    );

    return {
      enhancedPrompt,
      interactionType: detectedInteraction,
      targetElement: targetElement || undefined,
      suggestedZone
    };
  }

  private determineBestZone(interaction: string, targetElement: string): string {
    // Логика выбора оптимальной зоны на основе элемента и взаимодействия
    const { layout } = this.walletAnalysis.uiStructure;
    
    if (targetElement === 'button' && layout.type === 'login') {
      return 'bottom'; // кнопки логина обычно внизу
    }
    
    if (targetElement === 'balance' && layout.type === 'wallet') {
      return 'top'; // баланс обычно вверху
    }
    
    if (targetElement === 'logo') {
      return 'top'; // логотип обычно вверху
    }
    
    if (interaction === 'embrace' || interaction === 'protect') {
      return 'all'; // обнимать/защищать лучше вокруг
    }
    
    return 'all'; // default
  }

  private buildEnhancedPrompt(
    userPrompt: string, 
    interaction: string, 
    targetElement: string
  ): string {
    const { layout, colorPalette, safeZone } = this.walletAnalysis.uiStructure;
    const { generationContext } = this.walletAnalysis;

    // Базовый enhanced prompt из анализа
    let enhanced = generationContext.promptEnhancement;

    // Добавляем специфику взаимодействия
    const interactionDescriptions = {
      touch: `gently touching and interacting with`,
      embrace: `warmly embracing and hugging around`,
      point: `pointing towards and highlighting`,
      protect: `protectively guarding and shielding`,
      present: `proudly presenting and showcasing`,
      sit: `comfortably sitting next to and relaxing with`
    };

    const interactionDesc = interactionDescriptions[interaction as keyof typeof interactionDescriptions] || 'interacting with';

    // Добавляем информацию о целевом элементе
    let elementContext = '';
    if (targetElement) {
      const elementDescriptions = {
        button: `the interactive ${colorPalette.accent} colored action buttons`,
        balance: `the prominent balance display showing wallet value`,
        logo: `the ${colorPalette.accent} Solana logo and branding`,
        input: `the input fields for user authentication`,
        header: `the wallet header and navigation area`,
        transaction: `the transaction history and activity list`
      };
      
      elementContext = elementDescriptions[targetElement as keyof typeof elementDescriptions] || 'the wallet interface';
    }

    // Собираем финальный промпт
    const finalPrompt = `${userPrompt}, character ${interactionDesc} ${elementContext || 'the wallet interface'}, ${enhanced}, maintaining ${safeZone.width}x${safeZone.height}px safe zone for critical UI elements, character positioned to enhance ${layout.type} wallet experience`;

    return finalPrompt;
  }

  // Генерирует suggestions для пользователя
  generateInteractionSuggestions(): string[] {
    const { layout } = this.walletAnalysis.uiStructure;
    
    if (layout.type === 'login') {
      return [
        "Character touches the unlock button",
        "Character protects the login interface", 
        "Character points at the Solana logo",
        "Character sits next to the email field",
        "Character embraces the authentication screen"
      ];
    } else {
      return [
        "Character touches the send button",
        "Character points at the balance display",
        "Character embraces the wallet interface",
        "Character protects the transaction history",
        "Character sits next to the action buttons"
      ];
    }
  }
}

// Утилитарная функция для быстрого использования
export function buildSmartPrompt(
  userPrompt: string, 
  walletAnalysis: WalletAnalysis
): SmartPromptResult {
  const builder = new LayoutAwarePromptBuilder(walletAnalysis);
  return builder.analyzeUserIntent(userPrompt);
}
