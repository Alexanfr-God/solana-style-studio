
import type { ImageAnalysis } from "../types/ai.types.ts";

export class ImageAnalyzer {
  private openAIKey: string;

  constructor() {
    this.openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
    console.log('📸 ImageAnalyzer initialized');
  }

  async analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
    console.log('🔍 Analyzing image:', imageUrl);
    
    try {
      const analysis = await this.performVisionAnalysis(imageUrl);
      const colorPalette = await this.extractColorPalette(imageUrl);
      const moodProfile = this.analyzeMood(analysis);

      return {
        analysisId: crypto.randomUUID(),
        confidence: 0.85,
        processingTime: Date.now(),
        result: analysis,
        colorPalette,
        moodProfile
      };

    } catch (error) {
      console.error('❌ Image analysis error:', error);
      return this.getFallbackAnalysis(imageUrl);
    }
  }

  private async performVisionAnalysis(imageUrl: string): Promise<any> {
    if (!this.openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in visual design analysis. Analyze images for wallet UI customization, focusing on colors, mood, style, and design patterns. Return structured JSON.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for wallet UI design. Extract: 1) Color palette (dominant, accent, neutral), 2) Mood/energy level, 3) Design style, 4) Recommended UI elements. Return as JSON.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch {
      return this.parseTextAnalysis(content);
    }
  }

  private async extractColorPalette(imageUrl: string): Promise<any> {
    // Simplified color extraction - in production, use specialized color analysis API
    console.log('🎨 Extracting colors from image');
    
    return {
      dominant: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      accent: '#FFD93D',
      neutral: '#F8F9FA'
    };
  }

  private analyzeMood(analysis: any): any {
    console.log('😊 Analyzing mood from image analysis');
    
    // Extract mood from analysis or use default
    return {
      primary: analysis.mood || 'modern',
      energy: analysis.energy || 'medium',
      formality: analysis.formality || 'casual'
    };
  }

  private parseTextAnalysis(content: string): any {
    console.log('📝 Parsing text-based analysis');
    
    // Simple text parsing fallback
    const analysis = {
      style: 'modern',
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
      mood: 'energetic',
      recommendations: ['Use bold colors', 'Modern typography', 'Clean layouts']
    };

    // Try to extract colors from text
    const colorMatches = content.match(/#[A-Fa-f0-9]{6}/g);
    if (colorMatches) {
      analysis.colors = colorMatches.slice(0, 5);
    }

    // Try to extract mood keywords
    const moodKeywords = ['modern', 'classic', 'minimalist', 'bold', 'elegant', 'playful'];
    for (const keyword of moodKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        analysis.mood = keyword;
        break;
      }
    }

    return analysis;
  }

  private getFallbackAnalysis(imageUrl: string): ImageAnalysis {
    console.log('🔄 Using fallback analysis');
    
    return {
      analysisId: crypto.randomUUID(),
      confidence: 0.6,
      processingTime: Date.now(),
      result: {
        style: 'modern',
        description: 'Image analysis unavailable, using default styling',
        recommendations: ['Use neutral colors', 'Modern layout', 'Clean typography']
      },
      colorPalette: {
        dominant: ['#667080', '#9CA3AF', '#E5E7EB'],
        accent: '#3B82F6',
        neutral: '#F9FAFB'
      },
      moodProfile: {
        primary: 'neutral',
        energy: 'medium' as const,
        formality: 'casual' as const
      }
    };
  }

  async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && (contentType?.startsWith('image/') || false);
    } catch {
      return false;
    }
  }
}

export const imageAnalyzer = new ImageAnalyzer();
