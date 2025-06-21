
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

interface WalletProvider {
  id: string;
  name: string;
  api_endpoint?: string;
  supported_wallets: string[];
  metadata: any;
}

interface WalletElement {
  id: string;
  wallet_type: string;
  screen_type: string;
  element_name: string;
  element_type: string;
  position: any;
  properties: any;
  safe_zone?: any;
  is_interactive: boolean;
}

interface WalletInstance {
  id: string;
  instance_name: string;
  wallet_type: string;
  structure_data: any;
  is_active: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing wallet customization structure request...');

    if (req.method === 'GET') {
      // Return comprehensive wallet structure for AI agents
      return await handleGetStructure();
    }

    if (req.method === 'POST') {
      const requestData = await req.json();
      const { action, walletType, externalApiUrl, sessionName, theme, userId } = requestData;

      switch (action) {
        case 'analyze-external-wallet':
          return await handleExternalWalletAnalysis(externalApiUrl, sessionName);
        case 'switch-wallet':
          return await handleWalletSwitch(walletType);
        case 'apply-theme':
          return await handleThemeApplication(theme, userId);
        case 'create-collaboration':
          return await handleCollaborationCreation(sessionName, externalApiUrl);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('❌ Error in wallet customization structure:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleGetStructure() {
  console.log('📊 Fetching comprehensive wallet structure...');

  // Load all wallet providers
  const { data: providers, error: providersError } = await supabase
    .from('wallet_providers')
    .select('*')
    .eq('status', 'active');

  if (providersError) {
    throw new Error(`Failed to load providers: ${providersError.message}`);
  }

  // Load all wallet elements
  const { data: elements, error: elementsError } = await supabase
    .from('wallet_element_registry')
    .select('*')
    .order('wallet_type, screen_type, element_name');

  if (elementsError) {
    throw new Error(`Failed to load elements: ${elementsError.message}`);
  }

  // Load active wallet instances
  const { data: instances, error: instancesError } = await supabase
    .from('wallet_instances')
    .select('*')
    .eq('is_active', true);

  if (instancesError) {
    throw new Error(`Failed to load instances: ${instancesError.message}`);
  }

  // Build comprehensive structure
  const structure = buildUniversalWalletStructure(providers || [], elements || [], instances || []);

  console.log('✅ Comprehensive wallet structure built successfully');

  return new Response(JSON.stringify({
    success: true,
    structure,
    metadata: {
      totalProviders: providers?.length || 0,
      totalElements: elements?.length || 0,
      totalInstances: instances?.length || 0,
      totalWalletTypes: [...new Set(elements?.map(e => e.wallet_type) || [])].length,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      capabilities: [
        'multi-wallet-support',
        'external-api-integration',
        'real-time-switching',
        'collaboration-ready',
        'ai-agent-optimized'
      ]
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleExternalWalletAnalysis(apiUrl: string, sessionName: string) {
  console.log('🔍 Analyzing external wallet API:', apiUrl);

  // Create collaboration session
  const { data: session, error: sessionError } = await supabase
    .from('collaboration_sessions')
    .insert({
      session_name: sessionName,
      external_api_url: apiUrl,
      status: 'analyzing'
    })
    .select()
    .single();

  if (sessionError) {
    throw new Error(`Failed to create session: ${sessionError.message}`);
  }

  try {
    // Fetch external wallet structure
    const response = await fetch(apiUrl);
    const externalData = await response.json();

    // Analyze and convert external structure
    const analyzedStructure = await analyzeExternalWalletStructure(externalData);

    // Store analysis result
    const { error: updateError } = await supabase
      .from('collaboration_sessions')
      .update({
        wallet_data: externalData,
        analysis_result: analyzedStructure,
        status: 'completed'
      })
      .eq('id', session.id);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    // Add elements to registry
    if (analyzedStructure.elements) {
      for (const element of analyzedStructure.elements) {
        await supabase
          .from('wallet_element_registry')
          .upsert({
            wallet_type: analyzedStructure.wallet_type,
            screen_type: element.screen_type,
            element_name: element.name,
            element_type: element.type,
            position: element.position,
            properties: element.properties,
            safe_zone: element.safe_zone,
            is_interactive: element.is_interactive
          });
      }
    }

    console.log('✅ External wallet analyzed and added to registry');

    return new Response(JSON.stringify({
      success: true,
      sessionId: session.id,
      analyzedStructure,
      message: 'External wallet analyzed and integrated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Update session with error
    await supabase
      .from('collaboration_sessions')
      .update({
        status: 'failed',
        analysis_result: { error: error.message }
      })
      .eq('id', session.id);

    throw error;
  }
}

async function handleWalletSwitch(walletType: string) {
  console.log('🔄 Switching to wallet type:', walletType);

  // Load wallet elements for the specified type
  const { data: elements, error: elementsError } = await supabase
    .from('wallet_element_registry')
    .select('*')
    .eq('wallet_type', walletType);

  if (elementsError) {
    throw new Error(`Failed to load wallet elements: ${elementsError.message}`);
  }

  // Load wallet instance if exists
  const { data: instance, error: instanceError } = await supabase
    .from('wallet_instances')
    .select('*')
    .eq('wallet_type', walletType)
    .eq('is_active', true)
    .single();

  if (instanceError && instanceError.code !== 'PGRST116') {
    throw new Error(`Failed to load wallet instance: ${instanceError.message}`);
  }

  const walletStructure = {
    walletType,
    elements: elements || [],
    instance: instance || null,
    screens: groupElementsByScreen(elements || []),
    metadata: {
      totalElements: elements?.length || 0,
      screens: [...new Set(elements?.map(e => e.screen_type) || [])],
      interactiveElements: elements?.filter(e => e.is_interactive).length || 0
    }
  };

  console.log('✅ Wallet switch completed:', walletType);

  return new Response(JSON.stringify({
    success: true,
    walletStructure,
    message: `Successfully switched to ${walletType} wallet`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleThemeApplication(theme: any, userId: string) {
  console.log('🎨 Applying theme:', theme);

  // Here you would implement theme application logic
  // For now, we'll just store it as a customization result
  const { data: result, error } = await supabase
    .from('customization_results')
    .insert({
      session_id: `theme_${Date.now()}`,
      customization_data: theme,
      status: 'completed',
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to apply theme: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    result,
    message: 'Theme applied successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCollaborationCreation(sessionName: string, apiUrl: string) {
  console.log('🤝 Creating collaboration session:', sessionName);

  const { data: session, error } = await supabase
    .from('collaboration_sessions')
    .insert({
      session_name: sessionName,
      external_api_url: apiUrl,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create collaboration: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    session,
    message: 'Collaboration session created successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function buildUniversalWalletStructure(providers: WalletProvider[], elements: WalletElement[], instances: WalletInstance[]) {
  const walletTypes = [...new Set(elements.map(e => e.wallet_type))];
  
  const structure = {
    providers: providers.reduce((acc, p) => {
      acc[p.name] = {
        id: p.id,
        supportedWallets: p.supported_wallets,
        apiEndpoint: p.api_endpoint,
        metadata: p.metadata
      };
      return acc;
    }, {} as any),
    
    walletTypes: walletTypes.reduce((acc, type) => {
      const typeElements = elements.filter(e => e.wallet_type === type);
      const typeInstance = instances.find(i => i.wallet_type === type);
      
      acc[type] = {
        elements: groupElementsByScreen(typeElements),
        instance: typeInstance,
        metadata: {
          totalElements: typeElements.length,
          screens: [...new Set(typeElements.map(e => e.screen_type))],
          interactiveElements: typeElements.filter(e => e.is_interactive).length,
          safeZones: typeElements.filter(e => e.safe_zone).map(e => ({
            element: e.element_name,
            zone: e.safe_zone
          }))
        }
      };
      return acc;
    }, {} as any),
    
    capabilities: {
      multiWalletSupport: true,
      externalApiIntegration: true,
      realTimeSwitching: true,
      collaborationReady: true,
      aiAgentOptimized: true
    },
    
    aiAgentsInstructions: {
      contextUnderstanding: "Use walletTypes[type].elements to understand wallet structure",
      safeZoneRespect: "Always check safeZones before applying modifications",
      interactivityPreservation: "Maintain interactiveElements functionality",
      collaborationSupport: "External APIs can be integrated via collaboration sessions"
    },
    
    exampleThemes: {
      cyberpunk: {
        backgroundColor: "#0a0a0a",
        accentColor: "#00ff88",
        textColor: "#ffffff",
        buttonColor: "#ff0080"
      },
      minimal: {
        backgroundColor: "#ffffff",
        accentColor: "#000000",
        textColor: "#333333",
        buttonColor: "#007bff"
      },
      warm: {
        backgroundColor: "#fff5f5",
        accentColor: "#ff6b6b",
        textColor: "#2d3748",
        buttonColor: "#e53e3e"
      }
    }
  };

  return structure;
}

function groupElementsByScreen(elements: WalletElement[]) {
  return elements.reduce((acc, element) => {
    if (!acc[element.screen_type]) {
      acc[element.screen_type] = [];
    }
    acc[element.screen_type].push({
      name: element.element_name,
      type: element.element_type,
      position: element.position,
      properties: element.properties,
      safeZone: element.safe_zone,
      isInteractive: element.is_interactive
    });
    return acc;
  }, {} as any);
}

async function analyzeExternalWalletStructure(externalData: any) {
  // Basic structure analysis for external wallet data
  // This would be more sophisticated in a real implementation
  return {
    wallet_type: externalData.type || 'external_wallet',
    elements: externalData.elements || [],
    metadata: {
      source: 'external_api',
      analyzedAt: new Date().toISOString(),
      version: externalData.version || '1.0'
    }
  };
}
