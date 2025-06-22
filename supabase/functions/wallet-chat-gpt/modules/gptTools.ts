// GPT Tools System for enhanced AI capabilities

export const GPT_TOOLS = [
  {
    type: "function",
    function: {
      name: "analyze_wallet_structure",
      description: "Get the complete structure and customizable elements of the current wallet",
      parameters: {
        type: "object",
        properties: {
          walletType: {
            type: "string",
            description: "Type of wallet (phantom, metamask, etc)"
          },
          includeRegistry: {
            type: "boolean",
            description: "Include element registry data"
          }
        },
        required: ["walletType"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_background",
      description: "Generate a background image using DALL-E or Replicate AI services",
      parameters: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "Detailed prompt for image generation"
          },
          service: {
            type: "string",
            enum: ["dalle", "replicate"],
            description: "AI service to use"
          },
          layer: {
            type: "string",
            enum: ["unlock", "balance", "both"],
            description: "Which wallet layer to generate for"
          },
          style: {
            type: "object",
            properties: {
              wowEffect: {
                type: "string",
                enum: ["neon", "holographic", "particle", "gradient", "geometric", "nature", "tech", "abstract"]
              },
              mood: {
                type: "string",
                enum: ["vibrant", "minimal", "dark", "light", "cosmic", "professional"]
              }
            }
          }
        },
        required: ["prompt", "service"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_fonts_library",
      description: "Load Google Fonts library with filtering options",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["sans-serif", "serif", "display", "handwriting", "monospace"],
            description: "Font category filter"
          },
          sort: {
            type: "string",
            enum: ["popularity", "trending", "date", "alphabetical"],
            description: "Sort order"
          },
          limit: {
            type: "number",
            description: "Maximum number of fonts to return"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "apply_style_changes",
      description: "Apply style changes to wallet elements with validation",
      parameters: {
        type: "object",
        properties: {
          changes: {
            type: "object",
            description: "Style changes object with CSS properties"
          },
          target: {
            type: "string",
            description: "Target element selector or element ID"
          },
          layer: {
            type: "string",
            enum: ["unlock", "balance", "global"],
            description: "Which layer to apply changes to"
          },
          validate: {
            type: "boolean",
            description: "Whether to validate changes before applying"
          }
        },
        required: ["changes", "target"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_icons",
      description: "Search for icons from various icon libraries",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Icon search query"
          },
          libraries: {
            type: "array",
            items: {
              type: "string",
              enum: ["phosphor", "heroicons", "lucide"]
            },
            description: "Icon libraries to search"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_image_colors",
      description: "Extract color palette from an image URL",
      parameters: {
        type: "object",
        properties: {
          imageUrl: {
            type: "string",
            description: "URL of the image to analyze"
          }
        },
        required: ["imageUrl"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_wow_effects",
      description: "Get available wow effects for the current wallet",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["visual", "interactive", "animation", "advanced"],
            description: "Effect category"
          },
          performance: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Performance impact filter"
          }
        }
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "preview_changes",
      description: "Generate a preview URL for the current changes",
      parameters: {
        type: "object",
        properties: {
          includeEffects: {
            type: "boolean",
            description: "Include wow effects in preview"
          }
        }
      }
    }
  }
];

// Tool execution handlers
export async function executeTool(toolName, parameters, context) {
  console.log(`🔧 Executing tool: ${toolName}`, parameters);
  
  switch (toolName) {
    case 'analyze_wallet_structure':
      return await analyzeWalletStructure(parameters, context);
    
    case 'generate_background':
      return await generateBackground(parameters, context);
    
    case 'get_fonts_library':
      return await getFontsLibrary(parameters, context);
    
    case 'apply_style_changes':
      return await applyStyleChanges(parameters, context);
    
    case 'search_icons':
      return await searchIcons(parameters, context);
    
    case 'analyze_image_colors':
      return await analyzeImageColors(parameters, context);
    
    case 'get_wow_effects':
      return await getWowEffects(parameters, context);
    
    case 'preview_changes':
      return await previewChanges(parameters, context);
    
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Individual tool implementations
async function analyzeWalletStructure(params, context) {
  const { supabase } = context;
  
  const response = await supabase.functions.invoke('wallet-customization-structure', {
    method: 'GET',
    body: { walletType: params.walletType }
  });
  
  return {
    structure: response.data?.structure,
    customizableElements: response.data?.customizableElements,
    layers: response.data?.layers
  };
}

async function generateBackground(params, context) {
  const { generateImageWithDALLE, generateImageWithReplicate } = await import('./imageGenerator.ts');
  
  const generator = params.service === 'dalle' ? generateImageWithDALLE : generateImageWithReplicate;
  const result = await generator(params.prompt, context.supabase, {
    multiLayer: params.layer === 'both',
    wowEffect: params.style?.wowEffect,
    mood: params.style?.mood
  });
  
  return result;
}

async function getFontsLibrary(params, context) {
  const { fetchGoogleFonts } = await import('./apiIntegrations.ts');
  
  const fonts = await fetchGoogleFonts({
    category: params.category,
    sort: params.sort || 'popularity',
    limit: params.limit || 50
  });
  
  return fonts;
}

async function applyStyleChanges(params, context) {
  // Validate changes if requested
  if (params.validate) {
    const validation = await validateStyleChanges(params.changes, params.target, context);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }
  }
  
  // Apply changes
  return {
    success: true,
    applied: params.changes,
    target: params.target,
    layer: params.layer || 'global'
  };
}

async function searchIcons(params, context) {
  const { searchIcons: searchIconsAPI } = await import('./apiIntegrations.ts');
  
  return await searchIconsAPI(params.query, params.libraries || ['phosphor', 'heroicons', 'lucide']);
}

async function analyzeImageColors(params, context) {
  const { analyzeColors } = await import('./apiIntegrations.ts');
  
  return await analyzeColors(params.imageUrl);
}

async function getWowEffects(params, context) {
  const effects = context.walletContext.wowEffects.availableEffects;
  
  let filtered = effects;
  
  if (params.category) {
    filtered = filtered.filter(e => e.category === params.category);
  }
  
  if (params.performance) {
    filtered = filtered.filter(e => e.performance === params.performance);
  }
  
  return { effects: filtered };
}

async function previewChanges(params, context) {
  const previewId = `preview-${Date.now()}`;
  
  return {
    previewUrl: `https://wallet-preview.vercel.app/preview/${previewId}`,
    expiresIn: 3600 // 1 hour
  };
}

async function validateStyleChanges(changes, target, context) {
  // Basic validation
  const errors = [];
  
  // Check if target exists
  const validTargets = context.walletContext.availableElements;
  if (!validTargets.includes(target) && !target.startsWith('.') && !target.startsWith('#')) {
    errors.push(`Invalid target: ${target}`);
  }
  
  // Validate CSS properties
  const validProperties = [
    'backgroundColor', 'color', 'fontSize', 'fontFamily',
    'padding', 'margin', 'borderRadius', 'boxShadow',
    'transform', 'animation', 'filter', 'opacity'
  ];
  
  Object.keys(changes).forEach(prop => {
    if (!validProperties.includes(prop)) {
      errors.push(`Unknown CSS property: ${prop}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
