const recommendations = this.generateComparisonRecommendations(style1, style2);
    const betterFor = this.determineBetterUseCase(style1, style2);

    return {
      similarity,
      differences,
      recommendations,
      betterFor
    };
  }

  /**
   * Генерация цветовых палитр на основе анализа
   */
  async generateColorPalettes(
    baseAnalysis: StyleAnalysis,
    variations: ('lighter' | 'darker' | 'saturated' | 'desaturated' | 'complementary' | 'analogous')[] = ['lighter', 'darker']
  ): Promise<ColorPalette[]> {
    console.log('🎨 Generating color palette variations...');

    const palettes: ColorPalette[] = [];
    const basePalette = baseAnalysis.colorPalette;

    for (const variation of variations) {
      let newPalette: ColorPalette;

      switch (variation) {
        case 'lighter':
          newPalette = this.createLighterPalette(basePalette);
          break;
        case 'darker':
          newPalette = this.createDarkerPalette(basePalette);
          break;
        case 'saturated':
          newPalette = this.createSaturatedPalette(basePalette);
          break;
        case 'desaturated':
          newPalette = this.createDesaturatedPalette(basePalette);
          break;
        case 'complementary':
          newPalette = this.createComplementaryPalette(basePalette);
          break;
        case 'analogous':
          newPalette = this.createAnalogousPalette(basePalette);
          break;
        default:
          newPalette = basePalette;
      }

      palettes.push(newPalette);
    }

    return palettes;
  }

  /**
   * Получение предустановленных стилей с расширенными возможностями
   */
  async getPresetStyles(): Promise<{ [key: string]: StyleAnalysis }> {
    try {
      // Попытка загрузить из базы данных
      const { data: presetsData } = await this.supabase
        .from('style_presets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (presetsData && presetsData.length > 0) {
        const presets: { [key: string]: StyleAnalysis } = {};
        presetsData.forEach((preset: any) => {
          presets[preset.name] = preset.styles;
        });
        return presets;
      }
    } catch (error) {
      console.warn('⚠️ Could not load presets from database, using defaults');
    }

    // Fallback к предустановленным стилям
    return this.getEnhancedDefaultPresets();
  }

  /**
   * Создание расширенного промпта для анализа изображения
   */
  private buildAdvancedImageAnalysisPrompt(options: any): string {
    let prompt = `Analyze this image for Web3 wallet interface design. Extract comprehensive style information including:

1. **Color Analysis**: Dominant colors, color harmony, emotional impact
2. **Visual Theme**: Overall aesthetic (dark/light/neon/minimal/etc.)
3. **Typography Style**: Suggested font characteristics
4. **Mood & Emotion**: What feelings does this evoke?
5. **Design Complexity**: How complex is the visual style?
6. **Accessibility**: Color contrast and readability considerations

`;

    if (options.contextHint) {
      prompt += `Context: ${options.contextHint}\n`;
    }

    if (options.targetAudience) {
      prompt += `Target Audience: ${options.targetAudience}\n`;
    }

    prompt += `Return detailed JSON:
{
  "colorPalette": {
    "primary": "#hex", "secondary": "#hex", "accent": "#hex",
    "background": "#hex", "surface": "#hex", "text": "#hex", 
    "textSecondary": "#hex", "success": "#hex", "warning": "#hex", 
    "error": "#hex", "info": "#hex",
    "gradient": {"start": "#hex", "end": "#hex", "direction": "degree"}
  },
  "theme": "light|dark|neon|minimal|gradient|retro|cyberpunk",
  "fontFamily": "suggested font",
  "fontWeight": "light|normal|medium|semibold|bold",
  "mood": "professional|playful|elegant|modern|retro|aggressive|calming",
  "borderRadius": "px value",
  "spacing": "tight|normal|loose|custom",
  "complexity": "minimal|moderate|complex|maximalist",
  "contrast": "low|medium|high",
  "emotions": ["emotion1", "emotion2"],
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.0-1.0,
  "metadata": {
    "dominantColors": ["#hex1", "#hex2"],
    "colorHarmony": "monochromatic|analogous|complementary|triadic|split-complementary",
    "temperature": "warm|cool|neutral",
    "saturation": "low|medium|high",
    "brightness": "dark|medium|bright"
  }
}`;

    return prompt;
  }

  /**
   * Создание контекстуального промпта для текста
   */
  private buildContextualTextPrompt(description: string, options: any): string {
    let prompt = `Create a comprehensive Web3 wallet interface style based on: "${description}"

`;

    if (options.brandContext) {
      prompt += `Brand Context: ${options.brandContext}\n`;
    }

    if (options.industryContext) {
      prompt += `Industry: ${options.industryContext}\n`;
    }

    if (options.targetDemographic) {
      prompt += `Target Users: ${options.targetDemographic}\n`;
    }

    prompt += `Consider:
- Color psychology and emotional impact
- Accessibility requirements (WCAG 2.1)
- Modern Web3 design trends
- User experience best practices
- Brand personality alignment

Return the same detailed JSON structure as image analysis.`;

    return prompt;
  }

  /**
   * Парсинг ответа анализа с валидацией
   */
  private parseAnalysisResponse(content: string): StyleAnalysis {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Валидация и нормализация
        return this.validateAndNormalizeAnalysis(parsed);
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.warn('⚠️ Failed to parse analysis response, using enhanced default');
      return this.getEnhancedDefaultAnalysis('parse_error');
    }
  }

  /**
   * Валидация и нормализация анализа
   */
  private validateAndNormalizeAnalysis(parsed: any): StyleAnalysis {
    // Обеспечиваем наличие всех обязательных полей
    const analysis: StyleAnalysis = {
      colorPalette: this.validateColorPalette(parsed.colorPalette),
      theme: parsed.theme || 'dark',
      fontFamily: parsed.fontFamily || 'Inter, sans-serif',
      fontWeight: parsed.fontWeight || 'normal',
      mood: parsed.mood || 'modern',
      borderRadius: parsed.borderRadius || '8px',
      spacing: parsed.spacing || 'normal',
      complexity: parsed.complexity || 'moderate',
      contrast: parsed.contrast || 'medium',
      accessibility: parsed.accessibility || { score: 7, issues: [], suggestions: [] },
      emotions: parsed.emotions || ['professional', 'modern'],
      keywords: parsed.keywords || [],
      confidence: parsed.confidence || 0.8,
      metadata: this.validateMetadata(parsed.metadata)
    };

    return analysis;
  }

  /**
   * Валидация цветовой палитры
   */
  private validateColorPalette(palette: any): ColorPalette {
    const defaultPalette: ColorPalette = {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#8b5cf6',
      background: '#1e293b',
      surface: '#334155',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };

    if (!palette || typeof palette !== 'object') {
      return defaultPalette;
    }

    // Нормализуем каждый цвет
    Object.keys(defaultPalette).forEach(key => {
      if (!palette[key] || !this.isValidHexColor(palette[key])) {
        palette[key] = defaultPalette[key as keyof ColorPalette];
      }
    });

    return palette;
  }

  /**
   * Валидация метаданных
   */
  private validateMetadata(metadata: any): StyleAnalysis['metadata'] {
    return {
      dominantColors: metadata?.dominantColors || ['#6366f1', '#1e293b'],
      colorHarmony: metadata?.colorHarmony || 'complementary',
      temperature: metadata?.temperature || 'cool',
      saturation: metadata?.saturation || 'medium',
      brightness: metadata?.brightness || 'medium'
    };
  }

  /**
   * Проверка валидности HEX цвета
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  /**
   * Обогащение анализа дополнительными данными
   */
  private async enrichWithAdvancedAnalysis(
    analysis: StyleAnalysis, 
    imageUrl: string
  ): Promise<StyleAnalysis> {
    try {
      // Дополнительный анализ цветов
      const colorAnalysis = await this.performAdvancedColorAnalysis(imageUrl);
      
      // Обогащаем метаданные
      analysis.metadata.dominantColors = colorAnalysis.dominantColors.map(c => c.color);
      analysis.metadata.colorHarmony = colorAnalysis.colorHarmony as any;
      
      // Добавляем эмоциональное воздействие
      analysis.emotions = [...analysis.emotions, ...colorAnalysis.emotionalImpact];
      
      return analysis;
    } catch (error) {
      console.warn('⚠️ Could not enrich with advanced analysis:', error);
      return analysis;
    }
  }

  /**
   * Продвинутый анализ цветов (заглушка для будущей интеграции с внешними сервисами)
   */
  private async performAdvancedColorAnalysis(imageUrl: string): Promise<AdvancedColorAnalysis> {
    // В будущем здесь может быть интеграция с Colormind, Adobe Color API и т.д.
    return {
      dominantColors: [
        { color: '#6366f1', percentage: 45, name: 'Indigo', rgb: { r: 99, g: 102, b: 241 }, hsl: { h: 238, s: 84, l: 67 } },
        { color: '#1e293b', percentage: 35, name: 'Dark Blue', rgb: { r: 30, g: 41, b: 59 }, hsl: { h: 217, s: 33, l: 17 } }
      ],
      colorHarmony: 'complementary',
      emotionalImpact: ['trustworthy', 'professional', 'modern'],
      brandPersonality: ['innovative', 'reliable', 'tech-savvy'],
      recommendedPalettes: []
    };
  }

  /**
   * Анализ эмоционального воздействия текста
   */
  private async analyzeEmotionalImpact(description: string): Promise<string[]> {
    const emotionKeywords = {
      'trustworthy': ['безопасн', 'надежн', 'стабильн', 'защищ'],
      'innovative': ['иннова', 'современн', 'передов', 'новаторск'],
      'playful': ['игрив', 'веселый', 'ярк', 'красочн'],
      'professional': ['профессионал', 'деловой', 'серьезн', 'корпоратив'],
      'elegant': ['элегант', 'изящн', 'утончен', 'стильн'],
      'energetic': ['энергичн', 'динамичн', 'активн', 'жив'],
      'calming': ['спокойн', 'умиротвор', 'расслабл', 'мирн']
    };

    const emotions: string[] = [];
    const lowerDesc = description.toLowerCase();

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        emotions.push(emotion);
      }
    });

    return emotions.length > 0 ? emotions : ['modern', 'professional'];
  }

  /**
   * Извлечение ключевых слов из описания
   */
  private extractKeywords(description: string): string[] {
    // Простое извлечение ключевых слов (можно улучшить с помощью NLP)
    const stopWords = new Set(['и', 'в', 'на', 'с', 'по', 'для', 'как', 'что', 'это', 'я', 'мне', 'хочу']);
    
    return description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }

  /**
   * Анализ доступности цветовой палитры
   */
  private analyzeAccessibility(palette: ColorPalette): StyleAnalysis['accessibility'] {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 10;

    // Проверка контраста текста на фоне
    const textBackgroundContrast = this.calculateContrast(palette.text, palette.background);
    if (textBackgroundContrast < 4.5) {
      issues.push('Недостаточный контраст между текстом и фоном');
      suggestions.push('Увеличьте контраст между цветом текста и фоном');
      score -= 3;
    }

    // Проверка контраста кнопок
    const buttonContrast = this.calculateContrast(palette.text, palette.primary);
    if (buttonContrast < 3) {
      issues.push('Низкий контраст на интерактивных элементах');
      suggestions.push('Убедитесь что кнопки достаточно контрастны');
      score -= 2;
    }

    // Проверка на дальтонизм (упрощенная)
    if (this.isSimilarForColorBlind(palette.success, palette.error)) {
      issues.push('Цвета успеха и ошибки могут быть неразличимы для людей с дальтонизмом');
      suggestions.push('Используйте дополнительные визуальные индикаторы кроме цвета');
      score -= 2;
    }

    return {
      score: Math.max(score, 0),
      issues,
      suggestions
    };
  }

  /**
   * Расчет контраста между цветами
   */
  private calculateContrast(color1: string, color2: string): number {
    const getLuminance = (color: string) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Проверка схожести цветов для дальтоников
   */
  private isSimilarForColorBlind(color1: string, color2: string): boolean {
    // Упрощенная проверка - в реальности нужен более сложный алгоритм
    const hue1 = this.getHue(color1);
    const hue2 = this.getHue(color2);
    
    return Math.abs(hue1 - hue2) < 30; // Если цвета близки по оттенку
  }

  /**
   * Получение оттенка цвета
   */
  private getHue(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    if (delta === 0) return 0;
    
    let hue = 0;
    if (max === r) hue = (g - b) / delta;
    else if (max === g) hue = 2 + (b - r) / delta;
    else hue = 4 + (r - g) / delta;
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
  }

  /**
   * Получение текущих трендов стилей
   */
  private getCurrentStyleTrends(industry: string): StyleTrend[] {
    const trends: StyleTrend[] = [
      {
        name: 'Neumorphism 2.0',
        popularity: 85,
        characteristics: ['Soft shadows', 'Subtle gradients', 'Minimal contrast'],
        suitableFor: ['Modern apps', 'Clean interfaces', 'Professional tools'],
        examples: [this.createNeumorphismPalette()]
      },
      {
        name: 'Dark Mode Premium',
        popularity: 92,
        characteristics: ['Deep blacks', 'Accent colors', 'High contrast'],
        suitableFor: ['Night usage', 'Eye comfort', 'Premium feel'],
        examples: [this.createDarkPremiumPalette()]
      },
      {
        name: 'Cyber Punk',
        popularity: 78,
        characteristics: ['Neon colors', 'High saturation', 'Futuristic feel'],
        suitableFor: ['Gaming', 'Crypto', 'Tech enthusiasts'],
        examples: [this.createCyberPunkPalette()]
      },
      {
        name: 'Minimalist Zen',
        popularity: 88,
        characteristics: ['Muted colors', 'Lots of whitespace', 'Clean typography'],
        suitableFor: ['Focus apps', 'Meditation', 'Productivity'],
        examples: [this.createMinimalistPalette()]
      }
    ];

    return trends;
  }

  /**
   * Методы создания различных палитр
   */
  private createNeumorphismPalette(): ColorPalette {
    return {
      primary: '#e0e5ec',
      secondary: '#d1d9e6',
      accent: '#4f46e5',
      background: '#e0e5ec',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#4a5568',
      success: '#38a169',
      warning: '#ed8936',
      error: '#e53e3e',
      info: '#3182ce'
    };
  }

  private createDarkPremiumPalette(): ColorPalette {
    return {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#8b5cf6',
      background: '#0a0a0b',
      surface: '#1a1a1b',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };
  }

  private createCyberPunkPalette(): ColorPalette {
    return {
      primary: '#00ff88',
      secondary: '#ff0080',
      accent: '#00ffff',
      background: '#000011',
      surface: '#001122',
      text: '#ffffff',
      textSecondary: '#88ffaa',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0040',
      info: '#0088ff'
    };
  }

  private createMinimalistPalette(): ColorPalette {
    return {
      primary: '#2d3748',
      secondary: '#4a5568',
      accent: '#805ad5',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#1a202c',
      textSecondary: '#718096',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      info: '#3182ce'
    };
  }

  /**
   * Методы создания вариаций палитр
   */
  private createLighterPalette(basePalette: ColorPalette): ColorPalette {
    const lighten = (color: string, amount: number = 0.2) => {
      // Упрощенная функция осветления
      return this.adjustBrightness(color, amount);
    };

    return {
      ...basePalette,
      background: lighten(basePalette.background),
      surface: lighten(basePalette.surface),
      primary: lighten(basePalette.primary),
      secondary: lighten(basePalette.secondary)
    };
  }

  private createDarkerPalette(basePalette: ColorPalette): ColorPalette {
    const darken = (color: string, amount: number = 0.2) => {
      return this.adjustBrightness(color, -amount);
    };

    return {
      ...basePalette,
      background: darken(basePalette.background),
      surface: darken(basePalette.surface),
      primary: darken(basePalette.primary),
      secondary: darken(basePalette.secondary)
    };
  }

  private createSaturatedPalette(basePalette: ColorPalette): ColorPalette {
    const saturate = (color: string) => {
      // Увеличиваем насыщенность
      return this.adjustSaturation(color, 0.3);
    };

    return {
      ...basePalette,
      primary: saturate(basePalette.primary),
      secondary: saturate(basePalette.secondary),
      accent: saturate(basePalette.accent),
      success: saturate(basePalette.success),
      warning: saturate(basePalette.warning),
      error: saturate(basePalette.error)
    };
  }

  private createDesaturatedPalette(basePalette: ColorPalette): ColorPalette {
    const desaturate = (color: string) => {
      return this.adjustSaturation(color, -0.3);
    };

    return {
      ...basePalette,
      primary: desaturate(basePalette.primary),
      secondary: desaturate(basePalette.secondary),
      accent: desaturate(basePalette.accent)
    };
  }

  private createComplementaryPalette(basePalette: ColorPalette): ColorPalette {
    const getComplementary = (color: string) => {
      const hue = this.getHue(color);
      return this.setHue(color, (hue + 180) % 360);
    };

    return {
      ...basePalette,
      accent: getComplementary(basePalette.primary),
      secondary: getComplementary(basePalette.secondary)
    };
  }

  private createAnalogousPalette(basePalette: ColorPalette): ColorPalette {
    const getAnalogous = (color: string, offset: number) => {
      const hue = this.getHue(color);
      return this.setHue(color, (hue + offset) % 360);
    };

    return {
      ...basePalette,
      secondary: getAnalogous(basePalette.primary, 30),
      accent: getAnalogous(basePalette.primary, -30)
    };
  }

  /**
   * Вспомогательные методы для работы с цветами
   */
  private adjustBrightness(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount * 255));
    const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount * 255));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount * 255));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  private adjustSaturation(color: string, amount: number): string {
    // Упрощенная функция изменения насыщенности
    // В реальной реализации лучше использовать HSL преобразования
    return color; // Заглушка
  }

  private setHue(color: string, hue: number): string {
    // Упрощенная функция установки оттенка
    // В реальной реализации нужно HSL преобразование
    return color; // Заглушка
  }

  /**
   * Методы для сравнения стилей
   */
  private calculateStyleSimilarity(style1: StyleAnalysis, style2: StyleAnalysis): number {
    let similarity = 0;
    let factors = 0;

    // Сравнение темы
    if (style1.theme === style2.theme) similarity += 0.3;
    factors += 0.3;

    // Сравнение настроения
    if (style1.mood === style2.mood) similarity += 0.2;
    factors += 0.2;

    // Сравнение сложности
    if (style1.complexity === style2.complexity) similarity += 0.1;
    factors += 0.1;

    // Сравнение цветов (упрощенно)
    const colorSimilarity = this.calculateColorSimilarity(
      style1.colorPalette,
      style2.colorPalette
    );
    similarity += colorSimilarity * 0.4;
    factors += 0.4;

    return Math.round((similarity / factors) * 100) / 100;
  }

  private calculateColorSimilarity(palette1: ColorPalette, palette2: ColorPalette): number {
    const colors1 = [palette1.primary, palette1.secondary, palette1.accent];
    const colors2 = [palette2.primary, palette2.secondary, palette2.accent];
    
    let totalSimilarity = 0;
    
    for (let i = 0; i < colors1.length; i++) {
      const hue1 = this.getHue(colors1[i]);
      const hue2 = this.getHue(colors2[i]);
      const hueDiff = Math.abs(hue1 - hue2);
      const similarity = 1 - (Math.min(hueDiff, 360 - hueDiff) / 180);
      totalSimilarity += similarity;
    }
    
    return totalSimilarity / colors1.length;
  }

  private identifyStyleDifferences(style1: StyleAnalysis, style2: StyleAnalysis): string[] {
    const differences: string[] = [];

    if (style1.theme !== style2.theme) {
      differences.push(`Разная тема: ${style1.theme} vs ${style2.theme}`);
    }

    if (style1.mood !== style2.mood) {
      differences.push(`Разное настроение: ${style1.mood} vs ${style2.mood}`);
    }

    if (style1.complexity !== style2.complexity) {
      differences.push(`Разная сложность: ${style1.complexity} vs ${style2.complexity}`);
    }

    const contrast1 = this.calculateContrast(style1.colorPalette.text, style1.colorPalette.background);
    const contrast2 = this.calculateContrast(style2.colorPalette.text, style2.colorPalette.background);
    
    if (Math.abs(contrast1 - contrast2) > 2) {
      differences.push(`Существенная разница в контрасте: ${contrast1.toFixed(1)} vs ${contrast2.toFixed(1)}`);
    }

    return differences;
  }

  private generateComparisonRecommendations(style1: StyleAnalysis, style2: StyleAnalysis): string[] {
    const recommendations: string[] = [];

    // Рекомендации на основе доступности
    if (style1.accessibility.score > style2.accessibility.score) {
      recommendations.push('Первый стиль лучше с точки зрения доступности');
    } else if (style2.accessibility.score > style1.accessibility.score) {
      recommendations.push('Второй стиль лучше с точки зрения доступности');
    }

    // Рекомендации на основе сложности
    if (style1.complexity === 'minimal' && style2.complexity === 'complex') {
      recommendations.push('Первый стиль лучше для новичков, второй - для опытных пользователей');
    }

    // Рекомендации на основе трендов
    const modernThemes = ['dark', 'neon', 'minimal'];
    if (modernThemes.includes(style1.theme) && !modernThemes.includes(style2.theme)) {
      recommendations.push('Первый стиль более современный и трендовый');
    }

    return recommendations;
  }

  private determineBetterUseCase(style1: StyleAnalysis, style2: StyleAnalysis): { [key: string]: string } {
    const useCases: { [key: string]: string } = {};

    // Профессиональное использование
    if (style1.mood === 'professional' && style1.accessibility.score >= 8) {
      useCases['business'] = 'Стиль 1';
    } else if (style2.mood === 'professional' && style2.accessibility.score >= 8) {
      useCases['business'] = 'Стиль 2';
    }

    // Игровое использование
    if (style1.theme === 'neon' || style1.mood === 'playful') {
      useCases['gaming'] = 'Стиль 1';
    } else if (style2.theme === 'neon' || style2.mood === 'playful') {
      useCases['gaming'] = 'Стиль 2';
    }

    // Длительное использование
    if (style1.theme === 'dark' && style1.contrast === 'medium') {
      useCases['long_sessions'] = 'Стиль 1';
    } else if (style2.theme === 'dark' && style2.contrast === 'medium') {
      useCases['long_sessions'] = 'Стиль 2';
    }

    // Мобильное использование
    if (style1.complexity === 'minimal' && style1.spacing === 'loose') {
      useCases['mobile'] = 'Стиль 1';
    } else if (style2.complexity === 'minimal' && style2.spacing === 'loose') {
      useCases['mobile'] = 'Стиль 2';
    }

    return useCases;
  }

  /**
   * Получение расширенных дефолтных пресетов
   */
  private getEnhancedDefaultPresets(): { [key: string]: StyleAnalysis } {
    return {
      'dark_professional_2024': {
        colorPalette: {
          primary: '#6366f1',
          secondary: '#4f46e5',
          accent: '#8b5cf6',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textSecondary: '#cbd5e1',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        theme: 'dark',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'medium',
        mood: 'professional',
        borderRadius: '12px',
        spacing: 'normal',
        complexity: 'moderate',
        contrast: 'high',
        accessibility: { score: 9, issues: [], suggestions: [] },
        emotions: ['trustworthy', 'professional', 'modern'],
        keywords: ['business', 'reliable', 'clean'],
        confidence: 0.95,
        metadata: {
          dominantColors: ['#6366f1', '#0f172a'],
          colorHarmony: 'complementary',
          temperature: 'cool',
          saturation: 'medium',
          brightness: 'dark'
        }
      },

      'neon_gaming_cyber': {
        colorPalette: {
          primary: '#00ff88',
          secondary: '#ff0080',
          accent: '#00ffff',
          background: '#000011',
          surface: '#001122',
          text: '#ffffff',
          textSecondary: '#88ffaa',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0040',
          info: '#0088ff',
          gradient: {
            start: '#00ff88',
            end: '#ff0080',
            direction: '45deg'
          }
        },
        theme: 'cyberpunk',
        fontFamily: 'Orbitron, monospace',
        fontWeight: 'bold',
        mood: 'aggressive',
        borderRadius: '16px',
        spacing: 'loose',
        complexity: 'maximalist',
        contrast: 'high',
        accessibility: { score: 6, issues: ['Очень яркие цвета'], suggestions: ['Добавить режим пониженной яркости'] },
        emotions: ['energetic', 'futuristic', 'bold'],
        keywords: ['gaming', 'cyber', 'neon', 'futuristic'],
        confidence: 0.92,
        metadata: {
          dominantColors: ['#00ff88', '#ff0080', '#00ffff'],
          colorHarmony: 'triadic',
          temperature: 'cool',
          saturation: 'high',
          brightness: 'bright'
        }
      },

      'light_minimal_zen': {
        colorPalette: {
          primary: '#2d3748',
          secondary: '#4a5568',
          accent: '#805ad5',
          background: '#ffffff',
          surface: '#f7fafc',
          text: '#1a202c',
          textSecondary: '#718096',
          success: '#38a169',
          warning: '#d69e2e',
          error: '#e53e3e',
          info: '#3182ce'
        },
        theme: 'minimal',
        fontFamily: 'SF Pro Display, sans-serif',
        fontWeight: 'light',
        mood: 'calming',
        borderRadius: '8px',
        spacing: 'loose',
        complexity: 'minimal',
        contrast: 'medium',
        accessibility: { score: 10, issues: [], suggestions: [] },
        emotions: ['calming', 'clean', 'peaceful'],
        keywords: ['minimal', 'zen', 'focus', 'clarity'],
        confidence: 0.98,
        metadata: {
          dominantColors: ['#2d3748', '#ffffff'],
          colorHarmony: 'monochromatic',
          temperature: 'neutral',
          saturation: 'low',
          brightness: 'bright'
        }
      },

      'gradient_modern_web3': {
        colorPalette: {
          primary: '#667eea',
          secondary: '#764ba2',
          accent: '#f093fb',
          background: '#4c1d95',
          surface: '#5b21b6',
          text: '#ffffff',
          textSecondary: '#e0e7ff',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
          gradient: {
            start: '#667eea',
            end: '#764ba2',
            direction: '135deg'
          }
        },
        theme: 'gradient',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 'semibold',
        mood: 'modern',
        borderRadius: '20px',
        spacing: 'normal',
        complexity: 'complex',
        contrast: 'medium',
        accessibility: { score: 8, issues: [], suggestions: ['Проверить контраст градиентов'] },
        emotions: ['innovative', 'modern', 'creative'],
        keywords: ['web3', 'gradient', 'modern', 'crypto'],
        confidence: 0.89,
        metadata: {
          dominantColors: ['#667eea', '#764ba2', '#f093fb'],
          colorHarmony: 'analogous',
          temperature: 'cool',
          saturation: 'medium',
          brightness: 'medium'
        }
      },

      'retro_80s_synthwave': {
        colorPalette: {
          primary: '#ff006e',
          secondary: '#8338ec',
          accent: '#ffbe0b',
          background: '#1a0b2e',
          surface: '#16213e',
          text: '#ffffff',
          textSecondary: '#ff9a00',
          success: '#06ffa5',
          warning: '#ffbe0b',
          error: '#ff006e',
          info: '#4cc9f0'
        },
        theme: 'retro',
        fontFamily: 'Courier New, monospace',
        fontWeight: 'bold',
        mood: 'retro',
        borderRadius: '4px',
        spacing: 'tight',
        complexity: 'complex',
        contrast: 'high',
        accessibility: { score: 7, issues: ['Яркие контрастные цвета'], suggestions: ['Добавить альтернативную схему'] },
        emotions: ['nostalgic', 'energetic', 'playful'],
        keywords: ['retro', '80s', 'synthwave', 'neon'],
        confidence: 0.91,
        metadata: {
          dominantColors: ['#ff006e', '#8338ec', '#ffbe0b'],
          colorHarmony: 'split-complementary',
          temperature: 'warm',
          saturation: 'high',
          brightness: 'medium'
        }
      }
    };
  }

  /**
   * Получение улучшенного дефолтного анализа
   */
  private getEnhancedDefaultAnalysis(fallbackType: string): StyleAnalysis {
    return {
      colorPalette: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        accent: '#8b5cf6',
        background: '#1e293b',
        surface: '#334155',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      theme: 'dark',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      mood: 'modern',
      borderRadius: '8px',
      spacing: 'normal',
      complexity: 'moderate',
      contrast: 'medium',
      accessibility: {
        score: 8,
        issues: [],
        suggestions: ['Анализ выполнен с базовыми настройками']
      },
      emotions: ['professional', 'modern'],
      keywords: [fallbackType],
      confidence: 0.7,
      metadata: {
        dominantColors: ['#6366f1', '#1e293b'],
        colorHarmony: 'complementary',
        temperature: 'cool',
        saturation: 'medium',
        brightness: 'medium'
      }
    };
  }

  /**
   * Создание хеша URL для кеширования
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Создание хеша строки для кеширования
   */
  private hashString(str: string): string {
    return this.hashUrl(str);
  }

  /**
   * Сохранение анализа в базу данных для будущего использования
   */
  async saveAnalysisToDatabase(
    analysis: StyleAnalysis, 
    sourceType: 'image' | 'text',
    sourceData: string,
    userId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('style_analyses')
        .insert({
          analysis,
          source_type: sourceType,
          source_data: sourceData,
          user_id: userId,
          confidence: analysis.confidence,
          created_at: new Date().toISOString()
        });
      
      console.log('✅ Style analysis saved to database');
    } catch (error) {
      console.warn('⚠️ Could not save analysis to database:', error);
    }
  }

  /**
   * Получение популярных анализов для рекомендаций
   */
  async getPopularAnalyses(limit: number = 10): Promise<StyleAnalysis[]> {
    try {
      const { data } = await this.supabase
        .from('style_analyses')
        .select('analysis')
        .order('created_at', { ascending: false })
        .limit(limit);

      return data?.map(item => item.analysis) || [];
    } catch (error) {
      console.warn('⚠️ Could not fetch popular analyses:', error);
      return [];
    }
  }

  /**
   * Экспорт анализа в различных форматах
   */
  exportAnalysis(
    analysis: StyleAnalysis, 
    format: 'json' | 'css' | 'scss' | 'tailwind' = 'json'
  ): string {
    switch (format) {
      case 'css':
        return this.exportToCSS(analysis);
      case 'scss':
        return this.exportToSCSS(analysis);
      case 'tailwind':
        return this.exportToTailwind(analysis);
      default:
        return JSON.stringify(analysis, null, 2);
    }
  }

  /**
   * Экспорт в CSS
   */
  private exportToCSS(analysis: StyleAnalysis): string {
    const { colorPalette } = analysis;
    return `:root {
  --color-primary: ${colorPalette.primary};
  --color-secondary: ${colorPalette.secondary};
  --color-accent: ${colorPalette.accent};
  --color-background: ${colorPalette.background};
  --color-surface: ${colorPalette.surface};
  --color-text: ${colorPalette.text};
  --color-text-secondary: ${colorPalette.textSecondary};
  --color-success: ${colorPalette.success};
  --color-warning: ${colorPalette.warning};
  --color-error: ${colorPalette.error};
  --color-info: ${colorPalette.info};
  
  --font-family: ${analysis.fontFamily};
  --font-weight: ${analysis.fontWeight};
  --border-radius: ${analysis.borderRadius};
  --spacing: ${analysis.spacing};
}`;
  }

  /**
   * Экспорт в SCSS
   */
  private exportToSCSS(analysis: StyleAnalysis): string {
    const { colorPalette } = analysis;
    return `// Style Analysis Export - ${analysis.theme} theme
$color-primary: ${colorPalette.primary};
$color-secondary: ${colorPalette.secondary};
$color-accent: ${colorPalette.accent};
$color-background: ${colorPalette.background};
$color-surface: ${colorPalette.surface};
$color-text: ${colorPalette.text};
$color-text-secondary: ${colorPalette.textSecondary};
$color-success: ${colorPalette.success};
$color-warning: ${colorPalette.warning};
$color-error: ${colorPalette.error};
$color-info: ${colorPalette.info};

$font-family: ${analysis.fontFamily};
$font-weight: ${analysis.fontWeight};
$border-radius: ${analysis.borderRadius};
$spacing: ${analysis.spacing};

// Color palette map
$colors: (
  'primary': $color-primary,
  'secondary': $color-secondary,
  'accent': $color-accent,
  'background': $color-background,
  'surface': $color-surface,
  'text': $color-text,
  'text-secondary': $color-text-secondary,
  'success': $color-success,
  'warning': $color-warning,
  'error': $color-error,
  'info': $color-info
);`;
  }

  /**
   * Экспорт в Tailwind CSS конфигурацию
   */
  private exportToTailwind(analysis: StyleAnalysis): string {
    const { colorPalette } = analysis;
    return `// Tailwind CSS Configuration Export
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${colorPalette.primary}',
        secondary: '${colorPalette.secondary}',
        accent: '${colorPalette.accent}',
        background: '${colorPalette.background}',
        surface: '${colorPalette.surface}',
        text: '${colorPalette.text}',
        'text-secondary': '${colorPalette.textSecondary}',
        success: '${colorPalette.success}',
        warning: '${colorPalette.warning}',
        error: '${colorPalette.error}',
        info: '${colorPalette.info}'
      },
      fontFamily: {
        'custom': [${analysis.fontFamily.split(',').map(f => `'${f.trim()}'`).join(', ')}]
      },
      borderRadius: {
        'custom': '${analysis.borderRadius}'
      }
    }
  }
}`;
  }

  /**
   * Очистка кешей
   */
  clearCache(): void {
    this.analysisCache.clear();
    this.colorCache.clear();
    console.log('🗑️ Style analyzer cache cleared');
  }

  /**
   * Получение статистики кеша
   */
  getCacheStats(): any {
    return {
      analysisCache: {
        size: this.analysisCache.size,
        timeout: this.cacheTimeout
      },
      colorCache: {
        size: this.colorCache.size,
        timeout: this.cacheTimeout
      }
    };
  }

  /**
   * Валидация качества анализа
   */
  validateAnalysisQuality(analysis: StyleAnalysis): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Проверка доступности
    if (analysis.accessibility.score < 7) {
      issues.push('Низкий балл доступности');
      score -= 20;
    }

    // Проверка контраста
    const contrast = this.calculateContrast(
      analysis.colorPalette.text,
      analysis.colorPalette.background
    );
    if (contrast < 4.5) {
      issues.push('Недостаточный контраст текста');
      score -= 25;
    }

    // Проверка полноты палитры
    const requiredColors = ['primary', 'background', 'text'];
    const missingColors = requiredColors.filter(
      color => !analysis.colorPalette[color as keyof ColorPalette]
    );
    if (missingColors.length > 0) {
      issues.push(`Отсутствуют цвета: ${missingColors.join(', ')}`);
      score -= 15 * missingColors.length;
    }

    // Проверка уверенности
    if (analysis.confidence < 0.7) {
      issues.push('Низкая уверенность анализа');
      score -= 10;
    }

    return {
      isValid: score >= 60,
      score: Math.max(0, score),
      issues
    };
  }
}

