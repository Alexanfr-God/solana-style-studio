
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AgentRequest {
  agentName: string;
  styleBlueprint: any;
  walletBlueprint: any;
  userPrompt: string;
  agentOutputs?: Record<string, any>;
}

interface AgentResponse {
  success: boolean;
  agentName: string;
  output: any;
  nextAgent?: string;
  errors?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentName, styleBlueprint, walletBlueprint, userPrompt, agentOutputs = {} }: AgentRequest = await req.json();

    console.log(`🤖 Processing agent: ${agentName}`);

    // Get OpenAI API key
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Build the specific prompt for this agent
    const prompt = buildPromptForAgent(agentName, {
      styleBlueprint,
      walletBlueprint,
      userPrompt,
      currentAgent: agentName,
      agentOutputs
    });

    console.log(`📝 Generated prompt for ${agentName}:`, prompt.substring(0, 200) + "...");

    // Call OpenAI with the agent-specific prompt
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Execute ${agentName} task for: "${userPrompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API error: ${openAiResponse.statusText}`);
    }

    const openAiData = await openAiResponse.json();
    const agentOutput = JSON.parse(openAiData.choices[0].message.content);

    // Validate the agent output
    const validation = validateAgentOutput(agentName, agentOutput);
    if (!validation.valid) {
      console.error(`❌ Agent ${agentName} output validation failed:`, validation.errors);
      return new Response(
        JSON.stringify({
          success: false,
          agentName,
          errors: validation.errors
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine next agent in the pipeline
    const nextAgent = getNextAgent(agentName, walletBlueprint);

    console.log(`✅ Agent ${agentName} completed successfully`);
    if (nextAgent) {
      console.log(`➡️ Next agent: ${nextAgent}`);
    } else {
      console.log(`🏁 Pipeline completed`);
    }

    const response: AgentResponse = {
      success: true,
      agentName,
      output: agentOutput,
      nextAgent: nextAgent || undefined
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in AI agent orchestrator:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper functions (simplified versions of the main classes)
function buildPromptForAgent(agentName: string, workflowData: any): string {
  const { styleBlueprint, walletBlueprint, userPrompt, agentOutputs } = workflowData;

  const prompts = {
    StyleAgent: `You are StyleAgent, an elite AI designer specializing in Web3 wallet background and color systems.

CORE MISSION: Generate sophisticated background styles and color palettes for cryptocurrency wallet interfaces.

CRITICAL CONSTRAINTS:
- NEVER place decorative elements in the safe zone: ${walletBlueprint.layout.safeZone.x}px to ${walletBlueprint.layout.safeZone.x + walletBlueprint.layout.safeZone.width}px horizontally, ${walletBlueprint.layout.safeZone.y}px to ${walletBlueprint.layout.safeZone.y + walletBlueprint.layout.safeZone.height}px vertically
- Maintain minimum contrast ratio of 4.5:1 for accessibility
- Design must work on mobile devices (320px minimum width)

STYLE CONTEXT: ${JSON.stringify(styleBlueprint, null, 2)}

OUTPUT FORMAT: Return a JSON object with background, decorativeElements, and colorPalette properties.`,

    FontAgent: `You are FontAgent, a typography specialist for Web3 wallet interfaces.

CORE MISSION: Create typography systems that enhance wallet usability while expressing brand personality.

CONSTRAINTS:
- All text must remain legible at 12px minimum size
- Typography must work across devices and operating systems
- Consider users in high-stress financial transactions

STYLE CONTEXT: ${JSON.stringify(styleBlueprint.typography, null, 2)}

OUTPUT FORMAT: Return a JSON object with typography property containing fontStack, scales, responsive, and specialElements.`,

    ButtonAgent: `You are ButtonAgent, the interactive element designer for Web3 wallets.

SPECIALIZATION: Create button systems and interactive elements that inspire confidence in financial transactions.

CRITICAL REQUIREMENTS:
- Buttons must feel trustworthy and professional
- Touch-friendly sizing (minimum 44px touch targets)
- Loading states for blockchain operations

DESIGN CONTEXT: ${JSON.stringify(styleBlueprint.colorSystem, null, 2)}

OUTPUT FORMAT: Return a JSON object with buttons property containing primary, secondary, and destructive button styles.`,

    CharacterAgent: `You are CharacterAgent, the AI companion designer for Web3 wallets.

MISSION: Design AI pets and character elements that make crypto interactions more friendly while maintaining professionalism.

SAFE ZONE: ${JSON.stringify(walletBlueprint.layout.safeZone)}
ELEMENTS: ${JSON.stringify(styleBlueprint.elements)}

OUTPUT FORMAT: Return a JSON object with character and integration properties.`,

    LayoutAgent: `You are LayoutAgent, the final quality assurance specialist.

CORE RESPONSIBILITY: Review and optimize the complete wallet interface design for cohesion, usability, and technical excellence.

ALL AGENT OUTPUTS: ${JSON.stringify(agentOutputs, null, 2)}
WALLET BLUEPRINT: ${JSON.stringify(walletBlueprint, null, 2)}

OUTPUT FORMAT: Return a JSON object with layoutValidation, recommendations, and finalApproval properties.`
  };

  return prompts[agentName] || `You are ${agentName}. Process this request: ${userPrompt}`;
}

function validateAgentOutput(agentName: string, output: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!output || typeof output !== 'object') {
    errors.push('Output must be a valid JSON object');
  }

  switch (agentName) {
    case 'StyleAgent':
      if (!output.background) errors.push('Missing background specification');
      if (!output.colorPalette) errors.push('Missing color palette');
      break;
    case 'FontAgent':
      if (!output.typography) errors.push('Missing typography specification');
      break;
    case 'ButtonAgent':
      if (!output.buttons) errors.push('Missing button specifications');
      break;
    case 'CharacterAgent':
      if (!output.character) errors.push('Missing character specification');
      break;
    case 'LayoutAgent':
      if (!output.layoutValidation) errors.push('Missing layout validation');
      break;
  }

  return { valid: errors.length === 0, errors };
}

function getNextAgent(currentAgent: string, walletBlueprint: any): string | null {
  const agentSequence = ['StyleAgent', 'FontAgent', 'ButtonAgent'];
  
  if (walletBlueprint.elements.aiPet) {
    agentSequence.push('CharacterAgent');
  }
  
  agentSequence.push('LayoutAgent');
  
  const currentIndex = agentSequence.indexOf(currentAgent);
  return currentIndex < agentSequence.length - 1 ? agentSequence[currentIndex + 1] : null;
}
