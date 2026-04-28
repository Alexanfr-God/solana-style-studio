import type { BackgroundResult, ColorAnalysis } from "../shared/types.ts";

function getAPIKey() {
  return Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("OPENA_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY") ?? "";
}
function getAPIBase() {
  if (Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("OPENA_API_KEY")) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}
function getModel() {
  if (Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("OPENA_API_KEY")) return "gpt-4o";
  return "google/gemini-2.5-flash";
}

const SYSTEM_PROMPT = `You are a professional color analyst for UI/UX overlay design.
Analyze the image and determine which colors are SAFE for UI elements overlaid on top.
Return ONLY valid JSON — no markdown, no preamble.

JSON schema:
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
4. dark luminance → safe_text light (#F5F5F5+), light luminance → safe_text dark (#1a1a1a)
5. NEVER safe_button_bg the same as background`;

// Fallback when no image URL available (gradient background)
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
  // Default dark
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

export async function runColorAnalyst(background: BackgroundResult, userPrompt: string): Promise<ColorAnalysis> {
  // No image to analyze → keyword fallback
  if (!background.url || background.type === "gradient") {
    console.log("[color-analyst] No image URL, using keyword fallback");
    return buildFallbackAnalysis(userPrompt);
  }

  const apiKey = getAPIKey();
  if (!apiKey) return buildFallbackAnalysis(userPrompt);

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: [
        { type: "image_url", image_url: { url: background.url, detail: "high" } },
        { type: "text", text: `Theme intent: "${userPrompt}". Analyze colors and return JSON.` },
      ],
    },
  ];

  // Gemini via Lovable gateway doesn't support image_url in messages the same way
  // For non-OpenAI endpoints, use text-only with URL hint
  const isOpenAI = getAPIBase().includes("openai.com");
  if (!isOpenAI) {
    messages[1].content = `Theme intent: "${userPrompt}". Image: ${background.url}. Infer colors from the theme name and return the JSON color analysis.`;
  }

  try {
    const res = await fetch(`${getAPIBase()}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: 800,
        temperature: 0.3,
        messages,
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const content: string = data.choices[0].message.content;

    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");

    const result = JSON.parse(match[0]) as ColorAnalysis;
    console.log("[color-analyst] Done. Luminance:", result.luminance, "Mood:", result.mood);
    return result;
  } catch (e) {
    console.warn("[color-analyst] Failed:", e, "— using fallback");
    return buildFallbackAnalysis(userPrompt);
  }
}
