
// Main entry point for generate-style Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createLayoutAwarePrompt } from "./utils/layoutPrompts.ts";
import { buildStylePrompt } from "./utils/stylePromptBuilder.ts";
import { generateBackgroundImage, getDominantColors, saveImageToBucket } from "./utils/imageAnalysis.ts";

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
    const { prompt, image_url, layer_type, user_id, mode } = await req.json();

    console.log(`🚀 Processing request - Mode: ${mode}, Layer: ${layer_type}, Prompt: ${prompt}`);

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    // Handle image generation mode
    if (mode === 'image_generation') {
      console.log("🎨 Image generation mode - generating with DALL-E");
      
      try {
        // Generate image with OpenAI
        console.log("📝 Sending request to OpenAI API...");
        const generatedImageUrl = await generateBackgroundImage(prompt, openAiApiKey);
        console.log(`✅ Image generated successfully: ${generatedImageUrl.substring(0, 50)}...`);
        
        // Save to our storage bucket
        console.log("💾 Saving image to Supabase storage...");
        const publicUrl = await saveImageToBucket(generatedImageUrl, prompt, 'dalle', supabase);
        console.log(`🌐 Image saved to bucket: ${publicUrl}`);
        
        return new Response(
          JSON.stringify({
            success: true,
            imageUrl: publicUrl,
            mode: 'dalle'
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("💥 Image generation error:", error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Image generation failed: ${error.message}`,
            details: error.stack || 'No stack trace available'
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Handle style generation mode (existing logic)
    console.log(`🎨 Starting style generation for ${layer_type} layer`);
    
    // Create layout-aware background prompt based on layer type
    const layoutConfig = await createLayoutAwarePrompt(prompt, layer_type);
    
    // Generate background image if no image was uploaded
    let backgroundImage = null;
    if (!image_url) {
      console.log("🖼️ No image provided, generating one with OpenAI");
      try {
        const generatedImageUrl = await generateBackgroundImage(layoutConfig.enhancedPrompt, openAiApiKey);
        // Save to bucket and get public URL
        backgroundImage = await saveImageToBucket(generatedImageUrl, prompt, 'dalle', supabase);
        console.log("✅ Generated image saved to bucket:", backgroundImage);
      } catch (error) {
        console.error("⚠️ Image generation error:", error);
        // Continue without background image rather than failing completely
        console.log("🔄 Continuing style generation without background image");
      }
    } else {
      backgroundImage = image_url;
      console.log("📷 Using uploaded image:", image_url.substring(0, 50) + "...");
      
      // Analyze uploaded image for dominant colors
      try {
        const dominantColors = await getDominantColors(image_url);
        console.log("🎨 Dominant colors extracted:", dominantColors);
        // These colors can be used later for style generation
      } catch (error) {
        console.log("⚠️ Could not extract colors from image:", error);
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
      console.error("⚠️ Error updating style in database:", updateError);
    } else {
      console.log("✅ Style saved successfully:", requestData);
    }

    return new Response(
      JSON.stringify({
        success: true,
        style: styleJson,
        imageUrl: backgroundImage
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in generate-style function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
