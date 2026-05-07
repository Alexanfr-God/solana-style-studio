import type { ColorAnalysis, BackgroundResult, ElementStyle } from "../shared/types.ts";
import { callClaudeJSON } from "../shared/llm.ts";
import type { DesignSystem } from "../design-systems/index.ts";

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

const FONT_CATALOG = `
FONT CATALOG — pick the family that fits the aesthetic:
Crypto / Web3  : "Orbitron", "Space Grotesk", "Space Mono"
Futuristic     : "Exo 2", "Rajdhani", "Audiowide"
Gaming / Retro : "Press Start 2P", "VT323", "Silkscreen"
Elegant        : "Playfair Display", "Cormorant Garamond"
Urban / Bold   : "Bebas Neue", "Anton", "Black Ops One"
Minimal / Clean: "DM Sans", "Manrope", "Syne", "Inter", "Geist Sans"
Default        : "Inter"
`;

const MOOD_FONTS: Record<string, string> = {
  cyberpunk: "Orbitron", neon: "Rajdhani", retro: "VT323",
  gaming: "Press Start 2P", pixel: "VT323",
  elegant: "Playfair Display", luxury: "Cormorant Garamond",
  minimal: "Inter", clean: "Inter",
  urban: "Bebas Neue", street: "Anton",
  space: "Audiowide", futuristic: "Exo 2",
  default: "Inter",
};

function getMoodFont(mood?: string): string {
  if (!mood) return MOOD_FONTS.default;
  const lower = mood.toLowerCase();
  for (const [key, font] of Object.entries(MOOD_FONTS)) {
    if (lower.includes(key)) return font;
  }
  return MOOD_FONTS.default;
}

function buildFallbackElements(ca: ColorAnalysis): Record<string, ElementStyle> {
  const { safe_text, safe_accent, safe_button_bg, palette, luminance, mood } = ca;
  const font = getMoodFont(mood);
  const glassAlpha = luminance === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const borderAlpha = luminance === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const subtleGlow = `0 0 14px ${safe_accent}40`;

  const glass: ElementStyle = {
    style: {
      type: "glassmorphism",
      fill: glassAlpha, fill_opacity: 0.05, blur: 18,
      border_color: borderAlpha, border_width: 1, border_radius: 12,
    },
    text: { color: safe_text, size: 14, weight: 400, opacity: 1, fontFamily: font },
    animation: { type: "none", duration_ms: 0, loop: false },
  };

  const btn: ElementStyle = {
    style: {
      type: "gradient",
      fill: safe_button_bg, fill_opacity: 1,
      gradient: { from: safe_button_bg, to: palette.primary, angle: 135 },
      border_radius: 22, border_color: borderAlpha, border_width: 1,
    },
    text: { color: "#ffffff", size: 12, weight: 600, opacity: 1, fontFamily: font, textTransform: "uppercase" },
    animation: { type: "shimmer", duration_ms: 2400, loop: true, color: safe_accent, easing: "ease-in-out" },
    icon: { tint: "#ffffff", opacity: 0.9 },
  };

  const heroBtn: ElementStyle = {
    ...btn,
    style: {
      ...btn.style,
      gradient: { from: palette.primary, to: `${safe_accent}cc`, angle: 135 },
    },
    animation: { type: "glow", duration_ms: 2000, loop: true, color: safe_accent, intensity: 0.4, easing: "ease-in-out" },
  };

  return {
    "background-layer": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
    },
    "header": {
      ...glass,
      style: { ...glass.style, border_radius: 0, blur: 20, fill: glassAlpha, fill_opacity: 0.04 },
    },
    "network-badge": {
      style: {
        type: "solid",
        fill: `${safe_accent}22`, fill_opacity: 0.13,
        border_radius: 12, border_color: `${safe_accent}40`, border_width: 1,
      },
      text: { color: safe_accent, size: 11, weight: 600, opacity: 1, fontFamily: font, textTransform: "uppercase" },
      animation: { type: "none", duration_ms: 0, loop: false },
    },
    "account-address": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 8 },
      text: { color: safe_text, size: 12, weight: 400, opacity: 0.6, fontFamily: "Space Mono" },
    },
    "balance-sol": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 40, weight: 800, opacity: 1, fontFamily: font, textShadow: subtleGlow, lineHeight: 1.1 },
      animation: { type: "float", duration_ms: 3400, loop: true, easing: "ease-in-out" },
    },
    "balance-usd": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
      text: { color: safe_text, size: 14, weight: 400, opacity: 0.55, fontFamily: font },
      animation: { type: "float", duration_ms: 3400, loop: true, delay_ms: 160, easing: "ease-in-out" },
    },
    "btn-send":    { ...btn, animation: { ...btn.animation!, delay_ms: 0   } },
    "btn-receive": { ...btn, animation: { ...btn.animation!, delay_ms: 120 } },
    "btn-swap":    { ...btn, animation: { ...btn.animation!, delay_ms: 240 } },
    "btn-buy":     heroBtn,
    "token-list-item": {
      style: {
        type: "glassmorphism", fill: "rgba(255,255,255,0.03)", fill_opacity: 0.03,
        blur: 8, border_radius: 12, border_color: "rgba(255,255,255,0.07)", border_width: 1,
      },
      text: { color: safe_text, size: 14, weight: 400, opacity: 0.9, fontFamily: font },
      animation: { type: "none", duration_ms: 0, loop: false },
    },
  };
}

