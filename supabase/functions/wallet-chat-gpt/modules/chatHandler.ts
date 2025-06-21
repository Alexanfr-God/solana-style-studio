
import type { WalletContext } from '../types/wallet.ts';
import type { GPTResponse } from '../types/responses.ts';
import { buildAdvancedWalletSystemPrompt, buildUserMessage, buildWowEffectPrompt } from '../utils/prompt-builder.ts';
import { analyzeStyleFromResponse, analyzeEnhancedStyleFromResponse } from './styleAnalyzer.ts';

export async function processGPTChat(
  content: string,
  walletContext: WalletContext,
  walletElement?: string,
  imageUrl?: string,
  designExamples?: any[],
  chosenStyle?: any,
  openAIApiKey?: string
): Promise<GPTResponse> {
  try {
    console.log('🤖 Processing enhanced GPT chat with detailed wallet structure...');
    console.log('🔑 Using OPENA_API_KEY for OpenAI chat completion');

    // Check if this is a WOW-effect request
    const wowEffectKeywords = ['wow', 'amazing', 'impressive', 'dramatic', 'cyberpunk', 'luxury', 'neon', 'cosmic', 'epic'];
    const isWowEffectRequest = wowEffectKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    // Get enhanced wallet structure and analysis
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch enhanced structure with detailed analysis
    const { data: structureData, error: structureError } = await supabaseClient.functions.invoke(
      'wallet-customization-structure',
      {
        method: 'POST',
        body: {
          action: 'build-gpt-prompt',
          userPrompt: content,
          walletType: walletContext.walletType || 'phantom',
          imageUrl
        }
      }
    );

    if (structureError) {
      console.warn('⚠️ Failed to get enhanced structure, using fallback');
    }

    let systemPrompt = '';
    let enhancedContext = walletContext;

    if (structureData?.success && structureData.enhancedPrompt) {
      console.log('✅ Using enhanced GPT prompt with detailed wallet analysis');
      systemPrompt = structureData.enhancedPrompt;
      enhancedContext = {
        ...walletContext,
        enhancedAnalysis: structureData.analysis,
        totalElements: structureData.analysis.totalElements,
        customizableElements: structureData.analysis.customizableElements
      };
    } else {
      console.log('📝 Using fallback prompt builder');
      systemPrompt = buildAdvancedWalletSystemPrompt(walletContext, designExamples || [], chosenStyle);
    }

    // Build user message with enhanced context or WOW-effect
    let userMessage = '';
    if (isWowEffectRequest) {
      console.log('✨ Applying WOW-effect enhancement to prompt');
      // Detect effect type from content
      const effectType = detectEffectType(content);
      const intensity = detectIntensity(content);
      userMessage = buildWowEffectPrompt(effectType, enhancedContext, intensity);
    } else {
      userMessage = buildUserMessage(content, walletElement, imageUrl);
    }

    console.log('📡 Sending enhanced request to OpenAI with detailed wallet context...');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Add image if provided
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Please analyze this image and apply similar styling to the wallet:' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('💥 OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ Enhanced GPT response received, processing with validation...');

    // Validate response if enhanced structure is available
    let validationResult = null;
    if (structureData?.success) {
      try {
        const parsedResponse = JSON.parse(
          aiResponse.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || '{}'
        );
        
        const { data: validationData } = await supabaseClient.functions.invoke(
          'wallet-customization-structure',
          {
            method: 'POST',
            body: {
              action: 'validate-customization',
              customization: parsedResponse,
              walletType: walletContext.walletType || 'phantom'
            }
          }
        );

        if (validationData?.success) {
          validationResult = validationData.validation;
          console.log('✅ Response validation completed');
        }
      } catch (validationError) {
        console.warn('⚠️ Response validation failed:', validationError);
      }
    }

    // Extract and validate style changes
    const styleChanges = analyzeEnhancedStyleFromResponse(aiResponse);
    
    if (!styleChanges) {
      console.warn('⚠️ No valid style changes found in enhanced response');
      return {
        response: aiResponse,
        styleChanges: null,
        success: false,
        mode: 'analysis',
        enhancedContext,
        validation: validationResult
      };
    }

    console.log('🎨 Enhanced style changes extracted and validated');

    return {
      response: aiResponse,
      styleChanges,
      success: true,
      mode: isWowEffectRequest ? 'wow-effect' : 'enhanced-analysis',
      enhancedContext,
      validation: validationResult,
      metadata: {
        totalElements: enhancedContext.totalElements,
        customizableElements: enhancedContext.customizableElements,
        validationPassed: validationResult?.isValid,
        warningsCount: validationResult?.warnings?.length || 0,
        wowEffect: isWowEffectRequest
      }
    };

  } catch (error) {
    console.error('💥 Enhanced GPT chat processing error:', error);
    return {
      response: `I encountered an error while processing your request: ${error.message}. Please try again.`,
      styleChanges: null,
      success: false,
      mode: 'error',
      error: error.message
    };
  }
}

// Helper functions for WOW-effect detection
function detectEffectType(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('cyberpunk') || contentLower.includes('matrix') || contentLower.includes('neon green')) {
    return 'cyberpunk';
  }
  if (contentLower.includes('luxury') || contentLower.includes('gold') || contentLower.includes('premium')) {
    return 'luxury';
  }
  if (contentLower.includes('neon') || contentLower.includes('electric') || contentLower.includes('bright')) {
    return 'neon';
  }
  if (contentLower.includes('cosmic') || contentLower.includes('space') || contentLower.includes('galaxy')) {
    return 'cosmic';
  }
  if (contentLower.includes('minimal') || contentLower.includes('clean') || contentLower.includes('simple')) {
    return 'minimal';
  }
  if (contentLower.includes('retro') || contentLower.includes('80s') || contentLower.includes('vintage')) {
    return 'retro';
  }
  
  // Default to neon for wow effects
  return 'neon';
}

function detectIntensity(content: string): 'subtle' | 'medium' | 'dramatic' {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('dramatic') || contentLower.includes('extreme') || contentLower.includes('bold')) {
    return 'dramatic';
  }
  if (contentLower.includes('subtle') || contentLower.includes('gentle') || contentLower.includes('soft')) {
    return 'subtle';
  }
  
  return 'medium'; // default
}
