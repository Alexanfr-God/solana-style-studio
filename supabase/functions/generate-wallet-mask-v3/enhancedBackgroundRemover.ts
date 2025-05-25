
// V4 Enhanced: Multi-Model Background Removal System
export async function enhancedBackgroundRemoval(imageUrl: string): Promise<{
  processedUrl: string;
  method: string;
  success: boolean;
}> {
  console.log("🎨 V4 Enhanced: Starting multi-model background removal system");
  
  const HUGGING_FACE_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
  
  if (!HUGGING_FACE_TOKEN) {
    console.log("⚠️ V4 Enhanced: No Hugging Face token, skipping background removal");
    return { processedUrl: imageUrl, method: "none", success: false };
  }

  // Try multiple models in order of preference
  const models = [
    "briaai/RMBG-1.4",
    "Xenova/rembg-new", 
    "briaai/RMBG-2.0"
  ];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`🔄 V4 Enhanced: Attempting background removal with model ${i + 1}/${models.length}: ${model}`);
    
    try {
      const result = await tryBackgroundRemovalWithModel(imageUrl, model, HUGGING_FACE_TOKEN);
      if (result.success) {
        console.log(`✅ V4 Enhanced: Background removal successful with ${model}`);
        return { processedUrl: result.processedUrl, method: model, success: true };
      }
    } catch (error) {
      console.log(`❌ V4 Enhanced: Model ${model} failed:`, error.message);
      continue;
    }
  }

  console.log("⚠️ V4 Enhanced: All background removal models failed, returning original");
  return { processedUrl: imageUrl, method: "failed", success: false };
}

async function tryBackgroundRemovalWithModel(
  imageUrl: string, 
  model: string, 
  token: string
): Promise<{ processedUrl: string; success: boolean }> {
  
  // Download image
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }
  
  const imageBlob = await imageResponse.blob();
  console.log(`📥 V4 Enhanced: Image downloaded for ${model} processing`);

  // Call Hugging Face API with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: imageBlob,
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`API responded with ${response.status}: ${errorText}`);
    }

    const resultBlob = await response.blob();
    
    // Validate result
    if (resultBlob.size < 1000) {
      throw new Error("Result too small, likely invalid");
    }
    
    // Convert to base64
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const processedImageUrl = `data:image/png;base64,${base64}`;
    
    console.log(`📊 V4 Enhanced: ${model} processed image size:`, Math.round(processedImageUrl.length / 1024), "KB");
    
    return { processedUrl: processedImageUrl, success: true };
    
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export function validateBackgroundRemovalResult(
  originalUrl: string, 
  processedUrl: string, 
  method: string
): boolean {
  try {
    const isProcessed = processedUrl !== originalUrl && 
                       processedUrl.includes('data:image/png;base64,') &&
                       processedUrl.length > originalUrl.length * 0.3;
    
    console.log("🔍 V4 Enhanced background removal validation:", {
      method,
      originalLength: originalUrl.length,
      processedLength: processedUrl.length,
      isBase64PNG: processedUrl.includes('data:image/png;base64,'),
      isValid: isProcessed
    });
    
    return isProcessed;
  } catch (error) {
    console.error("❌ V4 Enhanced validation error:", error);
    return false;
  }
}