function buildSystemPrompt(colorAnalysis: ColorAnalysis, ds?: DesignSystem): string {
  const dsBlock = ds
    ? `\n# Reference Design System: ${ds.name}\n\nUse this as your PRIMARY reference. Color values, typography choices, component\nshapes, and motion principles below override your default instincts. Match this\nsystem's aesthetic precisely.\n\n\`\`\`md\n${ds.content}\n\`\`\`\n`
    : "";

  return `You are a Senior Product Designer at a top-tier fintech studio. Your work is inspired by Linear, Vercel, and Stripe — refined, cohesive, modern.

You design overlay themes for the Phantom crypto wallet (380×600px transparent skin layered on top of real wallet UI).

PHANTOM ELEMENT MAP:
${JSON.stringify(PHANTOM_ELEMENT_MAP, null, 2)}

COLOR ANALYSIS FROM IMAGE:
${JSON.stringify(colorAnalysis, null, 2)}

${FONT_CATALOG}
${dsBlock}
STYLE TYPES: glassmorphism | solid | gradient | transparent
ANIMATIONS: none | shimmer | glow | float

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫  PROHIBITED — these patterns make themes look amateurish:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "neon" style type — FORBIDDEN. Use gradient or glassmorphism instead.
• Full-saturation fills: #FF00FF, #FF6600, #00FF00 etc.
  → ALWAYS desaturate. Use rgba(r,g,b,0.15-0.25) for container fills.
• textShadow on: header, network-badge, account-address, buttons, token-list-item
• animation on: header, network-badge, account-address, token-list-item
• fontSize > 16px for: header, network-badge, account-address, balance-usd, buttons
• fontSize outside 32-46px range for balance-sol
• Opaque borders: use rgba max 0.25 alpha for border_color
• "pulse" animation — FORBIDDEN completely. Use shimmer, glow, or float only.
• Bright orange, pink, or green as button background fill — use dark desaturated colors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  MANDATORY DESIGN RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. COLOR DISCIPLINE (60-30-10 rule):
   • 60% → near-transparent glassmorphism fills (rgba 0.04-0.08)
   • 30% → desaturated palette colors for borders/secondary fills (rgba 0.10-0.20)
   • 10% → accent tint ONLY on btn-buy glow + balance-sol textShadow
   • Button fills: gradient between two DARK/DESATURATED palette variants
   • NEVER use pure accent color as a solid fill for any container

2. TYPOGRAPHY SCALE (strictly enforce):
   • balance-sol: 36-44px, weight 700-800, ONE subtle textShadow max: "0 0 14px {color}40"
   • balance-usd: 13-15px, weight 400, opacity 0.55
   • header: 14px, weight 500
   • network-badge: 10-12px, weight 600, uppercase
   • buttons: 11-13px, weight 600, uppercase
   • account-address: 11-13px, weight 400, fontFamily "Space Mono" always

3. BUTTONS — cohesive pill design:
   • All 4 buttons: gradient style, border_radius ≥ 20 (pill shape)
   • gradient: from darker palette color → to slightly lighter variant
   • btn-send/receive/swap: same gradient, shimmer animation, delay_ms 0/100/200
   • btn-buy: slightly more vibrant gradient + glow animation (intensity 0.35-0.50)
   • All button text: color "#ffffff", weight 600, textTransform "uppercase"

4. HEADER: glassmorphism ONLY (blur 16-24), fill rgba 0.04-0.06
   border_radius: 0, border rgba at 0.08-0.12

5. ANIMATIONS: MAXIMUM 4 total — ALL others MUST be type "none":
   • balance-sol  → float (3000-3600ms)
   • balance-usd  → float (same ms, delay_ms 150-200)
   • btn-buy      → glow  (1800-2200ms, intensity 0.35-0.5)
   • btn-send     → shimmer (2000-2600ms)
   • network-badge, header, account-address, token-list-item → "none" ALWAYS

ELEMENT IDs to output (ALL 11 required):
background-layer, header, network-badge, account-address,
balance-sol, balance-usd, btn-send, btn-receive, btn-swap, btn-buy, token-list-item

SCHEMA per element:
{
  "style": { "type": string, "fill": string, "fill_opacity": number, "blur"?: number,
             "border_color"?: string, "border_width"?: number, "border_radius": number,
             "gradient"?: { "from": string, "to": string, "angle": number } },
  "text"?: { "color": string, "size": number, "weight": number, "opacity": number,
             "fontFamily"?: string, "textTransform"?: string, "textShadow"?: string,
             "lineHeight"?: number },
  "animation"?: { "type": string, "duration_ms": number, "loop": boolean,
                  "color"?: string, "delay_ms"?: number, "easing"?: string, "intensity"?: number },
  "icon"?: { "tint": string, "opacity": number }
}

Return ONLY a valid JSON object with ALL 11 element IDs. No markdown fences, no explanation.`;
}

