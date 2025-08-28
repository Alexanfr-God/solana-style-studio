
// Local palette extraction from images (no external APIs required)

export interface ExtractedPalette {
  bg: string;
  text: string;
  primary: string;
  secondary?: string;
}

export async function extractPaletteLocal(imageBlob: Blob): Promise<ExtractedPalette> {
  try {
    console.log('🎨 Starting local palette extraction...');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Load image from blob
    const img = await loadImageFromBlob(imageBlob);
    
    // Set canvas size (resize for performance)
    const maxSize = 200;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Sample pixels (every 10th pixel for performance)
    const colors: Array<{r: number, g: number, b: number}> = [];
    
    for (let i = 0; i < pixels.length; i += 40) { // Skip alpha channel, sample every 10th pixel
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];
      
      // Skip transparent pixels
      if (alpha > 128) {
        colors.push({ r, g, b });
      }
    }
    
    console.log(`📊 Analyzed ${colors.length} color samples`);
    
    // Find dominant colors
    const dominantColor = findDominantColor(colors);
    const brightColors = colors.filter(c => getBrightness(c) > 150);
    const darkColors = colors.filter(c => getBrightness(c) < 100);
    
    // Determine background (most frequent)
    const bg = rgbToHex(dominantColor);
    
    // Determine text color (contrasting with background)
    const bgBrightness = getBrightness(dominantColor);
    const text = bgBrightness > 128 ? '#000000' : '#FFFFFF';
    
    // Find primary color (saturated, not too similar to bg)
    let primaryColor = brightColors.length > 0 
      ? findMostSaturated(brightColors)
      : findMostSaturated(colors);
    
    // Ensure primary is different from background
    if (colorDistance(primaryColor, dominantColor) < 100) {
      primaryColor = bgBrightness > 128 
        ? { r: 139, g: 51, b: 234 } // Purple
        : { r: 255, g: 215, b: 0 }; // Gold
    }
    
    const primary = rgbToHex(primaryColor);
    
    // Secondary color (optional)
    const secondaryColor = darkColors.length > 0 && brightColors.length > 0
      ? findMostSaturated(darkColors.length > brightColors.length ? darkColors : brightColors)
      : undefined;
    
    const secondary = secondaryColor ? rgbToHex(secondaryColor) : undefined;
    
    const palette = { bg, text, primary, secondary };
    
    console.log('🎯 Extracted palette:', palette);
    
    return palette;
  } catch (error) {
    console.error('❌ Palette extraction failed:', error);
    throw new Error(`Palette extraction failed: ${error.message}`);
  }
}

// Helper functions
function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function findDominantColor(colors: Array<{r: number, g: number, b: number}>): {r: number, g: number, b: number} {
  if (colors.length === 0) return { r: 26, g: 26, b: 46 }; // Default dark
  
  // Simple clustering: group similar colors
  const buckets = new Map<string, {color: {r: number, g: number, b: number}, count: number}>();
  
  colors.forEach(color => {
    // Quantize to reduce color space
    const key = `${Math.floor(color.r / 32)}-${Math.floor(color.g / 32)}-${Math.floor(color.b / 32)}`;
    const existing = buckets.get(key);
    
    if (existing) {
      existing.count++;
    } else {
      buckets.set(key, { color, count: 1 });
    }
  });
  
  // Find most frequent
  let dominant = { color: colors[0], count: 0 };
  for (const bucket of buckets.values()) {
    if (bucket.count > dominant.count) {
      dominant = bucket;
    }
  }
  
  return dominant.color;
}

function findMostSaturated(colors: Array<{r: number, g: number, b: number}>): {r: number, g: number, b: number} {
  if (colors.length === 0) return { r: 139, g: 51, b: 234 }; // Default purple
  
  let mostSaturated = colors[0];
  let maxSaturation = getSaturation(colors[0]);
  
  for (const color of colors) {
    const saturation = getSaturation(color);
    if (saturation > maxSaturation) {
      maxSaturation = saturation;
      mostSaturated = color;
    }
  }
  
  return mostSaturated;
}

function getBrightness(color: {r: number, g: number, b: number}): number {
  return (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
}

function getSaturation(color: {r: number, g: number, b: number}): number {
  const max = Math.max(color.r, color.g, color.b);
  const min = Math.min(color.r, color.g, color.b);
  return max === 0 ? 0 : (max - min) / max;
}

function colorDistance(c1: {r: number, g: number, b: number}, c2: {r: number, g: number, b: number}): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function rgbToHex(color: {r: number, g: number, b: number}): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}
