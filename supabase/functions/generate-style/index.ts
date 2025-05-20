
// Main entry point for generate-style Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createLayoutAwarePrompt } from "./utils/layoutPrompts.ts";
import { buildStylePrompt } from "./utils/stylePromptBuilder.ts";
import { generateBackgroundImage, getDominantColors } from "./utils/imageAnalysis.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image_url, layer_type, user_id } = await req.json();

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log(`Starting style generation for ${layer_type} layer`);
    console.log(`Prompt: ${prompt}`);
    
    // Create layout-aware background prompt based on layer type
    const layoutConfig = await createLayoutAwarePrompt(prompt, layer_type);
    
    // Generate background image if no image was uploaded
    let backgroundImage = null;
    if (!image_url) {
      console.log("No image provided, generating one with OpenAI");
      try {
        backgroundImage = await generateBackgroundImage(layoutConfig.enhancedPrompt, openAiApiKey);
        console.log("Image generated successfully:", backgroundImage.substring(0, 50) + "...");
      } catch (error) {
        console.error("Image generation error:", error);
        throw new Error(`Failed to generate image: ${error.message}`);
      }
    } else {
      backgroundImage = image_url;
      console.log("Using uploaded image:", image_url.substring(0, 50) + "...");
      
      // Analyze uploaded image for dominant colors
      try {
        const dominantColors = await getDominantColors(image_url);
        console.log("Dominant colors extracted:", dominantColors);
        // These colors can be used later for style generation
      } catch (error) {
        console.log("Could not extract colors from image:", error);
      }
    }

    // Generate style JSON using the layout config and OpenAI
    const styleJson = await buildStylePrompt(prompt, layer_type, openAiApiKey);

    // Add the generated/uploaded background image to the style
    if (backgroundImage) {
      styleJson.backgroundImage = `url(${backgroundImage})`;
    }

    // Update the record in Supabase
    const { data: requestData, error: updateError } = await supabase
      .from("ai_requests")
      .update({ 
        style_result: styleJson,
        status: 'completed'
      })
      .eq("user_id", user_id)
      .eq("prompt", prompt)
      .select();

    if (updateError) {
      console.error("Error updating style in database:", updateError);
    } else {
      console.log("Style saved successfully:", requestData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        style: styleJson,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-style function:", error);
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
