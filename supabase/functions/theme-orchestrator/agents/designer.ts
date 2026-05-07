import type { DesignBrief } from "../shared/types.ts";
import { callClaudeJSON } from "../shared/llm.ts";
import type { DesignSystem } from "../design-systems/index.ts";

const BASE_SYSTEM_PROMPT = `You are a Senior Visual Designer specializing in crypto wallet UI/UX with 10+ years of experience in Web3 product design.

Your job: translate a user's creative request into a precise visual design brief that the rest of the AI pipeline will execute.

You are designing a theme for the Phantom wallet overlay — a 380×600px transparent skin layered on top of the real wallet UI.

Elements to describe:
- background: overall mood, atmosphere, dominant colors
- header: top bar (chain selector + avatar)
- buttons: action buttons (Send / Receive / Swap / Buy)
- balance: SOL balance + USD value display
- token_list: list of token rows

FONT CATALOG — pick one that fits the requested aesthetic:
Crypto/Web3: "Orbitron", "Space Grotesk", "Space Mono"
Futuristic:  "Exo 2", "Rajdhani", "Audiowide"
Gaming/Retro: "Press Start 2P", "VT323"
Elegant:     "Playfair Display", "Cormorant Garamond"
Urban/Bold:  "Bebas Neue", "Anton", "Black Ops One"
Minimal:     "DM Sans", "Manrope", "Syne", "Inter", "Geist Sans", "SF Pro Display"

OUTPUT — respond ONLY with valid JSON, no markdown fences:
{
  "visual_concept": "1-2 sentence vision of the complete design",
  "background": {
    "description": "detailed description of the background visual",
    "mood": "single word (e.g. dark/vibrant/minimal/cosmic/neon/ethereal)",
    "key_colors": ["#hex1", "#hex2", "#hex3"]
  },
  "typography": {
    "style": "describe the font personality in 5–10 words",
    "suggested_font": "one font name from the catalog above"
  },
  "elements": {
    "header": "visual description of the top bar",
    "buttons": "visual description including animation style",
    "balance": "how the balance numbers should look and feel",
    "token_list": "how token rows should appear",
    "overall_feel": "one sentence summing up the complete aesthetic"
  },
  "animation_style": "describe overall motion: subtle/energetic/hypnotic/pulsing/none",
  "design_rationale": "why this design perfectly fits the user's request"
}`;

function buildSystemPrompt(ds?: DesignSystem): string {
  if (!ds) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}

# Reference Design System: ${ds.name}

The user's prompt has been matched to this design system. Use it as your PRIMARY
reference. The brief you produce must respect this system's color philosophy,
typography choices, component vocabulary, and motion principles. Don't paraphrase
the file — internalize it and let it guide every value you propose.

\`\`\`md
${ds.content}
\`\`\``;
}

function buildFallbackBrief(prompt: string, ds?: DesignSystem): DesignBrief {
  return {
    visual_concept: `A custom Phantom wallet theme inspired by: "${prompt}"${ds ? ` in the ${ds.name} aesthetic` : ""}`,
    background: {
      description: "Dark atmospheric background with accent color glow",
      mood: "dark",
      key_colors: ["#131217", "#9945FF", "#14F195"],
    },
    typography: {
      style: "Modern, clean, crypto-native",
      suggested_font: "Inter",
    },
    elements: {
      header: "Semi-transparent dark header with subtle accent border",
      buttons: "Solid accent-colored buttons, no glow",
      balance: "Large prominent white balance, no shadow",
      token_list: "Clean rows with hairline borders",
      overall_feel: "Professional Web3 aesthetic, restrained and confident",
    },
    animation_style: "subtle",
    design_rationale: `Theme derived from the user's creative prompt`,
  };
}

export interface DesignerInput {
  userPrompt: string;
  imageUrl?: string;
  designSystem?: DesignSystem;
}

export async function runDesigner(input: DesignerInput): Promise<DesignBrief> {
  const { userPrompt, imageUrl, designSystem } = input;

  const userContent = imageUrl
    ? [
        {
          type: "text" as const,
          text: `The client uploaded this image as the wallet background. Analyze it visually and create a design brief that matches its aesthetic, mood, and color palette. Additional context: "${userPrompt}"`,
        },
        {
          type: "image" as const,
          source: { type: "url" as const, url: imageUrl },
        },
      ]
    : `Create a design brief for this wallet theme request: "${userPrompt}"`;

  try {
    const brief = await callClaudeJSON<DesignBrief>({
      system: buildSystemPrompt(designSystem),
      messages: [{ role: "user", content: userContent }],
      maxTokens: 1500,
      temperature: 0.7,
    });
    console.log(`[designer] ✓ Brief: ${brief.visual_concept}${designSystem ? ` (using ${designSystem.id})` : ""}`);
    return brief;
  } catch (e) {
    console.warn("[designer] Claude failed:", (e as Error).message, "— using fallback");
    return buildFallbackBrief(userPrompt, designSystem);
  }
}
