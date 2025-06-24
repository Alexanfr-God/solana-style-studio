// Advanced COT (Chain of Thought) and RUG (Rules, Understanding, Generation) System
// For creating high-quality poster-style wallet backgrounds

// ========== COT REASONING STEPS ==========
const COT_REASONING_STEPS = `
CHAIN OF THOUGHT ANALYSIS:

1. UNDERSTAND REQUEST:
   - What character/theme did user request?
   - What emotion/mood should it convey?
   - What's the intended use (wallet background)?

2. ANALYZE POSTER STYLE:
   - Strong central character focus
   - Dynamic composition with energy lines
   - Bold color contrasts
   - Clear visual hierarchy
   - Professional illustration quality

3. COMPOSITION PLANNING:
   - Character placement (usually center or slightly off-center)
   - Background elements (rays, particles, gradients)
   - Color harmony (complementary or triadic schemes)
   - Visual flow and energy direction

4. TECHNICAL REQUIREMENTS:
   - High contrast for UI readability
   - Character should not overwhelm wallet UI
   - Leave space for wallet elements
   - Ensure scalability and crop flexibility

5. STYLE EXECUTION:
   - Vector-style illustration
   - Bold outlines and cel shading
   - Dramatic lighting effects
   - Professional poster aesthetic
`;

// ========== RUG DESIGN RULES ==========
const RUG_DESIGN_RULES = `
POSTER GENERATION RULES:

CHARACTER RULES:
- Bold, confident pose with strong silhouette
- Exaggerated features for impact (like your examples)
- Clean vector illustration style
- Strong facial expressions
- Dynamic body language

COLOR RULES:
- Maximum 4-5 main colors
- High contrast between character and background
- Use complementary colors for drama
- Warm colors for character, cool for background (or vice versa)
- Bold, saturated colors

COMPOSITION RULES:
- Rule of thirds or centered hero composition
- Dynamic diagonal lines or radiating patterns
- Energy lines/speed lines for movement
- Depth through layering (foreground/midground/background)
- Leave breathing room around edges

BACKGROUND RULES:
- Gradient or pattern that doesn't compete with character
- Radiating lines from behind character
- Subtle texture or halftone patterns
- Atmospheric effects (stars, particles, light rays)
- Abstract geometric shapes for modern feel

STYLE CONSISTENCY:
- Vector illustration aesthetic
- Bold black outlines (2-4px weight)
- Cel shading with 2-3 shade levels
- Minimal gradients on character
- Professional poster quality
`;

// ========== POSTER STYLE TEMPLATES ==========
const POSTER_STYLE_TEMPLATES = {
  superhero: {
    composition: "heroic pose with chest out, slight low angle view",
    background: "radiating light beams, city skyline silhouette",
    colors: "bold primary colors, high contrast",
    effects: "speed lines, energy aura, lens flare",
    mood: "powerful, inspiring, larger than life"
  },
  
  political: {
    composition: "dignified portrait, flag elements, formal pose",
    background: "flag motifs, stars, patriotic elements",
    colors: "red white blue, gold accents, high saturation",
    effects: "subtle glow, sharp shadows",
    mood: "authoritative, patriotic, confident"
  },
  
  sports: {
    composition: "victory pose, action moment, emotional expression",
    background: "stadium lights, crowd silhouette, team colors",
    colors: "team colors, bright highlights, dynamic contrast",
    effects: "motion blur, light rays, confetti",
    mood: "triumphant, energetic, celebratory"
  },
  
  cartoon: {
    composition: "exaggerated proportions, dynamic pose, big expressions",
    background: "abstract shapes, comic book patterns",
    colors: "vibrant, saturated, complementary scheme",
    effects: "halftone dots, action lines, comic bubbles",
    mood: "fun, energetic, playful"
  }
};

// ========== ENHANCED PROMPT BUILDER ==========
export function buildPosterPrompt(userRequest: string, generator: 'dalle' | 'replicate') {
  console.log('🎨 Building poster prompt for:', userRequest);
  
  // Step 1: Analyze user request
  const analysis = analyzeUserRequest(userRequest);
  
  // Step 2: Select appropriate template
  const template = selectPosterTemplate(analysis);
  
  // Step 3: Build comprehensive prompt
  const prompt = constructDetailedPrompt(analysis, template, generator);
  
  console.log('📝 Final prompt:', prompt);
  return prompt;
}

function analyzeUserRequest(request: string) {
  const lower = request.toLowerCase();
  
  return {
    character: extractCharacter(request),
    style: detectStyle(lower),
    mood: detectMood(lower),
    hasSpecificRequest: request.length > 20,
    keywords: request.split(' ').filter(w => w.length > 3)
  };
}

