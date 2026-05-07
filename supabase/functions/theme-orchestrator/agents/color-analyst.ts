import type { BackgroundResult, ColorAnalysis } from "../shared/types.ts";
import { callClaudeJSON } from "../shared/llm.ts";

const SYSTEM_PROMPT = `You are a professional color analyst for UI/UX overlay design.
Analyze the image and determine which colors are SAFE for UI elements overlaid on top.
Return ONLY valid JSON — no markdown fences, no preamble, no explanation.

JSON schema (return EXACTLY these keys):
{
  "dominant": ["#hex", "#hex", "#hex"],
  "luminance": "dark" | "light" | "mixed",
  "luminance_value": number (0-100),
  "forbidden": ["#hex"],
  "forbidden_reason": "string",
  "safe_text": "#hex",
  "safe_text_secondary": "#hex",
  "safe_accent": "#hex",
  "safe_button_bg": "#hex",
  "safe_button_text": "#hex",
  "complementary": "#hex",
  "palette": { "primary": "#hex", "secondary": "#hex", "neutral": "#hex", "highlight": "#hex", "warning": "#hex" },
  "regions": { "top": "#hex", "center": "#hex", "bottom": "#hex" },
  "mood": "string describing aesthetic"
}

CRITICAL RULES:
1. forbidden[] must include any color within 30 RGB distance from dominant background
2. safe_text MUST achieve contrast ratio ≥ 4.5:1 against center region
3. safe_accent MUST be visually distinct from all dominant colors
4. dark luminance → safe_text light (#F5F5F5+); light luminance → safe_text dark (#1a1a1a)
5. NEVER set safe_button_bg the same as background`;

function buildFallbackAnalysis(prompt: string): ColorAnalysis {
  const lower = prompt.toLowerCase();
  if (lower.includes("gold") || lower.includes("bitcoin") || lower.includes("luxury")) {
    return {
      dominant: ["#1a0a00", "#3d2000", "#000000"],
      luminance: "dark", luminance_value: 15,
      forbidden: ["#c8a000", "#8b6914"],
      safe_text: "#FFD700", safe_text_secondary: "#FFC107",
      safe_accent: "#FFD700", safe_button_bg: "#3d2000", safe_button_text: "#FFD700",
      palette: { primary: "#FFD700", secondary: "#2a1400", neutral: "#1a0a00", highlight: "#FFC107" },
      mood: "luxury gold",
    };
  }
  if (lower.includes("cyberpunk") || lower.includes("neon")) {
    return {
      dominant: ["#0d0221", "#4a0080", "#000000"],
      luminance: "dark", luminance_value: 8,
      forbidden: ["#3a0070", "#0d0230"],
      safe_text: "#E0D4FF", safe_text_secondary: "#C084FC",
      safe_accent: "#00FFFF", safe_button_bg: "#4a0080", safe_button_text: "#ffffff",
      palette: { primary: "#A855F7", secondary: "#06B6D4", neutral: "#1e1e2e", highlight: "#00FFFF" },
      mood: "cyberpunk neon",
    };
  }
  return {
    dominant: ["#131217", "#1a1a2e"],
    luminance: "dark", luminance_value: 12,
    forbidden: ["#131217"],
    safe_text: "#ffffff", safe_text_secondary: "#a0a0b0",
    safe_accent: "#ab9ff2", safe_button_bg: "#ab9ff2", safe_button_text: "#000000",
    palette: { primary: "#ab9ff2", secondary: "#1a1a2e", neutral: "#888888", highlight: "#ab9ff2" },
    mood: "phantom default",
  };
}

export async function runColorAnalyst(
  background: BackgroundResult,
  userPrompt: string
): Promise<ColorAnalysis> {
  // No image (gradient/color background) → keyword fallback
  if (!background.url || background.type === "gradient") {
    console.log("[color-analyst] No image URL, using keyword fallback");
    return buildFallbackAnalysis(userPrompt);
  }

  try {
    const result = await callClaudeJSON<ColorAnalysis>({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: background.url } },
            { type: "text", text: `Theme intent: "${userPrompt}". Analyze colors and return JSON.` },
          ],
        },
      ],
      maxTokens: 1000,
      temperature: 0.3,
    });
    console.log("[color-analyst] Done. Luminance:", result.luminance, "Mood:", result.mood);
    return result;
  } catch (e) {
    console.warn("[color-analyst] Claude failed:", (e as Error).message, "— using fallback");
    return buildFallbackAnalysis(userPrompt);
  }
}
