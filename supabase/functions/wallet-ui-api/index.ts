
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface WalletAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
  version: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;
  const walletType = url.searchParams.get('type') || 'phantom';

  try {
    console.log(`🚀 Wallet UI API request: ${req.method} ${pathname}`);

    // API Router
    switch (pathname) {
      case '/wallet-ui-api/analyze':
        return handleAnalyzeWallet(walletType);
      
      case '/wallet-ui-api/schema':
        return handleGetSchema(walletType);
      
      case '/wallet-ui-api/elements':
        return handleGetElements(walletType);
      
      case '/wallet-ui-api/categories':
        return handleGetCategories(walletType);
      
      case '/wallet-ui-api/health':
        return handleHealthCheck();
      
      default:
        return createErrorResponse('Endpoint not found', 404);
    }

  } catch (error) {
    console.error('❌ Wallet UI API error:', error);
    return createErrorResponse(error.message, 500);
  }

  async function handleAnalyzeWallet(walletType: string): Promise<Response> {
    console.log(`🔍 Analyzing wallet: ${walletType}`);

    // Load elements from database
    const { data: elements, error: elementsError } = await supabase
      .from('wallet_element_registry')
      .select('*')
      .eq('wallet_type', walletType);

    if (elementsError) {
      console.error('Database error:', elementsError);
      return createErrorResponse('Failed to load wallet elements', 500);
    }

    // Load wallet instances
    const { data: instances, error: instancesError } = await supabase
      .from('wallet_instances')
      .select('*')
      .eq('wallet_type', walletType)
      .eq('is_active', true);

    if (instancesError) {
      console.warn('Instance loading error:', instancesError);
    }

    const analysis = {
      walletType,
      totalElements: elements?.length || 0,
      categories: [...new Set(elements?.map(e => e.properties?.category).filter(Boolean))],
      interactiveElements: elements?.filter(e => e.is_interactive).length || 0,
      customizableElements: elements?.filter(e => e.properties?.customizable).length || 0,
      instances: instances || [],
      lastAnalyzed: new Date().toISOString()
    };

    return createSuccessResponse(analysis);
  }

  async function handleGetSchema(walletType: string): Promise<Response> {
    console.log(`📋 Getting schema for: ${walletType}`);

    const { data: elements, error } = await supabase
      .from('wallet_element_registry')
      .select('*')
      .eq('wallet_type', walletType);

    if (error) {
      return createErrorResponse('Failed to load schema', 500);
    }

    const schema = {
      walletType,
      version: '1.0.0',
      totalElements: elements?.length || 0,
      categories: [...new Set(elements?.map(e => e.properties?.category).filter(Boolean))],
      screens: ['home', 'send', 'receive', 'buy', 'swap', 'apps', 'history', 'search'],
      elements: elements?.map(element => ({
        id: element.id,
        name: element.element_name,
        type: element.element_type,
        category: element.properties?.category || 'Other',
        description: element.properties?.description || '',
        selector: element.position?.selector || '',
        properties: {
          customizable: element.properties?.customizable || false,
          interactive: element.is_interactive,
          safeZone: element.safe_zone,
          position: element.position
        }
      })) || [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        apiVersion: '1.0.0',
        compatibility: ['WalletAlivePlayground', 'PhantomWallet']
      }
    };

    return createSuccessResponse(schema);
  }

  async function handleGetElements(walletType: string): Promise<Response> {
    console.log(`🧩 Getting elements for: ${walletType}`);

    const { data: elements, error } = await supabase
      .from('wallet_element_registry')
      .select('*')
      .eq('wallet_type', walletType);

    if (error) {
      return createErrorResponse('Failed to load elements', 500);
    }

    return createSuccessResponse({
      walletType,
      elements: elements || [],
      count: elements?.length || 0
    });
  }

  async function handleGetCategories(walletType: string): Promise<Response> {
    console.log(`📂 Getting categories for: ${walletType}`);

    const { data: elements, error } = await supabase
      .from('wallet_element_registry')
      .select('properties')
      .eq('wallet_type', walletType);

    if (error) {
      return createErrorResponse('Failed to load categories', 500);
    }

    const categories = [...new Set(elements?.map(e => e.properties?.category).filter(Boolean))];
    const categoriesWithCounts = categories.map(category => ({
      name: category,
      count: elements?.filter(e => e.properties?.category === category).length || 0
    }));

    return createSuccessResponse({
      walletType,
      categories: categoriesWithCounts,
      totalCategories: categories.length
    });
  }

  async function handleHealthCheck(): Promise<Response> {
    const health = {
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational'
      }
    };

    return createSuccessResponse(health);
  }

  function createSuccessResponse(data: any): Response {
    const response: WalletAPIResponse = {
      success: true,
      data,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  function createErrorResponse(error: string, status: number = 400): Response {
    const response: WalletAPIResponse = {
      success: false,
      error,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
