
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

// OpenAI model mapping
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

// Convert image to style object based on prompt
const generateStyleFromImage = (imageUrl: string, prompt: string, layerType: string): Record<string, any> => {
  // Extract color and style preferences from prompt
  const isDark = prompt.toLowerCase().includes("dark") || prompt.toLowerCase().includes("black");
  const isLight = prompt.toLowerCase().includes("light") || prompt.toLowerCase().includes("white");
  const hasPurple = prompt.toLowerCase().includes("purple");
  const hasBlue = prompt.toLowerCase().includes("blue");
  const hasGreen = prompt.toLowerCase().includes("green");
  const hasRed = prompt.toLowerCase().includes("red");
  const hasGold = prompt.toLowerCase().includes("gold");
  const isRounded = prompt.toLowerCase().includes("rounded") || prompt.toLowerCase().includes("soft");
  const isSharp = prompt.toLowerCase().includes("sharp") || prompt.toLowerCase().includes("angular");
  const isGradient = prompt.toLowerCase().includes("gradient");
  const isGlass = prompt.toLowerCase().includes("glass") || prompt.toLowerCase().includes("transparent");
  const isNeon = prompt.toLowerCase().includes("neon") || prompt.toLowerCase().includes("glow");

  // Generate style properties based on the prompt and image
  let backgroundColor = isDark ? "#121212" : isLight ? "#F8F9FA" : "#1A103D";
  let textColor = isDark ? "#FFFFFF" : "#121212";
  let accentColor = "#9945FF"; // Default Phantom purple
  let buttonColor = accentColor;
  let buttonTextColor = isDark ? "#000000" : "#FFFFFF";
  let borderRadius = isRounded ? "24px" : isSharp ? "4px" : "12px";
  let boxShadow = isGlass ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "0 4px 12px rgba(0, 0, 0, 0.25)";

  // Adjust accent color based on prompt colors
  if (hasPurple) accentColor = "#9945FF";
  if (hasBlue) accentColor = "#3B82F6";
  if (hasGreen) accentColor = "#10B981";
  if (hasRed) accentColor = "#EF4444";
  if (hasGold) accentColor = "#F59E0B";
  
  // Adjust button color
  buttonColor = layerType === 'login' ? accentColor : (isDark ? "rgba(40, 40, 40, 0.8)" : "#EFEFEF");
  
  // Create the style object
  return {
    backgroundColor,
    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
    accentColor,
    textColor,
    buttonColor,
    buttonTextColor,
    borderRadius,
    fontFamily: "Inter, sans-serif",
    boxShadow,
    imageUrl,
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
      const generatedImageUrl = await generateImageWithOpenAI(enhancedPrompt);
      
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
