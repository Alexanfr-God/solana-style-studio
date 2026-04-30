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

// ── Font Catalog ──────────────────────────────────────────────────────────────
const FONT_CATALOG = `
FONT CATALOG — pick the family that fits the aesthetic:
Crypto / Web3 : "Orbitron", "Space Grotesk", "Space Mono"
Futuristic    : "Exo 2", "Rajdhani", "Audiowide"
Gaming / Retro: "Press Start 2P", "VT323", "Silkscreen"
Elegant       : "Playfair Display", "Cormorant Garamond"
Urban / Bold  : "Bebas Neue", "Anton", "Black Ops One"
Minimal/Clean : "DM Sans", "Manrope", "Syne"
Default       : "Space Grotesk"
`;

// ── Mood → Font heuristic for fallback ────────────────────────────────────────
const MOOD_FONTS: Record<string, string> = {
  cyberpunk: "Orbitron", neon: "Rajdhani", retro: "VT323",
  gaming: "Press Start 2P", pixel: "VT323",
  elegant: "Playfair Display", luxury: "Cormorant Garamond",
  minimal: "DM Sans", clean: "Manrope",
  urban: "Bebas Neue", street: "Anton",
  space: "Audiowide", futuristic: "Exo 2",
  default: "Space Grotesk",
};

