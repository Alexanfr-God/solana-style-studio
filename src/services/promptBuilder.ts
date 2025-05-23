
// This file contains the client-side validation functions
// The main prompt building logic is now in the edge function

export interface SafeZoneConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Default safe zone for 1024x1024 DALL-E canvas with centered wallet UI
const DEFAULT_SAFE_ZONE: SafeZoneConfig = {
  x: 352, // (1024 - 320) / 2
  y: 227, // (1024 - 569) / 2
  width: 320,
  height: 569
};

/**
 * Validates that an image has transparency in the safe zone
 */
export async function validateSafeZoneTransparency(
  imageUrl: string,
  safeZone: SafeZoneConfig = DEFAULT_SAFE_ZONE,
  tolerancePercent: number = 5
): Promise<{ isValid: boolean; opaquePixelPercent: number }> {
  try {
    // Create image element
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });
    
    // Create canvas and get image data
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    ctx.drawImage(img, 0, 0, 1024, 1024);
    const imageData = ctx.getImageData(safeZone.x, safeZone.y, safeZone.width, safeZone.height);
    
    // Check alpha channel in safe zone
    let totalPixels = safeZone.width * safeZone.height;
    let opaquePixels = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const alpha = imageData.data[i + 3];
      if (alpha > 25) { // Consider alpha > 25 as "opaque" (10% opacity threshold)
        opaquePixels++;
      }
    }
    
    const opaquePixelPercent = (opaquePixels / totalPixels) * 100;
    const isValid = opaquePixelPercent <= tolerancePercent;
    
    console.log(`Safe zone validation: ${opaquePixelPercent.toFixed(1)}% opaque pixels (tolerance: ${tolerancePercent}%)`);
    
    return { isValid, opaquePixelPercent };
  } catch (error) {
    console.error('Error validating safe zone:', error);
    // Return true to avoid blocking generation on validation errors
    return { isValid: true, opaquePixelPercent: 0 };
  }
}
