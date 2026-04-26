import { uploadToStorage } from "../utils/storage.ts";
import type { BackgroundResult, ThemeRequest } from "../../shared/types.ts";

// ── Lovable AI Gateway (DALL-E 3 proxy) ──────────────────────────────────
async function generateWithLovable(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const dallePrompt = `Abstract atmospheric wallet background for "${prompt}" theme. No text, no UI elements, no logos, no letters. Portrait orientation 2:3. Visually stunning, cinematic lighting, minimal content in center where UI overlays appear.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      style: "vivid",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lovable DALL-E error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.data[0].url as string;
}

// ── OpenAI direct (OPENA_API_KEY fallback) ────────────────────────────────
async function generateWithOpenAI(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("OPENA_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new Error("No OpenAI key");

  const dallePrompt = `Abstract atmospheric wallet background for "${prompt}" theme. No text, no UI elements, no logos. Portrait 2:3. Cinematic lighting, minimal center.`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      style: "vivid",
    }),
  });

  if (!res.ok) throw new Error(`OpenAI DALL-E error ${res.status}`);
  const data = await res.json();
  return data.data[0].url as string;
}

// ── HuggingFace FLUX.1-schnell (free tier) ────────────────────────────────
async function generateWithHuggingFace(prompt: string): Promise<Uint8Array> {
  const token = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
  if (!token) throw new Error("HUGGING_FACE_ACCESS_TOKEN not configured");

  const bgPrompt = `Abstract atmospheric background for "${prompt}" crypto wallet theme. No text, no logos, no UI. Cinematic, portrait orientation, dark moody atmosphere.`;

  const res = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: bgPrompt, parameters: { num_inference_steps: 4 } }),
      signal: AbortSignal.timeout(55_000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HuggingFace error ${res.status}: ${err.slice(0, 200)}`);
  }

  const blob = await res.blob();
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

// ── Keyword-based gradient fallback ──────────────────────────────────────
const GRADIENT_MAP: Record<string, [string, string]> = {
  cyberpunk: ["#0d0221", "#4a0080"],
  neon:      ["#001a33", "#003366"],
  glass:     ["#e8eaf0", "#b0b8d0"],
  glassmorphism: ["#dce8f8", "#a8c0e0"],
  minimal:   ["#f5f5f5", "#d0d0d0"],
  white:     ["#ffffff", "#e0e8f0"],
  dark:      ["#0a0a0a", "#1a1a2e"],
  gold:      ["#1a0a00", "#3d2000"],
  bitcoin:   ["#1a0800", "#2d1500"],
  luxury:    ["#0d0d0d", "#2a1a00"],
  space:     ["#000010", "#0a0025"],
  cosmic:    ["#020010", "#100030"],
  galaxy:    ["#000020", "#0d0040"],
  ocean:     ["#001830", "#002850"],
  fire:      ["#1a0000", "#3d0500"],
  forest:    ["#001a00", "#0a2a0a"],
  synthwave: ["#1a0030", "#0d0040"],
  vaporwave: ["#ff70d4", "#70d4ff"],
  pastel:    ["#ffd6e8", "#d6e8ff"],
  punk:      ["#1a0020", "#350040"],
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

  // Try 1: Lovable gateway DALL-E 3
  try {
    const tempUrl = await generateWithLovable(prompt);
    console.log("[step1] Lovable DALL-E success, uploading...");
    const saved = await uploadToStorage(tempUrl, `backgrounds/${userId}/${Date.now()}.png`);
    return { type: "image", url: saved, blur: 0, opacity: 0.9 };
  } catch (e) {
    console.warn("[step1] Lovable failed:", e);
  }

  // Try 2: OpenAI direct (OPENA_API_KEY)
  try {
    const tempUrl = await generateWithOpenAI(prompt);
    console.log("[step1] OpenAI DALL-E success, uploading...");
    const saved = await uploadToStorage(tempUrl, `backgrounds/${userId}/${Date.now()}.png`);
    return { type: "image", url: saved, blur: 0, opacity: 0.9 };
  } catch (e) {
    console.warn("[step1] OpenAI failed:", e);
  }

  // Try 3: HuggingFace FLUX.1-schnell (returns binary)
  try {
    const imgBytes = await generateWithHuggingFace(prompt);
    console.log("[step1] HuggingFace success, uploading binary...");

    // Upload binary directly to storage
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const path = `backgrounds/${userId}/${Date.now()}_hf.png`;
    const { error } = await supabase.storage.from("theme-assets").upload(path, imgBytes, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from("theme-assets").getPublicUrl(path);
    return { type: "image", url: publicUrl, blur: 0, opacity: 0.9 };
  } catch (e) {
    console.warn("[step1] HuggingFace failed:", e);
  }

  // Fallback: gradient based on keywords
  console.log("[step1] All generators failed — using gradient fallback");
  return buildGradientFallback(prompt);
}
