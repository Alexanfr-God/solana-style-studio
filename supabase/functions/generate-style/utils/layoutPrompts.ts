
// Layout prompt generation utility

// Configuration for wallet layout zones - helps with creating better backgrounds
const walletCanvasConfig = {
  "login": {
    topLogoZone: "10%",     // For "phantom" logo
    titleZone: "15%",       // For title text
    inputZone: "30%",       // For password field(s)
    supportTextZone: "15%", // For "forgot password" text
    actionButtonZone: "15%" // For "Unlock" button
  },
  "wallet": {
    headerZone: "15%",      // For wallet header
    balanceZone: "20%",     // For balance display
    actionsZone: "25%",     // For buttons
    assetsZone: "30%",      // For asset list
    navigationZone: "10%"   // For bottom navigation
  }
};

/**
 * Creates a layout-aware prompt for better background image generation
 * @param prompt User's original prompt
 * @param layerType Type of wallet layer (login or wallet)
 * @returns Object containing enhanced prompt and layout configuration
 */
export async function createLayoutAwarePrompt(
  prompt: string, 
  layerType: string,
): Promise<{enhancedPrompt: string, config: Record<string, string>}> {
  
  const layoutConfig = walletCanvasConfig[layerType as keyof typeof walletCanvasConfig] || {};
  
  // Base background generation instructions
  let enhancedPrompt = `
    Design a collectible vertical background for a crypto wallet ${layerType === "login" ? "login screen" : "interface"}.
    
    Prompt theme: ${prompt}
    
    Instructions:
    - Create a vertical collectible background for a wallet ${layerType === "login" ? "login screen" : "interface"}.
    - DO NOT draw buttons, inputs, "Password", "Forgot password", "Unlock", or any other UI elements.
    - DO NOT add any text, labels, or words of any kind to the image.
    - DO NOT add any shadows, overlays, gradients, or lighting effects that would interfere with UI readability.
    - Use a clean, professional cartoon or comic-inspired art style.
    - Avoid oversaturated or harsh neon colors unless specifically requested.
    - Create a smooth visual flow that respects these layout zones:
  `;

  // Add layout-specific instructions based on layer type
  if (layerType === "login") {
    enhancedPrompt += `
      * Top ${layoutConfig.topLogoZone}: leave empty space for the "phantom" logo
      * Next ${layoutConfig.titleZone}: visually interesting but not distracting area
      * Middle ${layoutConfig.inputZone}: calm, clean area for password input field
      * Next ${layoutConfig.supportTextZone}: subtle visual elements
      * Bottom ${layoutConfig.actionButtonZone}: area that will contain the unlock button
    `;
  } else {
    enhancedPrompt += `
      * Top ${layoutConfig.headerZone}: header area with subtle decoration
      * Next ${layoutConfig.balanceZone}: area for displaying wallet balance  
      * Middle ${layoutConfig.actionsZone}: clean space for action buttons
      * Next ${layoutConfig.assetsZone}: visual area for assets list
      * Bottom ${layoutConfig.navigationZone}: footer area for navigation
    `;
  }

  // Additional style guidance
  enhancedPrompt += `
    - If a character (like a cat or meme) is involved, it should be positioned elegantly around the layout zones, not directly in input areas.
    - If the prompt includes a fashion brand (e.g., Gucci), apply color themes and abstract patterns only — do NOT add logos unless stylized as part of the visual texture.
    - The background should feel collectible, stylish, and premium — not childish.
    - Ensure the final image will be suitable as a professional wallet background.
    - Create something visually similar to high-quality collectible NFT art.
  `;

  return { 
    enhancedPrompt, 
    config: layoutConfig 
  };
}
