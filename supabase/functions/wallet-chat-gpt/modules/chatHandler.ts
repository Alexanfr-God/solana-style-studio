
// Fixed GPT chat handling logic with proper format conversion
import { buildAdvancedWalletSystemPrompt, buildUserMessage } from '../utils/prompt-builder.ts';
import { fixedStyleExtraction } from '../utils/json-parser.ts';

export async function processGPTChat(
  content: string,
  walletContext: any,
  walletElement?: string,
  imageUrl?: string,
  designExamples: any[] = [],
  chosenStyle: any = null,
  openAIApiKey: string = ''
) {
  try {
    console.log('🤖 Processing GPT chat with fixed system prompt...');
    
    // Build fixed system prompt
    const systemPrompt = buildAdvancedWalletSystemPrompt(walletContext, designExamples, chosenStyle);
    
    // Build user message with context
    const userMessage = buildUserMessage(content, walletElement, imageUrl);

    // Create messages array for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Handle image if provided
    if (imageUrl) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userMessage },
          { 
            type: 'image_url', 
            image_url: { 
              url: imageUrl,
              detail: 'low'
            }
          }
        ]
      };
    }

    console.log('🔥 Calling OpenAI with fixed prompt structure...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('🎨 AI Response received, parsing with fixed extractor...');

    // Use fixed style extraction
    const styleChanges = fixedStyleExtraction(aiResponse);

    console.log('✅ Fixed style changes extracted:', styleChanges ? 'SUCCESS' : 'FALLBACK');

    return {
      success: true,
      response: aiResponse,
      styleChanges,
      mode: 'analysis'
    };
  } catch (error) {
    console.error('❌ Error in fixed GPT chat processing:', error);
    return {
      success: false,
      error: error.message,
      mode: 'analysis'
    };
  }
}
