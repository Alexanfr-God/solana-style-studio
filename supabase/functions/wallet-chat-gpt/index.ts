import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import modules
import { processGPTChat } from './modules/chatHandler.ts';
import { generateImageWithDALLE, generateImageWithReplicate } from './modules/imageGenerator.ts';
import { validateWalletContext, createDefaultWalletContext } from './modules/walletManager.ts';
import { loadDesignExamples, chooseStyle } from './utils/storage-manager.ts';
import { fixedStyleExtraction } from './utils/json-parser.ts';

// Импортируем ДЕТАЛЬНЫЙ реестр элементов кошелька
const DETAILED_WALLET_ELEMENTS_REGISTRY = [
  // Полная структура из DetailedWalletElementsRegistry.tsx
  {
    id: 'wallet-main-container',
    name: 'Main Wallet Container',
    category: 'Structure',
    subcategory: 'Container',
    description: 'Main wallet container with white borders (361x601px)',
    selector: '.wallet-container',
    cssSelector: 'div[style*="361px"][style*="601px"]',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'wallet-white-border',
    name: 'White Border',
    category: 'Structure',
    subcategory: 'Border',
    description: 'White border around wallet (1px solid white)',
    selector: '.wallet-border',
    cssSelector: 'div[style*="border: 1px solid white"]',
    customizable: true,
    elementType: 'container'
  },
  {
    id: 'wallet-background',
    name: 'Wallet Background',
    category: 'Background',
    subcategory: 'Main',
    description: 'Main wallet background area',
    selector: '.wallet-bg',
    customizable: true,
    elementType: 'background'
  },
  {
    id: 'login-header-container',
    name: 'Login Header Container',
    category: 'Login Screen',
    subcategory: 'Header',
    description: 'Header section of login screen (58px height)',
    selector: '.login-header',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'login-phantom-logo-text',
    name: 'Phantom Logo Text',
    category: 'Login Screen',
    subcategory: 'Branding',
    description: 'Phantom text logo in header',
    selector: '.login-logo-text',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'text'
  },
  {
    id: 'login-help-icon',
    name: 'Help Icon',
    category: 'Login Screen',
    subcategory: 'Navigation',
    description: 'Help circle icon in header',
    selector: '.login-help-icon',
    customizable: true,
    layer: 'login',
    position: 'header',
    elementType: 'icon'
  },
  {
    id: 'login-main-content',
    name: 'Login Main Content',
    category: 'Login Screen',
    subcategory: 'Content',
    description: 'Main content area of login screen (541px height)',
    selector: '.login-main-content',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'login-phantom-ghost-icon',
    name: 'Phantom Ghost Icon',
    category: 'Login Screen',
    subcategory: 'Branding',
    description: 'Large Phantom ghost logo (120x120px)',
    selector: '.login-ghost-icon',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'image'
  },
  {
    id: 'login-password-title',
    name: 'Password Title',
    category: 'Login Screen',
    subcategory: 'Text',
    description: '"Enter your password" text',
    selector: '.login-password-title',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'login-password-input',
    name: 'Password Input Field',
    category: 'Login Screen',
    subcategory: 'Input',
    description: 'Password input field with placeholder',
    selector: '.login-password-input',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'input'
  },
  {
    id: 'login-unlock-button',
    name: 'Unlock Button',
    category: 'Login Screen',
    subcategory: 'Action',
    description: 'Main unlock button',
    selector: '.login-unlock-button',
    customizable: true,
    layer: 'login',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-header-container',
    name: 'Home Header Container',
    category: 'Home Screen',
    subcategory: 'Header',
    description: 'Header section with account info and search',
    selector: '.home-header',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'container'
  },
  {
    id: 'home-user-avatar',
    name: 'User Avatar',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Round user avatar (40x40px)',
    selector: '.home-user-avatar',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'image'
  },
  {
    id: 'home-account-dropdown-button',
    name: 'Account Dropdown Button',
    category: 'Home Screen',
    subcategory: 'Account',
    description: 'Account selector with name and address',
    selector: '.home-account-dropdown',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'home-search-button',
    name: 'Search Button',
    category: 'Home Screen',
    subcategory: 'Navigation',
    description: 'Search icon button in header',
    selector: '.home-search-button',
    customizable: true,
    layer: 'home',
    position: 'header',
    elementType: 'button'
  },
  {
    id: 'home-balance-section',
    name: 'Balance Section',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'Total balance display area',
    selector: '.home-balance-section',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-sol-amount',
    name: 'SOL Amount',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'Main SOL balance number',
    selector: '.home-sol-amount',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-usd-value',
    name: 'USD Value',
    category: 'Home Screen',
    subcategory: 'Balance',
    description: 'USD equivalent of balance',
    selector: '.home-usd-value',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'text'
  },
  {
    id: 'home-send-button',
    name: 'Send Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Send crypto action button',
    selector: '.home-send-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-receive-button',
    name: 'Receive Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Receive crypto action button',
    selector: '.home-receive-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-buy-button',
    name: 'Buy Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Buy crypto action button',
    selector: '.home-buy-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-swap-button',
    name: 'Swap Button',
    category: 'Home Screen',
    subcategory: 'Actions',
    description: 'Swap tokens action button',
    selector: '.home-swap-button',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'home-assets-section',
    name: 'Assets Section',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: 'Assets list section container',
    selector: '.home-assets-section',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'home-see-all-button',
    name: 'See All Button',
    category: 'Home Screen',
    subcategory: 'Assets',
    description: '"See all" link button',
    selector: '.home-see-all',
    customizable: true,
    layer: 'home',
    position: 'content',
    elementType: 'button'
  },
  {
    id: 'bottom-nav-container',
    name: 'Bottom Navigation Container',
    category: 'Navigation',
    subcategory: 'Main',
    description: 'Bottom navigation bar container',
    selector: '.bottom-nav',
    customizable: true,
    position: 'footer',
    elementType: 'container'
  },
  {
    id: 'nav-home-tab',
    name: 'Home Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Home navigation tab',
    selector: '.nav-home',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-swap-tab',
    name: 'Swap Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Swap navigation tab',
    selector: '.nav-swap',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-apps-tab',
    name: 'Apps Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'Apps navigation tab',
    selector: '.nav-apps',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'nav-history-tab',
    name: 'History Tab',
    category: 'Navigation',
    subcategory: 'Tab',
    description: 'History navigation tab',
    selector: '.nav-history',
    customizable: true,
    position: 'footer',
    elementType: 'button'
  },
  {
    id: 'send-content',
    name: 'Send Content',
    category: 'Send Screen',
    subcategory: 'Content',
    description: 'Send form content area',
    selector: '.send-content',
    customizable: true,
    layer: 'send',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'receive-content',
    name: 'Receive Content',
    category: 'Receive Screen',
    subcategory: 'Content',
    description: 'Receive screen content area',
    selector: '.receive-content',
    customizable: true,
    layer: 'receive',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'buy-content',
    name: 'Buy Content',
    category: 'Buy Screen',
    subcategory: 'Content',
    description: 'Buy options content area',
    selector: '.buy-content',
    customizable: true,
    layer: 'buy',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'swap-content',
    name: 'Swap Content',
    category: 'Swap Screen',
    subcategory: 'Content',
    description: 'Swap interface content area',
    selector: '.swap-content',
    customizable: true,
    layer: 'swap',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'apps-content',
    name: 'Apps Content',
    category: 'Apps Screen',
    subcategory: 'Content',
    description: 'DApps and applications content area',
    selector: '.apps-content',
    customizable: true,
    layer: 'apps',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'history-content',
    name: 'History Content',
    category: 'History Screen',
    subcategory: 'Content',
    description: 'Transaction history content area',
    selector: '.history-content',
    customizable: true,
    layer: 'history',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'search-content',
    name: 'Search Content',
    category: 'Search Screen',
    subcategory: 'Content',
    description: 'Search interface content area',
    selector: '.search-content',
    customizable: true,
    layer: 'search',
    position: 'content',
    elementType: 'container'
  },
  {
    id: 'account-sidebar-panel',
    name: 'Account Sidebar Panel',
    category: 'Account',
    subcategory: 'Sidebar',
    description: 'Account sidebar sliding panel',
    selector: '.account-sidebar-panel',
    customizable: true,
    position: 'sidebar',
    elementType: 'container'
  },
  {
    id: 'ai-pet-inside-container',
    name: 'AI Pet Inside Container',
    category: 'AI Pet',
    subcategory: 'Inside',
    description: 'AI Pet when positioned inside wallet',
    selector: '.ai-pet-inside',
    customizable: true,
    elementType: 'container'
  }
];

