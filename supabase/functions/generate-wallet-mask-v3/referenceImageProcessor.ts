
// V4 Enhanced: Reference Image Processing System with Black Square Guide
import { V4_CONFIG } from './utils/constants.ts';

export interface ReferenceImageConfig {
  imageUrl: string;
  safeZone: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  outputSize: number;
}

export async function loadReferenceImage(): Promise<string | null> {
  try {
    console.log("🖼️ V4 Enhanced: Loading black square reference image for precise DALL-E positioning");
    
    // First try the main black square guide image
    const primaryResponse = await fetch(V4_CONFIG.GUIDE_IMAGE_URL, { method: 'HEAD' });
    
    if (primaryResponse.ok) {
      console.log("✅ V4 Enhanced: Black square guide image found and accessible");
      console.log(`📍 V4 Enhanced: Using guide: ${V4_CONFIG.GUIDE_IMAGE_URL}`);
      return V4_CONFIG.GUIDE_IMAGE_URL;
    }
    
    console.log("⚠️ V4 Enhanced: Primary guide not accessible, trying fallback");
    
    // Try fallback guide image
    const fallbackResponse = await fetch(V4_CONFIG.FALLBACK_GUIDE_URL, { method: 'HEAD' });
    
    if (fallbackResponse.ok) {
      console.log("✅ V4 Enhanced: Fallback guide image accessible");
      console.log(`📍 V4 Enhanced: Using fallback: ${V4_CONFIG.FALLBACK_GUIDE_URL}`);
      return V4_CONFIG.FALLBACK_GUIDE_URL;
    }
    
    console.log("❌ V4 Enhanced: No reference images accessible, using coordinate-based approach");
    return null;
  } catch (error) {
    console.error("❌ V4 Enhanced: Error loading reference images:", error);
    return null;
  }
}

export function buildReferenceGuidedPrompt(
  userPrompt: string,
  style: string,
  hasReferenceImage: boolean
): string {
  const character = getEnhancedCharacterDescription(style);
  const interactionDetails = getPhysicalInteractionDetails();
  
  const positioningInstructions = hasReferenceImage 
    ? "using the provided reference image with BLACK RECTANGULAR AREA as exact positioning guide - character must embrace and interact with this black rectangular zone"
    : "with character positioned around coordinates (352,228) embracing a 320x569 pixel central rectangular area";
  
  return `${character} ${userPrompt} ${interactionDetails} ${positioningInstructions}, COMPLETELY TRANSPARENT BACKGROUND, PNG format, no background elements, professional 4K quality, character must make direct physical contact with the central rectangular area.`;
}

function getEnhancedCharacterDescription(style: string): string {
  const descriptions = {
    cartoon: "vibrant detailed cartoon character with bold expressive features and clear outlines",
    meme: "iconic meme-style character with exaggerated expressions and recognizable features",
    luxury: "elegant sophisticated character with premium details and refined aesthetics",
    modern: "sleek contemporary character with clean geometric design elements",
    realistic: "highly detailed photorealistic character with natural proportions",
    fantasy: "enchanting fantasy character with magical elements and mystical details",
    minimalist: "clean simple character with essential details and clear geometric forms"
  };
  
  return descriptions[style as keyof typeof descriptions] || "detailed expressive character";
}

function getPhysicalInteractionDetails(): string {
  return "physically embracing, hugging, and making direct contact with the central black rectangular area";
}

export function getZoneBasedPositioning(zone: 'top' | 'bottom' | 'left' | 'right' | 'all'): string {
  const zones = {
    top: "character positioned above the central black rectangle, leaning down and embracing it from above",
    bottom: "character positioned below the central black rectangle, reaching up and hugging it from below", 
    left: "character positioned to the left of the central black rectangle, embracing it from the side",
    right: "character positioned to the right of the central black rectangle, hugging it from the right side",
    all: "character surrounding and embracing the central black rectangle from multiple angles"
  };
  
  return zones[zone];
}
