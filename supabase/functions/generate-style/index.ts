
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
const supabaseUrl = "https://opxordptvpvzmhakvdde.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// CORS headers to allow cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI image generation function
const generateImageWithOpenAI = async (prompt: string): Promise<string> => {
  console.log("Calling OpenAI API with prompt:", prompt);
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    console.log("OpenAI API response:", data);
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Function to extract colors and style information from the prompt
const extractColorsFromPrompt = (prompt: string): {
  backgroundColor: string;
  textColor: string; 
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  boxShadow: string;
  styleNotes: string;
} => {
  // Initialize with defaults
  let result = {
    backgroundColor: "#121212",
    textColor: "#ffffff",
    accentColor: "#9945FF",
    buttonColor: "#9945FF",
    buttonTextColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
    styleNotes: "modern, sleek"
  };
  
  // Color extraction logic
  const promptLower = prompt.toLowerCase();
  
  // Extract style notes
  const styleTerms = [];
  if (promptLower.includes("futuristic")) styleTerms.push("futuristic");
  if (promptLower.includes("minimal") || promptLower.includes("clean")) styleTerms.push("minimalist");
  if (promptLower.includes("glass") || promptLower.includes("transparent")) styleTerms.push("glassmorphic");
  if (promptLower.includes("gradient")) styleTerms.push("gradient");
  if (promptLower.includes("neon") || promptLower.includes("glow")) styleTerms.push("neon glow");
  if (promptLower.includes("dark")) styleTerms.push("dark mode");
  if (promptLower.includes("light")) styleTerms.push("light mode");
  
  // If we have style terms, join them
  if (styleTerms.length > 0) {
    result.styleNotes = styleTerms.join(", ");
  }
  
  // Background color detection
  if (promptLower.includes("dark") || promptLower.includes("black")) {
    result.backgroundColor = "#121212";
    result.textColor = "#ffffff";
  } else if (promptLower.includes("light") || promptLower.includes("white")) {
    result.backgroundColor = "#f8f8f8";
    result.textColor = "#121212";
  }
  
  // Accent color detection
  if (promptLower.includes("blue")) {
    result.accentColor = "#3B82F6";
  } else if (promptLower.includes("green")) {
    result.accentColor = "#10B981";
  } else if (promptLower.includes("red")) {
    result.accentColor = "#EF4444";
  } else if (promptLower.includes("purple")) {
    result.accentColor = "#8B5CF6";
  } else if (promptLower.includes("pink")) {
    result.accentColor = "#EC4899";
  } else if (promptLower.includes("orange")) {
    result.accentColor = "#F59E0B";
  } else if (promptLower.includes("yellow")) {
    result.accentColor = "#FBBF24";
  } else if (promptLower.includes("teal")) {
    result.accentColor = "#14B8A6";
  } else if (promptLower.includes("cyan")) {
    result.accentColor = "#22D3EE";
  } else if (promptLower.includes("lime")) {
    result.accentColor = "#84CC16";
  } else if (promptLower.includes("gold") || promptLower.includes("yellow")) {
    result.accentColor = "#F59E0B";
  }
  
  // Button color based on layer type and prompt
  if (promptLower.includes("glass")) {
    result.buttonColor = "rgba(255, 255, 255, 0.1)";
    result.boxShadow = "0 8px 32px rgba(31, 38, 135, 0.15)";
    result.borderRadius = "24px";
  } else if (promptLower.includes("sharp") || promptLower.includes("angular")) {
    result.borderRadius = "4px";
  } else if (promptLower.includes("rounded") || promptLower.includes("soft")) {
    result.borderRadius = "32px";
  }
  
  // Button text color logic
  const accentColorHex = result.accentColor.replace("#", "");
  // Simple luminance check (very approximate)
  const r = parseInt(accentColorHex.substring(0, 2), 16);
  const g = parseInt(accentColorHex.substring(2, 4), 16);
  const b = parseInt(accentColorHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  result.buttonTextColor = luminance > 0.5 ? "#000000" : "#ffffff";
  
  return result;
};

// Convert image to style object based on prompt
const generateStyleFromImage = (imageUrl: string, prompt: string, layerType: string): Record<string, any> => {
  // Extract style information from prompt
  const styleInfo = extractColorsFromPrompt(prompt);
  
  // Create the final style object
  return {
    backgroundColor: styleInfo.backgroundColor,
    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
    accentColor: styleInfo.accentColor,
    textColor: styleInfo.textColor,
    buttonColor: styleInfo.buttonColor,
    buttonTextColor: styleInfo.buttonTextColor,
    borderRadius: styleInfo.borderRadius,
    fontFamily: "Inter, sans-serif",
    boxShadow: styleInfo.boxShadow,
    imageUrl,
    styleNotes: styleInfo.styleNotes,
    generatedAt: new Date().toISOString()
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { prompt, image_url, layer_type, user_id } = await req.json();

    // Validate required fields
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!layer_type || !['login', 'wallet'].includes(layer_type)) {
      return new Response(
        JSON.stringify({ error: "Valid layer_type (login or wallet) is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create initial request record
    const { data: requestData, error: createError } = await supabase
      .from('ai_requests')
      .insert({
        user_id,
        prompt,
        image_url,
        layer_type,
        status: 'pending'
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating request record:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create request record", details: createError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestId = requestData.id;
    console.log(`Created request record with ID: ${requestId}`);
    
    try {
      // Generate image from OpenAI
      const enhancedPrompt = `Create a ${layer_type === 'login' ? 'login screen' : 'wallet interface'} design with ${prompt}. Make it suitable for a modern web application.`;
      
      // If user provided an image, use it as reference but still generate a new image
      // This ensures we have a cohesive style based on both the image and prompt
      let generatedImageUrl = "";
      if (image_url) {
        // Use the image_url as inspiration in the prompt
        const imageInspiredPrompt = `${enhancedPrompt} Design inspired by the uploaded reference image. Maintain visual cohesion with the image's style and color palette.`;
        generatedImageUrl = await generateImageWithOpenAI(imageInspiredPrompt);
      } else {
        // Regular image generation without reference
        generatedImageUrl = await generateImageWithOpenAI(enhancedPrompt);
      }
      
      // Generate style object from image and prompt
      const styleResult = generateStyleFromImage(generatedImageUrl, prompt, layer_type);
      
      // Update the request record with the generated style
      const { data: updatedData, error: updateError } = await supabase
        .from('ai_requests')
        .update({
          status: 'completed',
          style_result: styleResult,
        })
        .eq('id', requestId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Error updating request record:", updateError);
        throw new Error("Failed to update request record");
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          style: styleResult,
          request_id: requestId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error("Error in generation process:", error);
      
      // Update the request record with failure status
      await supabase
        .from('ai_requests')
        .update({
          status: 'failed',
        })
        .eq('id', requestId);
      
      return new Response(
        JSON.stringify({ 
          error: "Style generation failed", 
          details: error.message,
          request_id: requestId 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