function extractCharacter(request: string) {
  // Common character patterns
  if (/trump/i.test(request)) return 'Donald Trump';
  if (/superman|batman|spiderman/i.test(request)) return request.match(/superman|batman|spiderman/i)[0];
  if (/messi|ronaldo|lebron/i.test(request)) return request.match(/messi|ronaldo|lebron/i)[0];
  
  // Default to first capitalized word
  const words = request.split(' ');
  return words.find(w => w[0] === w[0].toUpperCase()) || 'character';
}

function detectStyle(text: string) {
  if (text.includes('cartoon') || text.includes('comic')) return 'cartoon';
  if (text.includes('superhero') || text.includes('hero')) return 'superhero';
  if (text.includes('president') || text.includes('political')) return 'political';
  if (text.includes('sports') || text.includes('champion')) return 'sports';
  
  return 'cartoon'; // default
}

function detectMood(text: string) {
  if (text.includes('power') || text.includes('strong')) return 'powerful';
  if (text.includes('fun') || text.includes('happy')) return 'playful';
  if (text.includes('serious') || text.includes('formal')) return 'serious';
  if (text.includes('epic') || text.includes('awesome')) return 'epic';
  
  return 'confident';
}

function selectPosterTemplate(analysis: any) {
  return POSTER_STYLE_TEMPLATES[analysis.style] || POSTER_STYLE_TEMPLATES.cartoon;
}

function constructDetailedPrompt(analysis: any, template: any, generator: string) {
  const characterDesc = analysis.character;
  const isRealPerson = /trump|messi|ronaldo|biden/i.test(characterDesc);
  
  // Base prompt structure
  let prompt = `Professional poster illustration of ${characterDesc}, ${template.composition}, ${template.mood} mood, vector art style with bold black outlines, cel shading, ${template.colors}, ${template.background}, ${template.effects}`;
  
  // Add technical specifications
  prompt += `, digital illustration, poster design, high contrast, professional quality, suitable for wallet app background`;
  
  // Generator-specific optimizations
  if (generator === 'dalle') {
    prompt += `, in the style of modern vector posters, clean illustration, Adobe Illustrator quality`;
  } else if (generator === 'replicate') {
    prompt += `, poster art, vector style, bold design`;
  }
  
  // Add composition hints
  prompt += `, centered composition with dynamic background elements, leave space around edges for UI elements`;
  
  return prompt;
}

// ========== EXAMPLE USAGE ==========
export function generatePosterBackground(userRequest: string, generator: 'dalle' | 'replicate') {
  // Apply COT reasoning
  console.log('🧠 Applying Chain of Thought reasoning...');
  console.log(COT_REASONING_STEPS);
  
  // Apply RUG rules
  console.log('📏 Applying design rules...');
  console.log(RUG_DESIGN_RULES);
  
  // Build the prompt
  const enhancedPrompt = buildPosterPrompt(userRequest, generator);
  
  // Add metadata for quality control
  const metadata = {
    style: 'poster',
    quality: 'high',
    rules_applied: true,
    cot_applied: true,
    timestamp: new Date().toISOString()
  };
  
  return {
    prompt: enhancedPrompt,
    metadata,
    reasoning: COT_REASONING_STEPS,
    rules: RUG_DESIGN_RULES
  };
}

// ========== QUALITY ENHANCEMENT TIPS ==========
const QUALITY_TIPS = `
FOR DALL-E 3:
1. Use "I need" instead of imperative commands
2. Describe the style in detail
3. Mention "professional", "high quality", "poster art"
4. Reference known styles: "vector illustration", "Adobe Illustrator"
5. Be specific about colors and composition

FOR REPLICATE (Flux):
1. Keep prompts concise but descriptive
2. Front-load important details
3. Use style keywords: "poster", "vector", "illustration"
4. Specify technical details: "high contrast", "bold colors"
5. Add quality modifiers: "professional", "detailed"

COMMON IMPROVEMENTS:
- Always specify "vector illustration style"
- Mention "bold black outlines" for that poster look
- Use "cel shading" for clean color blocks
- Add "dynamic composition" for energy
- Include "professional poster design" for quality
`;

// ========== INTEGRATION WITH imageGenerator.ts ==========
export function enhanceImageGeneratorPrompt(originalPrompt: string, generator: 'dalle' | 'replicate') {
  const posterData = generatePosterBackground(originalPrompt, generator);
  
  return {
    enhancedPrompt: posterData.prompt,
    metadata: posterData.metadata,
    tips: QUALITY_TIPS
  };
}
