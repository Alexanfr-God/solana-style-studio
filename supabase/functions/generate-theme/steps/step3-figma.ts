import { PHANTOM_ELEMENT_MAP } from "../../shared/phantomMap.ts";
import type { ColorAnalysis, BackgroundResult, ElementStyle } from "../../shared/types.ts";

function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  return key;
}

function getAPIBase(): string {
  if (Deno.env.get("OPENAI_API_KEY")) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}

function buildFallbackElements(colorAnalysis: ColorAnalysis): Record<string, ElementStyle> {
  const { safe_text, safe_accent, safe_button_bg, palette, luminance } = colorAnalysis;
  const headerBg = luminance === "dark"
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.06)";

  const base: ElementStyle = {
    style: {
      type: "glassmorphism",
      fill: headerBg,
      fill_opacity: 0.08,
      blur: 12,
      border_color: luminance === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
      border_width: 1,
      border_radius: 12,
    },
    text: { color: safe_text, size: 14, weight: 400, opacity: 1 },
    animation: { type: "none", duration_ms: 0, loop: false },
  };

  const btnStyle: ElementStyle = {
    style: {
      type: "solid",
      fill: safe_button_bg,
      fill_opacity: 1,
      border_radius: 16,
      border_color: safe_accent,
      border_width: 1,
    },
    text: { color: safe_text, size: 12, weight: 600, opacity: 1 },
    animation: { type: "shimmer", duration_ms: 2000, loop: true, color: safe_accent },
    icon: { tint: safe_accent, opacity: 1 },
  };

  return {
    "background-layer": {
      style: { type: "transparent", fill: "transparent", fill_opacity: 0, border_radius: 0 },
    },
    "header": {
      ...base,
      style: { ...base.style, border_radius: 0 },
    },
    "network-badge": {
      style: {
        type: "solid",
        fill: palette.secondary,
        fill_opacity: 1,
        border_radius: 12,
        border_color: safe_accent,
        border_width: 1,
      },
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
    "btn-send": { ...btnStyle },
    "btn-receive": { ...btnStyle },
    "btn-swap": {
      ...btnStyle,
      style: { ...btnStyle.style, fill: palette.primary, border_color: safe_text },
    },
    "btn-buy": {
      ...btnStyle,
      animation: { type: "glow", duration_ms: 1500, loop: true, color: safe_accent },
    },
    "token-list-item": {
      style: {
        type: "glassmorphism",
        fill: "rgba(255,255,255,0.04)",
        fill_opacity: 0.04,
        blur: 8,
        border_radius: 12,
        border_color: "rgba(255,255,255,0.08)",
        border_width: 1,
      },
      text: { color: safe_text, size: 14, weight: 400, opacity: 1 },
    },
  };
}

export async function designInFigma(
  userPrompt: string,
  colorAnalysis: ColorAnalysis,
  background: BackgroundResult
): Promise<Record<string, ElementStyle>> {
  console.log("[step3] Designing elements with GPT-4o for prompt:", userPrompt);

  const apiKey = getOpenAIKey();
  const apiBase = getAPIBase();

  const systemPrompt = `You are a senior Web3 UI designer creating overlay themes for the Phantom crypto wallet.

PHANTOM ELEMENT MAP (positions in 380x600px frame):
${JSON.stringify(PHANTOM_ELEMENT_MAP, null, 2)}

COLOR ANALYSIS FROM BACKGROUND:
${JSON.stringify(colorAnalysis, null, 2)}

CRITICAL RULES:
1. NEVER use these forbidden colors: ${colorAnalysis.forbidden.join(", ")}
2. Text must use safe_text: ${colorAnalysis.safe_text}
3. Buttons must use safe_button_bg: ${colorAnalysis.safe_button_bg} or safe_accent: ${colorAnalysis.safe_accent}
4. If luminance is "${colorAnalysis.luminance}" → use ${colorAnalysis.luminance === "dark" ? "light text, light borders" : "dark text, dark borders"}
5. Every button must look DIFFERENT from background

SUPPORTED STYLE TYPES: glassmorphism | solid | gradient | neon | neumorphic | transparent
SUPPORTED ANIMATIONS: none | pulse | shimmer | glow | ripple | bounce | float

Return ONLY valid JSON — no markdown, no explanation. Return an object where each key is an element ID from PHANTOM_ELEMENT_MAP and value matches this TypeScript type:

{
  style: {
    type: string,
    fill: string,
    fill_opacity: number,
    blur?: number,
    border_color?: string,
    border_width?: number,
    border_radius: number,
    shadow?: { color: string, radius: number, spread: number, x: number, y: number },
    gradient?: { from: string, to: string, angle: number }
  },
  text?: { color: string, size: number, weight: number, opacity: number },
  animation?: { type: string, duration_ms: number, loop: boolean, color?: string },
  icon?: { tint: string, opacity: number }
}`;

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Design a "${userPrompt}" theme for Phantom wallet.
Background type: ${background.type}, opacity: ${background.opacity}.
Use the color analysis to ensure perfect contrast.
Create stunning visual effects but never sacrifice readability.
Return ONLY the JSON object for the elements — all 11 element IDs must be present.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[step3] GPT-4o error:", err);
      return buildFallbackElements(colorAnalysis);
    }

    const data = await response.json();
    const content: string = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[step3] GPT did not return valid JSON, using fallback");
      return buildFallbackElements(colorAnalysis);
    }

    const elements = JSON.parse(jsonMatch[0]) as Record<string, ElementStyle>;
    console.log("[step3] Element design complete, elements:", Object.keys(elements).join(", "));
    return elements;
  } catch (e) {
    console.error("[step3] Element design failed, using fallback:", e);
    return buildFallbackElements(colorAnalysis);
  }
}
