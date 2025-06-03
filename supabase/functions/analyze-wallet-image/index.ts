
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

interface WalletComponentStyles {
  // Global and Layer Backgrounds
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
  
  // Assets Section
  assetsContainer: ComponentStyle;
  assetItem: ComponentStyle;
  assetIcon: ComponentStyle;
  assetName: ComponentStyle;
  assetBalance: ComponentStyle;
  assetValue: ComponentStyle;
  
  // Action Buttons
  actionButtonsContainer: ComponentStyle;
  sendButton: ComponentStyle;
  receiveButton: ComponentStyle;
  swapButton: ComponentStyle;
  buyButton: ComponentStyle;
  
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
  
  // Swap Components
  swapContainer: ComponentStyle;
  swapCard: ComponentStyle;
  swapFromToken: ComponentStyle;
  swapToToken: ComponentStyle;
  swapArrow: ComponentStyle;
  swapButton: ComponentStyle;
  
  // Apps Components
  appsGrid: ComponentStyle;
  appCard: ComponentStyle;
  appIcon: ComponentStyle;
  appName: ComponentStyle;
  
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

    console.log("Starting detailed wallet image analysis...");

    const analysisPrompt = `
    Analyze this image in extreme detail for wallet UI styling. I need a comprehensive analysis covering:

    VISUAL ANALYSIS:
    1. Color Palette: Extract all dominant colors, their hex codes, and relationships
    2. Typography: What fonts would match this aesthetic? Weight, size recommendations
    3. Lighting & Mood: Bright/dark, warm/cool, energetic/calm
    4. Textures & Patterns: Any visible textures, patterns, geometric elements
    5. Composition: Balance, focal points, visual hierarchy
    6. Design Elements: Gradients, shadows, borders, transparency effects

    STYLE CHARACTERISTICS:
    1. Overall aesthetic style (modern, retro, futuristic, organic, etc.)
    2. Mood and emotional tone
    3. Level of complexity (minimal, moderate, complex)
    4. Visual weight and contrast levels

    AI PET RECOMMENDATIONS:
    1. What emotion would fit this style? (idle, happy, excited, sleepy, suspicious, sad, wink)
    2. Should the pet be inside or outside the wallet?
    3. Which body type fits better? (phantom ghost-like, lottie fluid)
    4. Animation style recommendations

    Return ONLY valid JSON with this exact structure:
    {
      "style": "concise style name",
      "mood": "overall mood description",
      "colors": {
        "dominant": ["color1", "color2", "color3"],
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
        "recommendedEmotion": "emotion name",
        "recommendedZone": "inside/outside",
        "recommendedBodyType": "phantom/lottie",
        "animationStyle": "smooth/bouncy/energetic/calm"
      }
    }
    `;

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
        max_tokens: 1500
      }),
    });

    if (!analysisResponse.ok) {
      const errorData = await analysisResponse.json();
      throw new Error(`Analysis API error: ${JSON.stringify(errorData)}`);
    }

    const analysisData = await analysisResponse.json();
    let analysisContent = analysisData.choices[0].message.content;
    
    analysisContent = analysisContent.replace(/```json|```/g, "").trim();
    const analysis: DetailedAnalysis = JSON.parse(analysisContent);

    console.log("Analysis completed:", analysis);

    const walletStyles = generateComprehensiveWalletStyles(analysis);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: savedStyle, error: saveError } = await supabase
      .from("style_library")
      .insert({
        style_name: `${analysis.style} - ${analysis.mood}`,
        style_data: walletStyles,
        ai_analysis: analysis,
        inspiration_image_url: imageUrl,
        created_by: "wallet-alive-system"
      } as any)
      .select()
      .single();

    if (saveError) {
      console.error("Error saving style:", saveError);
    } else {
      console.log("Style saved successfully:", savedStyle?.id);
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
    console.error("Error in analyze-wallet-image function:", error);
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
  const { colors, typography, designElements, composition, aiPetCharacteristics } = analysis;
  
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
  
  const getGradient = (from: string, to: string) => {
    return `linear-gradient(135deg, ${from}, ${to})`;
  };

  const getLayerBackground = (opacity: string) => {
    return designElements.hasGradients 
      ? getGradient(`${colors.background}${opacity}`, `${colors.primary}10`)
      : `${colors.background}${opacity}`;
  };

  return {
    // Global and Layer Backgrounds
    globalBackground: {
      backgroundColor: colors.background,
      backgroundImage: designElements.hasGradients 
        ? getGradient(`${colors.background}F0`, `${colors.primary}05`)
        : undefined,
      fontFamily: typography.primary,
      textColor: colors.text,
    },
    loginLayerBackground: {
      backgroundColor: getLayerBackground('E6'),
      backdropFilter: 'blur(12px)',
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
    },
    homeLayerBackground: {
      backgroundColor: getLayerBackground('F0'),
      backgroundImage: designElements.hasPatterns 
        ? `radial-gradient(circle at 20% 50%, ${colors.primary}10 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${colors.accent}08 0%, transparent 50%)`
        : undefined,
    },
    swapLayerBackground: {
      backgroundColor: getLayerBackground('E8'),
      backgroundImage: designElements.hasGradients 
        ? getGradient(`${colors.secondary}15`, `${colors.accent}10`)
        : undefined,
    },
    appsLayerBackground: {
      backgroundColor: getLayerBackground('EA'),
      backgroundImage: designElements.hasGeometry 
        ? `repeating-linear-gradient(45deg, transparent, transparent 10px, ${colors.primary}05 10px, ${colors.primary}05 20px)`
        : undefined,
    },
    historyLayerBackground: {
      backgroundColor: getLayerBackground('EC'),
      backdropFilter: 'blur(8px)',
    },
    searchLayerBackground: {
      backgroundColor: getLayerBackground('EE'),
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
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.background, `${colors.primary}20`)
        : colors.background,
      borderRadius: getBorderRadius('large'),
      padding: '24px',
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
      boxShadow: getShadow('medium'),
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

    // Assets Section
    assetsContainer: {
      backgroundColor: `${colors.background}30`,
      borderRadius: getBorderRadius('large'),
      padding: '16px',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${colors.secondary}25`,
    },
    assetItem: {
      backgroundColor: `${colors.background}20`,
      borderRadius: getBorderRadius('medium'),
      padding: '12px',
      border: `1px solid ${colors.secondary}20`,
      transition: 'all 0.2s ease',
      boxShadow: getShadow('subtle'),
    },
    assetIcon: {
      backgroundColor: `${colors.primary}20`,
      borderRadius: getBorderRadius('small'),
      textColor: colors.primary,
    },
    assetName: {
      fontFamily: typography.primary,
      fontSize: '14px',
      fontWeight: '600',
      textColor: colors.text,
    },
    assetBalance: {
      fontFamily: typography.primary,
      fontSize: '14px',
      textColor: colors.text,
    },
    assetValue: {
      fontFamily: typography.primary,
      fontSize: '12px',
      textColor: colors.accent,
    },
    
    // Action Buttons
    actionButtonsContainer: {
      backgroundColor: 'transparent',
      padding: '16px',
    },
    sendButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.primary, colors.secondary)
        : colors.primary,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
    },
    receiveButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.secondary, colors.accent)
        : colors.secondary,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
    },
    swapButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.accent, colors.primary)
        : colors.accent,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
    },
    buyButton: {
      backgroundColor: `${colors.accent}80`,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('subtle'),
      padding: '16px',
      textColor: colors.text,
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

    // Swap Components
    swapContainer: {
      backgroundColor: `${colors.background}40`,
      borderRadius: getBorderRadius('large'),
      padding: '20px',
      backdropFilter: 'blur(16px)',
      border: `1px solid ${colors.secondary}30`,
      boxShadow: getShadow('medium'),
    },
    swapCard: {
      backgroundColor: `${colors.background}60`,
      borderRadius: getBorderRadius('medium'),
      padding: '16px',
      border: `1px solid ${colors.secondary}25`,
      boxShadow: getShadow('subtle'),
    },
    swapFromToken: {
      backgroundColor: `${colors.primary}20`,
      borderRadius: getBorderRadius('medium'),
      padding: '12px',
      border: `1px solid ${colors.primary}40`,
    },
    swapToToken: {
      backgroundColor: `${colors.accent}20`,
      borderRadius: getBorderRadius('medium'),
      padding: '12px',
      border: `1px solid ${colors.accent}40`,
    },
    swapArrow: {
      backgroundColor: `${colors.secondary}30`,
      borderRadius: '50%',
      textColor: colors.secondary,
    },
    swapButton: {
      backgroundColor: designElements.hasGradients 
        ? getGradient(colors.accent, colors.primary)
        : colors.accent,
      borderRadius: getBorderRadius('large'),
      boxShadow: getShadow('medium'),
      padding: '16px',
      textColor: colors.background,
      fontWeight: '700',
    },

    // Apps Components
    appsGrid: {
      backgroundColor: 'transparent',
      padding: '16px',
    },
    appCard: {
      backgroundColor: `${colors.background}50`,
      borderRadius: getBorderRadius('large'),
      padding: '16px',
      border: `1px solid ${colors.secondary}30`,
      boxShadow: getShadow('subtle'),
      transition: 'all 0.2s ease',
    },
    appIcon: {
      backgroundColor: `${colors.primary}20`,
      borderRadius: getBorderRadius('medium'),
      textColor: colors.primary,
    },
    appName: {
      fontFamily: typography.primary,
      fontSize: '14px',
      fontWeight: '600',
      textColor: colors.text,
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