export function createStyleAnalyzer(supabaseUrl: string, supabaseKey: string) {
  return new StyleAnalyzer(supabaseUrl, supabaseKey);
}// ====== Enhanced modules/styleAnalyzer.ts ======
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient?: {
    start: string;
    end: string;
    direction: string;
  };
}

export interface StyleAnalysis {
  colorPalette: ColorPalette;
  theme: 'light' | 'dark' | 'neon' | 'minimal' | 'gradient' | 'retro' | 'cyberpunk';
  fontFamily: string;
  fontWeight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  mood: 'professional' | 'playful' | 'elegant' | 'modern' | 'retro' | 'aggressive' | 'calming';
  borderRadius: string;
  spacing: 'tight' | 'normal' | 'loose' | 'custom';
  complexity: 'minimal' | 'moderate' | 'complex' | 'maximalist';
  contrast: 'low' | 'medium' | 'high';
  accessibility: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  emotions: string[];
  keywords: string[];
  confidence: number;
  metadata: {
    dominantColors: string[];
    colorHarmony: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary';
    temperature: 'warm' | 'cool' | 'neutral';
    saturation: 'low' | 'medium' | 'high';
    brightness: 'dark' | 'medium' | 'bright';
  };
}

export interface AdvancedColorAnalysis {
  dominantColors: Array<{
    color: string;
    percentage: number;
    name: string;
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  }>;
  colorHarmony: string;
  emotionalImpact: string[];
  brandPersonality: string[];
  recommendedPalettes: ColorPalette[];
}

