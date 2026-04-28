import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { runBackgroundAgent } from "./agents/background-agent.ts";
import { runColorAnalyst } from "./agents/color-analyst.ts";
import { runElementDesigner } from "./agents/element-designer.ts";
import { runValidator } from "./agents/validator.ts";
import { runApplier } from "./agents/applier.ts";
import type { ThemeRequest } from "./shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: ThemeRequest & { message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Support both direct ThemeRequest and simple { message, userId } from chat
  const prompt: string = body.prompt ?? body.message ?? "";
  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = body.userId ?? "anonymous";

  // Parse background from message if not explicitly set
  const background = body.background ?? (() => {
    const urlMatch = prompt.match(/https?:\/\/\S+\.(gif|mp4|webm|png|jpg|jpeg)/i);
    if (urlMatch) return { type: urlMatch[1].toLowerCase() === "gif" ? "gif" : "url" as const, value: urlMatch[0] };
    return { type: "generate" as const };
  })();

  console.log("[orchestrator] Starting pipeline:", { prompt, userId, background });

  // SSE streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        const chunk = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        try { controller.enqueue(encoder.encode(chunk)); } catch { /* stream closed */ }
      };

      try {
        // ── STEP 1: Background ────────────────────────────────────────────────
        send("progress", { step: 1, agent: "background", status: "running", label: "🎨 Generating background..." });
        const background_result = await runBackgroundAgent({ prompt, background, userId, wallet: "phantom" });
        send("progress", { step: 1, agent: "background", status: "done", result: background_result });

        // ── STEP 2: Color Analysis ────────────────────────────────────────────
        send("progress", { step: 2, agent: "color-analyst", status: "running", label: "🔍 Analyzing colors..." });
        const colors = await runColorAnalyst(background_result, prompt);
        send("progress", { step: 2, agent: "color-analyst", status: "done", result: colors });

        // ── STEP 3: Element Design ────────────────────────────────────────────
        send("progress", { step: 3, agent: "designer", status: "running", label: "✨ Designing UI elements..." });
        const elements = await runElementDesigner(prompt, colors, background_result);
        send("progress", { step: 3, agent: "designer", status: "done", count: Object.keys(elements).length });

        // ── STEP 4: Validation ────────────────────────────────────────────────
        send("progress", { step: 4, agent: "validator", status: "running", label: "✅ Validating theme..." });
        const validated = await runValidator({ background: background_result, colors, elements, userPrompt: prompt });
        send("progress", { step: 4, agent: "validator", status: "done", warnings: validated.warnings.length, fixes: validated.fixes });

        // ── STEP 5: Apply ─────────────────────────────────────────────────────
        send("progress", { step: 5, agent: "applier", status: "running", label: "🚀 Applying theme..." });
        const applied = await runApplier(validated.theme, userId);
        send("progress", { step: 5, agent: "applier", status: "done" });

        // ── Complete ──────────────────────────────────────────────────────────
        send("complete", {
          success: true,
          theme: validated.theme,
          themeUrl: applied.themeUrl,
          warnings: validated.warnings,
        });

        console.log("[orchestrator] ✅ Pipeline complete:", validated.theme.theme_name);
      } catch (err) {
        console.error("[orchestrator] ❌ Fatal error:", err);
        send("error", { message: err instanceof Error ? err.message : String(err) });
      } finally {
        try { controller.close(); } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
});
