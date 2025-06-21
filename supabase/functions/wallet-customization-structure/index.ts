import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import enhanced modules
import { analyzeWalletStructure, DetailedWalletAnalysis } from './modules/structureAnalyzer.ts';
import { PHANTOM_WALLET_ELEMENTS, WalletElement, validateCustomization } from './modules/elementRegistry.ts';
import { buildEnhancedWalletPrompt, validateGptResponse } from './modules/gptPromptBuilder.ts';
import { validateFullCustomization, ValidationResult } from './modules/customizationValidator.ts';

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
    console.log('🚀 Processing enhanced wallet customization structure request...');

    if (req.method === 'GET') {
      // Return comprehensive wallet structure for AI agents
      return await handleGetEnhancedStructure();
    }

    if (req.method === 'POST') {
      const requestData = await req.json();
      const { action, walletType, externalApiUrl, sessionName, theme, userId, customization } = requestData;

      switch (action) {
        case 'analyze-structure':
          return await handleStructureAnalysis(walletType);
        case 'validate-customization':
          return await handleCustomizationValidation(customization, walletType);
        case 'analyze-external-wallet':
          return await handleExternalWalletAnalysis(externalApiUrl, sessionName);
        case 'switch-wallet':
          return await handleWalletSwitch(walletType);
        case 'apply-theme':
          return await handleThemeApplication(theme, userId);
        case 'create-collaboration':
          return await handleCollaborationCreation(sessionName, externalApiUrl);
        case 'build-gpt-prompt':
          return await handleGptPromptBuilding(requestData);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    }

    throw new Error('Method not allowed');

  } catch (error) {
    console.error('❌ Error in enhanced wallet customization structure:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleGetEnhancedStructure() {
  console.log('📊 Fetching enhanced comprehensive wallet structure...');

  // Load all wallet providers
  const { data: providers, error: providersError } = await supabase
    .from('wallet_providers')
    .select('*')
    .eq('status', 'active');

  if (providersError) {
    throw new Error(`Failed to load providers: ${providersError.message}`);
  }

  // Load all wallet elements from registry
  const { data: registryElements, error: elementsError } = await supabase
    .from('wallet_element_registry')
    .select('*')
    .order('wallet_type, screen_type, element_name');

  if (elementsError) {
    throw new Error(`Failed to load registry elements: ${elementsError.message}`);
  }

  // Load active wallet instances
  const { data: instances, error: instancesError } = await supabase
    .from('wallet_instances')
    .select('*')
    .eq('is_active', true);

  if (instancesError) {
    throw new Error(`Failed to load instances: ${instancesError.message}`);
  }

  // Generate detailed analysis for primary wallet (Phantom)
  const phantomAnalysis = analyzeWalletStructure('phantom', 'wallet');
  
  // Build enhanced comprehensive structure
  const structure = buildEnhancedUniversalWalletStructure(
    providers || [], 
    registryElements || [], 
    instances || [],
    phantomAnalysis
  );

  console.log('✅ Enhanced comprehensive wallet structure built successfully');
  console.log(`📊 Detailed elements analyzed: ${PHANTOM_WALLET_ELEMENTS.length}`);
  console.log(`📊 Customizable elements: ${PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.canCustomize).length}`);
  console.log(`📊 Critical elements: ${PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.criticalForFunctionality).length}`);

  return new Response(JSON.stringify({
    success: true,
    structure,
    detailedAnalysis: phantomAnalysis,
    elementRegistry: PHANTOM_WALLET_ELEMENTS,
    metadata: {
      totalProviders: providers?.length || 0,
      totalRegistryElements: registryElements?.length || 0,
      totalDetailedElements: PHANTOM_WALLET_ELEMENTS.length,
      totalInstances: instances?.length || 0,
      totalWalletTypes: [...new Set(registryElements?.map(e => e.wallet_type) || [])].length,
      customizableElements: PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.canCustomize).length,
      criticalElements: PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.criticalForFunctionality).length,
      version: '2.0.0-enhanced',
      timestamp: new Date().toISOString(),
      capabilities: [
        'multi-wallet-support',
        'external-api-integration', 
        'real-time-switching',
        'collaboration-ready',
        'ai-agent-optimized',
        'detailed-element-registry',
        'comprehensive-validation',
        'enhanced-gpt-prompts',
        'accessibility-validation',
        'performance-optimization'
      ]
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleStructureAnalysis(walletType: string = 'phantom') {
  console.log('🔍 Performing detailed structure analysis for:', walletType);
  
  const analysis = analyzeWalletStructure(walletType, 'wallet');
  
  // Store analysis in database
  const { data: analysisRecord, error: storeError } = await supabase
    .from('wallet_structure_analysis')
    .insert({
      wallet_type: walletType,
      screen_type: 'wallet',
      ui_structure: analysis.uiStructure,
      color_palette: analysis.colorSystem,
      typography: analysis.typography,
      interactivity: analysis.interactivity,
      safe_zones: analysis.customizationRules.safeZones,
      functional_context: {
        customizationRules: analysis.customizationRules,
        layoutSystem: analysis.layoutSystem
      },
      generation_context: analysis.generationContext,
      version: analysis.version
    })
    .select()
    .single();

  if (storeError) {
    console.warn('⚠️ Failed to store analysis:', storeError.message);
  } else {
    console.log('✅ Analysis stored with ID:', analysisRecord.id);
  }

  return new Response(JSON.stringify({
    success: true,
    analysis,
    analysisId: analysisRecord?.id,
    metadata: {
      totalElements: analysis.uiStructure.elements.length,
      customizableElements: analysis.uiStructure.elements.filter(el => el.safeZone.canCustomize).length,
      criticalElements: analysis.uiStructure.elements.filter(el => el.safeZone.criticalForFunctionality).length,
      analyzedAt: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleCustomizationValidation(customization: any, walletType: string = 'phantom') {
  console.log('✅ Validating customization for:', walletType);
  
  const analysis = analyzeWalletStructure(walletType, 'wallet');
  const validation = validateFullCustomization(customization, analysis);
  
  return new Response(JSON.stringify({
    success: validation.isValid,
    validation,
    recommendations: validation.suggestions,
    criticalErrors: validation.errors.filter(e => e.severity === 'critical'),
    warnings: validation.warnings,
    metadata: {
      validatedAt: new Date().toISOString(),
      walletType,
      validationVersion: '2.0.0'
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleGptPromptBuilding(requestData: any) {
  const { userPrompt, walletType = 'phantom', imageUrl } = requestData;
  
  console.log('🤖 Building enhanced GPT prompt for:', walletType);
  
  const analysis = analyzeWalletStructure(walletType, 'wallet');
  const enhancedPrompt = buildEnhancedWalletPrompt(userPrompt, analysis, imageUrl);
  
  return new Response(JSON.stringify({
    success: true,
    enhancedPrompt,
    analysis: {
      totalElements: analysis.uiStructure.elements.length,
      customizableElements: analysis.uiStructure.elements.filter(el => el.safeZone.canCustomize).length,
      themeVariations: analysis.generationContext.themeVariations.length
    },
    metadata: {
      walletType,
      promptLength: enhancedPrompt.length,
      builtAt: new Date().toISOString()
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

  // Generate detailed analysis for the wallet type
  const detailedAnalysis = analyzeWalletStructure(walletType, 'wallet');

  const walletStructure = {
    walletType,
    elements: elements || [],
    instance: instance || null,
    screens: groupElementsByScreen(elements || []),
    detailedAnalysis,
    metadata: {
      totalElements: elements?.length || 0,
      screens: [...new Set(elements?.map(e => e.screen_type) || [])],
      interactiveElements: elements?.filter(e => e.is_interactive).length || 0,
      detailedElementsCount: PHANTOM_WALLET_ELEMENTS.length,
      customizableElementsCount: PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.canCustomize).length
    }
  };

  console.log('✅ Enhanced wallet switch completed:', walletType);

  return new Response(JSON.stringify({
    success: true,
    walletStructure,
    message: `Successfully switched to ${walletType} wallet with enhanced analysis`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleThemeApplication(theme: any, userId: string) {
  console.log('🎨 Applying theme with validation:', theme);

  // Validate theme before application
  const analysis = analyzeWalletStructure('phantom', 'wallet');
  const validation = validateFullCustomization(theme, analysis);

  if (!validation.isValid) {
    return new Response(JSON.stringify({
      success: false,
      validation,
      message: 'Theme validation failed',
      errors: validation.errors
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Store validated theme
  const { data: result, error } = await supabase
    .from('customization_results')
    .insert({
      session_id: `theme_${Date.now()}`,
      customization_data: theme,
      status: 'completed',
      user_id: userId,
      quality_score: validation.warnings.length === 0 ? 1.0 : 0.8
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to apply theme: ${error.message}`);
  }

  return new Response(JSON.stringify({
    success: true,
    result,
    validation,
    message: 'Theme applied successfully with validation'
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

function buildEnhancedUniversalWalletStructure(
  providers: WalletProvider[], 
  registryElements: any[], 
  instances: WalletInstance[],
  phantomAnalysis: DetailedWalletAnalysis
) {
  const walletTypes = [...new Set(registryElements.map(e => e.wallet_type))];
  
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
      const typeElements = registryElements.filter(e => e.wallet_type === type);
      const typeInstance = instances.find(i => i.wallet_type === type);
      
      acc[type] = {
        elements: groupElementsByScreen(typeElements),
        instance: typeInstance,
        detailedElements: type === 'phantom' ? PHANTOM_WALLET_ELEMENTS : [],
        analysis: type === 'phantom' ? phantomAnalysis : null,
        metadata: {
          totalElements: typeElements.length,
          detailedElementsCount: type === 'phantom' ? PHANTOM_WALLET_ELEMENTS.length : 0,
          screens: [...new Set(typeElements.map(e => e.screen_type))],
          interactiveElements: typeElements.filter(e => e.is_interactive).length,
          customizableElements: type === 'phantom' ? 
            PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.canCustomize).length : 0,
          criticalElements: type === 'phantom' ? 
            PHANTOM_WALLET_ELEMENTS.filter(el => el.safeZone.criticalForFunctionality).length : 0,
          safeZones: typeElements.filter(e => e.safe_zone).map(e => ({
            element: e.element_name,
            zone: e.safe_zone
          }))
        }
      };
      return acc;
    }, {} as any),
    
    enhancedCapabilities: {
      multiWalletSupport: true,
      externalApiIntegration: true,
      realTimeSwitching: true,
      collaborationReady: true,
      aiAgentOptimized: true,
      detailedElementRegistry: true,
      comprehensiveValidation: true,
      enhancedGptPrompts: true,
      accessibilityValidation: true,
      performanceOptimization: true
    },
    
    aiAgentsInstructions: {
      contextUnderstanding: "Use walletTypes[type].detailedElements for comprehensive element understanding",
      safeZoneRespect: "Always check element.safeZone.canCustomize before applying modifications",
      interactivityPreservation: "Maintain functionality of elements with safeZone.criticalForFunctionality = true",
      collaborationSupport: "External APIs can be integrated via collaboration sessions",
      validationRequired: "Always validate customizations using the validation endpoint",
      promptEnhancement: "Use the build-gpt-prompt action for enhanced context",
      elementHierarchy: "Respect parent-child relationships in element structure",
      stateManagement: "Consider all element states (normal, hover, active, disabled)",
      animationHandling: "Preserve existing animations unless specifically requested to modify"
    },
    
    detailedAnalysis: phantomAnalysis,
    elementRegistry: PHANTOM_WALLET_ELEMENTS
  };

  return structure;
}

function groupElementsByScreen(elements: any[]) {
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
