import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { WCCOverlayV3 } from "../shared/types.ts";

export async function runApplier(theme: WCCOverlayV3, userId: string): Promise<{ themeUrl?: string }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let themeUrl: string | undefined;

  // 1. Save theme JSON to storage
  try {
    const slug = theme.theme_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const path = `themes/${userId.slice(0, 8)}/${slug}-${Date.now()}.json`;
    const json = JSON.stringify(theme, null, 2);
    const bytes = new TextEncoder().encode(json);

    const { error } = await supabase.storage
      .from("generated-images")
      .upload(path, bytes, { contentType: "application/json", upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("generated-images").getPublicUrl(path);
      themeUrl = publicUrl;
    }
  } catch (e) {
    console.warn("[applier] Theme JSON save failed (non-fatal):", e);
  }

  // 2. Save to user_themes table (best-effort)
  try {
    await supabase.from("user_themes").upsert(
      { user_id: userId, theme_data: theme as any, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
  } catch (e) {
    console.warn("[applier] DB save failed (non-fatal):", e);
  }

  // 3. Broadcast via Realtime — macOS overlay agent + frontend both subscribed
  try {
    await supabase.channel(`theme:phantom:${userId}`)
      .send({ type: "broadcast", event: "theme:generated", payload: theme });
  } catch (e) {
    console.warn("[applier] Realtime broadcast failed (non-fatal):", e);
  }

  console.log("[applier] Done. themeUrl:", themeUrl?.slice(0, 60));
  return { themeUrl };
}
