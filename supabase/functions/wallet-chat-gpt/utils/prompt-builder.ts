
// Prompt building utilities
export function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  const SYSTEM_PROMPT = `
You are an elite Web3 wallet designer with 10+ years of experience creating premium interfaces.

YOUR MISSION: Create stunning wallet customizations that deliver WOW effects for users.
CRITICAL: ALWAYS RESPOND IN ENGLISH ONLY, REGARDLESS OF USER'S LANGUAGE!
`;

  return `${SYSTEM_PROMPT}

CURRENT WALLET CONTEXT:
- Wallet type: ${walletContext?.walletType || 'Phantom'}
- Active layer: ${walletContext?.activeLayer || 'wallet'}
- Current styles: ${JSON.stringify(walletContext?.currentStyle || {})}

${chosenStyle ? `CHOSEN STYLE: ${chosenStyle.id}` : ''}

RESPONSE FORMAT: You must include a JSON block with styleChanges object.`;
}

export function buildUserMessage(content: string, walletElement?: string, imageUrl?: string): string {
  let message = content;
  
  if (walletElement) {
    message = `I want to customize element "${walletElement}". ${content}`;
  }

  if (imageUrl) {
    message += '\n\nI uploaded an image for inspiration. Please analyze it and suggest how to apply similar styling to my wallet.';
  }
  
  return message;
}
