
import type { ImageAnalysis } from "../types/ai.types.ts";

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ImageAnalyzer::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class ImageAnalyzerAI {
  constructor() {
    log('Constructor', 'INFO', 'ImageAnalyzerAI initialized');
  }

  async analyzeImage(imageBase64: string): Promise<ImageAnalysis> {
    const analysisId = crypto.randomUUID();
    const startTime = Date.now();
    
    log('AnalyzeImage', 'INFO', 'Starting image analysis', { 
      analysisId,
      imageSize: imageBase64.length 
    });

    try {
      const validationResult = this.validateImageInput(imageBase64);
      if (!validationResult.valid) {
        throw new Error(`Invalid image input: ${validationResult.error}`);
      }

      log('AnalyzeImage', 'INFO', 'Image validation passed, calling GPT-4 Vision', { analysisId });
      
      const analysisResult = await this.callGPT4Vision(imageBase64);
      
      log('AnalyzeImage', 'INFO', 'GPT-4 Vision response received, validating result', { 
        analysisId,
        responseLength: JSON.stringify(analysisResult).length 
      });

      if (!this.validateAnalysisResult(analysisResult)) {
        throw new Error('Invalid analysis result structure from GPT-4 Vision');
      }

      const processingTime = Date.now() - startTime;
      
      const imageAnalysis: ImageAnalysis = {
        analysisId,
        confidence: analysisResult.confidence || 0.8,
        processingTime,
        result: analysisResult,
        colorPalette: {
          dominant: analysisResult.colorPalette?.dominant || ['#000000', '#FFFFFF'],
          accent: analysisResult.colorPalette?.accent || '#9945FF',
          neutral: analysisResult.colorPalette?.neutral || '#888888'
        },
        moodProfile: {
          primary: analysisResult.moodProfile?.primary || 'modern',
          energy: analysisResult.moodProfile?.energy || 'medium',
          formality: analysisResult.moodProfile?.formality || 'casual'
        }
      };

      log('AnalyzeImage', 'INFO', 'Image analysis completed successfully', { 
        analysisId,
        processingTime: `${processingTime}ms`,
        confidence: imageAnalysis.confidence,
        dominantColors: imageAnalysis.colorPalette.dominant.length
      });

      return imageAnalysis;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      log('AnalyzeImage', 'ERROR', 'Image analysis failed', { 
        analysisId,
        processingTime: `${processingTime}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  private validateImageInput(imageBase64: string): { valid: boolean; error?: string } {
    log('ValidateInput', 'DEBUG', 'Validating image input');
    
    if (!imageBase64) {
      return { valid: false, error: 'No image data provided' };
    }

    if (typeof imageBase64 !== 'string') {
      return { valid: false, error: 'Image data must be a string' };
    }

    if (!imageBase64.startsWith('data:image/')) {
      return { valid: false, error: 'Invalid image format, must be base64 data URL' };
    }

    if (imageBase64.length < 100) {
      return { valid: false, error: 'Image data too small' };
    }

    log('ValidateInput', 'DEBUG', 'Image input validation passed');
    return { valid: true };
  }

  private async callGPT4Vision(imageBase64: string): Promise<any> {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    log('GPT4Vision', 'INFO', 'Making request to OpenAI GPT-4 Vision API');

    const prompt = `Analyze this image for wallet UI customization. Return a JSON object with:

{
  "confidence": 0.0-1.0,
  "colorPalette": {
    "dominant": ["color1", "color2", "color3"],
    "accent": "accentColor",
    "neutral": "neutralColor"
  },
  "moodProfile": {
    "primary": "modern|classic|playful|professional",
    "energy": "high|medium|low", 
    "formality": "formal|casual|mixed"
  },
  "styleRecommendations": {
    "fonts": ["font1", "font2"],
    "spacing": "tight|normal|loose",
    "borderRadius": "sharp|rounded|circular",
    "shadows": "none|subtle|prominent"
  },
  "psychologicalProfile": {
    "trustLevel": "high|medium|low",
    "modernityScore": 0.0-1.0,
    "friendlinessScore": 0.0-1.0
  }
}

Focus on financial app UI design principles, user trust, and accessibility.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { 
                  type: 'image_url', 
                  image_url: { url: imageBase64 }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        log('GPT4Vision', 'ERROR', `OpenAI API error: ${response.status}`, { error: errorText });
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      log('GPT4Vision', 'INFO', 'OpenAI API response received', { 
        usage: data.usage,
        finishReason: data.choices[0]?.finish_reason 
      });

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      try {
        return JSON.parse(content);
      } catch (parseError) {
        log('GPT4Vision', 'ERROR', 'Failed to parse JSON response', { content });
        throw new Error('Invalid JSON response from GPT-4 Vision');
      }

    } catch (error) {
      log('GPT4Vision', 'ERROR', 'GPT-4 Vision API call failed', { error: error.message });
      throw error;
    }
  }

  private validateAnalysisResult(result: any): boolean {
    log('ValidateResult', 'DEBUG', 'Validating analysis result structure');
    
    if (!result || typeof result !== 'object') {
      log('ValidateResult', 'ERROR', 'Result is not an object');
      return false;
    }

    // Check required fields
    const requiredFields = ['confidence', 'colorPalette', 'moodProfile'];
    for (const field of requiredFields) {
      if (!(field in result)) {
        log('ValidateResult', 'ERROR', `Missing required field: ${field}`);
        return false;
      }
    }

    // Validate colorPalette
    if (!result.colorPalette.dominant || !Array.isArray(result.colorPalette.dominant)) {
      log('ValidateResult', 'ERROR', 'Invalid colorPalette.dominant');
      return false;
    }

    // Validate moodProfile
    if (!result.moodProfile.primary || !result.moodProfile.energy) {
      log('ValidateResult', 'ERROR', 'Invalid moodProfile structure');
      return false;
    }

    log('ValidateResult', 'DEBUG', 'Analysis result validation passed');
    return true;
  }
}

export const imageAnalyzer = new ImageAnalyzerAI();
