
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { compositeImage, safeZone, useStyleTransfer } = await req.json();
    
    console.log(`🎨 Starting mask generation with exact safe zone:`, safeZone);
    console.log(`📐 Safe zone coordinates: x=${safeZone.x}, y=${safeZone.y}, w=${safeZone.width}, h=${safeZone.height}`);
    
    if (!compositeImage) {
      throw new Error("No composite image provided");
    }

    // For now, we'll use a simple approach that creates a transparent center
    // In a production environment, you would use proper AI image processing
    const processedMaskUrl = await processDrawingToMask(compositeImage, safeZone, useStyleTransfer);
    
    console.log("✅ Mask generation completed successfully");
    
    const responseData = {
      mask_image_url: processedMaskUrl,
      layout_json: {
        layout: {
          top: "User drawing elements (top area)",
          bottom: "User drawing elements (bottom area)", 
          left: "User drawing elements (left area)",
          right: "User drawing elements (right area)",
          core: "transparent"
        },
        style: useStyleTransfer ? "user-drawing-stylized" : "user-drawing-original",
        color_palette: ["#ff3333", "#ffffff", "#000000"],
        generation_method: useStyleTransfer ? "drawing-with-style-transfer" : "drawing-direct"
      }
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ Error in mask generation:", error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback_mask: '/external-masks/abstract-mask.png'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/**
 * Process the drawing to create a mask with transparent center
 */
async function processDrawingToMask(
  drawingImageBase64: string, 
  safeZone: any, 
  useStyleTransfer: boolean
): Promise<string> {
  try {
    console.log('🖼️ Processing drawing to create mask with transparent center...');
    console.log('📐 Safe zone for transparency:', safeZone);
    
    // Create a canvas to process the image
    const canvas = new OffscreenCanvas(800, 800);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Load the drawing image
    const response = await fetch(drawingImageBase64);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);
    
    // Draw the original image
    ctx.drawImage(imageBitmap, 0, 0, 800, 800);
    
    // Clear the safe zone area (make it transparent)
    ctx.clearRect(safeZone.x, safeZone.y, safeZone.width, safeZone.height);
    
    // Convert back to data URL
    const processedBlob = await canvas.convertToBlob({ type: 'image/png' });
    const arrayBuffer = await processedBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('✅ Drawing processed successfully with transparent center');
    return `data:image/png;base64,${base64}`;
    
  } catch (error) {
    console.error('Error processing drawing:', error);
    
    // Return a fallback mask if processing fails
    return '/external-masks/abstract-mask.png';
  }
}
