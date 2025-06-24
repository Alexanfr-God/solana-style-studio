// Enhanced Image generation with DALL-E and Replicate for multi-layer wallet support

// Configuration for wallet layers
const WALLET_LAYERS = {
  LAYER_1: {
    name: 'unlock-layer',
    description: 'Layer with unlock button',
    aspectRatio: '16:9',
    suggestedSize: { width: 1920, height: 1080 }
  },
  LAYER_2: {
    name: 'balance-layer', 
    description: 'Layer with balance display',
    aspectRatio: '16:9',
    suggestedSize: { width: 1920, height: 1080 }
  }
};

// Enhanced prompt templates for wow effects
const WOW_EFFECT_TEMPLATES = {
  neon: 'neon glowing effects, cyberpunk style, vibrant colors',
  holographic: 'holographic, iridescent, prismatic light effects',
  particle: 'particle effects, sparkles, magical dust, ethereal',
  gradient: 'smooth gradient transitions, color flow, ambient',
  geometric: 'geometric patterns, sacred geometry, mathematical beauty',
  nature: 'organic patterns, natural textures, biomorphic designs',
  tech: 'futuristic tech patterns, circuit boards, digital matrix',
  abstract: 'abstract art, fluid dynamics, artistic expression'
};

export async function generateImageWithDALLE(prompt, supabase, options = {}) {
  try {
    console.log('🖼️ Calling enhanced DALL-E generation...');
    
    // Enhance prompt for multi-layer generation
    const enhancedPrompt = buildEnhancedPrompt(prompt, 'dalle', options);
    
    // Determine if we need special composition for layers
    const compositionMode = options.multiLayer ? 'dual-layer' : 'single';
    
    const requestBody = {
      prompt: enhancedPrompt,
      mode: 'image_generation',
      size: options.size || '1792x1024', // Better for wallet aspect ratio
      quality: options.quality || 'hd',
      style: options.style || 'vivid',
      composition: compositionMode,
      layerConfig: options.multiLayer ? {
        layer1: WALLET_LAYERS.LAYER_1,
        layer2: WALLET_LAYERS.LAYER_2,
        blendMode: options.blendMode || 'normal'
      } : null
    };

    console.log('📤 DALL-E request config:', {
      composition: compositionMode,
      hasLayerConfig: !!requestBody.layerConfig,
      style: requestBody.style
    });

    const imageResponse = await supabase.functions.invoke('generate-style', {
      body: requestBody
    });

    if (imageResponse?.error) {
      throw new Error(`DALL-E generation failed: ${imageResponse.error.message}`);
    }

    const result = processDALLEResponse(imageResponse.data, options);
    
    if (result.success) {
      console.log('✅ DALL-E generation successful:', {
        hasMainImage: !!result.imageUrl,
        hasLayers: !!result.layers,
        layerCount: result.layers?.length || 0
      });
      return result;
    } else {
      throw new Error('Failed to process DALL-E response');
    }

  } catch (error) {
    console.error('❌ DALL-E generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'dalle'
    };
  }
}

export async function generateImageWithReplicate(prompt, supabase, options = {}) {
  try {
    console.log('🎨 Calling enhanced Replicate generation...');
    
    // Enhance prompt for better multi-layer support
    const enhancedPrompt = buildEnhancedPrompt(prompt, 'replicate', options);
    
    // Replicate naturally generates for two layers but needs size optimization
    const requestBody = {
      prompt: enhancedPrompt,
      // Add size hints for better layer adaptation
      width: options.width || 1920,
      height: options.height || 1080,
      // Ensure the image fills the wallet properly
      guidance_scale: options.guidanceScale || 7.5,
      num_inference_steps: options.steps || 50,
      // Additional parameters for better layer separation
      layer_mode: 'dual',
      preserve_aspect_ratio: true,
      adapt_to_wallet: true
    };

    console.log('📤 Replicate request config:', {
      width: requestBody.width,
      height: requestBody.height,
      layerMode: requestBody.layer_mode
    });

    const imageResponse = await supabase.functions.invoke('generate-wallet-mask-v3', {
      body: requestBody
    });

    if (imageResponse?.error) {
      throw new Error(`Replicate generation failed: ${imageResponse.error.message}`);
    }

    const result = processReplicateResponse(imageResponse.data, options);
    
    if (result.success) {
      console.log('✅ Replicate generation successful:', {
        hasMainImage: !!result.imageUrl,
        optimizedForLayers: result.layerOptimized
      });
      return result;
    } else {
      throw new Error('Failed to process Replicate response');
    }

  } catch (error) {
    console.error('❌ Replicate generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'replicate'
    };
  }
}

