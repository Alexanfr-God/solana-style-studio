import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a professional digital artist creating stunning wallpapers and posters for crypto wallet UI customization.

STYLE GUIDELINES:
- Create visually striking, modern digital art suitable for app backgrounds
- Dark themes work best: deep purples (#1a0a2e), rich blues (#0a1628), blacks (#0d0d0d)
- Include subtle crypto/blockchain visual elements when appropriate (geometric patterns, circuit-like lines, abstract nodes)
- High contrast with vibrant accent colors (neon cyan #00d4ff, electric purple #a855f7, hot pink #ff0066)
- Abstract, geometric, or cosmic patterns work great
- Gradients and glowing effects add depth
- Keep compositions balanced - not too busy, allowing UI elements to be readable on top

TECHNICAL REQUIREMENTS:
- Output a single cohesive image
- Poster/wallpaper style optimized for mobile screens
- Aspect ratio: 1:1 (1024x1024)
- No text, watermarks, or logos unless explicitly requested
- Rich textures and depth
- Suitable as a background layer in a fintech/crypto app

THEMES TO CONSIDER:
- Cyberpunk cityscapes with neon lights
- Abstract geometric blockchain networks
- Cosmic/space themes with nebulae and stars
- Digital matrix/code rain aesthetics
- Luxury dark marble with gold accents
- Nature-meets-tech organic circuits
- Synthwave retro-futurism

Always prioritize visual appeal and usability as a UI background.`;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, userId } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[generate-poster] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[generate-poster] 🎨 Generating poster with prompt:", prompt.slice(0, 100));

    // Call Lovable AI Gateway with image generation model
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Create a wallet background poster: ${prompt}` }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[generate-poster] AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to generate image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("[generate-poster] AI response received");

    // Extract base64 image from response
    const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error("[generate-poster] No image in AI response:", JSON.stringify(aiData).slice(0, 500));
      return new Response(
        JSON.stringify({ error: "No image generated. Try a different prompt." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert base64 to binary
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Generate unique filename
    const timestamp = Date.now();
    const userPrefix = userId ? userId.slice(0, 8) : "anon";
    const fileName = `posters/${userPrefix}/${timestamp}.png`;

    console.log("[generate-poster] Uploading to storage:", fileName);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, binaryData, {
        contentType: "image/png",
        upsert: false
      });

    if (uploadError) {
      console.error("[generate-poster] Upload error:", uploadError);
      // Still return base64 if upload fails
      return new Response(
        JSON.stringify({ 
          success: true,
          imageUrl: imageData,
          isBase64: true,
          message: "Image generated (storage upload failed)"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(fileName);

    console.log("[generate-poster] ✅ Success:", publicUrlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrlData.publicUrl,
        isBase64: false,
        prompt: prompt,
        message: "Poster generated successfully!"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[generate-poster] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
