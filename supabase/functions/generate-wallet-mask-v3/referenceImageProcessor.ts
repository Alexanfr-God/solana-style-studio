
// V4 Enhanced: Reference Image Processing System
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
    // Try to load the reference cutout image
    const referenceImageUrl = "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png";
    
    console.log("🖼️ V4 Enhanced: Loading reference image for precise positioning");
    
    // Test if reference image is accessible
    const response = await fetch(referenceImageUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log("✅ V4 Enhanced: Reference image found and accessible");
      return referenceImageUrl;
    } else {
      console.log("⚠️ V4 Enhanced: Reference image not accessible, using coordinate-based approach");
      return null;
    }
  } catch (error) {
    console.error("❌ V4 Enhanced: Error loading reference image:", error);
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
    ? "using the white background with transparent rectangular cutout as positioning guide"
    : "with black rectangle positioned at coordinates (352,228) dimensions 320x569 pixels";
  
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
  return "physically embracing, hugging, and making direct contact with the central transparent rectangular area";
}

export function getZoneBasedPositioning(zone: 'top' | 'bottom' | 'left' | 'right' | 'all'): string {
  const zones = {
    top: "character positioned above the central rectangle, leaning down and embracing it from above",
    bottom: "character positioned below the central rectangle, reaching up and hugging it from below", 
    left: "character positioned to the left of the central rectangle, embracing it from the side",
    right: "character positioned to the right of the central rectangle, hugging it from the right side",
    all: "character surrounding and embracing the central rectangle from multiple angles"
  };
  
  return zones[zone];
}
