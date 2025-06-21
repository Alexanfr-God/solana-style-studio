
// GPT chat handling logic
import { buildAdvancedWalletSystemPrompt, buildUserMessage } from '../utils/prompt-builder.ts';
import { extractAdvancedStyleChanges } from '../utils/json-parser.ts';

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
    // Build system prompt with design library integration
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
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Extract style changes
    const styleChanges = extractAdvancedStyleChanges(aiResponse, walletContext);

    return {
      success: true,
      response: aiResponse,
      styleChanges,
      mode: 'analysis'
    };
  } catch (error) {
    console.error('❌ Error in GPT chat processing:', error);
    return {
      success: false,
      error: error.message,
      mode: 'analysis'
    };
  }
}
