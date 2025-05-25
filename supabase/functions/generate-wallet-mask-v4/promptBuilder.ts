
// Ultra-simple prompt builder focusing ONLY on character interaction
// NO coordinates, NO technical details, NO complex instructions

interface StyleConfig {
  modifier: string;
  interaction: string;
}

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  cartoon: {
    modifier: "cute cartoon style",
    interaction: "character hugging and holding"
  },
  meme: {
    modifier: "funny meme style",
    interaction: "character presenting and pointing to"
  },
  luxury: {
    modifier: "elegant luxury style",
    interaction: "character gracefully holding"
  },
  modern: {
    modifier: "clean modern style", 
    interaction: "character interacting with"
  },
  realistic: {
    modifier: "realistic style",
    interaction: "character holding and embracing"
  },
  fantasy: {
    modifier: "magical fantasy style",
    interaction: "character magically interacting with"
  },
  minimalist: {
    modifier: "simple minimalist style",
    interaction: "character simply holding"
  }
};

export function buildSimplePrompt(userPrompt: string, style: string): string {
  const config = STYLE_CONFIGS[style] || STYLE_CONFIGS.cartoon;
  
  // Extract key theme from user prompt (first few meaningful words)
  const cleanPrompt = userPrompt.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 3)
    .join(' ');

  // Build ultra-simple prompt
  const simplePrompt = `${config.modifier} ${cleanPrompt} ${config.interaction} a black rectangle in the center. Character around the rectangle. No background. PNG transparent style.`;

  console.log(`🎯 Prompt built: "${userPrompt}" → "${simplePrompt}"`);
  
  return simplePrompt;
}

export function buildGuidePrompt(): string {
  return `A black rectangle positioned in the center of a 1024x1024 white canvas. Rectangle size: 320x569 pixels. Simple reference guide image.`;
}
