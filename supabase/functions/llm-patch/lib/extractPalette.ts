/**
 * Extract color palette from image using OpenAI Vision API
 */

export interface Palette {
  bg: string;      // background (#hex)
  fg: string;      // foreground/text (#hex)
  primary: string; // primary accent (#hex)
  accent1: string; // secondary accent (#hex)
  accent2: string; // tertiary accent (#hex)
  neutral: string; // neutral/gray (#hex)
}

const DEFAULT_PALETTE: Palette = {
  bg: '#0E1016',
  fg: '#FFFFFF',
  primary: '#7C3AED',
  accent1: '#22D3EE',
  accent2: '#10B981',
  neutral: '#1A1F2B'
};

/**
 * Calculate luminance for contrast checking
 */
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure foreground color has sufficient contrast with background
 */
function ensureContrast(fg: string, bg: string): string {
  const contrast = getContrastRatio(fg, bg);
  
  // WCAG AA требует минимум 4.5:1 для обычного текста
  if (contrast >= 4.5) {
    return fg;
  }
  
  // Если контраст низкий, выбираем белый или черный в зависимости от яркости фона
  const bgLuminance = getLuminance(bg);
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Validate hex color format
 */
function isValidHex(color: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color);
}

/**
 * Extract palette from image using OpenAI Vision API
 */
export async function extractPaletteFromImage(imageUrl: string): Promise<Palette> {
  const openAiKey = Deno.env.get('OPENA_API_KEY');
  if (!openAiKey) {
    console.error('[EXTRACT-PALETTE] OPENA_API_KEY not configured, using default palette');
    return DEFAULT_PALETTE;
  }

  try {
    console.log('[EXTRACT-PALETTE] 🎨 Analyzing image:', imageUrl);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a color extraction expert. Analyze images and extract exactly 6 colors in hex format. Return ONLY valid JSON with no additional text.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract 6 main colors from this image for a wallet UI theme. Return JSON with this exact structure:
{
  "bg": "#HEXCOLOR",
  "fg": "#HEXCOLOR",
  "primary": "#HEXCOLOR",
  "accent1": "#HEXCOLOR",
  "accent2": "#HEXCOLOR",
  "neutral": "#HEXCOLOR"
}

Rules:
- bg: main background color (usually darkest or lightest)
- fg: text/foreground color (must have high contrast with bg, prefer white or black)
- primary: main accent/brand color (most vibrant)
- accent1: secondary accent (complementary to primary)
- accent2: tertiary accent (for highlights)
- neutral: neutral/gray for containers and cards

All colors MUST be uppercase hex format starting with #.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[EXTRACT-PALETTE] ❌ OpenAI API error:', response.status, errorText);
      return DEFAULT_PALETTE;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('[EXTRACT-PALETTE] ❌ No content in response');
      return DEFAULT_PALETTE;
    }

    console.log('[EXTRACT-PALETTE] 📝 Raw AI response:', content);
    
    const palette = JSON.parse(content) as Palette;
    
    // Validate all colors
    const requiredKeys: (keyof Palette)[] = ['bg', 'fg', 'primary', 'accent1', 'accent2', 'neutral'];
    for (const key of requiredKeys) {
      if (!palette[key] || !isValidHex(palette[key])) {
        console.error(`[EXTRACT-PALETTE] ❌ Invalid color for ${key}:`, palette[key]);
        return DEFAULT_PALETTE;
      }
    }
    
    // Ensure foreground has sufficient contrast
    palette.fg = ensureContrast(palette.fg, palette.bg);
    
    console.log('[EXTRACT-PALETTE] ✅ Extracted palette:', palette);
    console.log('[EXTRACT-PALETTE] 📊 Contrast ratio (fg/bg):', getContrastRatio(palette.fg, palette.bg).toFixed(2));
    
    return palette;
    
  } catch (error) {
    console.error('[EXTRACT-PALETTE] ❌ Error:', error);
    return DEFAULT_PALETTE;
  }
}
