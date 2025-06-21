
// Image analysis utility functions

/**
 * Generates a background image using DALL-E based on the provided prompt
 * @param prompt Enhanced prompt for image generation
 * @param apiKey OpenAI API key
 * @returns URL of the generated image
 */
export async function generateBackgroundImage(prompt: string, apiKey: string): Promise<string> {
  // Clean and validate API key
  const cleanApiKey = apiKey.trim();
  if (!cleanApiKey || !cleanApiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format - must start with sk-');
  }

  console.log('🔑 Using OPENA_API_KEY for DALL-E image generation');

  // Create proper headers object
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${cleanApiKey}`);

  console.log('🎨 Generating image with dall-e-3 model...');

  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json"
    }),
  });

  if (!imageResponse.ok) {
    const errorData = await imageResponse.json().catch(() => ({ error: 'Unknown error' }));
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${imageResponse.status} - ${JSON.stringify(errorData)}`);
  }

  const imageData = await imageResponse.json();
  console.log('✅ OpenAI response received, processing image data...');

  if (!imageData.data || !imageData.data[0]) {
    throw new Error('Invalid response from OpenAI API - no image data');
  }

  // DALL-E 3 returns base64 data when response_format is b64_json
  const base64Data = imageData.data[0].b64_json;
  if (!base64Data) {
    throw new Error('No base64 image data received from OpenAI API');
  }

  // Convert base64 to data URL for immediate use
  const dataUrl = `data:image/png;base64,${base64Data}`;
  console.log('✅ Image converted to data URL successfully');
  
  return dataUrl;
}

/**
 * Saves generated image to Supabase storage and returns public URL
 * @param imageUrl URL or base64 data URL of the generated image
 * @param prompt Original prompt used for generation
 * @param mode Generation mode ('dalle' or 'replicate')
 * @param supabase Supabase client
 * @returns Public URL of saved image
 */
export async function saveImageToBucket(
  imageUrl: string, 
  prompt: string, 
  mode: string,
  supabase: any
): Promise<string> {
  try {
    console.log('💾 Saving image to bucket...');
    
    let imageBlob: Blob;
    
    // Handle different image formats (data URL vs regular URL)
    if (imageUrl.startsWith('data:')) {
      // Convert data URL to blob
      const base64Data = imageUrl.split(',')[1];
      const binaryData = atob(base64Data);
      const uint8Array = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
      }
      imageBlob = new Blob([uint8Array], { type: 'image/png' });
      console.log('✅ Converted data URL to blob');
    } else {
      // Download the image from URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.status}`);
      }
      imageBlob = await imageResponse.blob();
      console.log('✅ Downloaded image from URL');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${mode}-${timestamp}.png`;
    const filepath = `generated/${filename}`;

    console.log(`📁 Uploading to path: ${filepath}`);

    // Upload to storage bucket
    const { data: storageData, error: storageError } = await supabase.storage
      .from('generated-images')
      .upload(filepath, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (storageError) {
      console.error('Storage upload error:', storageError);
      throw new Error(`Failed to save image: ${storageError.message}`);
    }

    console.log('✅ Image uploaded successfully:', storageData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filepath);

    const publicUrl = urlData.publicUrl;
    console.log('🌐 Public URL generated:', publicUrl);

    // Save metadata to database
    try {
      const { error: dbError } = await supabase
        .from('generated_images')
        .insert({
          prompt,
          storage_path: filepath,
          public_url: publicUrl,
          generation_mode: mode,
          metadata: { 
            original_url: imageUrl.startsWith('data:') ? 'base64_data' : imageUrl,
            timestamp,
            size: imageBlob.size
          }
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Don't throw here - image is saved, metadata is optional
      } else {
        console.log('✅ Metadata saved to database');
      }
    } catch (metaError) {
      console.error('Metadata save error:', metaError);
      // Continue - image is successfully saved
    }

    return publicUrl;
  } catch (error) {
    console.error('💥 Error saving image to bucket:', error);
    throw error;
  }
}

/**
 * Extracts dominant colors from an image
 * @param imageUrl URL of the image to analyze
 * @returns Array of hex color codes
 */
export async function getDominantColors(imageUrl: string): Promise<string[]> {
  try {
    // Note: For actual implementation, this would use an image analysis API
    // This is a placeholder implementation that would be replaced with real color extraction
    console.log("Analyzing image colors from:", imageUrl);
    
    // In a real implementation, this would call an API like Cloudinary, Imagga, or a custom ML model
    // For now, we'll return placeholder colors
    return ["#336699", "#993366", "#669933"];
  } catch (error) {
    console.error("Error extracting colors:", error);
    return [];
  }
}

/**
 * Detects objects within an image
 * @param imageUrl URL of the image to analyze
 * @returns Array of detected object labels
 */
export async function detectObjects(imageUrl: string): Promise<string[]> {
  try {
    // Note: For actual implementation, this would use an object detection API
    // This is a placeholder implementation
    console.log("Detecting objects in image:", imageUrl);
    
    // In a real implementation, this would call an API like Google Vision, AWS Rekognition, etc.
    // For now, we'll return placeholder objects
    return ["background", "character", "artwork"];
  } catch (error) {
    console.error("Error detecting objects:", error);
    return [];
  }
}
