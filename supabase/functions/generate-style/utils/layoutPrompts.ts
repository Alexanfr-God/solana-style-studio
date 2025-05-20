
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
  
  // Base background generation instructions with improved composition guidance
  let enhancedPrompt = `
    Draw a collectible wallet background in NFT style.

    Position subject's head and shoulders in the top 40% of the image. 
    Leave the center (middle 336x336) visually clear of any objects or faces.

    Theme: ${prompt}
    
    Instructions:
    - Create a vertical collectible background for a ${layerType === "login" ? "login screen" : "wallet interface"}.
    - DO NOT draw UI elements like buttons, input fields, or "Password"/"Forgot password"/"Unlock" labels.
    - DO NOT add any text, logos, or words of any kind to the image.
    - Design with a clean, professional comic or illustration style.
    - Keep the center area (middle 336x336 pixels) visually clear and simple for UI elements.
    - Place character elements, faces, or focal points in the top 30-40% of the image.
    - Use bottom 30% for decorative elements, textures, or lower body parts if characters are included.
    - Left and right edges can have background elements but avoid text or small details there.
  `;

  // Add layout-specific instructions based on layer type
  if (layerType === "login") {
    enhancedPrompt += `
      * Top ${layoutConfig.topLogoZone}: suitable for character's head or decorative elements
      * Next ${layoutConfig.titleZone}: visually interesting area above the center
      * Middle ${layoutConfig.inputZone}: MUST remain visually clean and simple (central 336x336 area)
      * Next ${layoutConfig.supportTextZone}: subtle visual elements below center
      * Bottom ${layoutConfig.actionButtonZone}: decorative area for lower portions of characters or designs
    `;
  } else {
    enhancedPrompt += `
      * Top ${layoutConfig.headerZone}: area for character's head or upper design elements
      * Next ${layoutConfig.balanceZone}: transition area with minimal detail  
      * Middle ${layoutConfig.actionsZone}: MUST remain visually clean and simple (central 336x336 area)
      * Next ${layoutConfig.assetsZone}: subtle visual elements below center
      * Bottom ${layoutConfig.navigationZone}: decorative footer area
    `;
  }

  // Additional style guidance
  enhancedPrompt += `
    - If a character (like Pepe, Mia Khalifa, Trump, etc.) is involved, position their face/head in the top portion.
    - Any character should be positioned so their face/head is in the top 30-40% of the canvas.
    - If the prompt includes a fashion or luxury theme (e.g., Gucci), apply color themes and patterns tastefully.
    - The background should feel collectible and premium — like a high-quality NFT portrait or Web3 avatar.
    - Ensure the final image has a clean composition with the center area visually clear.
    - The art style should be clean, polished, and suitable for a professional wallet application.
  `;

  return { 
    enhancedPrompt, 
    config: layoutConfig 
  };
}