export interface ElementDesignerInput {
  userPrompt: string;
  colorAnalysis: ColorAnalysis;
  background: BackgroundResult;
  designSystem?: DesignSystem;
}

export async function runElementDesigner(
  input: ElementDesignerInput
): Promise<Record<string, ElementStyle>> {
  const { userPrompt, colorAnalysis, background, designSystem } = input;

  const userMsg =
    `Design a professional "${userPrompt}" theme.\n` +
    `Mood: ${colorAnalysis.mood ?? "custom"} | Background: ${background.type} | Luminance: ${colorAnalysis.luminance}\n` +
    `Safe accent: ${colorAnalysis.safe_accent} | Button bg: ${colorAnalysis.safe_button_bg} | Text: ${colorAnalysis.safe_text}\n` +
    (designSystem ? `Reference design system: ${designSystem.name} (use as primary inspiration).\n` : "") +
    `\nCRITICAL: Refined, cohesive, elegant. Desaturated fills. 4 animations max (balance + 2 buttons only).\n` +
    `Return ONLY the JSON object for all 11 elements.`;

  try {
    const elements = await callClaudeJSON<Record<string, ElementStyle>>({
      system: buildSystemPrompt(colorAnalysis, designSystem),
      messages: [{ role: "user", content: userMsg }],
      maxTokens: 4000,
      temperature: 0.45,
    });
    console.log(
      `[element-designer] ✓ Elements: ${Object.keys(elements).join(", ")}` +
        (designSystem ? ` (using ${designSystem.id})` : "")
    );
    return elements;
  } catch (e) {
    console.warn("[element-designer] Claude failed:", (e as Error).message, "— using fallback");
    return buildFallbackElements(colorAnalysis);
  }
}
