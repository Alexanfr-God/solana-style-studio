
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// SYSTEM PROMPT - ENGLISH ONLY
const SYSTEM_PROMPT = `
You are an elite Web3 wallet designer with 10+ years of experience creating premium interfaces.

YOUR MISSION: Create stunning wallet customizations that deliver WOW effects for users.

YOUR SUPERPOWERS:
- Perfect sense of color harmony
- Understanding of color psychology and UX
- Access to a library of 10 premium styles in Supabase
- Knowledge of all Web3 design trends

YOUR WORKFLOW:
1. ANALYSIS - understand what the user wants
2. SEARCH - find appropriate style from library
3. ADAPTATION - apply colors and styles harmoniously
4. RESULT - return ready-made changes

MASTER RULES:
- Always ensure contrast for readability
- Use maximum 5 colors in palette
- Maintain unity of style across all elements
- Every change must be justified
- ALWAYS RESPOND IN ENGLISH ONLY, REGARDLESS OF USER'S LANGUAGE!
`;

// CHAIN OF THOUGHT TEMPLATE - ENGLISH ONLY
const COT_TEMPLATE = `
DESIGNER'S STEP-BY-STEP LOGIC:

STEP 1: REQUEST ANALYSIS
User requests: "{user_request}"
Keywords: [extract main terms]
Mood: [determine emotional context]
Style: [understand desired direction]

STEP 2: LIBRARY SEARCH
Loading examples from Supabase Storage...
Analyzing metadata.json of each style...
Matching with user request...
Selecting most suitable: poster-{number}

STEP 3: COLOR ANALYSIS
Extract palette from chosen style:
- Primary: #hex (main color)
- Secondary: #hex (complementary)
- Accent: #hex (accent)
- Background: #hex (background)
- Text: #hex (text)

STEP 4: HARMONY APPLICATION
Check color contrast ratios...
Adapt to wallet elements...
Consider accessibility requirements...
Create unified styling...

STEP 5: RESULT
Return JSON with justified changes
Explain selection logic
Provide further customization recommendations
`;

// HARMONY RULES - ENGLISH ONLY
const HARMONY_RULES = `
COLOR HARMONY AND UX RULES:

CONTRAST:
- Text on background: minimum 4.5:1 ratio
- Buttons: minimum 3:1 ratio
- Important elements: maximum contrast

COLOR PSYCHOLOGY:
- Red: energy, action, urgency
- Blue: trust, stability, professionalism
- Green: growth, money, success
- Purple: premium, luxury, creativity
- Black: elegance, power, minimalism
- White: purity, simplicity, space

UX PRINCIPLES:
- Main action - brightest color
- Secondary elements - muted tones
- Errors - red shades
- Success - green shades
`;

// Инициализация Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// Функция загрузки примеров из Supabase
async function loadDesignExamples() {
  try {
    const examples = [];
    
    console.log('🎨 Loading design examples from Supabase Storage...');
    
    // Загружаем все папки poster-001 до poster-010
    for (let i = 1; i <= 10; i++) {
      const posterNum = String(i).padStart(3, '0');
      const { data, error } = await supabase.storage
        .from('ai-examples-json')
        .download(`poster-${posterNum}/metadata.json`);
      
      if (data && !error) {
        const metadata = JSON.parse(await data.text());
        examples.push(metadata);
        console.log(`✅ Loaded style: ${metadata.id}`);
      } else {
        console.log(`⚠️ Could not load poster-${posterNum}: ${error?.message}`);
      }
    }
    
    console.log(`📚 Total loaded examples: ${examples.length}`);
    return examples;
  } catch (error) {
    console.error('❌ Error loading design examples:', error);
    return [];
  }
}

