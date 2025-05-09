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
const generateImageWithOpenAI = async (prompt: string, layerType: string): Promise<string> => {
  console.log("Calling OpenAI API with prompt:", prompt);
  
  // Sanitize prompt to prevent UI elements from appearing
  const sanitizedPrompt = prompt
    .replace(/enter\s+(?:your\s+)?password/gi, '')
    .replace(/unlock/gi, '')
    .replace(/forgot\s+password/gi, '')
    .replace(/sign\s+in/gi, '')
    .replace(/log\s+in/gi, '')
    .replace(/button/gi, '')
    .replace(/field/gi, '')
    .replace(/input/gi, '')
    .trim();
  
  // Create layer-specific prompts
  let enhancedPrompt = "";
  
  if (layerType === "login") {
    enhancedPrompt = `Artistic background design for a crypto wallet login screen. 
    ${sanitizedPrompt}. 
    Style: Expressive, visually impressive with elements of graffiti, cyberpunk, cosmic, or abstract NFT aesthetics. 
    Use vibrant colors, strong contrast. 
    Include abstract elements, possibly a stylized ghost icon. 
    Do NOT include any UI elements like text fields, buttons, or placeholder content. 
    NO text like "Enter your password", "Forgot password", or "Unlock".
    NO user interface elements whatsoever.
    Create only a BACKGROUND ARTWORK, not a complete UI.`;
  } else {
    enhancedPrompt = `Subtle minimal background design for a crypto wallet interface. 
    ${sanitizedPrompt}. 
    Style: Clean, minimalist, and unobtrusive to ensure readability for financial data and buttons. 
    Use soft gradients or light abstract shapes with a limited color palette. 
    NO UI elements like buttons, input fields, or labels. 
    NO text of any kind.
    NO user interface elements whatsoever.
    Create only a CLEAN BACKGROUND, not a UI design.`;
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd"
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

// Utility function to extract dominant color from an image URL
const extractDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    // We need to get the image data first
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    // Since we can't use color-thief directly in Deno, we'll use a simpler approach
    // This is a placeholder implementation that returns a color based on the image URL's hash
    // In a production environment, you would use a proper image processing library or API
    
    // Generate a deterministic but varied color from the URL
    let hash = 0;
    for (let i = 0; i < imageUrl.length; i++) {
      hash = ((hash << 5) - hash) + imageUrl.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate RGB values between 30 and 230 to avoid too dark or too light colors
    const r = Math.abs(hash % 200) + 30;
    const g = Math.abs((hash >> 8) % 200) + 30;
    const b = Math.abs((hash >> 16) % 200) + 30;
    
    return `rgb(${r}, ${g}, ${b})`;
  } catch (error) {
    console.error("Error extracting dominant color:", error);
    return "rgb(153, 69, 255)"; // Default purple color
  }
};

// Calculate contrast color (light or dark) based on background color
const getContrastColor = (color: string): string => {
  // Extract RGB values from the color string
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  
  if (!rgbMatch) return "#ffffff"; // Default to white if format doesn't match
  
  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);
  
  // Calculate relative luminance
  // Formula: https://www.w3.org/TR/WCAG20-TECHS/G18.html
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Function to extract colors and style information from the prompt and image
const extractStyleFromPrompt = async (prompt: string, imageUrl: string | null, layerType: string): Promise<{
  backgroundColor: string;
  textColor: string; 
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  boxShadow: string;
  fontFamily: string;
  styleNotes: string;
}> => {
  // Initialize with sensible defaults based on layer type
  let result = layerType === "login" ? 
    // Login defaults: more expressive
    {
      backgroundColor: "#121212",
      textColor: "#ffffff",
      accentColor: "#9945FF",
      buttonColor: "#9945FF",
      buttonTextColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
      fontFamily: "Inter, sans-serif",
      styleNotes: "modern, expressive"
    } : 
    // Wallet defaults: more subtle
    {
      backgroundColor: "#121212",
      textColor: "#ffffff",
      accentColor: "#9945FF",
      buttonColor: "rgba(40, 40, 40, 0.8)",
      buttonTextColor: "#9945FF",
      borderRadius: "12px",
      fontFamily: "Inter, sans-serif",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
      styleNotes: "minimal, functional"
    };
  
  // Extract dominant color from image if available
  if (imageUrl) {
    const dominantColor = await extractDominantColor(imageUrl);
    
    // Set accent and button colors based on the dominant color
    if (layerType === "login") {
      result.accentColor = dominantColor;
      result.buttonColor = dominantColor;
      result.buttonTextColor = getContrastColor(dominantColor);
    } else {
      result.accentColor = dominantColor;
      // For wallet, keep the button color subtle but with accent color text
      result.buttonTextColor = dominantColor;
    }
  }
  
  // Color extraction logic from prompt
  const promptLower = prompt.toLowerCase();
  
  // Extract style notes based on prompt content
  const styleTerms = [];
  if (promptLower.includes("futuristic")) styleTerms.push("futuristic");
  if (promptLower.includes("minimal") || promptLower.includes("clean")) styleTerms.push("minimalist");
  if (promptLower.includes("glass") || promptLower.includes("transparent")) styleTerms.push("glassmorphic");
  if (promptLower.includes("gradient")) styleTerms.push("gradient");
  if (promptLower.includes("neon") || promptLower.includes("glow")) styleTerms.push("neon glow");
  if (promptLower.includes("dark")) styleTerms.push("dark mode");
  if (promptLower.includes("light")) styleTerms.push("light mode");
  if (promptLower.includes("graffiti") || promptLower.includes("street art")) styleTerms.push("graffiti style");
  if (promptLower.includes("cyberpunk")) styleTerms.push("cyberpunk");
  if (promptLower.includes("cosmic") || promptLower.includes("galaxy")) styleTerms.push("cosmic");
  if (promptLower.includes("nft") || promptLower.includes("digital art")) styleTerms.push("NFT aesthetic");
  
  // Custom font selection based on style
  if (promptLower.includes("futuristic") || promptLower.includes("cyber")) {
    result.fontFamily = "Space Grotesk, sans-serif";
  } else if (promptLower.includes("minimal") || promptLower.includes("clean")) {
    result.fontFamily = "Inter, sans-serif";
  } else if (promptLower.includes("elegant") || promptLower.includes("luxury")) {
    result.fontFamily = "Playfair Display, serif";
  } else if (promptLower.includes("tech") || promptLower.includes("code")) {
    result.fontFamily = "JetBrains Mono, monospace";
  } else if (promptLower.includes("bold") || promptLower.includes("strong")) {
    result.fontFamily = "Montserrat, sans-serif";
  }
  
  // If we have style terms, join them
  if (styleTerms.length > 0) {
    result.styleNotes = styleTerms.join(", ");
  } else {
    // Default style notes based on layer type
    result.styleNotes = layerType === "login" ? 
      "custom crypto login design" : 
      "minimal wallet interface";
  }
  
  // If image is provided, add that to style notes
  if (imageUrl) {
    result.styleNotes += ", image-inspired";
  }
  
  // Background color detection
  if (promptLower.includes("dark")) {
    result.backgroundColor = "#121212";
    result.textColor = "#ffffff";
  } else if (promptLower.includes("light")) {
    result.backgroundColor = "#f8f8f8";
    result.textColor = "#121212";
  }
  
  // Accent color detection from prompt keywords with more color options
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
  } else if (promptLower.includes("black")) {
    result.accentColor = "#000000";
  } else if (promptLower.includes("white")) {
    result.accentColor = "#FFFFFF";
  } else if (promptLower.includes("gray") || promptLower.includes("grey")) {
    result.accentColor = "#6B7280";
  }
  
  // Layer-specific UI customization
  if (layerType === "login") {
    // Login screen - potentially more flashy UI
    result.buttonColor = result.accentColor;
    
    if (promptLower.includes("glass")) {
      result.buttonColor = "rgba(255, 255, 255, 0.1)";
      result.boxShadow = "0 8px 32px rgba(31, 38, 135, 0.15)";
      result.borderRadius = "24px";
    } else if (promptLower.includes("sharp") || promptLower.includes("angular")) {
      result.borderRadius = "4px";
    } else if (promptLower.includes("rounded") || promptLower.includes("soft")) {
      result.borderRadius = "32px";
    }
  } else {
    // Wallet screen - more subdued UI
    // For wallet, we often want more subtle buttons
    result.buttonColor = "rgba(40, 40, 40, 0.8)";
    result.borderRadius = "12px";
    result.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.15)";
  }
  
  // Button text color logic - determine if text should be dark or light based on button color
  const accentColorHex = result.buttonColor.startsWith("rgba") ? result.accentColor : result.buttonColor;
  if (accentColorHex.startsWith("rgb")) {
    result.buttonTextColor = getContrastColor(accentColorHex);
  } else {
    const hexColor = accentColorHex.replace("#", "");
    
    if (hexColor.length >= 6) {
      // Simple luminance check (very approximate)
      const r = parseInt(hexColor.substring(0, 2), 16);
      const g = parseInt(hexColor.substring(2, 4), 16);
      const b = parseInt(hexColor.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      result.buttonTextColor = luminance > 0.5 ? "#000000" : "#ffffff";
    } else {
      // Default contrast for rgba values or invalid hex
      result.buttonTextColor = result.buttonColor.includes("rgba") && 
                              result.buttonColor.includes("255, 255, 255") ? 
                              "#000000" : "#ffffff";
    }
  }
  
  return result;
};

