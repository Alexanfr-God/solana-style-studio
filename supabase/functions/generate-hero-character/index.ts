
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { style, layer, mood, colors } = await req.json();

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Create hero prompts for different layers
    const heroPrompts = {
      login: `A mystical guardian character in ${style} style, standing protectively at an entrance gate, ${mood} atmosphere, wearing elegant armor with ${colors.primary} and ${colors.secondary} color scheme, fantasy art, high quality, detailed, centered composition`,
      home: `A friendly digital assistant character in ${style} style, welcoming pose, ${mood} atmosphere, modern tech aesthetic with ${colors.primary} and ${colors.secondary} colors, floating holographic elements, futuristic design`,
      apps: `A skilled technician character in ${style} style, surrounded by floating app icons and digital tools, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} color palette, cyberpunk aesthetic`,
      swap: `A merchant trader character in ${style} style, holding glowing exchange symbols, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} colors, magical trading post background`,
      history: `An wise archivist character in ${style} style, surrounded by floating scrolls and timeline elements, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} color scheme, mystical library setting`,
      search: `An explorer scout character in ${style} style, holding a glowing search crystal, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} colors, adventure aesthetic`,
      receive: `A generous gift-bearer character in ${style} style, hands glowing with receiving energy, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} color palette, magical aura`,
      send: `A swift messenger character in ${style} style, dynamic pose with energy trails, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} colors, speed and movement aesthetic`,
      buy: `A prosperity merchant character in ${style} style, surrounded by golden coins and gems, ${mood} atmosphere, ${colors.primary} and ${colors.secondary} color scheme, wealth and abundance theme`
    };

    const prompt = heroPrompts[layer as keyof typeof heroPrompts] || heroPrompts.home;

    console.log(`Generating hero for ${layer} layer with prompt:`, prompt);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0].url;

    console.log("Hero character generated successfully:", imageUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: imageUrl,
        layer: layer
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-hero-character function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
