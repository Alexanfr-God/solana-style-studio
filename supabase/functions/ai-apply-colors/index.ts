import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ColorScheme {
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
}

interface ApplyColorsRequest {
  userId: string;
  scheme: ColorScheme;
  layers: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, scheme, layers } = await req.json() as ApplyColorsRequest;
    
    if (!userId || !scheme || !layers || layers.length === 0) {
      throw new Error('userId, scheme, and layers are required');
    }

    console.log('[ai-apply-colors] Applying scheme:', scheme.name, 'for user:', userId);
    console.log('[ai-apply-colors] Target layers:', layers);
    console.log('[ai-apply-colors] Color scheme:', scheme.colors);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load current user theme (get the most recent one)
    const { data: userTheme, error: loadError } = await supabase
      .from('user_themes')
      .select('theme_data, version')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (loadError) {
      console.error('[ai-apply-colors] Failed to load user theme:', loadError);
      throw new Error(`Failed to load user theme: ${loadError.message}`);
    }
    
    if (!userTheme) {
      console.error('[ai-apply-colors] No theme found for user:', userId);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Theme not found. Please initialize your theme first by clicking "Initialize Theme".'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('[ai-apply-colors] User theme found:', {
      version: userTheme.version,
      hasThemeData: !!userTheme.theme_data,
      themeKeys: userTheme.theme_data ? Object.keys(userTheme.theme_data) : []
    });

    if (!userTheme.theme_data) {
      throw new Error('Theme data is empty');
    }

    console.log('[ai-apply-colors] Loaded theme version:', userTheme.version);

    // Clone theme data to avoid mutation
    const updatedTheme = JSON.parse(JSON.stringify(userTheme.theme_data));
    let appliedCount = 0;

    // Apply colors to each layer
    for (const layerKey of layers) {
      if (!updatedTheme[layerKey]) {
        console.warn(`[ai-apply-colors] Layer ${layerKey} not found in theme, skipping`);
        continue;
      }

      const layer = updatedTheme[layerKey];
      
      // Apply to main layer background
      if (layer.backgroundColor !== undefined && !layer.backgroundImage) {
        layer.backgroundColor = scheme.colors.background;
        appliedCount++;
      }
      if (layer.background !== undefined && !layer.backgroundImage) {
        layer.background = scheme.colors.background;
        appliedCount++;
      }
      
      // Apply text color
      if (layer.textColor !== undefined) {
        layer.textColor = scheme.colors.text;
        appliedCount++;
      }
      if (layer.color !== undefined) {
        layer.color = scheme.colors.text;
        appliedCount++;
      }
      
      // Apply accent color
      if (layer.accentColor !== undefined) {
        layer.accentColor = scheme.colors.accent;
        appliedCount++;
      }
      
      // Apply secondary color
      if (layer.secondaryColor !== undefined) {
        layer.secondaryColor = scheme.colors.secondary;
        appliedCount++;
      }

      // Apply colors to nested containers
      const applyToContainer = (container: any, prefix: string) => {
        if (!container) return;
        
        if (container.backgroundColor !== undefined && !container.backgroundImage) {
          container.backgroundColor = scheme.colors.background;
          appliedCount++;
          console.log(`[ai-apply-colors] Applied bg to ${prefix}`);
        }
        
        if (container.textColor !== undefined) {
          container.textColor = scheme.colors.text;
          appliedCount++;
        }
        
        if (container.color !== undefined) {
          container.color = scheme.colors.text;
          appliedCount++;
        }

        if (container.accentColor !== undefined) {
          container.accentColor = scheme.colors.accent;
          appliedCount++;
        }

        if (container.borderColor !== undefined) {
          container.borderColor = scheme.colors.secondary;
          appliedCount++;
        }
      };

      // Apply to common nested containers
      const containerKeys = [
        'mainContainer', 'headerContainer', 'centerContainer', 
        'footerContainer', 'fromContainer', 'toContainer',
        'searchInputContainer', 'header', 'searchInput',
        'sectionLabel', 'footer', 'sidebar', 'dropdownMenu',
        'assetContainer', 'assetList'
      ];

      for (const containerKey of containerKeys) {
        if (layer[containerKey]) {
          applyToContainer(layer[containerKey], `${layerKey}.${containerKey}`);
        }
      }

      // Apply to buttons
      if (layer.swapActionButton) {
        applyToContainer(layer.swapActionButton, `${layerKey}.swapActionButton`);
      }
      if (layer.buyButton) {
        applyToContainer(layer.buyButton, `${layerKey}.buyButton`);
      }

      console.log(`[ai-apply-colors] Processed layer: ${layerKey}`);
    }

    console.log(`[ai-apply-colors] Total properties updated: ${appliedCount}`);

    if (appliedCount === 0) {
      console.warn('[ai-apply-colors] No properties were updated - theme might have backgroundImages everywhere');
    }

    // Save updated theme back to database
    const { error: updateError } = await supabase
      .from('user_themes')
      .update({
        theme_data: updatedTheme,
        updated_at: new Date().toISOString(),
        version: userTheme.version + 1
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('[ai-apply-colors] Failed to save theme:', updateError);
      throw new Error(`Failed to save theme: ${updateError.message}`);
    }

    console.log('[ai-apply-colors] Successfully saved updated theme');

    return new Response(
      JSON.stringify({
        success: true,
        appliedCount,
        layers: layers,
        scheme: scheme.name,
        message: `Applied "${scheme.name}" to ${layers.length} layers (${appliedCount} properties updated)`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[ai-apply-colors] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