// Import types
import type { WalletContext } from './types/wallet.ts';
import type { GPTResponse } from './types/responses.ts';

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing enhanced wallet chat request with DETAILED elements registry...');

    // Get and validate OpenAI API key (updated to use new secret name)
    const openAIApiKey = Deno.env.get('OPENA_API_KEY')?.trim();
    if (!openAIApiKey || !openAIApiKey.startsWith('sk-')) {
      console.error('❌ OPENA_API_KEY not configured or invalid format');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured or invalid format - check OPENA_API_KEY secret',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Using OPENA_API_KEY for OpenAI requests');

    // Parse request data
    let content, imageUrl, walletElement, walletContext, sessionId, walletType, userPrompt, mode;
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const requestData = await req.json();
      content = requestData.content;
      imageUrl = requestData.imageUrl;
      walletElement = requestData.walletElement;
      walletContext = requestData.walletContext;
      mode = requestData.mode || 'analysis';
    } else {
      const formData = await req.formData();
      sessionId = formData.get('sessionId') as string;
      imageUrl = formData.get('imageUrl') as string;
      userPrompt = formData.get('customPrompt') as string || formData.get('prompt') as string;
      walletType = formData.get('walletType') as string;
      mode = formData.get('mode') as string || 'analysis';
      
      content = userPrompt;
      walletContext = { walletType, activeLayer: 'wallet' };
    }

    console.log('🤖 Processing request:', {
      hasContent: !!content,
      hasImage: !!imageUrl,
      hasWalletElement: !!walletElement,
      hasContext: !!walletContext,
      mode,
      sessionId,
      walletType
    });

    // ROUTER: Handle different modes
    if (mode === 'dalle') {
      const result = await generateImageWithDALLE(content, supabase);
      
      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          response: `I've generated an image based on your request: "${content}". You can apply it as a background to your wallet or download it.`,
          imageUrl: result.imageUrl,
          mode: 'dalle'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    if (mode === 'replicate') {
      const result = await generateImageWithReplicate(content, supabase);
      
      if (result.success) {
        return new Response(JSON.stringify({
          success: true,
          response: `I've generated an image based on your request: "${content}". You can apply it as a background to your wallet or download it.`,
          imageUrl: result.imageUrl,
          mode: 'replicate'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify(result), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // DEFAULT: Enhanced style analysis mode with DETAILED structure integration
    console.log('🧠 Processing enhanced style analysis mode with DETAILED registry...');

    // Validate wallet context
    const validatedWalletContext = validateWalletContext(walletContext);
    const currentWalletType = validatedWalletContext.walletType || 'phantom';

    // Load comprehensive wallet structure
    const structureResponse = await supabase.functions.invoke('wallet-customization-structure', {
      method: 'GET'
    });

    let walletStructure = null;
    if (structureResponse.data?.success) {
      walletStructure = structureResponse.data.structure;
      console.log('✅ Comprehensive wallet structure loaded');
    } else {
      console.warn('⚠️ Failed to load wallet structure, using fallback');
    }

    // НОВОЕ: Используем ДЕТАЛЬНЫЙ реестр элементов
    console.log(`📊 Loading DETAILED wallet elements registry: ${DETAILED_WALLET_ELEMENTS_REGISTRY.length} elements`);
    
    // Группируем элементы по слоям и категориям для лучшей организации
    const elementsByLayer = DETAILED_WALLET_ELEMENTS_REGISTRY.reduce((acc, element) => {
      const layer = element.layer || 'global';
      if (!acc[layer]) acc[layer] = [];
      acc[layer].push(element);
      return acc;
    }, {} as Record<string, any[]>);

    const elementsByCategory = DETAILED_WALLET_ELEMENTS_REGISTRY.reduce((acc, element) => {
      if (!acc[element.category]) acc[element.category] = [];
      acc[element.category].push(element);
      return acc;
    }, {} as Record<string, any[]>);

    console.log(`📋 Elements organized by layers: ${Object.keys(elementsByLayer).length} layers`);
    console.log(`📋 Elements organized by categories: ${Object.keys(elementsByCategory).length} categories`);

    // Enhance wallet context with DETAILED structure data
    const enhancedWalletContext = {
      ...validatedWalletContext,
      walletStructure,
      detailedElementsRegistry: DETAILED_WALLET_ELEMENTS_REGISTRY,
      elementsByLayer,
      elementsByCategory,
      totalElements: DETAILED_WALLET_ELEMENTS_REGISTRY.length,
      customizableElements: DETAILED_WALLET_ELEMENTS_REGISTRY.filter(e => e.customizable).length,
      capabilities: {
        multiWalletSupport: true,
        structureAware: true,
        safeZoneRespect: true,
        collaborationReady: true,
        detailedElementsSupport: true,
        layerBasedCustomization: true,
        granularControl: true
      }
    };

    // Load design examples
    const designExamples = await loadDesignExamples(supabase);
    
    // Choose appropriate style
    let chosenStyle = null;
    if (designExamples.length > 0 && content) {
      chosenStyle = chooseStyle(content, designExamples);
      console.log('🎨 Chosen style:', chosenStyle?.id || 'none');
    }

    // Process GPT chat with enhanced DETAILED context
    const result = await processGPTChat(
      content,
      enhancedWalletContext,
      walletElement,
      imageUrl,
      designExamples,
      chosenStyle,
      openAIApiKey
    );

    console.log('✅ Enhanced GPT response generated with DETAILED registry:', result.success);
    console.log('🎨 StyleChanges extracted:', result.styleChanges ? 'YES' : 'NO');
    console.log(`📊 Total elements available for customization: ${DETAILED_WALLET_ELEMENTS_REGISTRY.length}`);

    // Ensure we return the correct format that frontend expects
    return new Response(JSON.stringify({
      response: result.response,
      styleChanges: result.styleChanges,
      success: result.success,
      mode: result.mode || 'analysis',
      metadata: {
        walletType: currentWalletType,
        structureAware: !!walletStructure,
        detailedElementsCount: DETAILED_WALLET_ELEMENTS_REGISTRY.length,
        customizableElementsCount: DETAILED_WALLET_ELEMENTS_REGISTRY.filter(e => e.customizable).length,
        layersAvailable: Object.keys(elementsByLayer),
        categoriesAvailable: Object.keys(elementsByCategory),
        enhancedAnalysis: true,
        detailedRegistryEnabled: true
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced wallet-chat-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unexpected error occurred',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
