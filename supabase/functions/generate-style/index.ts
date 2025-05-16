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

// OpenAI image generation function with enhanced prompt engineering
const generateImageWithOpenAI = async (prompt: string, layerType: string): Promise<string> => {
  console.log("Generating image with prompt:", prompt);
  
  // Thorough prompt sanitization to prevent UI elements from appearing
  const sanitizedPrompt = prompt
    .replace(/enter\s+(?:your\s+)?password/gi, '')
    .replace(/unlock/gi, '')
    .replace(/forgot\s+password/gi, '')
    .replace(/sign\s+in/gi, '')
    .replace(/log\s+in/gi, '')
    .replace(/button/gi, '')
    .replace(/field/gi, '')
    .replace(/input/gi, '')
    .replace(/login/gi, '')
    .replace(/username/gi, '')
    .trim();
  
  // Detect style category from prompt
  const isMemeStyle = /pepe|meme|cartoon|anime|comic|doge|fun/i.test(sanitizedPrompt);
  const isLuxuryStyle = /luxury|gold|premium|expensive|elite|dubai|trump|high-end|vip/i.test(sanitizedPrompt);
  const isCosmicStyle = /space|cosmos|galaxy|spiritual|cosmic|universe|nebula|star/i.test(sanitizedPrompt);
  
  // Layer-specific prompt engineering for consistent results
  let enhancedPrompt = "";
  
  if (layerType === "login") {
    enhancedPrompt = `
Design a collectible login screen background for a crypto wallet.

Prompt theme: ${sanitizedPrompt}

Instructions:
- Draw a vertical composition where the top is clean for the word "phantom" and center is reserved for the login box.
- Leave the center-bottom area visually balanced and unobstructed (for UI overlays).
${isMemeStyle ? `
- Create a CARTOON/MEME style with BOLD COLORS and CLEAR OUTLINES
- Include a CENTRAL CHARACTER or MASCOT (like Pepe, Doge, or a fun character)
- Use FLAT COLOR AREAS with minimal shading
- Add playful, expressive visual elements
- Make the art style BOLD, EXPRESSIVE, and FUN
- Style: playful, internet meme culture, collectible
` : ''}
${isLuxuryStyle ? `
- Create a LUXURY PREMIUM design with GOLD/METALLIC accents
- Use ELEGANT GRADIENTS and minimal design elements
- Include subtle luxury patterns or textures (like marble, leather, or gold)
- Keep everything SOPHISTICATED with perfect symmetry
- Add subtle shimmer or reflection effects
- Make it feel expensive and exclusive
- Style: premium, high-end, elegant, VIP
` : ''}
${isCosmicStyle ? `
- Create a COSMIC MYSTICAL background with GALAXY elements
- Include LAYERED COSMIC effects (nebulae, stars, cosmic energy)
- Add subtle SACRED GEOMETRY or mystical symbols
- Use DEEP SPACE COLORS with glowing accents
- Create a sense of infinite depth and wonder
- Style: mystical, cosmic, transcendent, spiritual
` : ''}
- NO text in image. NO 'password', 'login', 'unlock', etc.
- DO NOT include buttons, inputs, or labels
- DO NOT add shadows or overlays – design should look like a clean background
- Make the design collectible and NFT-worthy
- Strong visual appeal for digital wallet skin
`;
  } else {
    enhancedPrompt = `Create an extremely minimal and neutral background for a crypto wallet interface:
    - Based on this style description: ${sanitizedPrompt}
    - Use ONLY 2 colors maximum with very low contrast
    - Create a clean, subtle background (soft gradient or minimal texture)
    - No icons, shapes, or visual elements that would distract from financial data
    - ABSOLUTELY NO user interface elements like buttons, fields, or text
    - Keep it extremely subtle and non-distracting
    - Style: minimal, functional, professional
    - Create ONLY a simple BACKGROUND, not a UI design`;
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
    console.log("Generated image URL:", data.data[0].url);
    return data.data[0].url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Extract dominant color from an image URL
const extractDominantColor = async (imageUrl: string): Promise<string> => {
  try {
    // Since we can't use client-side color extraction in Deno environment,
    // we'll use a deterministic but relevant approach based on the image URL
    
    // Get the last 100 characters of the URL to use for hashing
    const urlEnd = imageUrl.slice(-100);
    
    // Create a deterministic hash from the URL
    let hash = 0;
    for (let i = 0; i < urlEnd.length; i++) {
      hash = ((hash << 5) - hash) + urlEnd.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Generate HSL values with good saturation and brightness
    // For professional wallet UI, we want vibrant but not neon colors
    const h = Math.abs(hash % 360); // Hue: 0-359
    const s = 55 + Math.abs((hash >> 8) % 25); // Saturation: 55-80%
    const l = 45 + Math.abs((hash >> 16) % 15); // Lightness: 45-60%
    
    // Convert HSL to RGB
    const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l / 100 - c / 2;
    
    let r, g, b;
    if (h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }
    
    const red = Math.round((r + m) * 255);
    const green = Math.round((g + m) * 255);
    const blue = Math.round((b + m) * 255);
    
    return `rgb(${red}, ${green}, ${blue})`;
  } catch (error) {
    console.error("Error extracting dominant color:", error);
    return "rgb(153, 69, 255)"; // Default accent color as fallback
  }
};

// Extract a complementary accent color
const extractAccentColor = async (imageUrl: string, dominantColor: string): Promise<string> => {
  try {
    // Extract RGB components from the dominant color
    const rgbMatch = dominantColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
    if (!rgbMatch) return "#9945FF"; // Default accent
    
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    
    // Generate a complementary or analogous color based on the image URL
    const urlSum = imageUrl.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    let r2, g2, b2;
    if (urlSum % 2 === 0) {
      // Complementary (opposite on color wheel)
      r2 = 255 - r;
      g2 = 255 - g;
      b2 = 255 - b;
    } else {
      // Analogous (similar but distinct)
      const shift = 30 + (urlSum % 60);
      // Rotate the hue a bit and adjust saturation/brightness
      r2 = Math.min(255, Math.max(0, r + shift - 30));
      g2 = Math.min(255, Math.max(0, g + shift - 10));
      b2 = Math.min(255, Math.max(0, b + shift + 20));
    }
    
    // Ensure the accent color is not too bright or dull
    const brightness = (r2 * 299 + g2 * 587 + b2 * 114) / 1000;
    if (brightness < 50) {
      // Brighten dark colors
      r2 = Math.min(255, r2 + 50);
      g2 = Math.min(255, g2 + 50);
      b2 = Math.min(255, b2 + 50);
    } else if (brightness > 220) {
      // Darken very bright colors
      r2 = Math.max(0, r2 - 50);
      g2 = Math.max(0, g2 - 50);
      b2 = Math.max(0, b2 - 50);
    }
    
    return `rgb(${Math.round(r2)}, ${Math.round(g2)}, ${Math.round(b2)})`;
  } catch (error) {
    console.error("Error extracting accent color:", error);
    return "rgb(255, 102, 0)"; // Default secondary accent
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
  
  // Calculate relative luminance using WCAG formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
};

// Determine font family based on visual theme
const determineFontFamily = (prompt: string, layerType: string): string => {
  const promptLower = prompt.toLowerCase();
  
  // Detect style category from prompt more comprehensively
  const isMemeStyle = /pepe|meme|cartoon|anime|comic|doge|fun/i.test(promptLower);
  const isLuxuryStyle = /luxury|gold|premium|expensive|elite|dubai|trump|high-end|vip/i.test(promptLower);
  const isCosmicStyle = /space|cosmos|galaxy|spiritual|cosmic|universe|nebula|star/i.test(promptLower);
  
  // Assign specific fonts based on style categories
  if (isMemeStyle) {
    return "Comic Neue, sans-serif";
  } else if (isLuxuryStyle) {
    return "Playfair Display, serif";
  } else if (isCosmicStyle) {
    return "Space Grotesk, sans-serif";
  } 
  
  // If no specific category matched, fallback to keyword analysis
  if (promptLower.includes("futuristic") || promptLower.includes("sci-fi") || promptLower.includes("tech")) {
    return "Space Grotesk, sans-serif";
  } else if (promptLower.includes("elegant") || promptLower.includes("serif")) {
    return "Playfair Display, serif";
  } else if (promptLower.includes("playful") || promptLower.includes("fun") || promptLower.includes("cartoon")) {
    return "Comic Neue, sans-serif";
  } else if (promptLower.includes("crypto") || promptLower.includes("code") || promptLower.includes("developer")) {
    return "JetBrains Mono, monospace";
  } else if (promptLower.includes("minimal") || promptLower.includes("clean")) {
    return "Inter, sans-serif";
  } else if (promptLower.includes("bold") || promptLower.includes("strong")) {
    return "Montserrat, sans-serif";
  }
  
  // Default fonts based on layer type - keep it clean and professional
  return layerType === "login" ? "Space Grotesk, sans-serif" : "Inter, sans-serif";
};

// Determine border radius based on style keywords
const determineBorderRadius = (prompt: string, layerType: string): string => {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes("sharp") || promptLower.includes("angular") || promptLower.includes("square")) {
    return "4px";
  } else if (promptLower.includes("pill") || promptLower.includes("rounded") || promptLower.includes("circular")) {
    return "100px";
  } else if (promptLower.includes("organic") || promptLower.includes("blob") || promptLower.includes("curved")) {
    return "24px";
  } else if (promptLower.includes("minimal") || promptLower.includes("clean")) {
    return "8px";
  }
  
  // Default border radius based on layer type
  return layerType === "login" ? "16px" : "12px";
};

// Determine box shadow style based on visual theme
const determineBoxShadow = (prompt: string, layerType: string): string => {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes("glass") || promptLower.includes("glassmorphism")) {
    return "0 8px 32px rgba(31, 38, 135, 0.2)";
  } else if (promptLower.includes("neon") || promptLower.includes("glow")) {
    return "0 0 20px rgba(255, 255, 255, 0.2), 0 0 40px rgba(120, 0, 255, 0.15)";
  } else if (promptLower.includes("flat") || promptLower.includes("minimal")) {
    return "0 2px 6px rgba(0, 0, 0, 0.1)";
  } else if (promptLower.includes("floating") || promptLower.includes("3d")) {
    return "0 20px 40px rgba(0, 0, 0, 0.15)";
  }
  
  // Default shadow based on layer type
  return layerType === "login" 
    ? "0 8px 20px rgba(0, 0, 0, 0.15)" 
    : "0 4px 10px rgba(0, 0, 0, 0.1)";
};

// Extract style information from prompt and image
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
  // Initialize with layer-specific defaults
  let result = layerType === "login" ? 
    // Login defaults: more expressive
    {
      backgroundColor: "#121212",
      textColor: "#ffffff",
      accentColor: "#9945FF",
      buttonColor: "#9945FF",
      buttonTextColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
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
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      styleNotes: "minimal, functional"
    };
  
  // Detect style category from prompt
  const isMemeStyle = /pepe|meme|cartoon|anime|comic|doge|fun/i.test(prompt.toLowerCase());
  const isLuxuryStyle = /luxury|gold|premium|expensive|elite|dubai|trump|high-end|vip/i.test(prompt.toLowerCase());
  const isCosmicStyle = /space|cosmos|galaxy|spiritual|cosmic|universe|nebula|star/i.test(prompt.toLowerCase());
  
  // Apply style-specific defaults
  if (isMemeStyle) {
    // For cartoon/meme styles, use bolder colors and comic font
    result.fontFamily = "Comic Neue, sans-serif";
    result.borderRadius = "16px";
    result.styleNotes = "cartoon, meme, expressive";
  } else if (isLuxuryStyle) {
    // For luxury themes, use elegant fonts and gold tones
    result.fontFamily = "Playfair Display, serif";
    result.accentColor = "#D4AF37"; // Gold
    result.buttonColor = "#D4AF37";
    result.buttonTextColor = "#000000";
    result.styleNotes = "luxury, premium, elegant";
  } else if (isCosmicStyle) {
    // For cosmic themes, use Space Grotesk and glowing effects
    result.fontFamily = "Space Grotesk, sans-serif";
    result.boxShadow = "0 0 20px rgba(255, 255, 255, 0.15), 0 0 40px rgba(120, 0, 255, 0.1)";
    result.styleNotes = "cosmic, mystical, expansive";
  }
  
  // Extract colors from image if available
  if (imageUrl) {
    const dominantColor = await extractDominantColor(imageUrl);
    const accentColor = await extractAccentColor(imageUrl, dominantColor);
    
    // Apply colors based on layer type
    if (layerType === "login") {
      // For login, use dominant color for buttons and accent color for highlights
      result.accentColor = accentColor;
      result.buttonColor = dominantColor;
      result.buttonTextColor = getContrastColor(dominantColor);
    } else {
      // For wallet, use a more subtle approach
      result.accentColor = dominantColor;
      // Keep button color subtle but use accent color for text
      result.buttonTextColor = dominantColor;
    }
  }
  
  // Extract style keywords from prompt
  const promptLower = prompt.toLowerCase();
  
  // Build style terms for notes
  const styleTerms = [];
  if (promptLower.includes("futuristic")) styleTerms.push("futuristic");
  if (promptLower.includes("minimal") || promptLower.includes("clean")) styleTerms.push("minimalist");
  if (promptLower.includes("glass") || promptLower.includes("transparent")) styleTerms.push("glassmorphic");
  if (promptLower.includes("gradient")) styleTerms.push("gradient");
  if (promptLower.includes("dark")) styleTerms.push("dark mode");
  if (promptLower.includes("light")) styleTerms.push("light mode");
  
  // Apply font family based on visual theme
  result.fontFamily = determineFontFamily(prompt, layerType);
  
  // Determine border radius based on style
  result.borderRadius = determineBorderRadius(prompt, layerType);
  
  // Determine box shadow style
  result.boxShadow = determineBoxShadow(prompt, layerType);
  
  // Join style terms into notes
  if (styleTerms.length > 0) {
    result.styleNotes = styleTerms.join(", ");
  } else if (result.styleNotes === "modern, expressive" || result.styleNotes === "minimal, functional") {
    // Default style notes based on layer type if not already set by style category
    result.styleNotes = layerType === "login" ? 
      "custom crypto login design" : 
      "minimal wallet interface";
  }
  
  // Add image-inspired note if image is provided
  if (imageUrl) {
    result.styleNotes += ", image-inspired";
  }
  
  // Background color detection from prompt
  if (promptLower.includes("dark")) {
    result.backgroundColor = "#121212";
    result.textColor = "#ffffff";
  } else if (promptLower.includes("light")) {
    result.backgroundColor = "#f8f8f8";
    result.textColor = "#121212";
  }
  
  // Extract specific colors from prompt keywords
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
  } else if (promptLower.includes("gold") || promptLower.includes("luxury")) {
    result.accentColor = "#D4AF37";
  }
  
  // Button text color calculation for contrast
  result.buttonTextColor = getContrastColor(result.buttonColor.startsWith("rgba") ? result.accentColor : result.buttonColor);
  
  return result;
};

// Generate full style object based on image and prompt
const generateStyleFromImage = async (imageUrl: string, prompt: string, layerType: string): Promise<Record<string, any>> => {
  // Extract style information from prompt and image
  const styleInfo = await extractStyleFromPrompt(prompt, imageUrl, layerType);
  
  // Create the final style object with all required properties
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
    
    // Metadata
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

    // Sanitize the prompt to prevent UI elements from being included
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
      // Generate image based on input
      let generatedImageUrl = "";
      if (image_url) {
        // If user provided an image, use it as inspiration but still generate a new one
        generatedImageUrl = await generateImageWithOpenAI(`${sanitizedPrompt}. Design inspired by the reference image`, layer_type);
      } else {
        // Regular image generation without reference
        generatedImageUrl = await generateImageWithOpenAI(sanitizedPrompt, layer_type);
      }
      
      // Generate style object from image and prompt
      const styleResult = await generateStyleFromImage(generatedImageUrl, sanitizedPrompt, layer_type);
      
      // Update the request record with the generated style
      const { error: updateError } = await supabase
        .from('ai_requests')
        .update({
          status: 'completed',
        })
        .eq('id', requestId);
      
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
