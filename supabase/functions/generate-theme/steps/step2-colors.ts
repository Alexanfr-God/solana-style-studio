import type { ColorAnalysis } from "../../shared/types.ts";

function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  return key;
}

function getAPIBase(): string {
  if (Deno.env.get("OPENAI_API_KEY")) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}

const SYSTEM_PROMPT = `You are a professional color analyst for UI design.
Analyze the provided image and return ONLY valid JSON — no markdown, no explanation.
Determine which colors are safe to use for UI elements overlaid on top of this image.

Return exactly this JSON structure:
{
  "dominant": ["#hex1", "#hex2", "#hex3"],
  "luminance": "dark" | "light" | "mixed",
  "forbidden": ["#hex1", "#hex2"],
  "forbidden_reason": "colors too similar to background",
  "safe_text": "#hex",
  "safe_accent": "#hex",
  "safe_button_bg": "#hex",
  "complementary": "#hex",
  "palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "neutral": "#hex",
    "highlight": "#hex"
  }
}

Rules:
- forbidden[] = any color within 30 delta-E of the dominant background colors
- safe_text must have contrast ratio >= 4.5:1 against the most common background area
- safe_accent must be complementary or triadic to dominant, high saturation
- luminance "dark" = most pixels below 50% lightness
- palette colors must all work visually against the image`;

function fallbackColorAnalysis(): ColorAnalysis {
  return {
    dominant: ["#131217", "#1e1c23", "#2a2832"],
    luminance: "dark",
    forbidden: ["#131217", "#1e1c23"],
    forbidden_reason: "fallback — color analysis unavailable",
    safe_text: "#ffffff",
    safe_accent: "#ab9ff2",
    safe_button_bg: "#2a2832",
    complementary: "#9ff2ab",
    palette: {
      primary: "#ab9ff2",
      secondary: "#2a2832",
      neutral: "#888888",
      highlight: "#ffffff",
    },
  };
}

export async function analyzeColors(
  imageUrl: string,
  userPrompt: string
): Promise<ColorAnalysis> {
  console.log("[step2] Analyzing colors for image:", imageUrl);

  const apiKey = getOpenAIKey();
  const apiBase = getAPIBase();

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 600,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "low" },
              },
              {
                type: "text",
                text: `User theme request: "${userPrompt}". Analyze colors and return JSON only.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[step2] GPT-4o error:", err);
      return fallbackColorAnalysis();
    }

    const data = await response.json();
    const text: string = data.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    console.log("[step2] Color analysis complete:", parsed.luminance, parsed.dominant);
    return parsed as ColorAnalysis;
  } catch (e) {
    console.error("[step2] Color analysis failed, using fallback:", e);
    return fallbackColorAnalysis();
  }
}
