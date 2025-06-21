import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

interface WalletStyle {
  backgroundColor: string;
  backgroundImage?: string;
  accentColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: string;
  fontFamily: string;
  boxShadow?: string;
  styleNotes?: string;
}

interface AnalyzeRequest {
  loginStyle?: WalletStyle;
  walletStyle?: WalletStyle;
  activeLayer: 'login' | 'wallet';
  walletType?: string;
  externalApiUrl?: string;
  useRegistry?: boolean;
}

interface WalletAnalysis {
  uiStructure: {
    dimensions: {
      width: number;
      height: number;
      aspectRatio: string;
    };
    layout: {
      type: 'login' | 'wallet';
      primaryElements: string[];
      interactiveElements: string[];
      visualHierarchy: string[];
    };
    colorPalette: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
      gradients?: string[];
    };
    typography: {
      fontFamily: string;
      primaryTextColor: string;
      secondaryTextColor: string;
      textSizes: string[];
    };
    interactivity: {
      buttons: Array<{
        type: string;
        position: string;
        color: string;
        textColor: string;
        functionality: string;
      }>;
      inputs: Array<{
        type: string;
        placeholder: string;
        position: string;
        styling: string;
      }>;
      animations: string[];
    };
    safeZone: {
      x: number;
      y: number;
      width: number;
      height: number;
      criticalElements: string[];
    };
  };
  functionalContext: {
    purpose: string;
    userFlow: string[];
    criticalFeatures: string[];
    designPhilosophy: string;
  };
  generationContext: {
    promptEnhancement: string;
    characterInteractionGuidelines: string[];
    preservationRules: string[];
    styleAdaptation: string;
  };
  registryElements?: any[];
  externalData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting enhanced wallet structure analysis');
    
    const requestBody = await req.json() as AnalyzeRequest;
    const { 
      loginStyle, 
      walletStyle, 
      activeLayer, 
      walletType = 'phantom',
      externalApiUrl,
      useRegistry = true
    } = requestBody;
    
    const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;
    
    console.log(`📱 Analyzing ${activeLayer} wallet (${walletType}) with enhanced structure support`);
    
    let registryElements = [];
    let externalData = null;

    // Load from registry if requested
    if (useRegistry) {
      console.log('📊 Loading elements from registry...');
      const { data: elements, error } = await supabase
        .from('wallet_element_registry')
        .select('*')
        .eq('wallet_type', walletType)
        .eq('screen_type', activeLayer);

      if (error) {
        console.warn('⚠️ Failed to load from registry:', error.message);
      } else {
        registryElements = elements || [];
        console.log(`✅ Loaded ${registryElements.length} elements from registry`);
      }
    }

    // Fetch external data if URL provided
    if (externalApiUrl) {
      try {
        console.log('🌐 Fetching external wallet data...');
        const response = await fetch(externalApiUrl);
        externalData = await response.json();
        console.log('✅ External data loaded successfully');
      } catch (error) {
        console.warn('⚠️ Failed to fetch external data:', error.message);
      }
    }
    
    // Analyze structure with enhanced data
    const analysis: WalletAnalysis = analyzeWalletStructure(
      currentStyle, 
      activeLayer, 
      walletType,
      registryElements,
      externalData
    );
    
    console.log('✅ Enhanced wallet analysis completed');
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        metadata: {
          timestamp: new Date().toISOString(),
          layer: activeLayer,
          walletType,
          registryElementsCount: registryElements.length,
          hasExternalData: !!externalData,
          enhancedAnalysis: true
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("💥 Enhanced wallet analysis error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Analysis failed", 
        details: error.message,
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function analyzeWalletStructure(
  style: WalletStyle, 
  layer: 'login' | 'wallet',
  walletType: string = 'phantom',
  registryElements: any[] = [],
  externalData: any = null
): WalletAnalysis {
  console.log(`🎯 Deep analyzing ${layer} UI structure for ${walletType}`);
  
  // Base analysis (keeping existing logic)
  const baseAnalysis = getBaseAnalysis(style, layer);
  
  // Enhance with registry data
  if (registryElements.length > 0) {
    baseAnalysis.uiStructure.layout.primaryElements = [
      ...baseAnalysis.uiStructure.layout.primaryElements,
      ...registryElements.map(e => e.element_name)
    ];
    
    baseAnalysis.uiStructure.layout.interactiveElements = [
      ...baseAnalysis.uiStructure.layout.interactiveElements,
      ...registryElements.filter(e => e.is_interactive).map(e => e.element_name)
    ];

    // Add safe zones from registry
    const safeZones = registryElements
      .filter(e => e.safe_zone)
      .map(e => `${e.element_name} (${JSON.stringify(e.safe_zone)})`);
    
    if (safeZones.length > 0) {
      baseAnalysis.uiStructure.safeZone.criticalElements.push(...safeZones);
    }
  }

  // Add registry and external data to analysis
  baseAnalysis.registryElements = registryElements;
  baseAnalysis.externalData = externalData;

  // Update generation context with registry awareness
  baseAnalysis.generationContext.promptEnhancement += ` [Enhanced with ${registryElements.length} registry elements for ${walletType}]`;
  
  if (registryElements.length > 0) {
    baseAnalysis.generationContext.preservationRules.push(
      `Registry elements must be preserved: ${registryElements.map(e => e.element_name).join(', ')}`
    );
  }

  return baseAnalysis;
}

function getBaseAnalysis(style: WalletStyle, layer: 'login' | 'wallet'): WalletAnalysis {
  // ... keep existing code (login and wallet analysis logic from original file)
  if (layer === 'login') {
    return {
      uiStructure: {
        dimensions: {
          width: 320,
          height: 569,
          aspectRatio: "9:16"
        },
        layout: {
          type: 'login',
          primaryElements: [
            "Solana logo circle (top center)",
            "Welcome title text",
            "Description paragraph", 
            "Email input field",
            "Password input field",
            "Login button",
            "Create account link",
            "Version footer"
          ],
          interactiveElements: [
            "Email input (center, transparent background)",
            "Password input (center, transparent background)", 
            "Login button (primary action)",
            "Create account link (secondary action)"
          ],
          visualHierarchy: [
            "1. Solana logo (visual anchor)",
            "2. Welcome text (primary message)",
            "3. Input fields (user interaction)",
            "4. Login button (call to action)",
            "5. Secondary links (optional actions)"
          ]
        },
        colorPalette: {
          primary: style.backgroundColor,
          secondary: style.accentColor,
          accent: style.accentColor,
          text: style.textColor,
          background: style.backgroundColor,
          gradients: style.backgroundImage ? [style.backgroundImage] : []
        },
        typography: {
          fontFamily: style.fontFamily,
          primaryTextColor: style.textColor,
          secondaryTextColor: `${style.textColor}80`,
          textSizes: ["text-2xl (title)", "text-sm (description)", "text-xs (footer)"]
        },
        interactivity: {
          buttons: [
            {
              type: "primary",
              position: "center-bottom",
              color: style.buttonColor,
              textColor: style.buttonTextColor,
              functionality: "authenticate user"
            }
          ],
          inputs: [
            {
              type: "email",
              placeholder: "Email",
              position: "center",
              styling: "transparent background with rounded corners"
            },
            {
              type: "password", 
              placeholder: "Password",
              position: "center-below-email",
              styling: "transparent background with rounded corners"
            }
          ],
          animations: ["button hover effects", "input focus states", "subtle transitions"]
        },
        safeZone: {
          x: 352,
          y: 228, 
          width: 320,
          height: 569,
          criticalElements: [
            "Solana logo (must remain visible)",
            "Input fields (must be accessible)",
            "Login button (must be clickable)", 
            "All text content (must be readable)"
          ]
        }
      },
      functionalContext: {
        purpose: "Secure authentication gateway for Solana wallet access",
        userFlow: [
          "User sees welcoming Solana branding",
          "User enters email credentials", 
          "User enters secure password",
          "User clicks login to authenticate",
          "User can access create account option"
        ],
        criticalFeatures: [
          "Email validation input",
          "Secure password entry",
          "One-click authentication",
          "Account creation pathway",
          "Visual feedback on interaction"
        ],
        designPhilosophy: "Clean, secure, user-friendly crypto wallet entrance"
      },
      generationContext: {
        promptEnhancement: `Character interacting with a functional Solana wallet login screen featuring a centered ${style.accentColor} Solana logo, clean ${style.backgroundColor} background, two transparent input fields for email and secure password entry, and a prominent ${style.buttonColor} login button. The interface uses ${style.fontFamily} typography with ${style.textColor} text, creating a professional crypto authentication experience.`,
        characterInteractionGuidelines: [
          "Character should embrace/protect the login interface",
          "Maintain clear visibility of Solana logo and branding",
          "Ensure input fields remain completely accessible",
          "Preserve the security-focused design aesthetic",
          "Character positioning should enhance, not obscure, the login flow"
        ],
        preservationRules: [
          "Login button must remain fully visible and clickable",
          "Input fields cannot be covered or blocked",
          "Solana logo must stay centered and prominent",
          "Text readability is critical for user trust",
          "Color scheme integrity must be maintained"
        ],
        styleAdaptation: `Adapt character style to complement the ${style.backgroundColor} background and ${style.accentColor} accent colors, ensuring the character enhances the professional crypto wallet aesthetic`
      }
    };
  } else {
    return {
      uiStructure: {
        dimensions: {
          width: 320,
          height: 569,
          aspectRatio: "9:16"
        },
        layout: {
          type: 'wallet',
          primaryElements: [
            "Header with Solana logo and user avatar",
            "Total balance display (12.45 SOL)",
            "USD conversion ($236.55)",
            "Three action buttons (Send/Receive/Swap)",
            "Recent transactions list",
            "Transaction details with amounts"
          ],
          interactiveElements: [
            "Send button (arrow up icon)",
            "Receive button (arrow down icon)",
            "Swap button (arrow horizontal icon)",
            "User profile avatar",
            "Transaction items (clickable)",
            "See all link"
          ],
          visualHierarchy: [
            "1. Header navigation (user orientation)",
            "2. Balance display (primary information)",
            "3. Action buttons (main functions)",
            "4. Transaction history (secondary information)"
          ]
        },
        colorPalette: {
          primary: style.backgroundColor,
          secondary: style.accentColor,
          accent: style.accentColor,
          text: style.textColor,
          background: style.backgroundColor,
          gradients: style.backgroundImage ? [style.backgroundImage] : []
        },
        typography: {
          fontFamily: style.fontFamily,
          primaryTextColor: style.textColor,
          secondaryTextColor: `${style.textColor}70`,
          textSizes: ["text-3xl (balance)", "text-sm (labels)", "text-xs (details)"]
        },
        interactivity: {
          buttons: [
            {
              type: "action",
              position: "center-section",
              color: style.buttonColor,
              textColor: style.buttonTextColor,
              functionality: "send crypto"
            },
            {
              type: "action", 
              position: "center-section",
              color: style.buttonColor,
              textColor: style.buttonTextColor,
              functionality: "receive crypto"
            },
            {
              type: "action",
              position: "center-section", 
              color: style.buttonColor,
              textColor: style.buttonTextColor,
              functionality: "swap tokens"
            }
          ],
          inputs: [],
          animations: ["button press effects", "balance updates", "transaction animations", "smooth scrolling"]
        },
        safeZone: {
          x: 352,
          y: 228,
          width: 320, 
          height: 569,
          criticalElements: [
            "Balance display (must be clearly visible)",
            "Action buttons (must remain functional)",
            "Transaction list (must be readable)",
            "Navigation elements (must be accessible)"
          ]
        }
      },
      functionalContext: {
        purpose: "Active crypto wallet interface for managing Solana assets",
        userFlow: [
          "User views current balance and portfolio",
          "User accesses send/receive/swap functions",
          "User reviews recent transaction history",
          "User navigates to detailed views",
          "User manages crypto operations"
        ],
        criticalFeatures: [
          "Real-time balance display",
          "Quick action buttons for core functions",
          "Transaction history with details",
          "User profile and settings access",
          "Currency conversion display"
        ],
        designPhilosophy: "Functional, informative, action-oriented crypto management"
      },
      generationContext: {
        promptEnhancement: `Character interacting with an active Solana wallet interface showing "12.45 SOL" balance, three circular action buttons for Send/Receive/Swap in ${style.buttonColor}, transaction history list, and ${style.accentColor} Solana branding. The interface has a ${style.backgroundColor} background with ${style.textColor} text using ${style.fontFamily} font, representing a functional crypto wallet dashboard.`,
        characterInteractionGuidelines: [
          "Character should interact with the functional wallet interface",
          "Preserve visibility of balance and transaction information",
          "Maintain accessibility of action buttons",
          "Enhance the active crypto management experience",
          "Character should complement the financial interface design"
        ],
        preservationRules: [
          "Balance display must remain prominent and readable",
          "Action buttons (Send/Receive/Swap) must stay functional",
          "Transaction list must be accessible and readable",
          "Navigation elements cannot be obstructed",
          "Financial information integrity is critical"
        ],
        styleAdaptation: `Character style should reflect the active, functional nature of crypto management, complementing the ${style.backgroundColor} and ${style.accentColor} color scheme while maintaining the professional financial interface aesthetic`
      }
    };
  }
}