// New function for generating wow effect patterns
export async function generateWowEffectPattern(effectType, supabase, options = {}) {
  try {
    console.log('✨ Generating wow effect pattern:', effectType);
    
    const template = WOW_EFFECT_TEMPLATES[effectType] || WOW_EFFECT_TEMPLATES.abstract;
    const basePrompt = options.prompt || '';
    
    const enhancedPrompt = `${basePrompt} ${template}, seamless pattern, high quality, suitable for wallet interface overlay`;
    
    // Use DALL-E for pattern generation as it's better for abstract designs
    const result = await generateImageWithDALLE(enhancedPrompt, supabase, {
      ...options,
      style: 'vivid',
      patternMode: true
    });
    
    if (result.success) {
      result.effectType = effectType;
      result.isPattern = true;
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Wow effect pattern generation error:', error);
    return {
      success: false,
      error: error.message,
      effectType: effectType
    };
  }
}

// New function for generating animated backgrounds
export async function generateAnimatedBackground(prompt, supabase, options = {}) {
  try {
    console.log('🎬 Generating animated background assets...');
    
    // Generate multiple frames for animation
    const frames = [];
    const frameCount = options.frameCount || 3;
    
    for (let i = 0; i < frameCount; i++) {
      const framePrompt = `${prompt}, animation frame ${i + 1} of ${frameCount}, smooth transition`;
      
      const generator = options.useReplicate ? generateImageWithReplicate : generateImageWithDALLE;
      const result = await generator(framePrompt, supabase, {
        ...options,
        frameIndex: i
      });
      
      if (result.success) {
        frames.push(result);
      }
    }
    
    if (frames.length > 0) {
      return {
        success: true,
        frames: frames,
        frameCount: frames.length,
        mode: 'animated',
        animationData: generateAnimationData(frames, options)
      };
    } else {
      throw new Error('Failed to generate animation frames');
    }
    
  } catch (error) {
    console.error('❌ Animated background generation error:', error);
    return {
      success: false,
      error: error.message,
      mode: 'animated'
    };
  }
}

// Helper Functions

function buildEnhancedPrompt(basePrompt, generator, options) {
  let enhancedPrompt = basePrompt;
  
  // Add wallet-specific context
  enhancedPrompt += ', designed for modern crypto wallet interface';
  
  // Add layer-specific instructions
  if (options.multiLayer) {
    if (generator === 'dalle') {
      enhancedPrompt += ', compositionally balanced for dual-layer display with clear focal points for both unlock button area and balance display area';
    } else if (generator === 'replicate') {
      enhancedPrompt += ', optimized for wallet dimensions with proper scaling, ensure 100% visibility when applied to wallet layers';
    }
  }
  
  // Add wow effect modifiers
  if (options.wowEffect) {
    const effectModifier = WOW_EFFECT_TEMPLATES[options.wowEffect] || '';
    enhancedPrompt += `, ${effectModifier}`;
  }
  
  // Add style modifiers
  if (options.styleModifiers) {
    enhancedPrompt += `, ${options.styleModifiers.join(', ')}`;
  }
  
  // Add technical specifications
  enhancedPrompt += ', high resolution, professional quality, seamless integration';
  
  return enhancedPrompt;
}

function processDALLEResponse(data, options) {
  const generatedImageUrl = data?.imageUrl;
  
  if (!generatedImageUrl) {
    return {
      success: false,
      error: 'No image URL returned from DALL-E service'
    };
  }
  
  const result = {
    success: true,
    imageUrl: generatedImageUrl,
    mode: 'dalle',
    dimensions: data.dimensions || { width: 1792, height: 1024 }
  };
  
  // If multi-layer was requested, provide layer configuration
  if (options.multiLayer) {
    result.layers = [
      {
        id: 'layer1',
        name: WALLET_LAYERS.LAYER_1.name,
        imageUrl: generatedImageUrl,
        cropConfig: {
          x: 0,
          y: 0,
          width: '100%',
          height: '50%'
        },
        opacity: 1
      },
      {
        id: 'layer2',
        name: WALLET_LAYERS.LAYER_2.name,
        imageUrl: generatedImageUrl,
        cropConfig: {
          x: 0,
          y: '50%',
          width: '100%',
          height: '50%'
        },
        opacity: 1
      }
    ];
    
    result.layerInstructions = {
      implementation: 'Use CSS object-fit and object-position to properly display each layer',
      blendMode: options.blendMode || 'normal',
      zIndex: {
        layer1: 1,
        layer2: 2
      }
    };
  }
  
  // Add metadata
  result.metadata = {
    generatedAt: new Date().toISOString(),
    prompt: data.prompt,
    revisedPrompt: data.revised_prompt,
    style: data.style || 'vivid'
  };
  
  return result;
}

function processReplicateResponse(data, options) {
  const generatedImageUrl = data?.output?.[0];
  
  if (!generatedImageUrl) {
    return {
      success: false,
      error: 'No image URL returned from Replicate service'
    };
  }
  
  const result = {
    success: true,
    imageUrl: generatedImageUrl,
    mode: 'replicate',
    layerOptimized: true // Replicate is optimized for layers by default
  };
  
  // Add optimization data for proper display
  result.displayOptimization = {
    cssRules: {
      objectFit: 'cover',
      objectPosition: 'center',
      width: '100%',
      height: '100%',
      transform: 'scale(1.2)', // Scale up to ensure full coverage
      transformOrigin: 'center'
    },
    containerSettings: {
      overflow: 'hidden',
      position: 'relative'
    }
  };
  
  // Provide viewport configuration to show 100% of image
  result.viewportConfig = {
    layer1: {
      viewport: { x: 0, y: 0, width: '100%', height: '100%' },
      scale: 1.2, // Compensate for typical 20% visibility issue
      position: 'center top'
    },
    layer2: {
      viewport: { x: 0, y: 0, width: '100%', height: '100%' },
      scale: 1.2,
      position: 'center bottom'
    }
  };
  
  // Add metadata
  result.metadata = {
    generatedAt: new Date().toISOString(),
    originalDimensions: data.dimensions || { width: 1920, height: 1080 },
    optimizationApplied: true
  };
  
  return result;
}

function generateAnimationData(frames, options) {
  return {
    keyframes: frames.map((frame, index) => ({
      offset: index / (frames.length - 1),
      imageUrl: frame.imageUrl
    })),
    duration: options.duration || '10s',
    easing: options.easing || 'ease-in-out',
    iterations: options.iterations || 'infinite',
    direction: options.direction || 'alternate',
    css: generateAnimationCSS(frames, options)
  };
}

function generateAnimationCSS(frames, options) {
  const animationName = `wallet-bg-animation-${Date.now()}`;
  const duration = options.duration || '10s';
  
  const keyframes = frames.map((frame, index) => {
    const percent = (index / (frames.length - 1)) * 100;
    return `${percent}% { background-image: url('${frame.imageUrl}'); }`;
  }).join('\n');
  
  return `
    @keyframes ${animationName} {
      ${keyframes}
    }
    
    .animated-wallet-bg {
      animation: ${animationName} ${duration} ${options.easing || 'ease-in-out'} ${options.iterations || 'infinite'};
      background-size: cover;
      background-position: center;
    }
  `;
}

// Export helper function for frontend integration
export function getLayerOptimizationCSS(generator, layerId) {
  if (generator === 'replicate') {
    return `
      .wallet-layer-${layerId} {
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      
      .wallet-layer-${layerId} img {
        width: 120%;
        height: 120%;
        object-fit: cover;
        object-position: center;
        transform: translate(-10%, -10%);
      }
    `;
  } else {
    return `
      .wallet-layer-${layerId} {
        position: absolute;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      }
    `;
  }
}
