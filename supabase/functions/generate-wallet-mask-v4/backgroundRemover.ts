// Background removal using Hugging Face API
// Focuses on keeping character and black rectangle, removing everything else

export async function removeBackground(imageUrl: string, huggingFaceToken: string): Promise<string> {
  console.log('🧼 Starting background removal with Hugging Face...');
  
  try {
    // Download the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBlob = await imageResponse.blob();
    console.log(`📥 Image downloaded, size: ${imageBlob.size} bytes`);

    // Create form data for Hugging Face API
    const formData = new FormData();
    formData.append('inputs', imageBlob);

    // Call Hugging Face image segmentation API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/briaai/RMBG-1.4',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    const resultBlob = await response.blob();
    console.log(`🎨 Background removal completed, result size: ${resultBlob.size} bytes`);

    // Convert blob to data URL for return
    const arrayBuffer = await resultBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:image/png;base64,${base64}`;

    console.log('✅ Background removal successful');
    return dataUrl;

  } catch (error) {
    console.error('❌ Background removal failed:', error);
    throw new Error(`Background removal failed: ${error.message}`);
  }
}

export async function validateBackgroundRemoval(originalUrl: string, processedUrl: string): Promise<boolean> {
  // Simple validation - check if processed image is different from original
  try {
    const [originalResponse, processedResponse] = await Promise.all([
      fetch(originalUrl),
      fetch(processedUrl)
    ]);

    if (!originalResponse.ok || !processedResponse.ok) {
      return false;
    }

    const [originalBlob, processedBlob] = await Promise.all([
      originalResponse.blob(),
      processedResponse.blob()
    ]);

    // Different size indicates processing occurred
    const sizeDifference = Math.abs(originalBlob.size - processedBlob.size);
    const isProcessed = sizeDifference > 1000; // At least 1KB difference

    console.log(`🔍 Validation: original=${originalBlob.size}b, processed=${processedBlob.size}b, different=${isProcessed}`);
    return isProcessed;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}
