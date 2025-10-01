
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PresetData {
  title: string;
  tags: string[];
  cover_url: string | null;
  sample_patch: any[];
  sample_context: string;
}

function validatePresets(presets: PresetData[]): void {
  if (presets.length === 0) {
    throw new Error('No presets to validate');
  }

  const emptyTitles = presets.filter(p => !p.title || p.title.trim() === '');
  if (emptyTitles.length > 0) {
    throw new Error(`Found ${emptyTitles.length} presets with empty titles`);
  }
}

function createPresetData(slug: string): PresetData {
  const knownPresets: Record<string, PresetData> = {
    "wolf": {
      title: "Wolf of Wall Street",
      tags: ["luxury", "finance", "dark", "gold"],
      sample_patch: [],
      sample_context: "luxury finance aesthetic, black/gold color scheme, glossy accents, professional trading interface (inspired, no logos)",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_1.png"
    },
    "cz": {
      title: "CZ Minimalist",
      tags: ["minimal", "tech", "blue", "clean"],
      sample_patch: [],
      sample_context: "clean minimal tech aesthetic, cool blues, high contrast on CTAs, modern simplicity",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_2/image_1.png"
    },
    "superman": {
      title: "Superman",
      tags: ["heroic", "comic", "red", "blue"],
      sample_patch: [],
      sample_context: "heroic comic energy, red/blue highlights, bold headings, dynamic superhero styling (inspired, generic)",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_3/image_1.png"
    },
    "snoopdogg": {
      title: "Snoop Dogg",
      tags: ["urban", "neon", "purple", "chill"],
      sample_patch: [],
      sample_context: "urban neon-chill vibes, purple accents, vibey gradients, west coast hip-hop styling (inspired, generic)",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_4/image_1.png"
    },
    "pepe": {
      title: "Pepe",
      tags: ["meme", "green", "playful"],
      sample_patch: [],
      sample_context: "playful meme-inspired styling, green accents, fun gradients, internet culture vibes",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_5/image_1.png"
    },
    "elonmusk": {
      title: "Elon Musk",
      tags: ["tech", "space", "minimal", "futuristic"],
      sample_patch: [],
      sample_context: "futuristic tech aesthetic, space-inspired colors, minimal design, innovation-focused styling",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_6/image_1.png"
    },
    "gorillaz": {
      title: "Gorillaz",
      tags: ["artistic", "colorful", "creative"],
      sample_patch: [],
      sample_context: "artistic creative vibes, colorful palette, expressive design, alternative music aesthetic",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_7/image_1.png"
    },
    "mia": {
      title: "Mia",
      tags: ["elegant", "minimal", "pink"],
      sample_patch: [],
      sample_context: "elegant feminine aesthetic, soft pink tones, refined design, sophisticated styling",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_8/image_1.png"
    },
    "wifTheme": {
      title: "WIF Theme",
      tags: ["meme", "crypto", "dog"],
      sample_patch: [],
      sample_context: "WIF-inspired crypto meme styling, playful dog theme, community-focused design",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_2.png"
    },
    "guccicatluxurytheme": {
      title: "Gucci Cat Luxury",
      tags: ["luxury", "fashion", "cat", "premium"],
      sample_patch: [],
      sample_context: "luxury fashion aesthetic with cat motifs, premium styling, high-end fashion vibes",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_2/image_2.png"
    },
    "luxuryTheme": {
      title: "Luxury Theme",
      tags: ["luxury", "premium", "gold", "elegant"],
      sample_patch: [],
      sample_context: "premium luxury styling, gold accents, elegant typography, high-end aesthetic",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_3/image_2.png"
    },
    "defaultTheme": {
      title: "Default Theme",
      tags: ["default", "balanced", "neutral"],
      sample_patch: [],
      sample_context: "balanced default styling, neutral colors, versatile design suitable for all use cases",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_4/image_2.png"
    },
    "trump": {
      title: "TRUMP",
      tags: ["patriotic", "bold", "american", "red"],
      sample_patch: [],
      sample_context: "bold patriotic theme with red, white and blue American styling, presidential aesthetic",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_5/image_2.png"
    },
    "wcc": {
      title: "WCC",
      tags: ["custom", "community", "branded"],
      sample_patch: [],
      sample_context: "West Coast Customs inspired styling, automotive culture, custom design aesthetic",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_6/image_2.png"
    },
    "simpsons": {
      title: "Simpsons",
      tags: ["cartoon", "yellow", "fun", "family"],
      sample_patch: [],
      sample_context: "cartoon-inspired Simpsons styling, yellow color scheme, fun family-friendly design",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_7/image_2.png"
    },
    "space": {
      title: "Space",
      tags: ["cosmic", "dark", "futuristic", "stars"],
      sample_patch: [],
      sample_context: "cosmic space theme, dark starry backgrounds, futuristic elements, galaxy aesthetics",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_8/image_2.png"
    },
    "mexico": {
      title: "Mexico",
      tags: ["cultural", "vibrant", "traditional", "colorful"],
      sample_patch: [],
      sample_context: "vibrant Mexican cultural styling, traditional colors, festive design elements",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_3.png"
    },
    "china": {
      title: "China",
      tags: ["cultural", "red", "traditional", "elegant"],
      sample_patch: [],
      sample_context: "traditional Chinese aesthetic, red and gold colors, elegant cultural elements",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_2/image_3.png"
    },
    "nirvana": {
      title: "Nirvana",
      tags: ["grunge", "alternative", "music", "dark"],
      sample_patch: [],
      sample_context: "grunge alternative music aesthetic, dark moody styling, 90s music culture vibes",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_3/image_3.png"
    },
    "football": {
      title: "Football",
      tags: ["sports", "green", "athletic", "competitive"],
      sample_patch: [],
      sample_context: "football sports theme, green field colors, athletic competitive styling",
      cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_4/image_3.png"
    }
  };

  return knownPresets[slug] || {
    title: slug,
    tags: [],
    sample_patch: [],
    sample_context: `Style: ${slug}`,
    cover_url: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/ai-examples-json/poster_1/image_1.png"
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

    console.log('🔄 Inserting presets...');
    const { data, error } = await supabase
      .from('presets')
      .insert(presets)
      .select();

    if (error) {
      console.error('❌ Failed to insert presets:', error);
      throw error;
    }

    console.log(`✅ Successfully seeded ${presets.length} presets`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully seeded ${presets.length} presets`,
      count: presets.length,
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
