import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function uploadToStorage(sourceUrl: string, storagePath: string): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const imageRes = await fetch(sourceUrl);
  if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.status}`);

  const blob = await imageRes.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const contentType = blob.type || "image/png";
  const { error } = await supabase.storage
    .from("theme-assets")
    .upload(storagePath, uint8, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from("theme-assets")
    .getPublicUrl(storagePath);

  return publicUrl;
}

export async function saveThemeToStorage(
  overlayJson: unknown,
  userId: string,
  themeName: string
): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const slug = themeName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const path = `themes/${userId}/${slug}-${Date.now()}.json`;

  const blob = new Blob([JSON.stringify(overlayJson, null, 2)], {
    type: "application/json",
  });
  const arrayBuffer = await blob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from("theme-assets")
    .upload(path, uint8, { contentType: "application/json", upsert: true });

  if (error) throw new Error(`Theme JSON upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from("theme-assets")
    .getPublicUrl(path);

  return publicUrl;
}
