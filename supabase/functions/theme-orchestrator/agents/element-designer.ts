import type { ColorAnalysis, BackgroundResult, ElementStyle } from "../shared/types.ts";

const PHANTOM_ELEMENT_MAP: Record<string, { x: number; y: number; w: number; h: number }> = {
  "background-layer":  { x: 0,   y: 0,   w: 380, h: 600 },
  "header":            { x: 0,   y: 0,   w: 380, h: 60  },
  "network-badge":     { x: 16,  y: 18,  w: 80,  h: 24  },
  "account-address":   { x: 16,  y: 72,  w: 280, h: 32  },
  "balance-sol":       { x: 0,   y: 120, w: 380, h: 48  },
  "balance-usd":       { x: 0,   y: 168, w: 380, h: 24  },
  "btn-send":          { x: 20,  y: 210, w: 80,  h: 72  },
  "btn-receive":       { x: 110, y: 210, w: 80,  h: 72  },
  "btn-swap":          { x: 200, y: 210, w: 80,  h: 72  },
  "btn-buy":           { x: 290, y: 210, w: 80,  h: 72  },
  "token-list-item":   { x: 0,   y: 300, w: 380, h: 56  },
};

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

function buildFallbackElements(ca: ColorAnalysis): Record<string, ElementStyle> {
  const { safe_text, safe_accent, safe_button_bg, palette, luminance } = ca;
  const glass: ElementStyle = {
    style: {
      type: "glassmorphism",
      fill: luminance === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      fill_opacity: 0.08, blur: 12,
      border_color: luminance === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
      border_width: 1, border_radius: 12,
    },
    text: { color: safe_text, size: 14, weight: 400, opacity: 1 },
    animation: { type: "none", duration_ms: 0, loop: false },
  };
  const btn: ElementStyle = {
    style: { type: "solid", fill: safe_button_bg, fill_opacity: 1, border_radius: 16, border_color: safe_accent, border_width: 1 },
    text: { color: safe_text, size: 12, weight: 600, opacity: 1 },
    animation: { type: "shimmer", duration_ms: 2000, loop: true, color: safe_accent },
    icon: { tint: safe_accent, opacity: 1 },
  };
  return {
    "background-layer": { style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 } },
    "header": { ...glass, style: { ...glass.style, border_radius: 0 } },
    "network-badge": {
      style: { type: "solid", fill: palette.secondary, fill_opacity: 1, border_radius: 12, border_color: safe_accent, border_width: 1 },
      text: { color: safe_accent, size: 11, weight: 500, opacity: 1 },
    },
    "account-address": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 8 },
      text: { color: safe_text, size: 13, weight: 400, opacity: 0.7 },
    },
    "balance-sol": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 32, weight: 700, opacity: 1 },
      animation: { type: "float", duration_ms: 3000, loop: true },
    },
    "balance-usd": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 14, weight: 400, opacity: 0.6 },
    },
    "btn-send": { ...btn },
    "btn-receive": { ...btn },
    "btn-swap": { ...btn, style: { ...btn.style, fill: palette.primary, border_color: safe_text } },
    "btn-buy": { ...btn, animation: { type: "glow", duration_ms: 1500, loop: true, color: safe_accent } },
    "token-list-item": {
      style: { type: "glassmorphism", fill: "rgba(255,255,255,0.04)", fill_opacity: 0.04, blur: 8, border_radius: 12, border_color: "rgba(255,255,255,0.08)", border_width: 1 },
      text: { color: safe_text, size: 14, weight: 400, opacity: 1 },
    },
  };
}

export async function runElementDesigner(
  userPrompt: string,
  colorAnalysis: ColorAnalysis,
  background: BackgroundResult
): Promise<Record<string, ElementStyle>> {
  const apiKey = getAPIKey();
  if (!apiKey) return buildFallbackElements(colorAnalysis);

  const systemPrompt = `You are a senior Web3 UI designer creating overlay themes for the Phantom crypto wallet.

PHANTOM ELEMENT MAP (380x600px frame):
${JSON.stringify(PHANTOM_ELEMENT_MAP, null, 2)}

COLOR ANALYSIS:
${JSON.stringify(colorAnalysis, null, 2)}

RULES:
1. NEVER use forbidden: ${colorAnalysis.forbidden.join(", ")}
2. All text → safe_text: ${colorAnalysis.safe_text}
3. Buttons → safe_button_bg: ${colorAnalysis.safe_button_bg} or safe_accent: ${colorAnalysis.safe_accent}
4. Luminance is "${colorAnalysis.luminance}" → use ${colorAnalysis.luminance === "dark" ? "light text/borders" : "dark text/borders"}
5. Every button MUST look visually distinct from background
6. background-layer MUST be type "transparent" (the actual image is already behind all elements)

STYLE TYPES: glassmorphism | solid | gradient | neon | neumorphic | transparent
ANIMATIONS: none | pulse | shimmer | glow | ripple | bounce | float

Return ONLY valid JSON object — all 11 element IDs required:
{ "[element_id]": { style:{...}, text?:{...}, animation?:{...}, icon?:{...} } }`;

  try {
    const res = await fetch(`${getAPIBase()}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: 3000,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Design a "${userPrompt}" theme. Background type: ${background.type}, opacity: ${background.opacity}. Return ONLY the JSON object for all 11 elements.` },
        ],
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    const content: string = data.choices[0].message.content;
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in designer response");

    const elements = JSON.parse(match[0]) as Record<string, ElementStyle>;
    console.log("[element-designer] Done. Elements:", Object.keys(elements).join(", "));
    return elements;
  } catch (e) {
    console.warn("[element-designer] Failed:", e, "— using fallback");
    return buildFallbackElements(colorAnalysis);
  }
}
