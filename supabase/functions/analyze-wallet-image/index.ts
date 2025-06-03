
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DetailedAnalysis {
  style: string;
  mood: string;
  colors: {
    dominant: string[];
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    primary: string;
    secondary: string;
    weight: string;
    size: string;
  };
  lighting: string;
  contrast: string;
  textures: string[];
  patterns: string[];
  composition: {
    balance: string;
    focusArea: string;
    complexity: string;
  };
  designElements: {
    hasGradients: boolean;
    hasPatterns: boolean;
    hasTextures: boolean;
    hasGeometry: boolean;
    hasShadows: boolean;
  };
  aiPetCharacteristics: {
    recommendedEmotion: string;
    recommendedZone: 'inside' | 'outside';
    recommendedBodyType: 'phantom' | 'lottie';
    animationStyle: string;
  };
}

interface WalletComponentStyles {
  // Global Backgrounds
  globalBackground: ComponentStyle;
  loginLayerBackground: ComponentStyle;
  homeLayerBackground: ComponentStyle;
  swapLayerBackground: ComponentStyle;
  appsLayerBackground: ComponentStyle;
  historyLayerBackground: ComponentStyle;
  searchLayerBackground: ComponentStyle;
  
  // Header Components
  headerContainer: ComponentStyle;
  walletTitle: ComponentStyle;
  helpIcon: ComponentStyle;
  
  // Login Layer
  loginContainer: ComponentStyle;
  passwordTitle: ComponentStyle;
  passwordInput: ComponentStyle;
  eyeToggle: ComponentStyle;
  forgotPasswordLink: ComponentStyle;
  unlockButton: ComponentStyle;
  
  // Home Layer  
  homeContainer: ComponentStyle;
  balanceSection: ComponentStyle;
  totalBalanceLabel: ComponentStyle;
  balanceAmount: ComponentStyle;
  balanceUSD: ComponentStyle;
  
  // Assets Components
  assetContainer: ComponentStyle;
  assetTitle: ComponentStyle;
  assetItem: ComponentStyle;
  assetIcon: ComponentStyle;
  assetBalance: ComponentStyle;
  assetValue: ComponentStyle;
  
  // Action Buttons
  actionButtonsContainer: ComponentStyle;
  sendButton: ComponentStyle;
  receiveButton: ComponentStyle;
  swapButton: ComponentStyle;
  buyButton: ComponentStyle;
  
  // Swap Components
  swapContainer: ComponentStyle;
  swapTitle: ComponentStyle;
  swapFromToken: ComponentStyle;
  swapToToken: ComponentStyle;
  swapExchangeButton: ComponentStyle;
  swapAmountInput: ComponentStyle;
  
  // Apps Components
  appsContainer: ComponentStyle;
  appsTitle: ComponentStyle;
  collectibleGrid: ComponentStyle;
  collectibleItem: ComponentStyle;
  
  // Transaction History
  transactionContainer: ComponentStyle;
  transactionTitle: ComponentStyle;
  transactionItem: ComponentStyle;
  transactionIcon: ComponentStyle;
  transactionText: ComponentStyle;
  transactionAmount: ComponentStyle;
  
  // Navigation
  bottomNavigation: ComponentStyle;
  navButton: ComponentStyle;
  navIcon: ComponentStyle;
  navLabel: ComponentStyle;
  
  // Overlays and Modals
  accountSidebar: ComponentStyle;
  receiveModal: ComponentStyle;
  sendModal: ComponentStyle;
  
  // Input Components
  searchInput: ComponentStyle;
  amountInput: ComponentStyle;
  addressInput: ComponentStyle;
  
  // AI Pet
  aiPet: {
    zone: 'inside' | 'outside';
    bodyType: 'phantom' | 'lottie';
    emotion: string;
    color: string;
    size: number;
    animationSpeed: string;
  };
  
  // Global Styles
  globalContainer: ComponentStyle;
  backgroundOverlay: ComponentStyle;
}

