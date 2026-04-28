import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { ThemeRequest, BackgroundResult } from "../shared/types.ts";

const SYSTEM_PROMPT = `You are a digital artist creating stunning wallet backgrounds for crypto apps.
Create abstract atmospheric art. Portrait orientation (2:3). No text, no UI, no logos, no letters.
Cinematic lighting, depth, moody atmosphere. Clear center area for wallet UI overlay.`;

// Gemini image generation via Lovable gateway (proven working approach)
async function generateWithGemini(prompt: string, userId: string): Promise<BackgroundResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const bgPrompt = `Abstract atmospheric wallet background for "${prompt}" theme. Portrait 2:3. No text, no UI, no logos. Cinematic, stunning visuals with depth.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
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
    throw new Error(`Gemini gateway ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const imageData: string | undefined = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageData) throw new Error("No image in Gemini response");

  // Upload to Supabase Storage
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const userPrefix = userId.slice(0, 8);
  const path = `backgrounds/${userPrefix}/${Date.now()}.png`;
  const { error } = await supabase.storage
    .from("generated-images")
    .upload(path, binaryData, { contentType: "image/png", upsert: false });

  if (error) {
    console.warn("[bg-agent] Storage upload failed, using base64:", error.message);
    return { type: "image", url: imageData, opacity: 0.9, blur: 0 };
  }

  const { data: { publicUrl } } = supabase.storage.from("generated-images").getPublicUrl(path);
  return { type: "image", url: publicUrl, opacity: 0.9, blur: 0 };
}

// Keyword gradient fallback
const GRADIENT_MAP: Record<string, [string, string]> = {
  cyberpunk: ["#0d0221", "#4a0080"],
  neon: ["#001a33", "#003366"],
  glassmorphism: ["#dce8f8", "#a8c0e0"],
  minimal: ["#f5f5f5", "#d0d0d0"],
  dark: ["#0a0a0a", "#1a1a2e"],
  gold: ["#1a0a00", "#3d2000"],
  bitcoin: ["#1a0800", "#2d1500"],
  luxury: ["#0d0d0d", "#2a1a00"],
  space: ["#000010", "#0a0025"],
  ocean: ["#001830", "#002850"],
  fire: ["#1a0000", "#3d0500"],
  synthwave: ["#1a0030", "#0d0040"],
  vaporwave: ["#ff70d4", "#70d4ff"],
};

function gradientFallback(prompt: string): BackgroundResult {
  const lower = prompt.toLowerCase();
  let colors: [string, string] = ["#131217", "#2a2832"];
  for (const [kw, pair] of Object.entries(GRADIENT_MAP)) {
    if (lower.includes(kw)) { colors = pair; break; }
  }
  return { type: "gradient", gradient: { from: colors[0], to: colors[1], angle: 135 }, opacity: 1 };
}

export async function runBackgroundAgent(req: ThemeRequest): Promise<BackgroundResult> {
  // Passthrough: user uploaded their own image/gif/video
  if (req.background?.type && req.background.type !== "generate" && req.background.value) {
    console.log("[bg-agent] Passthrough:", req.background.type, req.background.value.slice(0, 60));
    return {
      type: req.background.type as BackgroundResult["type"],
      url: req.background.value,
      opacity: 0.95,
      blur: 0,
    };
  }

  console.log("[bg-agent] Generating image for:", req.prompt);
  try {
    return await generateWithGemini(req.prompt, req.userId);
  } catch (e) {
    console.warn("[bg-agent] Gemini failed:", e);
    return gradientFallback(req.prompt);
  }
}
