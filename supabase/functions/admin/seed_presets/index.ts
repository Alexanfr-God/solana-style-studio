
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
  sample_context: {
    styleSummary: string;
    palette: Record<string, string>;
    typography: Record<string, any>;
    components: Record<string, string>;
  };
  sample_patch: any[];
}

function validatePresets(titles: string[]): void {
  if (titles.length !== 12) {
    throw new Error(`Expected exactly 12 presets, got ${titles.length}`);
  }

  const emptyTitles = titles.filter(title => !title || title.trim() === '');
  if (emptyTitles.length > 0) {
    throw new Error(`Found ${emptyTitles.length} empty preset titles`);
  }

  const uniqueTitles = new Set(titles);
  if (uniqueTitles.size !== titles.length) {
    throw new Error(`Found duplicate preset titles. Unique: ${uniqueTitles.size}, Total: ${titles.length}`);
  }
}

function createPresetData(title: string): PresetData {
  const knownPresets: Record<string, Partial<PresetData>> = {
    "wolf of wall street": {
      tags: ["luxury", "finance", "dark", "gold"],
      sample_context: {
        styleSummary: "luxury finance, black/gold, glossy accents (inspired, no logos)",
        palette: { primary: "#D4AF37", background: "#0B0B0F", surface: "#1B1B23" },
        typography: { fontFamily: "Playfair Display|Inter", weights: ["600", "700", "400"] },
        components: { buttons: "rounded-16 md shadow", card: "dark surface with subtle glow" }
      }
    },
    "cz": {
      tags: ["minimal", "tech", "blue", "clean"],
      sample_context: {
        styleSummary: "clean minimal tech, cool blues, high contrast on CTAs",
        palette: { primary: "#2563EB", background: "#0B1220", surface: "#121A2A" },
        typography: { fontFamily: "Inter", weights: ["400", "600"] },
        components: { buttons: "flat md radius-12", chip: "outline" }
      }
    },
    "superman": {
      tags: ["heroic", "comic", "red", "blue"],
      sample_context: {
        styleSummary: "heroic comic energy, red/blue highlights, bold headings (inspired, generic)",
        palette: { primary: "#E11D48", secondary: "#1D4ED8", background: "#0A0A0F" },
        typography: { fontFamily: "Bebas Neue|Inter", weights: ["700", "400"] },
        components: { cta: "bold radius-16 shadow-lg" }
      }
    },
    "snoop dogg": {
      tags: ["urban", "neon", "purple", "chill"],
      sample_context: {
        styleSummary: "urban neon-chill, purple accents, vibey gradients (inspired, generic)",
        palette: { primary: "#9333EA", secondary: "#22D3EE", background: "#0B0B0F" },
        typography: { fontFamily: "Poppins|Inter", weights: ["500", "700"] },
        components: { card: "soft glow", button: "subtle gradient" }
      }
    },
    "pepe": {
      tags: ["meme", "green", "playful"],
      sample_context: {
        styleSummary: "playful meme-inspired, green accents, fun gradients",
        palette: { primary: "#22C55E", secondary: "#84CC16", background: "#0A0A0F" },
        typography: { fontFamily: "Comic Neue|Inter", weights: ["400", "700"] },
        components: { button: "rounded-full", card: "playful shadows" }
      }
    },
    "elonmusk": {
      tags: ["tech", "space", "minimal", "futuristic"],
      sample_context: {
        styleSummary: "futuristic tech aesthetic, space-inspired colors, minimal design",
        palette: { primary: "#6366F1", secondary: "#8B5CF6", background: "#030712" },
        typography: { fontFamily: "Space Mono|Inter", weights: ["400", "700"] },
        components: { button: "geometric", card: "tech borders" }
      }
    },
    "gorillaz": {
      tags: ["artistic", "colorful", "creative"],
      sample_context: {
        styleSummary: "artistic creative vibes, colorful palette, expressive design",
        palette: { primary: "#F59E0B", secondary: "#EF4444", background: "#111827" },
        typography: { fontFamily: "Fredoka One|Inter", weights: ["400", "600"] },
        components: { button: "artistic curves", card: "creative shadows" }
      }
    },
    "mia": {
      tags: ["elegant", "minimal", "pink"],
      sample_context: {
        styleSummary: "elegant feminine aesthetic, soft pink tones, refined design",
        palette: { primary: "#EC4899", secondary: "#F472B6", background: "#0F0F0F" },
        typography: { fontFamily: "Playfair Display|Inter", weights: ["400", "600"] },
        components: { button: "soft curves", card: "elegant borders" }
      }
    }
  };

  const known = knownPresets[title];
  
  return {
    title,
    tags: known?.tags || [],
    cover_url: null,
    sample_context: known?.sample_context || {
      styleSummary: "",
      palette: {},
      typography: {},
      components: {}
    },
    sample_patch: []
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

    // Get preset titles
    const presetTitles = [
      "wolf of wall street",
      "cz", 
      "superman",
      "snoop dogg",
      "pepe",
      "elonmusk",
      "gorillaz",
      "mia",
      "wifTheme",
      "guccicatluxurytheme",
      "luxuryTheme",
      "defaultTheme"
    ];

    console.log('📋 Validating preset list...');
    validatePresets(presetTitles);

    console.log('🔄 Upserting presets...');
    const results = [];

    for (const title of presetTitles) {
      const presetData = createPresetData(title);
      
      const { data, error } = await supabase
        .from('presets')
        .upsert(presetData, { onConflict: 'title' })
        .select();

      if (error) {
        console.error(`❌ Failed to upsert preset "${title}":`, error);
        throw error;
      }

      results.push({ title, action: 'upserted', data });
      console.log(`✅ Upserted preset: ${title}`);
    }

    console.log('🎉 Seed completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully seeded ${results.length} presets`,
      results
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
