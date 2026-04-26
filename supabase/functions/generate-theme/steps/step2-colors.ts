import type { ColorAnalysis, BackgroundResult } from "../../shared/types.ts";

// Keyword-based color analysis when no image URL is available (gradient fallback)
const KEYWORD_PALETTES: Record<string, ColorAnalysis> = {
  glassmorphism: { dominant: ["#dce8f8","#a8c0e0","#ffffff"], luminance: "light", forbidden: ["#dce8f8","#a8c0e0"], forbidden_reason: "too close to background", safe_text: "#1a1a2e", safe_accent: "#6a5acd", safe_button_bg: "rgba(255,255,255,0.3)", complementary: "#ffd700", palette: { primary: "#6a5acd", secondary: "rgba(255,255,255,0.2)", neutral: "#666688", highlight: "#ffffff" } },
  minimal: { dominant: ["#f5f5f5","#e0e0e0","#ffffff"], luminance: "light", forbidden: ["#f5f5f5","#e0e0e0"], forbidden_reason: "too close to background", safe_text: "#111111", safe_accent: "#333333", safe_button_bg: "#222222", complementary: "#0066ff", palette: { primary: "#222222", secondary: "#666666", neutral: "#999999", highlight: "#000000" } },
  cyberpunk: { dominant: ["#0d0221","#4a0080","#001133"], luminance: "dark", forbidden: ["#0d0221","#001133"], forbidden_reason: "too dark", safe_text: "#00ffff", safe_accent: "#ff00ff", safe_button_bg: "#1a0040", complementary: "#ff00ff", palette: { primary: "#00ffff", secondary: "#ff00ff", neutral: "#4a0080", highlight: "#ffffff" } },
  gold: { dominant: ["#1a0a00","#3d2000","#5c3000"], luminance: "dark", forbidden: ["#1a0a00","#3d2000"], forbidden_reason: "too dark", safe_text: "#ffd700", safe_accent: "#ffaa00", safe_button_bg: "#2d1500", complementary: "#00aaff", palette: { primary: "#ffd700", secondary: "#ffaa00", neutral: "#8b6914", highlight: "#ffffff" } },
  ocean: { dominant: ["#001830","#002850","#003060"], luminance: "dark", forbidden: ["#001830","#002850"], forbidden_reason: "too dark", safe_text: "#00e5ff", safe_accent: "#00bcd4", safe_button_bg: "#003366", complementary: "#ff6600", palette: { primary: "#00bcd4", secondary: "#0288d1", neutral: "#005f7a", highlight: "#ffffff" } },
  fire: { dominant: ["#1a0000","#3d0500","#600a00"], luminance: "dark", forbidden: ["#1a0000","#3d0500"], forbidden_reason: "too dark", safe_text: "#ffcc00", safe_accent: "#ff6600", safe_button_bg: "#4d1200", complementary: "#00ccff", palette: { primary: "#ff6600", secondary: "#ff3300", neutral: "#8b2000", highlight: "#ffff00" } },
};

function keywordColorAnalysis(prompt: string): ColorAnalysis {
  const lower = prompt.toLowerCase();
  for (const [kw, palette] of Object.entries(KEYWORD_PALETTES)) {
    if (lower.includes(kw)) return palette;
  }
  // Default dark
  return { dominant: ["#131217","#1e1c23","#2a2832"], luminance: "dark", forbidden: ["#131217","#1e1c23"], forbidden_reason: "keyword fallback", safe_text: "#ffffff", safe_accent: "#ab9ff2", safe_button_bg: "#2a2832", complementary: "#9ff2ab", palette: { primary: "#ab9ff2", secondary: "#2a2832", neutral: "#888888", highlight: "#ffffff" } };
}

function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY")
    ?? Deno.env.get("OPENA_API_KEY")
    ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("No OpenAI/Lovable API key configured");
  return key;
}

function getAPIBase(): string {
  if (Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("OPENA_API_KEY")) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}

function getModel(forVision = false): string {
  if (Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("OPENA_API_KEY")) return "gpt-4o";
  return forVision ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash";
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
  userPrompt: string,
  background?: BackgroundResult
): Promise<ColorAnalysis> {
  // If no image URL (gradient background) — use keyword-based analysis
  if (!imageUrl || background?.type === "gradient") {
    console.log("[step2] No image URL, using keyword-based color analysis");
    return keywordColorAnalysis(userPrompt);
  }
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
        model: getModel(true),
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
