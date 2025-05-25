
// V4 Enhanced Architecture: Advanced background removal with Hugging Face
export async function removeBackgroundHuggingFace(imageUrl: string): Promise<string> {
  console.log("🎨 Starting V4 Enhanced background removal with Hugging Face");
  
  try {
    const HUGGING_FACE_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    
    if (!HUGGING_FACE_TOKEN) {
      console.log("⚠️ Hugging Face token not found, returning original image");
      return imageUrl;
    }

    console.log("🔑 Hugging Face token found, proceeding with background removal");

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log("📥 Image downloaded for V4 Enhanced background removal");

    // Call Hugging Face background removal API with enhanced model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: imageBlob,
      }
    );

    if (!response.ok) {
      console.log(`⚠️ V4 Enhanced background removal failed with status ${response.status}, returning original`);
      const errorText = await response.text().catch(() => 'Unknown error');
      console.log("Error details:", errorText);
      return imageUrl;
    }

    const resultBlob = await response.blob();
    console.log("📊 V4 Enhanced background removal blob size:", resultBlob.size);
    
    // Convert blob to base64 for immediate return
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const processedImageUrl = `data:image/png;base64,${base64}`;
    
    console.log("✅ V4 Enhanced background removal completed successfully");
    console.log("🎯 Processed image size:", Math.round(processedImageUrl.length / 1024), "KB");
    
    return processedImageUrl;

  } catch (error) {
    console.error("❌ V4 Enhanced background removal error:", error);
    return imageUrl; // Return original on error
  }
}

export async function validateBackgroundRemoval(
  originalUrl: string, 
  processedUrl: string
): Promise<boolean> {
  try {
    // Enhanced validation - check if processed image is different and is base64 PNG
    const isProcessed = processedUrl !== originalUrl && 
                       processedUrl.includes('data:image/png;base64,') &&
                       processedUrl.length > originalUrl.length * 0.5; // Size check
    
    console.log("🔍 V4 Enhanced background removal validation:", {
      originalLength: originalUrl.length,
      processedLength: processedUrl.length,
      isBase64PNG: processedUrl.includes('data:image/png;base64,'),
      isProcessed
    });
    
    return isProcessed;
  } catch (error) {
    console.error("❌ V4 Enhanced validation error:", error);
    return false;
  }
}

export async function optimizeImageQuality(imageUrl: string): Promise<string> {
  try {
    console.log("🔧 V4 Enhanced: Starting image quality optimization");
    
    // If it's already a base64 image, return as-is
    if (imageUrl.startsWith('data:image')) {
      console.log("✅ V4 Enhanced: Image is already optimized base64");
      return imageUrl;
    }
    
    // For external URLs, we could add additional processing here
    // For now, return the original URL
    return imageUrl;
    
  } catch (error) {
    console.error("❌ V4 Enhanced image optimization error:", error);
    return imageUrl;
  }
}
