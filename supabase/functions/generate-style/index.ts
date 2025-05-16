
// Import necessary modules, but avoid the problematic arbundles import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
    
    // Enhance the prompt for better image generation results
    const enhancedPrompt = `
      Design a collectible login screen background for a crypto wallet.
      
      Prompt theme: ${prompt}
      
      Instructions:
      - Draw a vertical composition where the top is clean for the word "phantom" and center is reserved for the login box.
      - Leave the center-bottom area visually balanced and unobstructed (for UI overlays).
      - Use a cartoon / meme art style if applicable (e.g., for 'pepe')
      - Apply fashion brand theme if mentioned (e.g., Gucci = green/red stripes, luxury pattern)
      - NO text in image. NO 'password', 'login', 'unlock', etc.
      - DO NOT include buttons, inputs, or labels
      - DO NOT add shadows or overlays – design should look like a clean background
      - Make the design collectible and NFT-worthy
      - Strong visual appeal for digital wallet skin
    `;

    // Generate background image if no image was uploaded
    let backgroundImage = null;
    if (!image_url) {
      console.log("No image provided, generating one with OpenAI");
      try {
        const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiApiKey}`,
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            model: "dall-e-3",
          }),
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
        }

        const imageData = await imageResponse.json();
        backgroundImage = imageData.data[0].url;
        console.log("Image generated successfully:", backgroundImage.substring(0, 50) + "...");
      } catch (error) {
        console.error("Image generation error:", error);
        throw new Error(`Failed to generate image: ${error.message}`);
      }
    } else {
      backgroundImage = image_url;
      console.log("Using uploaded image:", image_url.substring(0, 50) + "...");
    }

    // Generate colors based on the image or prompt using OpenAI
    console.log("Generating style attributes based on theme");
    
    const stylePrompt = `
      Generate a cohesive style profile for a ${layer_type === "login" ? "login screen" : "wallet interface"} 
      with theme: "${prompt}".
      
      Return ONLY valid JSON with these properties:
      {
        "backgroundColor": "hex color code for background", 
        "backgroundImage": "URL of generated image or gradient",
        "accentColor": "hex color for accent elements",
        "textColor": "hex color for text that ensures readability",
        "buttonColor": "hex color for buttons",
        "buttonTextColor": "hex color for button text",
        "borderRadius": "radius value (e.g., '12px', '0px', etc.)",
        "fontFamily": "appropriate font family",
        "boxShadow": "appropriate shadow value",
        "styleNotes": "brief description of the style"
      }
    `;

    const styleResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a design system generator that creates wallet UI styles. Return only valid JSON that matches the requested format." },
          { role: "user", content: stylePrompt }
        ]
      })
    });

    if (!styleResponse.ok) {
      const errorData = await styleResponse.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const styleData = await styleResponse.json();
    let styleContent = styleData.choices[0].message.content;
    
    // Clean the response to ensure it's valid JSON
    styleContent = styleContent.replace(/```json|```/g, "").trim();
    console.log("Style content generated:", styleContent.substring(0, 100) + "...");
    
    let styleJson;
    try {
      styleJson = JSON.parse(styleContent);
    } catch (error) {
      console.error("Error parsing style JSON:", error);
      throw new Error("Failed to parse style data");
    }

    // Add the generated background image
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
