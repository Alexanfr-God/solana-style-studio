import { uploadToStorage } from "../utils/storage.ts";
import type { BackgroundResult, ThemeRequest } from "../../shared/types.ts";

function getOpenAIKey(): string {
  const key = Deno.env.get("OPENAI_API_KEY") ?? Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY not configured");
  return key;
}

function getAPIBase(): string {
  if (Deno.env.get("OPENAI_API_KEY")) return "https://api.openai.com/v1";
  return "https://ai.gateway.lovable.dev/v1";
}

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

  console.log("[step1] Generating background with DALL-E 3 for prompt:", prompt);

  const dallePrompt = `Wallet app background image for "${prompt}" theme. \
Style: abstract, atmospheric, no text, no UI elements, no logos, no letters. \
Aspect ratio: portrait 2:3 (380x600px equivalent). \
Visually striking but not interfering with UI overlaid on top. \
High contrast areas minimal in center where UI elements appear.`;

  const apiKey = getOpenAIKey();
  const apiBase = getAPIBase();

  const response = await fetch(`${apiBase}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: dallePrompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
      style: "vivid",
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DALL-E 3 error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const tempUrl: string = data.data[0].url;

  console.log("[step1] DALL-E 3 returned temp URL, uploading to storage...");

  // DALL-E URLs expire in ~1h — persist immediately
  const savedUrl = await uploadToStorage(
    tempUrl,
    `backgrounds/${userId}/${Date.now()}.png`
  );

  console.log("[step1] Background saved:", savedUrl);

  return {
    type: "image",
    url: savedUrl,
    blur: 0,
    opacity: 0.9,
  };
}
