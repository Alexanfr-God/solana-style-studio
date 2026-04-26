import { uploadToStorage } from "../utils/storage.ts";
import type { BackgroundResult, ThemeRequest } from "../../shared/types.ts";

// ── Leonardo.ai generation ────────────────────────────────────────────────
async function generateWithLeonardo(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("LEONARDO_API_KEY");
  if (!apiKey) throw new Error("LEONARDO_API_KEY not configured");

  const bgPrompt = `Abstract atmospheric background for "${prompt}" wallet theme. No text, no UI elements, no logos. Portrait orientation, visually striking, minimal contrast in center.`;

  // Start generation
  const createRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: bgPrompt,
      modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876", // Leonardo Diffusion XL
      width: 512,
      height: 768,
      num_images: 1,
      public: false,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Leonardo create error ${createRes.status}: ${err}`);
  }

  const { sdGenerationJob } = await createRes.json();
  const genId: string = sdGenerationJob.generationId;
  console.log("[step1] Leonardo generationId:", genId);

  // Poll until done (max 60s)
  const start = Date.now();
  while (Date.now() - start < 60_000) {
    await new Promise((r) => setTimeout(r, 3000));

    const poll = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${genId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await poll.json();
    const gen = data.generations_by_pk;

    console.log("[step1] Leonardo status:", gen?.status);
    if (gen?.status === "COMPLETE") {
      const imgUrl = gen.generated_images?.[0]?.url;
      if (!imgUrl) throw new Error("Leonardo returned no image URL");
      return imgUrl;
    }
    if (gen?.status === "FAILED") throw new Error("Leonardo generation failed");
  }
  throw new Error("Leonardo timeout");
}

// ── Keyword-based gradient fallback ──────────────────────────────────────
const GRADIENT_MAP: Record<string, [string, string]> = {
  cyberpunk:      ["#0d0221", "#4a0080"],
  neon:           ["#001a33", "#003366"],
  glass:          ["#e8eaf0", "#b0b8d0"],
  glassmorphism:  ["#dce8f8", "#a8c0e0"],
  minimal:        ["#f5f5f5", "#d0d0d0"],
  white:          ["#ffffff", "#e0e8f0"],
  dark:           ["#0a0a0a", "#1a1a2e"],
  gold:           ["#1a0a00", "#3d2000"],
  bitcoin:        ["#1a0800", "#2d1500"],
  luxury:         ["#0d0d0d", "#2a1a00"],
  space:          ["#000010", "#0a0025"],
  cosmic:         ["#020010", "#100030"],
  galaxy:         ["#000020", "#0d0040"],
  ocean:          ["#001830", "#002850"],
  fire:           ["#1a0000", "#3d0500"],
  forest:         ["#001a00", "#0a2a0a"],
  synthwave:      ["#1a0030", "#0d0040"],
  vaporwave:      ["#ff70d4", "#70d4ff"],
  pastel:         ["#ffd6e8", "#d6e8ff"],
};

function buildGradientFallback(prompt: string): BackgroundResult {
  const lower = prompt.toLowerCase();
  let colors: [string, string] = ["#131217", "#2a2832"];
  for (const [kw, pair] of Object.entries(GRADIENT_MAP)) {
    if (lower.includes(kw)) { colors = pair; break; }
  }
  return {
    type: "gradient",
    gradient: { from: colors[0], to: colors[1], angle: 135 },
    blur: 0,
    opacity: 1,
  };
}

// ── Main export ───────────────────────────────────────────────────────────
export async function generateBackground(
  prompt: string,
  config?: ThemeRequest["background"],
  userId = "anonymous"
): Promise<BackgroundResult> {
  // Passthrough — user provided a ready URL / GIF / video
  if (config?.type && config.type !== "generate" && config.value) {
    console.log("[step1] Passthrough background:", config.type, config.value);
    return {
      type: config.type as BackgroundResult["type"],
      url: config.value,
      blur: 0,
      opacity: 0.95,
    };
  }

  console.log("[step1] Generating background with Leonardo for:", prompt);

  try {
    const tempUrl = await generateWithLeonardo(prompt);
    console.log("[step1] Leonardo returned URL, uploading to storage...");
    const savedUrl = await uploadToStorage(tempUrl, `backgrounds/${userId}/${Date.now()}.png`);
    console.log("[step1] Background saved:", savedUrl);
    return { type: "image", url: savedUrl, blur: 0, opacity: 0.9 };
  } catch (e) {
    console.warn("[step1] Leonardo failed, using gradient fallback:", e);
    return buildGradientFallback(prompt);
  }
}