function getMoodFont(mood?: string): string {
  if (!mood) return MOOD_FONTS.default;
  const lower = mood.toLowerCase();
  for (const [key, font] of Object.entries(MOOD_FONTS)) {
    if (lower.includes(key)) return font;
  }
  return MOOD_FONTS.default;
}

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
  const { safe_text, safe_accent, safe_button_bg, palette, luminance, mood } = ca;
  const font = getMoodFont(mood);
  const glassAlpha = luminance === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const borderAlpha = luminance === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";

  const glass: ElementStyle = {
    style: {
      type: "glassmorphism",
      fill: glassAlpha, fill_opacity: 0.08, blur: 14,
      border_color: borderAlpha, border_width: 1, border_radius: 12,
    },
    text: { color: safe_text, size: 14, weight: 400, opacity: 1, fontFamily: font },
    animation: { type: "none", duration_ms: 0, loop: false },
  };

  const btn: ElementStyle = {
    style: {
      type: "solid", fill: safe_button_bg, fill_opacity: 1,
      border_radius: 16, border_color: safe_accent, border_width: 1,
    },
    text: { color: safe_text, size: 12, weight: 700, opacity: 1, fontFamily: font, textTransform: "uppercase" },
    animation: { type: "shimmer", duration_ms: 2200, loop: true, color: safe_accent, easing: "ease-in-out" },
    icon: { tint: safe_accent, opacity: 1 },
  };

  const neonShadow = `0 0 8px ${safe_accent}, 0 0 20px ${safe_accent}80`;

  return {
    "background-layer": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
    },
    "header": {
      ...glass,
      style: { ...glass.style, border_radius: 0, blur: 16 },
      text: { ...glass.text!, textShadow: neonShadow },
    },
    "network-badge": {
      style: { type: "solid", fill: palette.secondary, fill_opacity: 1, border_radius: 12, border_color: safe_accent, border_width: 1 },
      text: { color: safe_accent, size: 11, weight: 600, opacity: 1, fontFamily: font, textTransform: "uppercase", letterSpacing: 0.05 },
      animation: { type: "pulse", duration_ms: 2000, loop: true, color: safe_accent, delay_ms: 300 },
    },
    "account-address": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 8 },
      text: { color: safe_text, size: 13, weight: 400, opacity: 0.65, fontFamily: "Space Mono", letterSpacing: 0.04 },
    },
    "balance-sol": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 36, weight: 800, opacity: 1, fontFamily: font, textShadow: neonShadow, lineHeight: 1.1 },
      animation: { type: "float", duration_ms: 3200, loop: true, easing: "ease-in-out" },
    },
    "balance-usd": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 14, weight: 400, opacity: 0.55, fontFamily: font },
      animation: { type: "float", duration_ms: 3200, loop: true, delay_ms: 160, easing: "ease-in-out" },
    },
    "btn-send": { ...btn, animation: { ...btn.animation!, delay_ms: 0 } },
    "btn-receive": { ...btn, animation: { ...btn.animation!, delay_ms: 100 } },
    "btn-swap": {
      ...btn,
      style: { ...btn.style, fill: palette.primary, border_color: safe_text },
      animation: { type: "ripple", duration_ms: 1800, loop: true, color: safe_accent, delay_ms: 200 },
    },
    "btn-buy": {
      ...btn,
      style: { ...btn.style, type: "neon", fill: safe_button_bg, border_color: safe_accent, border_width: 2 },
      text: { ...btn.text!, textShadow: neonShadow },
      animation: { type: "glow", duration_ms: 1600, loop: true, color: safe_accent, intensity: 0.9, delay_ms: 0 },
    },
    "token-list-item": {
      style: { type: "glassmorphism", fill: "rgba(255,255,255,0.04)", fill_opacity: 0.04, blur: 8, border_radius: 12, border_color: "rgba(255,255,255,0.08)", border_width: 1 },
      text: { color: safe_text, size: 14, weight: 400, opacity: 1, fontFamily: font },
      animation: { type: "none", duration_ms: 0, loop: false },
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

  const systemPrompt = `You are an avant-garde Web3 UI designer creating EXPERIMENTAL overlay themes for the Phantom crypto wallet.
Be BOLD and CREATIVE — don't default to generic dark/purple. Every theme should feel unique.

PHANTOM ELEMENT MAP (380×600px frame):
${JSON.stringify(PHANTOM_ELEMENT_MAP, null, 2)}

COLOR ANALYSIS:
${JSON.stringify(colorAnalysis, null, 2)}

${FONT_CATALOG}

STYLE TYPES: glassmorphism | solid | gradient | neon | neumorphic | transparent
ANIMATIONS : none | pulse | shimmer | glow | ripple | bounce | float

═══ DESIGN RULES ════════════════════════════════════════════════
1. NEVER use forbidden colors: ${colorAnalysis.forbidden.join(", ")}
2. All text → safe_text: ${colorAnalysis.safe_text} (contrast must pass)
3. Buttons → safe_button_bg or safe_accent — must be VISUALLY DISTINCT from background
4. background-layer MUST be type "transparent"
5. Luminance is "${colorAnalysis.luminance}" → ${colorAnalysis.luminance === "dark" ? "light text/borders on dark bg" : "dark text/borders on light bg"}

═══ TYPOGRAPHY RULES ════════════════════════════════════════════
• Always set text.fontFamily from the FONT CATALOG — pick what fits the mood
• balance-sol: large (32–48px), heavy weight (700–900), add textShadow for drama
• Buttons: uppercase textTransform, weight 600–800
• Monospace font (Space Mono) for account-address — crypto addresses look best mono

═══ ANIMATION RULES — MINIMUM 4 ANIMATED ELEMENTS ═══════════════
• btn-buy: "glow" — the hero CTA, most prominent
• btn-send / btn-receive / btn-swap: "shimmer" with staggered delay_ms (0, 100, 200, 300)
• balance-sol: "float" — gentle levitation
• balance-usd: "float" with delay_ms:160 for slight stagger
• network-badge: "pulse"
• token-list-item: "ripple" or "none"
• Use delay_ms to create staggered entrance feel

═══ EFFECT RULES ════════════════════════════════════════════════
• neon style: add textShadow: "0 0 8px {color}, 0 0 20px {color}80"
• glassmorphism: blur 14–24, border with alpha (rgba)
• gradient style: use style.gradient with from/to/angle
• For filter/transform (optional): style.filter e.g. "brightness(1.1) saturate(1.3)"

═══ SCHEMA ══════════════════════════════════════════════════════
Each element:
{
  "style": { "type":string, "fill":string, "fill_opacity":number, "blur"?:number,
             "border_color"?:string, "border_width"?:number, "border_radius":number,
             "shadow"?:{x,y,radius,spread,color}, "gradient"?:{from,to,angle},
             "filter"?:string, "transform"?:string },
  "text"?: { "color":string, "size":number, "weight":number, "opacity":number,
              "fontFamily"?:string, "textTransform"?:string, "textShadow"?:string,
              "lineHeight"?:number, "letter_spacing"?:number },
  "animation"?: { "type":string, "duration_ms":number, "loop":boolean,
                  "color"?:string, "delay_ms"?:number, "easing"?:string, "intensity"?:number },
  "icon"?: { "tint":string, "opacity":number }
}

Return ONLY a valid JSON object with ALL 11 element IDs. No markdown, no explanation.`;

  try {
    const res = await fetch(`${getAPIBase()}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: 4000,
        temperature: 0.75,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Design a "${userPrompt}" theme. Mood: ${colorAnalysis.mood ?? "custom"}. ` +
              `Background type: ${background.type}, opacity: ${background.opacity}. ` +
              `Be experimental — surprise me with the font and animation choices. ` +
              `Return ONLY the JSON object for all 11 elements.`,
          },
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
