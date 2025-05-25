
// V4 Architecture: Ultra-simple prompts focused on character interaction
export function buildSimplePrompt(
  userPrompt: string,
  style: string
): string {
  const styleDescriptions = {
    cartoon: "vibrant cartoon character",
    meme: "meme-style character", 
    luxury: "elegant luxurious character",
    modern: "sleek modern character",
    realistic: "photorealistic character",
    fantasy: "magical fantasy character",
    minimalist: "clean minimal character"
  };

  const character = styleDescriptions[style as keyof typeof styleDescriptions] || "character";
  
  // V4 Core Principle: NO BACKGROUND, focus on interaction
  return `${character} ${userPrompt} interacting with black rectangle in center. Character hugging, holding, or presenting the black rectangle. NO BACKGROUND, transparent background, PNG style, clean edges, high quality detailed artwork. The character should physically touch or embrace the central black rectangle.`;
}

export function getInteractionVariations(): string[] {
  return [
    "character hugging the black rectangle from sides",
    "character holding the black rectangle like a precious item", 
    "character presenting the black rectangle with open arms",
    "character leaning on the black rectangle casually",
    "character embracing the black rectangle protectively"
  ];
}