export interface StyleTrend {
  name: string;
  popularity: number;
  characteristics: string[];
  suitableFor: string[];
  examples: ColorPalette[];
}

export class StyleAnalyzer {
  private supabase: any;
  private analysisCache: Map<string, StyleAnalysis> = new Map();
  private colorCache: Map<string, AdvancedColorAnalysis> = new Map();
  private cacheTimeout: number = 30 * 60 * 1000; // 30 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Расширенный анализ стилей из изображения с AI vision
   */
  async analyzeImageStyle(imageUrl: string, options: {
    includeAdvancedAnalysis?: boolean;
    contextHint?: string;
    targetAudience?: string;
  } = {}): Promise<StyleAnalysis> {
    console.log('🎨 Analyzing image style with advanced AI...');
    
    const cacheKey = `image_${this.hashUrl(imageUrl)}_${JSON.stringify(options)}`;
    
    if (this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey)!;
      console.log('📊 Using cached image analysis');
      return cached;
    }

    try {
      const openaiApiKey = Deno.env.get('OPENA_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Создаем расширенный промпт для анализа
      const analysisPrompt = this.buildAdvancedImageAnalysisPrompt(options);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: { 
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }],
          max_tokens: 800,
          temperature: 0.4
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      // Парсим и обогащаем результат
      let analysis = this.parseAnalysisResponse(content);
      
      if (options.includeAdvancedAnalysis) {
        analysis = await this.enrichWithAdvancedAnalysis(analysis, imageUrl);
      }

      // Добавляем проверку доступности
      analysis.accessibility = this.analyzeAccessibility(analysis.colorPalette);

      // Кешируем результат
      this.analysisCache.set(cacheKey, analysis);
      
      console.log('✅ Advanced image style analysis completed');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing image style:', error);
      return this.getEnhancedDefaultAnalysis('image_fallback');
    }
  }

  /**
   * Интеллектуальный анализ стилей по текстовому описанию
   */
  async analyzeTextStyle(
    description: string, 
    options: {
      includeEmotionalAnalysis?: boolean;
      brandContext?: string;
      industryContext?: string;
      targetDemographic?: string;
    } = {}
  ): Promise<StyleAnalysis> {
    console.log('📝 Analyzing text style with emotional intelligence...');
    
    const cacheKey = `text_${this.hashString(description)}_${JSON.stringify(options)}`;
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    try {
      const openaiApiKey = Deno.env.get('OPENA_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      // Создаем контекстуальный промпт
      const contextualPrompt = this.buildContextualTextPrompt(description, options);

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
            content: 'You are an expert color psychologist and UI/UX designer specializing in Web3 and cryptocurrency interfaces. You understand color theory, emotional impact, and accessibility requirements.'
          }, {
            role: 'user',
            content: contextualPrompt
          }],
          max_tokens: 700,
          temperature: 0.5
        })
      });

      const aiResponse = await response.json();
      const content = aiResponse.choices[0].message.content;
      
      let analysis = this.parseAnalysisResponse(content);
      
      // Добавляем эмоциональный анализ
      if (options.includeEmotionalAnalysis) {
        analysis.emotions = await this.analyzeEmotionalImpact(description);
      }

      // Добавляем анализ доступности
      analysis.accessibility = this.analyzeAccessibility(analysis.colorPalette);

      // Добавляем ключевые слова из описания
      analysis.keywords = this.extractKeywords(description);

      this.analysisCache.set(cacheKey, analysis);
      
      console.log('✅ Text style analysis completed with emotional intelligence');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error analyzing text style:', error);
      return this.getEnhancedDefaultAnalysis('text_fallback');
    }
  }

  /**
   * Анализ трендов и рекомендации стилей
   */
  async analyzeTrends(
    currentStyle?: StyleAnalysis,
    industry: string = 'crypto'
  ): Promise<StyleTrend[]> {
    console.log('📈 Analyzing current style trends...');

    try {
      // Получаем текущие тренды из базы данных
      const { data: trendsData } = await this.supabase
        .from('style_trends')
        .select('*')
        .eq('industry', industry)
        .order('popularity', { ascending: false })
        .limit(10);

      if (trendsData && trendsData.length > 0) {
        return trendsData;
      }

      // Fallback: создаем актуальные тренды
      return this.getCurrentStyleTrends(industry);
    } catch (error) {
      console.error('❌ Error analyzing trends:', error);
      return this.getCurrentStyleTrends(industry);
    }
  }

  /**
   * Сравнение стилей и рекомендации
   */
  async compareStyles(
    style1: StyleAnalysis,
    style2: StyleAnalysis
  ): Promise<{
    similarity: number;
    differences: string[];
    recommendations: string[];
    betterFor: { [key: string]: string };
  }> {
    console.log('⚖️ Comparing styles...');

    const similarity = this.calculateStyleSimilarity(style1, style2);
    const differences = this.identifyStyleDifferences(style1, style2);
    const recommendations = this.generateComparisonRecommendations(style1, style
