
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { applyPatch } from 'https://esm.sh/fast-json-patch@3.1.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { patch } = await req.json();
    
    if (!patch || !Array.isArray(patch)) {
      return new Response('Invalid patch format', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('[Theme Apply] Received patch with', patch.length, 'operations');

    // Получаем userId из JWT или используем анонимный ключ
    const authHeader = req.headers.get('authorization');
    let userId = 'anonymous';
    
    if (authHeader) {
      try {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (user) userId = user.id;
      } catch (error) {
        console.warn('[Theme Apply] Auth parsing failed, using anonymous');
      }
    }

    // Получаем текущую тему пользователя или загружаем default
    let baseTheme;
    try {
      const { data } = await supabase
        .from('user_themes')
        .select('theme_data')
        .eq('user_id', userId)
        .single();
      
      baseTheme = data?.theme_data;
    } catch (error) {
      console.log('[Theme Apply] No existing theme, using default');
    }

    // Если нет сохранённой темы, загружаем default
    if (!baseTheme) {
      const defaultResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/wallet-assets/themes/defaultTheme.json`);
      if (defaultResponse.ok) {
        baseTheme = await defaultResponse.json();
      } else {
        // Fallback на минимальную тему
        baseTheme = {
          lockLayer: { backgroundColor: '#1a1a1a' },
          homeLayer: { backgroundColor: '#1a1a1a' }
        };
      }
    }

    // Применяем патч к базовой теме
    const updatedTheme = applyPatch(baseTheme, patch, false, false).newDocument;
    
    // Сохраняем обновлённую тему
    const version = (baseTheme.version || 0) + 1;
    const themeWithMeta = {
      ...updatedTheme,
      version,
      updated_at: new Date().toISOString()
    };

    await supabase
      .from('user_themes')
      .upsert({
        user_id: userId,
        theme_data: themeWithMeta,
        version,
        updated_at: new Date().toISOString()
      });

    console.log('[Theme Apply] Theme saved successfully, version:', version);

    return new Response(
      JSON.stringify({ 
        ok: true, 
        version,
        message: 'Theme updated successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[Theme Apply] Error:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
