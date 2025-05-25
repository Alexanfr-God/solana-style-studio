
// V4 Architecture: Background removal using Hugging Face
export async function removeBackgroundHuggingFace(imageUrl: string): Promise<string> {
  console.log("🎨 Starting V4 background removal with Hugging Face");
  
  try {
    const HUGGING_FACE_TOKEN = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
    
    if (!HUGGING_FACE_TOKEN) {
      console.log("⚠️ Hugging Face token not found, returning original image");
      return imageUrl;
    }

    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log("📥 Image downloaded for background removal");

    // Call Hugging Face background removal API
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
      console.log("⚠️ Background removal failed, returning original");
      return imageUrl;
    }

    const resultBlob = await response.blob();
    
    // Convert blob to base64 for immediate return
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const processedImageUrl = `data:image/png;base64,${base64}`;
    
    console.log("✅ Background removal completed successfully");
    return processedImageUrl;

  } catch (error) {
    console.error("❌ Background removal error:", error);
    return imageUrl; // Return original on error
  }
}

export async function validateBackgroundRemoval(
  originalUrl: string, 
  processedUrl: string
): Promise<boolean> {
  try {
    // Simple validation - check if processed image is different from original
    return processedUrl !== originalUrl && processedUrl.includes('data:image');
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}
