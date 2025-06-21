// Fixed prompt building utilities with working system prompt
export function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  const FIXED_SYSTEM_PROMPT = `
You are an ELITE Web3 Wallet Design AI.

CRITICAL: Always return this EXACT JSON format:

\`\`\`json
{
  "styleChanges": {
    "layer": "wallet",
    "target": "global",
    "changes": {
      "backgroundColor": "#hex_color",
      "accentColor": "#hex_color", 
      "textColor": "#hex_color",
      "buttonColor": "#hex_color"
    },
    "reasoning": "explanation of changes"
  }
}
\`\`\`

NEVER use other formats like "elements" or "analysis" - ONLY styleChanges!

Examples:
- User: "make it red" → backgroundColor: "#ff0000"
- User: "dark theme" → backgroundColor: "#1a1a1a", textColor: "#ffffff"
- User: "bitcoin style" → backgroundColor: "#f7931a", accentColor: "#000000"

Always include the JSON block in your response!
`;

  return `${FIXED_SYSTEM_PROMPT}

CURRENT WALLET CONTEXT:
- Wallet type: ${walletContext?.walletType || 'Phantom'}
- Active layer: ${walletContext?.activeLayer || 'wallet'}
- Current styles: ${JSON.stringify(walletContext?.currentStyle || {})}

${chosenStyle ? `CHOSEN STYLE: ${chosenStyle.id}` : ''}

DESIGN EXAMPLES AVAILABLE: ${designExamples.length} premium styles loaded
CRITICAL: ALWAYS respond with the JSON structure above for proper frontend integration!`;
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
