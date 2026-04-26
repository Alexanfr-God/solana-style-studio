import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateBackground } from "./steps/step1-background.ts";
import { analyzeColors } from "./steps/step2-colors.ts";
import { designInFigma } from "./steps/step3-figma.ts";
import { saveThemeToStorage } from "./utils/storage.ts";
import { extractThemeName } from "./utils/themeNamer.ts";
import type { ThemeRequest, WCCOverlayV3 } from "../shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parseUserMessage(message: string): ThemeRequest["background"] {
  const urlMatch = message.match(/https?:\/\/\S+\.(gif|mp4|webm|png|jpg|jpeg)/i);
  if (urlMatch) {
    const ext = urlMatch[1].toLowerCase();
    return {
      type: ext === "gif" ? "gif" : (ext === "mp4" || ext === "webm") ? "video" : "url",
      value: urlMatch[0],
    };
  }
  return { type: "generate" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as ThemeRequest & { message?: string };

    // Support both direct ThemeRequest and simple { message, userId } from chat
    const prompt: string = body.prompt ?? body.message ?? "";
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId: string = body.userId ?? "anonymous";
    const backgroundConfig = body.background ?? parseUserMessage(prompt);

    console.log("[generate-theme] Starting pipeline:", { prompt, userId, backgroundConfig });

    // === STEP 1: BACKGROUND ===
    console.log("[generate-theme] Step 1: generating background...");
    const background = await generateBackground(prompt, backgroundConfig, userId);

    // === STEP 2: COLOR ANALYSIS ===
    console.log("[generate-theme] Step 2: analyzing colors...");
    const colorAnalysis = await analyzeColors(
      background.url ?? "",
      prompt
    );

    // === STEP 3: ELEMENT DESIGN ===
    console.log("[generate-theme] Step 3: designing elements...");
    const elements = await designInFigma(prompt, colorAnalysis, background);

    // === ASSEMBLE WCCOverlayV3 ===
    const themeName = extractThemeName(prompt);
    const overlayJson: WCCOverlayV3 = {
      version: 3,
      wallet: "phantom",
      theme_name: themeName,
      generated_at: new Date().toISOString(),
      global: { background, color_analysis: colorAnalysis },
      elements,
    };

    console.log("[generate-theme] Saving theme JSON to storage...");
    let themeUrl: string | undefined;
    try {
      themeUrl = await saveThemeToStorage(overlayJson, userId, themeName);
    } catch (e) {
      console.warn("[generate-theme] Theme JSON save failed (non-fatal):", e);
    }

    // Broadcast via Supabase Realtime so the macOS overlay agent picks it up
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.channel(`theme:phantom:${userId}`)
        .send({ type: "broadcast", event: "theme:generated", payload: overlayJson });
    } catch (e) {
      console.warn("[generate-theme] Realtime broadcast failed (non-fatal):", e);
    }

    console.log("[generate-theme] ✅ Pipeline complete:", themeName);

    return new Response(
      JSON.stringify({ success: true, theme: overlayJson, themeUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-theme] ❌ Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
