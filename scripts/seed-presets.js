
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { compare } from 'fast-json-patch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://opxordptvpvzmhakvdde.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-presets.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Known presets with their metadata
const knownPresets = {
  "wolf": {
    title: "Wolf of Wall Street",
    tags: ["luxury", "finance", "dark", "gold"],
    sample_context: "luxury finance aesthetic, black/gold color scheme, glossy accents, professional trading interface"
  },
  "cz": {
    title: "CZ Minimalist", 
    tags: ["minimal", "tech", "blue", "clean"],
    sample_context: "clean minimal tech aesthetic, cool blues, high contrast on CTAs, modern simplicity"
  },
  "superman": {
    title: "Superman",
    tags: ["heroic", "comic", "red", "blue"], 
    sample_context: "heroic comic energy, red/blue highlights, bold headings, dynamic superhero styling"
  },
  "snoopdogg": {
    title: "Snoop Dogg",
    tags: ["urban", "neon", "purple", "chill"],
    sample_context: "urban neon-chill vibes, purple accents, vibey gradients, west coast hip-hop styling"
  },
  "pepe": {
    title: "Pepe",
    tags: ["meme", "green", "playful"],
    sample_context: "playful meme-inspired styling, green accents, fun gradients, internet culture vibes"
  },
  "elonmusk": {
    title: "Elon Musk", 
    tags: ["tech", "space", "minimal", "futuristic"],
    sample_context: "futuristic tech aesthetic, space-inspired colors, minimal design, innovation-focused styling"
  },
  "gorillaz": {
    title: "Gorillaz",
    tags: ["artistic", "colorful", "creative"],
    sample_context: "artistic creative vibes, colorful palette, expressive design, alternative music aesthetic"
  },
  "mia": {
    title: "Mia",
    tags: ["elegant", "minimal", "pink"],
    sample_context: "elegant feminine aesthetic, soft pink tones, refined design, sophisticated styling"
  },
  "wifTheme": {
    title: "WIF Theme",
    tags: ["meme", "crypto", "dog"],
    sample_context: "WIF-inspired crypto meme styling, playful dog theme, community-focused design"
  },
  "guccicatluxurytheme": {
    title: "Gucci Cat Luxury",
    tags: ["luxury", "fashion", "cat", "premium"],
    sample_context: "luxury fashion aesthetic with cat motifs, premium styling, high-end fashion vibes"
  },
  "luxuryTheme": {
    title: "Luxury Theme",
    tags: ["luxury", "premium", "gold", "elegant"], 
    sample_context: "premium luxury styling, gold accents, elegant typography, high-end aesthetic"
  },
  "defaultTheme": {
    title: "Default Theme",
    tags: ["default", "balanced", "neutral"],
    sample_context: "balanced default styling, neutral colors, versatile design suitable for all use cases"
  },
  "trump": {
    title: "TRUMP",
    tags: ["patriotic", "bold", "american", "red"],
    sample_context: "bold patriotic theme with red, white and blue American styling, presidential aesthetic"
  },
  "wcc": {
    title: "WCC",
    tags: ["custom", "community", "branded"],
    sample_context: "West Coast Customs inspired styling, automotive culture, custom design aesthetic"
  },
  "simpsons": {
    title: "Simpsons",
    tags: ["cartoon", "yellow", "fun", "family"],
    sample_context: "cartoon-inspired Simpsons styling, yellow color scheme, fun family-friendly design"
  },
  "space": {
    title: "Space",
    tags: ["cosmic", "dark", "futuristic", "stars"],
    sample_context: "cosmic space theme, dark starry backgrounds, futuristic elements, galaxy aesthetics"
  },
  "mexico": {
    title: "Mexico", 
    tags: ["cultural", "vibrant", "traditional", "colorful"],
    sample_context: "vibrant Mexican cultural styling, traditional colors, festive design elements"
  },
  "china": {
    title: "China",
    tags: ["cultural", "red", "traditional", "elegant"],
    sample_context: "traditional Chinese aesthetic, red and gold colors, elegant cultural elements"
  },
  "nirvana": {
    title: "Nirvana",
    tags: ["grunge", "alternative", "music", "dark"],
    sample_context: "grunge alternative music aesthetic, dark moody styling, 90s music culture vibes"
  },
  "football": {
    title: "Football",
    tags: ["sports", "green", "athletic", "competitive"],
    sample_context: "football sports theme, green field colors, athletic competitive styling"
  }
};

async function seedPresets() {
  console.log('🌱 Starting preset seeding...');
  
  const ROOT = join(process.cwd(), 'public/themes');
  
  // Load default theme for comparison
  const defaultThemePath = join(ROOT, 'defaultTheme.json');
  if (!existsSync(defaultThemePath)) {
    throw new Error('Default theme not found at public/themes/defaultTheme.json');
  }
  
  const defaultTheme = JSON.parse(readFileSync(defaultThemePath, 'utf-8'));
  console.log('📄 Loaded default theme');

  // Load manifest
  const manifestPath = join(ROOT, 'manifest.json');
  if (!existsSync(manifestPath)) {
    throw new Error('Manifest not found at public/themes/manifest.json');
  }
  
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  console.log(`📋 Loaded manifest with ${manifest.length} themes`);

  const presetRows = [];

  for (const item of manifest) {
    const themeId = item.id;
    const themePath = join(ROOT, `${themeId}.json`);
    
    if (!existsSync(themePath)) {
      console.warn(`⚠️ Theme file not found: ${themeId}.json`);
      continue;
    }

    try {
      const themeData = JSON.parse(readFileSync(themePath, 'utf-8'));
      const patch = compare(defaultTheme, themeData);
      
      const knownData = knownPresets[themeId] || {};
      
      const presetData = {
        slug: themeId,
        title: knownData.title || item.name || themeId,
        cover_url: item.coverUrl || null,
        tags: knownData.tags || [],
        payload: {
          patch,
          sample_context: knownData.sample_context || `Style: ${item.name || themeId}`
        }
      };

      presetRows.push(presetData);
      console.log(`✅ Prepared preset: ${presetData.title} (${patch.length} operations)`);
    } catch (error) {
      console.error(`💥 Error processing ${themeId}:`, error);
    }
  }

  if (presetRows.length === 0) {
    throw new Error('No valid presets to seed');
  }

  console.log(`📊 Seeding ${presetRows.length} presets...`);
  
  const { error } = await supabase
    .from('presets')
    .upsert(presetRows, { onConflict: 'slug' });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  console.log(`🎉 Successfully seeded ${presetRows.length} presets!`);
  
  // Show final count by slug
  console.log('\n📋 Seeded presets by slug:');
  presetRows.forEach(preset => {
    console.log(`  ${preset.slug} → ${preset.title}`);
  });
}

seedPresets().catch(error => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});