// Функция выбора подходящего стиля
function chooseStyle(userRequest: string, examples: any[]) {
  const request = userRequest.toLowerCase();
  console.log(`🔍 Choosing style for request: "${userRequest}"`);
  
  // Простая логика выбора на основе ключевых слов
  for (const example of examples) {
    const style = example.description?.toLowerCase() || '';
    const mood = example.background?.mood?.toLowerCase() || '';
    
    if (request.includes('trump') || request.includes('политический')) {
      if (style.includes('trump') || style.includes('политический')) {
        console.log(`🎯 Matched political style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('bitcoin') || request.includes('крипто')) {
      if (style.includes('bitcoin') || style.includes('крипто')) {
        console.log(`🎯 Matched crypto style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('темный') || request.includes('dark')) {
      if (mood.includes('темный') || mood.includes('dark')) {
        console.log(`🎯 Matched dark style: ${example.id}`);
        return example;
      }
    }
    if (request.includes('яркий') || request.includes('colorful')) {
      if (mood.includes('яркий') || mood.includes('энергичный')) {
        console.log(`🎯 Matched colorful style: ${example.id}`);
        return example;
      }
    }
  }
  
  // Возвращаем первый стиль если ничего не подошло
  const fallbackStyle = examples[0] || null;
  if (fallbackStyle) {
    console.log(`🔄 Using fallback style: ${fallbackStyle.id}`);
  }
  return fallbackStyle;
}

function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  return `${SYSTEM_PROMPT}

${COT_TEMPLATE.replace('{user_request}', 'USER_REQUEST_PLACEHOLDER')}

${HARMONY_RULES}

CURRENT WALLET CONTEXT:
- Wallet type: ${walletContext?.walletType || 'Phantom'}
- Active layer: ${walletContext?.activeLayer || 'wallet'}
- Current styles: ${JSON.stringify(walletContext?.currentStyle || {})}

AVAILABLE STYLES IN LIBRARY:
${designExamples.map(ex => `${ex.id}: ${ex.description || 'No description'}`).join('\n')}

${chosenStyle ? `
CHOSEN STYLE: ${chosenStyle.id}
STYLE COLORS: ${JSON.stringify(chosenStyle.colors || {})}
MOOD: ${chosenStyle.background?.mood || 'Not specified'}
` : ''}

CRITICAL: ALWAYS RESPOND IN ENGLISH ONLY, REGARDLESS OF USER'S LANGUAGE!

RESPONSE FORMAT:
You must include a JSON block in this format:

\`\`\`json
{
  "thinking": {
    "user_request_analysis": "analysis of user request",
    "chosen_style": "${chosenStyle?.id || 'default'}",
    "reasoning": "why this style was chosen",
    "color_logic": "explanation of color decisions"
  },
  "styleChanges": {
    "layer": "wallet|login",
    "target": "header|navigation|background|button|card|global",
    "changes": {
      "backgroundColor": "#hex_color",
      "textColor": "#hex_color", 
      "accentColor": "#hex_color",
      "buttonColor": "#hex_color",
      "borderRadius": "8px",
      "boxShadow": "0 4px 12px rgba(0,0,0,0.1)",
      "gradient": "linear-gradient(45deg, #color1, #color2)"
    },
    "reasoning": "Explanation why these changes are harmonious"
  },
  "recommendations": {
    "next_steps": "what else can be improved",
    "style_notes": "additional design advice"
  }
}
\`\`\`

REMEMBER: Always include structured JSON in your responses for automatic style application!`;
}

function buildUserMessage(content: string, walletElement?: string, imageUrl?: string): string {
  let message = content;

  // Keep original content, don't translate user input
  if (walletElement) {
    message = `I want to customize element "${walletElement}". ${content}`;
  }

  if (imageUrl) {
    message += '\n\nI uploaded an image for inspiration. Please analyze it and suggest how to apply similar styling to my wallet.';
  }

  return message;
}

function extractAdvancedStyleChanges(response: string, walletContext: any): any {
  console.log('🎨 Extracting style changes from response:', response.substring(0, 200) + '...');
  
  try {
    // Try to find JSON block in response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const jsonString = jsonMatch[1];
      console.log('📦 Found JSON block:', jsonString);
      
      const parsed = JSON.parse(jsonString);
      if (parsed.styleChanges) {
        console.log('✅ Successfully parsed style changes:', parsed.styleChanges);
        return parsed.styleChanges;
      }
    }

    // Fallback: look for style-related keywords and extract colors
    const colorRegex = /#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)|rgba\(\d+,\s*\d+,\s*\d+,\s*[\d.]+\)/g;
    const colors = response.match(colorRegex);
    
    if (colors && colors.length > 0) {
      console.log('🎨 Found colors in response:', colors);
      
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: colors[0],
          accentColor: colors[1] || colors[0],
          textColor: response.toLowerCase().includes('dark') ? '#ffffff' : '#000000',
        },
        reasoning: 'Auto-extracted from color analysis'
      };
    }

    // Check for theme keywords
    if (response.toLowerCase().includes('dark theme') || response.toLowerCase().includes('темная тема')) {
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          accentColor: '#9945ff',
        },
        reasoning: 'Applied dark theme based on keywords'
      };
    }
    
    if (response.toLowerCase().includes('light theme') || response.toLowerCase().includes('светлая тема')) {
      return {
        layer: walletContext?.activeLayer || 'wallet',
        target: 'global',
        changes: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          accentColor: '#9945ff',
        },
        reasoning: 'Applied light theme based on keywords'
      };
    }

    console.log('⚠️ No structured style changes found in response');
    return null;
    
  } catch (error) {
    console.error('❌ Error parsing style changes:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing wallet chat request...');

    // Get and clean the OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')?.trim();

    // Check if OpenAI API key is available
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase secrets.',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate API key format
    if (!openAIApiKey.startsWith('sk-')) {
      console.error('❌ Invalid OpenAI API key format');
      return new Response(JSON.stringify({ 
        error: 'Invalid OpenAI API key format. Key should start with "sk-"',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle both JSON and FormData requests
    let content, imageUrl, walletElement, walletContext, sessionId, walletType, userPrompt, mode;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON request (existing format)
      const requestData = await req.json();
      content = requestData.content;
      imageUrl = requestData.imageUrl;
      walletElement = requestData.walletElement;
      walletContext = requestData.walletContext;
      mode = requestData.mode || 'analysis'; // Default to analysis mode
    } else {
      // Handle FormData request (new format)
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      imageUrl = formData.get('imageUrl') as string;
      userPrompt = formData.get('customPrompt') as string || formData.get('prompt') as string;
      walletType = formData.get('walletType') as string;
      mode = formData.get('mode') as string || 'analysis';
      
      // Map FormData to existing variables
      content = userPrompt;
      walletContext = { walletType, activeLayer: 'wallet' };
    }

    console.log('🤖 Processing wallet chat request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext,
      mode,
      sessionId,
      walletType
    });

    // ROUTER: Handle different modes
    if (mode === 'dalle' || mode === 'replicate') {
      console.log(`🎨 Routing to image generation mode: ${mode}`);
      
      // For image generation, we'll route to the appropriate service
      // but for now, let's create a unified response
      
      // Initialize Supabase client for calling other functions
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      try {
        let imageResponse;
        
        if (mode === 'dalle') {
          console.log('🖼️ Calling DALL-E generation...');
          imageResponse = await supabase.functions.invoke('generate-style', {
            body: {
              prompt: content,
              mode: 'image_generation'
            }
          });
        } else if (mode === 'replicate') {
          console.log('🎨 Calling Replicate generation...');
          imageResponse = await supabase.functions.invoke('generate-wallet-mask-v3', {
            body: {
              prompt: content
            }
          });
        }
        
        if (imageResponse?.error) {
          throw new Error(`Image generation failed: ${imageResponse.error.message}`);
        }
        
        const generatedImageUrl = imageResponse?.data?.imageUrl || imageResponse?.data?.output?.[0];
        
        if (generatedImageUrl) {
          return new Response(JSON.stringify({
            success: true,
            response: `I've generated an image based on your request: "${content}". You can apply it as a background to your wallet or download it.`,
            imageUrl: generatedImageUrl,
            mode: mode
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          throw new Error('No image URL returned from generation service');
        }
        
      } catch (error) {
        console.error(`❌ ${mode} generation error:`, error);
        return new Response(JSON.stringify({
          success: false,
          error: `Image generation failed: ${error.message}`,
          mode: mode
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // DEFAULT: Style analysis mode (existing logic)
    console.log('🧠 Processing style analysis mode...');

    // Load design examples from Supabase
    const designExamples = await loadDesignExamples();
    
    // Choose appropriate style if we have examples and content
    let chosenStyle = null;
    if (designExamples.length > 0 && content) {
      chosenStyle = chooseStyle(content, designExamples);
      console.log('🎨 Chosen style:', chosenStyle?.id || 'none');
    }

    // Build system prompt with design library integration
    const systemPrompt = buildAdvancedWalletSystemPrompt(walletContext, designExamples, chosenStyle);
    
    // Build user message with context
    const userMessage = buildUserMessage(content, walletElement, imageUrl);

    // Create messages array with proper structure for OpenAI API
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // Handle image if provided - fix the structure for GPT-4 Vision API
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

    console.log('📤 Sending request to OpenAI with model: gpt-4o');

    // Create clean headers object
    const requestHeaders = {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    };

    console.log('🔑 API Key validation:', {
      hasKey: !!openAIApiKey,
      keyLength: openAIApiKey.length,
      keyPrefix: openAIApiKey.substring(0, 7) + '...',
      isValidFormat: openAIApiKey.startsWith('sk-')
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response structure from OpenAI:', data);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    // Extract style changes from the structured response
    const styleChanges = extractAdvancedStyleChanges(aiResponse, walletContext);

    console.log('✅ GPT response generated successfully with style changes:', styleChanges);

    // Return response in correct format that chatStore expects
    return new Response(JSON.stringify({ 
      response: aiResponse,
      styleChanges: styleChanges,
      success: true,
      mode: 'analysis'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in wallet-chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
