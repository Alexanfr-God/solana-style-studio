
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PresetData {
  slug: string;
  title: string;
  tags: string[];
  cover_url: string | null;
  payload: {
    patch: any[];
    sample_context: string;
  };
}

function validatePresets(presets: PresetData[]): void {
  if (presets.length === 0) {
    throw new Error('No presets to validate');
  }

  const emptyTitles = presets.filter(p => !p.title || p.title.trim() === '');
  if (emptyTitles.length > 0) {
    throw new Error(`Found ${emptyTitles.length} presets with empty titles`);
  }

  const uniqueSlugs = new Set(presets.map(p => p.slug));
  if (uniqueSlugs.size !== presets.length) {
    throw new Error(`Found duplicate preset slugs. Unique: ${uniqueSlugs.size}, Total: ${presets.length}`);
  }
}

function createPresetData(slug: string): PresetData {
  const knownPresets: Record<string, Partial<PresetData>> = {
    "wolf": {
      title: "Wolf of Wall Street",
      tags: ["luxury", "finance", "dark", "gold"],
      payload: {
        patch: [],
        sample_context: "luxury finance aesthetic, black/gold color scheme, glossy accents, professional trading interface (inspired, no logos)"
      }
    },
    "cz": {
      title: "CZ Minimalist",
      tags: ["minimal", "tech", "blue", "clean"],
      payload: {
        patch: [],
        sample_context: "clean minimal tech aesthetic, cool blues, high contrast on CTAs, modern simplicity"
      }
    },
    "superman": {
      title: "Superman",
      tags: ["heroic", "comic", "red", "blue"],
      payload: {
        patch: [],
        sample_context: "heroic comic energy, red/blue highlights, bold headings, dynamic superhero styling (inspired, generic)"
      }
    },
    "snoopdogg": {
      title: "Snoop Dogg",
      tags: ["urban", "neon", "purple", "chill"],
      payload: {
        patch: [],
        sample_context: "urban neon-chill vibes, purple accents, vibey gradients, west coast hip-hop styling (inspired, generic)"
      }
    },
    "pepe": {
      title: "Pepe",
      tags: ["meme", "green", "playful"],
      payload: {
        patch: [],
        sample_context: "playful meme-inspired styling, green accents, fun gradients, internet culture vibes"
      }
    },
    "elonmusk": {
      title: "Elon Musk",
      tags: ["tech", "space", "minimal", "futuristic"],
      payload: {
        patch: [],
        sample_context: "futuristic tech aesthetic, space-inspired colors, minimal design, innovation-focused styling"
      }
    },
    "gorillaz": {
      title: "Gorillaz",
      tags: ["artistic", "colorful", "creative"],
      payload: {
        patch: [],
        sample_context: "artistic creative vibes, colorful palette, expressive design, alternative music aesthetic"
      }
    },
    "mia": {
      title: "Mia",
      tags: ["elegant", "minimal", "pink"],
      payload: {
        patch: [],
        sample_context: "elegant feminine aesthetic, soft pink tones, refined design, sophisticated styling"
      }
    },
    "wifTheme": {
      title: "WIF Theme",
      tags: ["meme", "crypto", "dog"],
      payload: {
        patch: [],
        sample_context: "WIF-inspired crypto meme styling, playful dog theme, community-focused design"
      }
    },
    "guccicatluxurytheme": {
      title: "Gucci Cat Luxury",
      tags: ["luxury", "fashion", "cat", "premium"],
      payload: {
        patch: [],
        sample_context: "luxury fashion aesthetic with cat motifs, premium styling, high-end fashion vibes"
      }
    },
    "luxuryTheme": {
      title: "Luxury Theme",
      tags: ["luxury", "premium", "gold", "elegant"],
      payload: {
        patch: [],
        sample_context: "premium luxury styling, gold accents, elegant typography, high-end aesthetic"
      }
    },
    "defaultTheme": {
      title: "Default Theme",
      tags: ["default", "balanced", "neutral"],
      payload: {
        patch: [],
        sample_context: "balanced default styling, neutral colors, versatile design suitable for all use cases"
      }
    },
    "trump": {
      title: "TRUMP",
      tags: ["patriotic", "bold", "american", "red"],
      payload: {
        patch: [],
        sample_context: "bold patriotic theme with red, white and blue American styling, presidential aesthetic"
      }
    },
    "wcc": {
      title: "WCC",
      tags: ["custom", "community", "branded"],
      payload: {
        patch: [],
        sample_context: "West Coast Customs inspired styling, automotive culture, custom design aesthetic"
      }
    },
    "simpsons": {
      title: "Simpsons",
      tags: ["cartoon", "yellow", "fun", "family"],
      payload: {
        patch: [],
        sample_context: "cartoon-inspired Simpsons styling, yellow color scheme, fun family-friendly design"
      }
    },
    "space": {
      title: "Space",
      tags: ["cosmic", "dark", "futuristic", "stars"],
      payload: {
        patch: [],
        sample_context: "cosmic space theme, dark starry backgrounds, futuristic elements, galaxy aesthetics"
      }
    },
    "mexico": {
      title: "Mexico",
      tags: ["cultural", "vibrant", "traditional", "colorful"],
      payload: {
        patch: [],
        sample_context: "vibrant Mexican cultural styling, traditional colors, festive design elements"
      }
    },
    "china": {
      title: "China",
      tags: ["cultural", "red", "traditional", "elegant"],
      payload: {
        patch: [],
        sample_context: "traditional Chinese aesthetic, red and gold colors, elegant cultural elements"
      }
    },
    "nirvana": {
      title: "Nirvana",
      tags: ["grunge", "alternative", "music", "dark"],
      payload: {
        patch: [],
        sample_context: "grunge alternative music aesthetic, dark moody styling, 90s music culture vibes"
      }
    },
    "football": {
      title: "Football",
      tags: ["sports", "green", "athletic", "competitive"],
      payload: {
        patch: [],
        sample_context: "football sports theme, green field colors, athletic competitive styling"
      }
    }
  };

  const known = knownPresets[slug] || {};
  
  return {
    slug,
    title: known.title || slug,
    tags: known.tags || [],
    cover_url: `https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_${Math.floor(Math.random() * 8) + 1}/image_${Math.floor(Math.random() * 8) + 1}.png`,
    payload: known.payload || {
      patch: [],
      sample_context: `Style: ${slug}`
    }
  };
}

serve(async (req) => {
  console.log(`🌱 Seed Presets Request: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get preset slugs
    const presetSlugs = [
      "wolf", "cz", "superman", "snoopdogg", "pepe", "elonmusk", 
      "gorillaz", "mia", "wifTheme", "guccicatluxurytheme", 
      "luxuryTheme", "defaultTheme", "trump", "wcc", "simpsons",
      "space", "mexico", "china", "nirvana", "football"
    ];

    console.log('🔄 Creating preset data...');
    const presets = presetSlugs.map(slug => createPresetData(slug));

    console.log('📋 Validating preset data...');
    validatePresets(presets);

    console.log('🔄 Upserting presets...');
    const { data, error } = await supabase
      .from('presets')
      .upsert(presets, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error('❌ Failed to upsert presets:', error);
      throw error;
    }

    console.log('🎉 Seed completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully seeded ${presets.length} presets`,
      data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('💥 Seed failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Seed failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
