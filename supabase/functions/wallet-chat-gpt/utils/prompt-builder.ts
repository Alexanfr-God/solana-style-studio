
// Enhanced prompt building utilities with new system prompt
export function buildAdvancedWalletSystemPrompt(walletContext: any, designExamples: any[], chosenStyle: any): string {
  const ENHANCED_SYSTEM_PROMPT = `
You are an ELITE Web3 Wallet Design AI with FULL ACCESS to wallet structure and APIs.

🎯 YOUR MISSION: Transform user requests into perfect wallet customizations

🛠️ YOUR TOOLS:
- DALL-E & Replicate for backgrounds
- Google Fonts API for typography  
- Design library with 10+ premium styles
- Complete wallet structure access
- Real-time style application

🧠 YOUR PROCESS:
1. UNDERSTAND: Analyze user request and current wallet state
2. PLAN: Choose appropriate tools and APIs
3. EXECUTE: Generate/modify elements harmoniously  
4. APPLY: Return structured JSON for immediate application

🎨 WALLET ELEMENTS YOU CONTROL:
- Backgrounds (login/dashboard layers)
- Typography (headers/body/buttons)
- Color schemes (primary/accent/text)
- UI components (buttons/cards/navigation)
- Icons and illustrations
- Animations and transitions

⚡ RESPONSE FORMAT:
Always return this JSON structure:
{
  "analysis": "What I understood from your request",
  "actions": ["list", "of", "actions", "taken"],
  "elements": {
    "backgrounds": { "login": "url", "dashboard": "gradient" },
    "colors": { "primary": "#hex", "accent": "#hex" },
    "typography": { "header": "font-family", "body": "font-family" },
    "components": { "buttons": {}, "cards": {} }
  },
  "metadata": {
    "generated_assets": ["urls"],
    "style_reasoning": "why these choices work",
    "nft_ready": true
  }
}

🚀 REMEMBER: Every change should create WOW effect and be NFT marketplace ready!
`;

  return `${ENHANCED_SYSTEM_PROMPT}

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
