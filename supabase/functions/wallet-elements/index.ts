
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface WalletElement {
  id: string;
  screen: string;
  name: string;
  type: string;
  description: string;
  customizable: boolean;
  custom_props: string[];
  position: string | null;
  selector: string | null;
  created_at: string;
  updated_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing wallet elements request...');

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const screen = url.searchParams.get('screen');
      const type = url.searchParams.get('type');
      const customizable = url.searchParams.get('customizable');

      return await handleGetElements(screen, type, customizable);
    }

    if (req.method === 'POST') {
      const requestData = await req.json();
      const { action } = requestData;

      switch (action) {
        case 'get-all-grouped':
          return await handleGetAllGrouped();
        case 'get-by-screen':
          return await handleGetByScreen(requestData.screen);
        case 'get-customizable':
          return await handleGetCustomizable();
        case 'get-statistics':
          return await handleGetStatistics();
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('❌ Error in wallet elements:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleGetElements(screen?: string | null, type?: string | null, customizable?: string | null) {
  console.log('📊 Fetching wallet elements with filters:', { screen, type, customizable });

  let query = supabase
    .from('wallet_elements')
    .select('*')
    .order('screen, position, name');

  if (screen) {
    query = query.eq('screen', screen);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (customizable) {
    query = query.eq('customizable', customizable === 'true');
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch elements: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    elements: data || [],
    count: data?.length || 0,
    filters: { screen, type, customizable }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetAllGrouped() {
  console.log('📊 Fetching all elements grouped by screen...');

  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .order('screen, position, name');

  if (error) {
    throw new Error(`Failed to fetch elements: ${error.message}`);
  }

  // Group elements by screen
  const grouped = (data || []).reduce((acc: any, element: WalletElement) => {
    if (!acc[element.screen]) {
      acc[element.screen] = {
        screen: element.screen,
        elements: [],
        counts: {
          total: 0,
          customizable: 0,
          byType: {}
        }
      };
    }
    
    acc[element.screen].elements.push(element);
    acc[element.screen].counts.total++;
    
    if (element.customizable) {
      acc[element.screen].counts.customizable++;
    }
    
    if (!acc[element.screen].counts.byType[element.type]) {
      acc[element.screen].counts.byType[element.type] = 0;
    }
    acc[element.screen].counts.byType[element.type]++;
    
    return acc;
  }, {});

  const screens = Object.keys(grouped);
  const totalElements = data?.length || 0;
  const customizableElements = data?.filter(el => el.customizable).length || 0;

  return new Response(JSON.stringify({
    success: true,
    grouped,
    screens,
    totalElements,
    customizableElements,
    metadata: {
      screenCount: screens.length,
      averageElementsPerScreen: Math.round(totalElements / screens.length),
      customizationPercentage: Math.round((customizableElements / totalElements) * 100)
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetByScreen(screen: string) {
  console.log('📊 Fetching elements for screen:', screen);

  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .eq('screen', screen)
    .order('position, name');

  if (error) {
    throw new Error(`Failed to fetch elements for screen ${screen}: ${error.message}`);
  }

  // Group by position
  const byPosition = (data || []).reduce((acc: any, element: WalletElement) => {
    const pos = element.position || 'unspecified';
    if (!acc[pos]) {
      acc[pos] = [];
    }
    acc[pos].push(element);
    return acc;
  }, {});

  return new Response(JSON.stringify({
    success: true,
    screen,
    elements: data || [],
    byPosition,
    count: data?.length || 0,
    customizableCount: data?.filter(el => el.customizable).length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetCustomizable() {
  console.log('📊 Fetching only customizable elements...');

  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*')
    .eq('customizable', true)
    .order('screen, position, name');

  if (error) {
    throw new Error(`Failed to fetch customizable elements: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    elements: data || [],
    count: data?.length || 0,
    message: 'Customizable elements only'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGetStatistics() {
  console.log('📊 Generating wallet elements statistics...');

  const { data, error } = await supabase
    .from('wallet_elements')
    .select('*');

  if (error) {
    throw new Error(`Failed to fetch elements for statistics: ${error.message}`);
  }

  if (!data) {
    return new Response(JSON.stringify({
      success: true,
      statistics: {
        total: 0,
        screens: [],
        types: [],
        customizable: 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Calculate statistics
  const screens = [...new Set(data.map(el => el.screen))];
  const types = [...new Set(data.map(el => el.type))];
  const customizable = data.filter(el => el.customizable).length;

  const screenStats = screens.reduce((acc: any, screen) => {
    const screenElements = data.filter(el => el.screen === screen);
    acc[screen] = {
      total: screenElements.length,
      customizable: screenElements.filter(el => el.customizable).length,
      types: [...new Set(screenElements.map(el => el.type))]
    };
    return acc;
  }, {});

  const typeStats = types.reduce((acc: any, type) => {
    const typeElements = data.filter(el => el.type === type);
    acc[type] = {
      total: typeElements.length,
      customizable: typeElements.filter(el => el.customizable).length,
      screens: [...new Set(typeElements.map(el => el.screen))]
    };
    return acc;
  }, {});

  return new Response(JSON.stringify({
    success: true,
    statistics: {
      total: data.length,
      customizable,
      customizationPercentage: Math.round((customizable / data.length) * 100),
      screens: {
        list: screens,
        count: screens.length,
        details: screenStats
      },
      types: {
        list: types,
        count: types.length,
        details: typeStats
      },
      positions: {
        list: [...new Set(data.map(el => el.position).filter(Boolean))],
        distribution: data.reduce((acc: any, el) => {
          const pos = el.position || 'unspecified';
          acc[pos] = (acc[pos] || 0) + 1;
          return acc;
        }, {})
      }
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