interface ComponentStyle {
  backgroundColor?: string;
  gradient?: string;
  textColor?: string;
  borderRadius?: string;
  boxShadow?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  border?: string;
  backdropFilter?: string;
  transition?: string;
  opacity?: string;
  padding?: string;
  margin?: string;
  animation?: string;
  backgroundImage?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      throw new Error("Image URL is required");
    }

    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }

    console.log("Starting comprehensive wallet image analysis...");

    // Enhanced analysis prompt for complete wallet styling
    const analysisPrompt = `
    Analyze this image comprehensively for complete wallet UI styling. Extract every detail for creating a unified design system:

    COMPREHENSIVE VISUAL ANALYSIS:
    1. Color Palette: Extract primary, secondary, accent, background, and text colors with exact hex codes
    2. Typography: Font families that match this aesthetic, weights, and size hierarchy
    3. Lighting & Atmosphere: Overall brightness, warmth, energy level
    4. Textures & Materials: Surface qualities, patterns, geometric elements
    5. Composition: Visual balance, focal points, depth, layering
    6. Design Language: Modern/retro/futuristic, minimalist/ornate, organic/geometric
    7. Background Elements: How backgrounds should look for different sections

    WALLET-SPECIFIC STYLING:
    1. Layer Backgrounds: Different background treatments for Login, Home, Swap, Apps, History
    2. Component Hierarchy: How different UI elements should be styled relative to each other
    3. Interactive Elements: Button styles, input fields, navigation elements
    4. Content Areas: Asset lists, transaction items, collectibles display

    AI PET INTEGRATION:
    1. Pet emotion that matches the style
    2. Inside or outside wallet placement
    3. Phantom or Lottie body type recommendation
    4. Animation style (smooth/bouncy/energetic/calm)

    Return ONLY valid JSON with this exact structure:
    {
      "style": "concise style name",
      "mood": "overall mood description", 
      "colors": {
        "dominant": ["#hex1", "#hex2", "#hex3"],
        "primary": "#hex",
        "secondary": "#hex",
        "accent": "#hex", 
        "background": "#hex",
        "text": "#hex"
      },
      "typography": {
        "primary": "font family name",
        "secondary": "secondary font",
        "weight": "normal/medium/bold",
        "size": "small/medium/large"
      },
      "lighting": "bright/medium/dark",
      "contrast": "low/medium/high", 
      "textures": ["texture1", "texture2"],
      "patterns": ["pattern1", "pattern2"],
      "composition": {
        "balance": "centered/asymmetric/dynamic",
        "focusArea": "center/top/bottom/left/right", 
        "complexity": "minimal/moderate/complex"
      },
      "designElements": {
        "hasGradients": true/false,
        "hasPatterns": true/false,
        "hasTextures": true/false,
        "hasGeometry": true/false,
        "hasShadows": true/false
      },
      "aiPetCharacteristics": {
        "recommendedEmotion": "idle/happy/excited/sleepy/suspicious/sad/wink",
        "recommendedZone": "inside/outside",
        "recommendedBodyType": "phantom/lottie", 
        "animationStyle": "smooth/bouncy/energetic/calm"
      }
    }
    `;

    // Call GPT-4o with vision for comprehensive analysis
    const analysisResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 2000
      }),
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      throw new Error(`Analysis API error: ${JSON.stringify(errorData)}`);
    }

    const analysisData = await analysisResponse.json();
    let analysisContent = analysisData.choices[0].message.content;
    
    // Clean and parse analysis
    analysisContent = analysisContent.replace(/```json|```/g, "").trim();
    const analysis: DetailedAnalysis = JSON.parse(analysisContent);

    console.log("Comprehensive analysis completed:", analysis);

    // Generate complete wallet component styles
    const walletStyles = generateComprehensiveWalletStyles(analysis);

    // Create Supabase client and save analysis
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to style_library
    const { data: savedStyle, error: saveError } = await supabase
      .from("style_library")
      .insert({
        style_name: `${analysis.style} - ${analysis.mood}`,
        style_data: walletStyles,
        ai_analysis: analysis,
        inspiration_image_url: imageUrl,
        created_by: "wallet-comprehensive-system"
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving style:", saveError);
    } else {
      console.log("Comprehensive style saved successfully:", savedStyle?.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        walletStyles,
        savedStyleId: savedStyle?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in comprehensive wallet analysis:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateComprehensiveWalletStyles(analysis: DetailedAnalysis): WalletComponentStyles {
  const { colors, typography, designElements, composition, lighting, aiPetCharacteristics } = analysis;
  
  // Helper functions for comprehensive styling
  const getBorderRadius = (size: 'small' | 'medium' | 'large') => {
    const radii = { small: '8px', medium: '12px', large: '20px' };
    return radii[size];
  };
  
  const getShadow = (intensity: 'subtle' | 'medium' | 'strong') => {
    const shadows = {
      subtle: `0 2px 8px ${colors.primary}15`,
      medium: `0 4px 16px ${colors.primary}25`,
      strong: `0 8px 32px ${colors.primary}35`
    };
    return shadows[intensity];
  };
  
  const getGradient = (from: string, to: string, direction = '135deg') => {
    return `linear-gradient(${direction}, ${from}, ${to})`;
  };

  const getBackgroundTreatment = (layer: string) => {
    const baseColor = colors.background;
    const accent = colors.accent;
    
    switch (layer) {
      case 'login':
        return designElements.hasGradients 
          ? getGradient(baseColor, `${accent}20`)
          : `${baseColor}F0`;
      case 'home':
        return designElements.hasGradients
          ? getGradient(`${baseColor}E0`, `${colors.primary}10`)
          : `${baseColor}E8`;
      case 'swap':
        return designElements.hasGradients
          ? getGradient(`${colors.secondary}15`, `${accent}15`)
          : `${baseColor}E5`;
      case 'apps':
        return designElements.hasGradients
          ? getGradient(`${accent}10`, `${colors.primary}10`)
          : `${baseColor}EA`;
      default:
        return `${baseColor}E0`;
    }
  };

  return {
    // Global Backgrounds - Enhanced for each layer
    globalBackground: {
      backgroundColor: colors.background,
      backgroundImage: designElements.hasGradients 
        ? getGradient(colors.background, `${colors.primary}15`)
        : undefined,
      fontFamily: typography.primary,
      textColor: colors.text,
    },
    loginLayerBackground: {
      backgroundColor: getBackgroundTreatment('login'),
      backdropFilter: 'blur(16px)',
      borderRadius: getBorderRadius('large'),
    },
    homeLayerBackground: {
      backgroundColor: getBackgroundTreatment('home'),
      backdropFilter: 'blur(12px)',
    },
    swapLayerBackground: {
      backgroundColor: getBackgroundTreatment('swap'),
      backdropFilter: 'blur(14px),
    },
    appsLayerBackground: {
      backgroundColor: getBackgroundTreatment('apps'),
      backdropFilter: 'blur(10px)',
    },
    historyLayerBackground: {
      backgroundColor: getBackgroundTreatment('history'),
      backdropFilter: 'blur(12px)',
    },
    searchLayerBackground: {
      backgroundColor: getBackgroundTreatment('search'),
      backdropFilter: 'blur(16px)',
    },
    
    // Header Components
    headerContainer: {
      backgroundColor: `${colors.background}E6`,
      backdropFilter: 'blur(12px)',
      borderRadius: getBorderRadius('medium'),
      boxShadow: getShadow('subtle'),
      padding: '16px',
    },
    walletTitle: {
      fontFamily: typography.primary,
      fontSize: typography.size === 'large' ? '18px' : '16px',
      fontWeight: typography.weight === 'bold' ? '700' : '600',
      textColor: colors.text,
    },
    helpIcon: {
      textColor: `${colors.text}80`,
      transition: 'all 0.2s ease',
    },
    
    // Login Layer
    loginContainer: {
      backgroundColor: getBackgroundTreatment('login'),
      borderRadius: getBorderRadius('large'),
      padding: '24px',
      boxShadow: getShadow('medium'),
    },
    passwordTitle: {
      fontFamily: typography.primary,
      fontSize: '20px',
      fontWeight: '600',
      textColor: colors.text,
    },
    passwordInput: {
      backgroundColor: `${colors.background}CC`,
      border: `1px solid ${colors.secondary}40`,
      borderRadius: getBorderRadius('medium'),
      textColor: colors.text,
      fontFamily: typography.primary,
      padding: '12px 16px',
      backdropFilter: 'blur(8px)',
    },
    eyeToggle: {
      textColor: `${colors.text}60`,
      transition: 'color 0.2s ease',
    },
    forgotPasswordLink: {
      textColor: `${colors.text}60`,
      fontFamily: typography.primary,
      fontSize: '14px',
    },
    unlockButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.primary, colors.accent)
        : colors.primary,
      textColor: colors.background,
      borderRadius: getBorderRadius('medium'),
      fontFamily: typography.primary,
      fontWeight: typography.weight === 'bold' ? '700' : '600',
      boxShadow: getShadow('medium'),
      padding: '16px',
      transition: 'all 0.3s ease',
    },
    
    // Home Layer
    homeContainer: {
      backgroundColor: 'transparent',
      padding: '20px',
    },
    balanceSection: {
      backgroundColor: `${colors.background}40`,
      borderRadius: getBorderRadius('large'),
      padding: '20px',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${colors.secondary}30`,
      boxShadow: getShadow('subtle'),
    },
    totalBalanceLabel: {
      fontFamily: typography.secondary || typography.primary,
      fontSize: '14px',
      textColor: `${colors.text}80`,
    },
    balanceAmount: {
      fontFamily: typography.primary,
      fontSize: '32px',
      fontWeight: '700',
      textColor: colors.text,
    },
    balanceUSD: {
      fontFamily: typography.secondary || typography.primary,
      fontSize: '16px',
      textColor: colors.accent,
    },

    // Assets Components - New comprehensive styling
    assetContainer: {
      backgroundColor: `${colors.background}30`,
      borderRadius: getBorderRadius('medium'),
      backdropFilter: 'blur(8px)',
      padding: '16px',
      border: `1px solid ${colors.secondary}20`,
    },
    assetTitle: {
      fontFamily: typography.primary,
      fontSize: '18px',
      fontWeight: '600',
      textColor: colors.text,
      marginBottom: '12px',
    },
    assetItem: {
      backgroundColor: `${colors.background}40`,
      borderRadius: getBorderRadius('small'),
      border: `1px solid ${colors.secondary}20`,
      padding: '12px',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(4px)',
    },
    assetIcon: {
      borderRadius: '50%',
      backgroundColor: `${colors.accent}20`,
      padding: '8px',
    },
    assetBalance: {
      fontFamily: typography.primary,
      fontSize: '16px',
      fontWeight: '600',
      textColor: colors.text,
    },
    assetValue: {
      fontFamily: typography.primary,
      fontSize: '14px',
      textColor: `${colors.text}70`,
    },
    
    // Action Buttons
    actionButtonsContainer: {
      backgroundColor: 'transparent',
      padding: '16px',
    },
    sendButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.secondary, colors.accent)
        : colors.secondary,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
      fontWeight: '600',
    },
    receiveButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.accent, colors.secondary)
        : colors.accent,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
      fontWeight: '600',
    },
    swapButton: {
      backgroundColor: `${colors.primary}80`,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('subtle'),
      padding: '16px',
      textColor: colors.text,
    },
    buyButton: {
      backgroundColor: `${colors.accent}60`,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('subtle'),
      padding: '16px',
      textColor: colors.text,
    },

    // Swap Components - Comprehensive styling
    swapContainer: {
      backgroundColor: `${colors.background}50`,
      borderRadius: getBorderRadius('large'),
      padding: '20px',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${colors.secondary}30`,
      boxShadow: getShadow('medium'),
    },
    swapTitle: {
      fontFamily: typography.primary,
      fontSize: '20px',
      fontWeight: '600',
      textColor: colors.text,
      marginBottom: '16px',
    },
    swapFromToken: {
      backgroundColor: `${colors.background}60`,
      borderRadius: getBorderRadius('medium'),
      padding: '16px',
      border: `1px solid ${colors.secondary}40`,
      marginBottom: '8px',
    },
    swapToToken: {
      backgroundColor: `${colors.background}60`,
      borderRadius: getBorderRadius('medium'),
      padding: '16px',
      border: `1px solid ${colors.secondary}40`,
      marginTop: '8px',
    },
    swapExchangeButton: {
      backgroundColor: colors.accent,
      borderRadius: '50%',
      padding: '12px',
      boxShadow: getShadow('medium'),
      textColor: colors.background,
    },
    swapAmountInput: {
      backgroundColor: `${colors.background}40`,
      border: `1px solid ${colors.secondary}50`,
      borderRadius: getBorderRadius('medium'),
      textColor: colors.text,
      fontFamily: typography.primary,
      fontSize: '18px',
      padding: '16px',
    },

    // Apps Components
    appsContainer: {
      backgroundColor: `${colors.background}20`,
      borderRadius: getBorderRadius('medium'),
      padding: '16px',
    },
    appsTitle: {
      fontFamily: typography.primary,
      fontSize: '18px',
      fontWeight: '600',
      textColor: colors.text,
    },
    collectibleGrid: {
      backgroundColor: 'transparent',
      padding: '8px',
    },
    collectibleItem: {
      backgroundColor: `${colors.background}40`,
      borderRadius: getBorderRadius('medium'),
      padding: '12px',
      border: `1px solid ${colors.secondary}20`,
      transition: 'all 0.2s ease',
      boxShadow: getShadow('subtle'),
    },
    
    // Transaction History
    transactionContainer: {
      backgroundColor: `${colors.background}60`,
      borderRadius: getBorderRadius('medium'),
      backdropFilter: 'blur(8px)',
      padding: '16px',
    },
    transactionTitle: {
      fontFamily: typography.primary,
      fontSize: '18px',
      fontWeight: '600',
      textColor: colors.text,
    },
    transactionItem: {
      backgroundColor: `${colors.background}40`,
      borderRadius: getBorderRadius('small'),
      border: `1px solid ${colors.secondary}20`,
      padding: '12px',
      transition: 'all 0.2s ease',
    },
    transactionIcon: {
      textColor: colors.accent,
    },
    transactionText: {
      fontFamily: typography.primary,
      fontSize: '14px',
      textColor: colors.text,
    },
    transactionAmount: {
      fontFamily: typography.primary,
      fontSize: '14px',
      fontWeight: '600',
      textColor: colors.accent,
    },
    
    // Navigation
    bottomNavigation: {
      backgroundColor: `${colors.background}E6`,
      backdropFilter: 'blur(16px)',
      borderRadius: `${getBorderRadius('large')} ${getBorderRadius('large')} 0 0`,
      boxShadow: getShadow('strong'),
      padding: '12px',
    },
    navButton: {
      backgroundColor: 'transparent',
      borderRadius: getBorderRadius('medium'),
      padding: '8px 12px',
      transition: 'all 0.2s ease',
    },
    navIcon: {
      textColor: `${colors.text}80`,
    },
    navLabel: {
      fontFamily: typography.primary,
      fontSize: '12px',
      textColor: `${colors.text}80`,
    },
    
    // Overlays and Modals
    accountSidebar: {
      backgroundColor: `${colors.background}F0`,
      backdropFilter: 'blur(20px)',
      boxShadow: getShadow('strong'),
      borderRadius: getBorderRadius('large'),
    },
    receiveModal: {
      backgroundColor: `${colors.background}F5`,
      backdropFilter: 'blur(24px)',
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('strong'),
      border: `1px solid ${colors.secondary}40`,
    },
    sendModal: {
      backgroundColor: `${colors.background}F5`,
      backdropFilter: 'blur(24px)',
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('strong'),
      border: `1px solid ${colors.secondary}40`,
    },
    
    // Input Components
    searchInput: {
      backgroundColor: `${colors.background}80`,
      border: `2px solid ${colors.primary}30`,
      borderRadius: getBorderRadius('large'),
      textColor: colors.text,
      fontFamily: typography.primary,
      backdropFilter: 'blur(8px)',
      padding: '12px 16px',
    },
    amountInput: {
      backgroundColor: `${colors.background}60`,
      border: `1px solid ${colors.secondary}40`,
      borderRadius: getBorderRadius('medium'),
      textColor: colors.text,
      fontFamily: typography.primary,
      fontSize: '18px',
      padding: '16px',
    },
    addressInput: {
      backgroundColor: `${colors.background}80`,
      border: `1px solid ${colors.secondary}40`,
      borderRadius: getBorderRadius('medium'),
      textColor: colors.text,
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '12px',
    },
    
    // AI Pet
    aiPet: {
      zone: aiPetCharacteristics.recommendedZone,
      bodyType: aiPetCharacteristics.recommendedBodyType,
      emotion: aiPetCharacteristics.recommendedEmotion,
      color: colors.accent,
      size: 64,
      animationSpeed: aiPetCharacteristics.animationStyle,
    },
    
    // Global Styles
    globalContainer: {
      backgroundColor: colors.background,
      backgroundImage: designElements.hasGradients 
        ? getGradient(`${colors.background}F0`, `${colors.primary}10`)
        : undefined,
      fontFamily: typography.primary,
      textColor: colors.text,
    },
    backgroundOverlay: {
      backgroundColor: `${colors.primary}05`,
      backdropFilter: 'blur(2px)',
    },
  };
}
