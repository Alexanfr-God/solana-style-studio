import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { BackgroundResult, ThemeRequest } from "../../shared/types.ts";

const SYSTEM_PROMPT = `You are a professional digital artist creating stunning wallet backgrounds for crypto apps.

STYLE GUIDELINES:
- Dark atmospheric themes work best: deep purples, rich blues, blacks
- Abstract, cosmic, or geometric patterns — NO text, NO UI elements, NO logos, NO letters
- Cinematic lighting, depth, and atmosphere
- Minimal center area where wallet UI will overlay on top
- High contrast with vibrant accent colors for the theme style

TECHNICAL REQUIREMENTS:
- Portrait orientation (2:3 aspect ratio — taller than wide)
- Single cohesive image filling the full frame
- Background layer only — UI sits on top of this image
- Rich textures, gradients, and depth`;

// ── Gemini image generation via Lovable AI Gateway (working approach) ─────
async function generateWithGemini(prompt: string, userId: string): Promise<BackgroundResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const bgPrompt = `Abstract atmospheric wallet background for "${prompt}" theme. Portrait orientation (2:3). No text, no UI elements, no logos, no letters. Cinematic lighting, stunning visuals, dark mood with clear center area for UI overlay.`;

  console.log("[step1] Calling Gemini image-preview via Lovable gateway...");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a wallet background: ${bgPrompt}` },
      ],
      modalities: ["image", "text"],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini gateway error ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  const imageData: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

  if (!imageData) {
    throw new Error(`No image in Gemini response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  // Convert base64 → binary and upload to Supabase Storage
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userPrefix = userId ? userId.slice(0, 8) : "anon";
  const path = `backgrounds/${userPrefix}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("generated-images")
    .upload(path, binaryData, { contentType: "image/png", upsert: false });

  if (uploadError) {
    console.warn("[step1] Storage upload failed, returning base64 directly:", uploadError.message);
    return { type: "image", url: imageData, blur: 0, opacity: 0.9 };
  }

  const { data: { publicUrl } } = supabase.storage.from("generated-images").getPublicUrl(path);
  console.log("[step1] ✅ Image uploaded:", publicUrl);
  return { type: "image", url: publicUrl, blur: 0, opacity: 0.9 };
}

// ── Keyword-based gradient fallback ──────────────────────────────────────
const GRADIENT_MAP: Record<string, [string, string]> = {
  cyberpunk:     ["#0d0221", "#4a0080"],
  neon:          ["#001a33", "#003366"],
  glass:         ["#e8eaf0", "#b0b8d0"],
  glassmorphism: ["#dce8f8", "#a8c0e0"],
  minimal:       ["#f5f5f5", "#d0d0d0"],
  white:         ["#ffffff", "#e0e8f0"],
  dark:          ["#0a0a0a", "#1a1a2e"],
  gold:          ["#1a0a00", "#3d2000"],
  bitcoin:       ["#1a0800", "#2d1500"],
  luxury:        ["#0d0d0d", "#2a1a00"],
  space:         ["#000010", "#0a0025"],
  cosmic:        ["#020010", "#100030"],
  galaxy:        ["#000020", "#0d0040"],
  ocean:         ["#001830", "#002850"],
  fire:          ["#1a0000", "#3d0500"],
  forest:        ["#001a00", "#0a2a0a"],
  synthwave:     ["#1a0030", "#0d0040"],
  vaporwave:     ["#ff70d4", "#70d4ff"],
  pastel:        ["#ffd6e8", "#d6e8ff"],
  punk:          ["#1a0020", "#350040"],
};

function buildGradientFallback(prompt: string): BackgroundResult {
  const lower = prompt.toLowerCase();
  let colors: [string, string] = ["#131217", "#2a2832"];
  for (const [kw, pair] of Object.entries(GRADIENT_MAP)) {
    if (lower.includes(kw)) { colors = pair; break; }
  }
  return { type: "gradient", gradient: { from: colors[0], to: colors[1], angle: 135 }, blur: 0, opacity: 1 };
}

// ── Main export ───────────────────────────────────────────────────────────
export async function generateBackground(
  prompt: string,
  config?: ThemeRequest["background"],
  userId = "anonymous"
): Promise<BackgroundResult> {
  if (config?.type && config.type !== "generate" && config.value) {
    console.log("[step1] Passthrough:", config.type, config.value);
    return { type: config.type as BackgroundResult["type"], url: config.value, blur: 0, opacity: 0.95 };
  }

  console.log("[step1] Generating image for:", prompt);

  try {
    return await generateWithGemini(prompt, userId);
  } catch (e) {
    console.warn("[step1] Gemini image generation failed:", e);
  }

  console.log("[step1] Gemini failed — using gradient fallback");
  return buildGradientFallback(prompt);
}
