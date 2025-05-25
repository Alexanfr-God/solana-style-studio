
// V4 Enhanced Architecture: Ultra-optimized prompts for character interaction
export function buildSimplePrompt(
  userPrompt: string,
  style: string
): string {
  const styleDescriptions = {
    cartoon: "vibrant detailed cartoon character",
    meme: "expressive meme-style character", 
    luxury: "elegant luxurious character with premium details",
    modern: "sleek futuristic character",
    realistic: "highly detailed photorealistic character",
    fantasy: "magical fantasy character with mystical elements",
    minimalist: "clean simple character with clear lines"
  };

  const character = styleDescriptions[style as keyof typeof styleDescriptions] || "detailed character";
  
  // V4 Enhanced Core Principle: PERFECT INTERACTION + NO BACKGROUND
  return `${character} ${userPrompt} physically hugging and embracing a solid black rectangle in the center, character wrapping arms around the black rectangle, touching it with hands and body, PNG format with COMPLETELY TRANSPARENT BACKGROUND, no background elements whatsoever, crisp clean edges, high quality 4K artwork, professional illustration style. Character must be in direct physical contact with the central black rectangle.`;
}

export function getInteractionVariations(): string[] {
  return [
    "character hugging the black rectangle tightly with both arms",
    "character holding the black rectangle like a treasured object", 
    "character presenting the black rectangle with proud gestures",
    "character leaning against the black rectangle comfortably",
    "character embracing the black rectangle protectively from behind",
    "character sitting on or next to the black rectangle casually"
  ];
}

export function buildEnhancedPrompt(
  userPrompt: string,
  style: string,
  interactionType: string = "hugging"
): string {
  const character = getCharacterDescription(style);
  const interaction = getInteractionDescription(interactionType);
  
  return `${character} ${userPrompt} ${interaction} a solid black rectangle, TRANSPARENT BACKGROUND, PNG style, no background, crisp edges, professional quality, 4K resolution, character in direct contact with black rectangle.`;
}

function getCharacterDescription(style: string): string {
  const descriptions = {
    cartoon: "vibrant cartoon character with bold colors and expressive features",
    meme: "iconic meme-style character with exaggerated expressions",
    luxury: "sophisticated elegant character with premium aesthetic",
    modern: "sleek contemporary character with clean design",
    realistic: "highly detailed photorealistic character",
    fantasy: "enchanting fantasy character with magical elements",
    minimalist: "simple clean character with essential details only"
  };
  
  return descriptions[style as keyof typeof descriptions] || "detailed character";
}

function getInteractionDescription(type: string): string {
  const interactions = {
    hugging: "warmly hugging and embracing",
    holding: "carefully holding and presenting",
    leaning: "casually leaning against",
    sitting: "comfortably sitting next to",
    protecting: "protectively standing guard over"
  };
  
  return interactions[type as keyof typeof interactions] || "interacting with";
}
