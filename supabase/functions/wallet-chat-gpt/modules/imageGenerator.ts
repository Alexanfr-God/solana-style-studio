
// Image generation with DALL-E and Replicate
export async function generateImageWithDALLE(prompt: string, supabase: any) {
  try {
    console.log('🖼️ Calling DALL-E generation...');
    const imageResponse = await supabase.functions.invoke('generate-style', {
      body: {
        prompt: prompt,
        mode: 'image_generation'
      }
    });

    if (imageResponse?.error) {
      throw new Error(`DALL-E generation failed: ${imageResponse.error.message}`);
    }

    const generatedImageUrl = imageResponse?.data?.imageUrl;
    
    if (generatedImageUrl) {
      return {
        success: true,
        imageUrl: generatedImageUrl,
        mode: 'dalle'
      };
    } else {
      throw new Error('No image URL returned from DALL-E service');
    }
  } catch (error) {
    console.error('❌ DALL-E generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'dalle'
    };
  }
}

export async function generateImageWithReplicate(prompt: string, supabase: any) {
  try {
    console.log('🎨 Calling Replicate generation...');
    const imageResponse = await supabase.functions.invoke('generate-wallet-mask-v3', {
      body: {
        prompt: prompt
      }
    });

    if (imageResponse?.error) {
      throw new Error(`Replicate generation failed: ${imageResponse.error.message}`);
    }

    const generatedImageUrl = imageResponse?.data?.output?.[0];
    
    if (generatedImageUrl) {
      return {
        success: true,
        imageUrl: generatedImageUrl,
        mode: 'replicate'
      };
    } else {
      throw new Error('No image URL returned from Replicate service');
    }
  } catch (error) {
    console.error('❌ Replicate generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'replicate'
    };
  }
}