// Convert image to style object based on prompt
const generateStyleFromImage = async (imageUrl: string, prompt: string, layerType: string): Promise<Record<string, any>> => {
  // Extract style information from prompt and image
  const styleInfo = await extractStyleFromPrompt(prompt, imageUrl, layerType);
  
  // Create the final style object that matches the required structure
  return {
    backgroundColor: styleInfo.backgroundColor,
    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
    accentColor: styleInfo.accentColor,
    textColor: styleInfo.textColor,
    buttonColor: styleInfo.buttonColor,
    buttonTextColor: styleInfo.buttonTextColor,
    borderRadius: styleInfo.borderRadius,
    fontFamily: styleInfo.fontFamily,
    boxShadow: styleInfo.boxShadow,
    styleNotes: styleInfo.styleNotes,
    
    // Additional fields required in the updated structure
    background: imageUrl || styleInfo.backgroundColor,
    fontColor: styleInfo.textColor,
    
    // Metadata for internal use
    generatedAt: new Date().toISOString(),
    layerType: layerType
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

    // Sanitize the prompt to prevent UI elements from being included in the generated image
    const sanitizedPrompt = prompt
      .replace(/enter\s+(?:your\s+)?password/gi, '')
      .replace(/unlock/gi, '')
      .replace(/forgot\s+password/gi, '')
      .replace(/sign\s+in/gi, '')
      .replace(/log\s+in/gi, '')
      .replace(/button/gi, '')
      .replace(/field/gi, '')
      .replace(/input/gi, '')
      .trim();

    // Validate required fields
    if (!sanitizedPrompt) {
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
        prompt: sanitizedPrompt,
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
      // Generate image from OpenAI using the sanitized prompt
      let generatedImageUrl = "";
      if (image_url) {
        // Use the image_url as inspiration in the prompt
        generatedImageUrl = await generateImageWithOpenAI(`${sanitizedPrompt}. Design inspired by the reference image`, layer_type);
      } else {
        // Regular image generation without reference
        generatedImageUrl = await generateImageWithOpenAI(sanitizedPrompt, layer_type);
      }
      
      // Generate style object from image and prompt
      const styleResult = await generateStyleFromImage(generatedImageUrl, sanitizedPrompt, layer_type);
      
      // Update the request record with the generated style
      const { data: updatedData, error: updateError } = await supabase
        .from('ai_requests')
        .update({
          status: 'completed',
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
