// Enhanced style analysis and processing with WOW effects support

// Main style analysis function
export function analyzeEnhancedStyleFromResponse(response) {
  try {
    // Extract enhanced JSON structure from GPT response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (validateEnhancedStructure(parsed)) {
        return enhanceWithDefaults(parsed);
      }
    }
    
    // Try direct JSON parsing
    try {
      const directJson = JSON.parse(response);
      if (validateEnhancedStructure(directJson)) {
        return enhanceWithDefaults(directJson);
      }
    } catch (e) {
      // Not direct JSON, continue
    }
    
    // Fallback: extract style information from text
    return extractStyleFromText(response);
    
  } catch (error) {
    console.error('❌ Enhanced style analysis error:', error);
    return null;
  }
}

// Extract WOW effects from AI response
export function extractWowEffects(response) {
  try {
    const effects = [];
    
    // Try to extract structured effects from JSON
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.wowEffects && Array.isArray(parsed.wowEffects)) {
        return parsed.wowEffects.map(effect => normalizeWowEffect(effect));
      }
    }
    
    // Extract effects from text using patterns
    const effectPatterns = {
      animation: /animation:\s*([^,;]+)/gi,
      gradient: /gradient:\s*([^,;]+)/gi,
      glow: /glow(?:ing)?:\s*([^,;]+)/gi,
      shadow: /shadow:\s*([^,;]+)/gi,
      transform: /transform:\s*([^,;]+)/gi,
      particle: /particle[s]?:\s*([^,;]+)/gi,
      hover: /hover:\s*([^,;]+)/gi,
      transition: /transition:\s*([^,;]+)/gi,
      '3d': /3[dD]:\s*([^,;]+)/gi,
      blur: /blur:\s*([^,;]+)/gi
    };
    
    // Extract effects from text
    Object.entries(effectPatterns).forEach(([type, pattern]) => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        effects.push({
          type,
          description: match[1].trim(),
          target: detectTarget(match[0], response),
          properties: extractEffectProperties(type, match[1])
        });
      }
    });
    
    // Look for effect blocks in the response
    const effectBlockPattern = /(?:wow\s)?effects?:\s*\n((?:[-*]\s*.+\n?)+)/gim;
    const blockMatches = response.matchAll(effectBlockPattern);
    
    for (const blockMatch of blockMatches) {
      const effectLines = blockMatch[1].split('\n').filter(line => line.trim());
      effectLines.forEach(line => {
        const effect = parseEffectLine(line);
        if (effect) {
          effects.push(effect);
        }
      });
    }
    
    // Deduplicate and enhance effects
    return deduplicateAndEnhanceEffects(effects);
    
  } catch (error) {
    console.error('❌ WOW effects extraction error:', error);
    return [];
  }
}

// Analyze style with WOW effect support
export function analyzeStyleWithWow(response, context) {
  const baseStyle = analyzeEnhancedStyleFromResponse(response);
  const wowEffects = extractWowEffects(response);
  
  if (!baseStyle) {
    return {
      success: false,
      error: 'Could not extract style information'
    };
  }
  
  // Merge wow effects into style
  const enhancedStyle = {
    ...baseStyle,
    wowEffects: wowEffects,
    hasWowEffects: wowEffects.length > 0,
    effectCategories: categorizeEffects(wowEffects),
    performanceImpact: calculatePerformanceImpact(wowEffects),
    browserSupport: checkBrowserSupport(wowEffects)
  };
  
  // Add implementation details for each effect
  enhancedStyle.implementation = generateImplementationGuide(enhancedStyle, context);
  
  return {
    success: true,
    ...enhancedStyle
  };
}

// Helper Functions

function validateEnhancedStructure(obj) {
  return obj && 
         (obj.analysis || obj.elements || obj.styles) &&
         typeof obj === 'object';
}

function enhanceWithDefaults(parsed) {
  const defaults = {
    analysis: parsed.analysis || 'Style analysis',
    actions: parsed.actions || [],
    elements: {
      colors: {
        background: parsed.elements?.colors?.background || '#000000',
        text: parsed.elements?.colors?.text || '#FFFFFF',
        accent: parsed.elements?.colors?.accent || '#00FF00',
        primary: parsed.elements?.colors?.primary || '#0066FF',
        secondary: parsed.elements?.colors?.secondary || '#FF6600',
        ...parsed.elements?.colors
      },
      typography: {
        header: parsed.elements?.typography?.header || 'Inter, sans-serif',
        body: parsed.elements?.typography?.body || 'Inter, sans-serif',
        ...parsed.elements?.typography
      },
      spacing: {
        small: parsed.elements?.spacing?.small || '8px',
        medium: parsed.elements?.spacing?.medium || '16px',
        large: parsed.elements?.spacing?.large || '24px',
        ...parsed.elements?.spacing
      },
      borderRadius: parsed.elements?.borderRadius || '12px',
      ...parsed.elements
    },
    metadata: {
      style_reasoning: parsed.metadata?.style_reasoning || 'Custom wallet styling',
      nft_ready: parsed.metadata?.nft_ready !== false,
      timestamp: new Date().toISOString(),
      ...parsed.metadata
    }
  };
  
  return defaults;
}

function extractStyleFromText(response) {
  // Fallback extraction from plain text
  const style = {
    analysis: 'Extracted from text response',
    actions: [],
    elements: {
      colors: {},
      typography: {},
      spacing: {}
    },
    metadata: {
      style_reasoning: 'Fallback extraction',
      nft_ready: true
    }
  };
  
  // Extract colors
  const colorPatterns = {
    background: /background(?:\s+color)?:\s*(#[0-9a-fA-F]{6}|[a-z]+)/i,
    text: /text(?:\s+color)?:\s*(#[0-9a-fA-F]{6}|[a-z]+)/i,
    accent: /accent(?:\s+color)?:\s*(#[0-9a-fA-F]{6}|[a-z]+)/i,
    primary: /primary(?:\s+color)?:\s*(#[0-9a-fA-F]{6}|[a-z]+)/i
  };
  
  Object.entries(colorPatterns).forEach(([key, pattern]) => {
    const match = response.match(pattern);
    if (match) {
      style.elements.colors[key] = match[1];
    }
  });
  
  // Extract fonts
  const fontPattern = /font(?:-family)?:\s*([^;,\n]+)/i;
  const fontMatch = response.match(fontPattern);
  if (fontMatch) {
    style.elements.typography.header = fontMatch[1].trim();
    style.elements.typography.body = fontMatch[1].trim();
  }
  
  return style;
}

function normalizeWowEffect(effect) {
  return {
    id: effect.id || `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: effect.type || 'animation',
    name: effect.name || generateEffectName(effect.type),
    description: effect.description || '',
    target: effect.target || '.wallet',
    properties: effect.properties || {},
    duration: effect.duration || '2s',
    easing: effect.easing || 'ease-in-out',
    trigger: effect.trigger || 'load',
    requiresJS: ['particle', 'interactive', '3d'].includes(effect.type),
    cssSupport: effect.cssSupport !== false,
    performance: effect.performance || 'medium'
  };
}

function detectTarget(effectText, fullResponse) {
  // Try to detect what element the effect targets
  const targetPatterns = [
    { pattern: /button/i, target: '.wallet-button' },
    { pattern: /balance/i, target: '.wallet-balance' },
    { pattern: /address/i, target: '.wallet-address' },
    { pattern: /header/i, target: '.wallet-header' },
    { pattern: /background/i, target: '.wallet-background' },
    { pattern: /card/i, target: '.wallet-card' },
    { pattern: /unlock/i, target: '.unlock-button' }
  ];
  
  for (const { pattern, target } of targetPatterns) {
    if (effectText.match(pattern)) {
      return target;
    }
  }
  
  return '.wallet'; // Default target
}

function extractEffectProperties(type, description) {
  const properties = {};
  
  switch (type) {
    case 'animation':
      // Extract animation properties
      const durationMatch = description.match(/(\d+(?:\.\d+)?)(s|ms)/);
      if (durationMatch) {
        properties.duration = durationMatch[0];
      }
      
      const easingMatch = description.match(/(ease|linear|ease-in|ease-out|ease-in-out)/);
      if (easingMatch) {
        properties.easing = easingMatch[0];
      }
      break;
      
    case 'gradient':
      // Extract gradient colors
      const colorMatches = description.matchAll(/#[0-9a-fA-F]{6}|[a-z]+/gi);
      properties.colors = Array.from(colorMatches).map(m => m[0]);
      
      const angleMatch = description.match(/(\d+)deg/);
      if (angleMatch) {
        properties.angle = angleMatch[0];
      }
      break;
      
    case 'shadow':
    case 'glow':
      // Extract shadow/glow properties
      const sizeMatch = description.match(/(\d+)px/);
      if (sizeMatch) {
        properties.size = sizeMatch[0];
      }
      
      const colorMatch = description.match(/#[0-9a-fA-F]{6}|[a-z]+/);
      if (colorMatch) {
        properties.color = colorMatch[0];
      }
      break;
  }
  
  return properties;
}

function parseEffectLine(line) {
  // Parse effect from bullet point or list item
  const cleanLine = line.replace(/^[-*]\s*/, '').trim();
  
  // Common effect patterns
  const patterns = [
    { regex: /^([\w\s]+):\s*(.+)$/, type: 'named' },
    { regex: /^Add\s+(.+)\s+to\s+(.+)$/, type: 'add' },
    { regex: /^(.+)\s+effect\s+on\s+(.+)$/, type: 'effect' },
    { regex: /^Animate\s+(.+)$/, type: 'animate' }
  ];
  
  for (const { regex, type: patternType } of patterns) {
    const match = cleanLine.match(regex);
    if (match) {
      return createEffectFromPattern(match, patternType, cleanLine);
    }
  }
  
  return null;
}

function createEffectFromPattern(match, patternType, fullLine) {
  let effect = {
    description: fullLine,
    properties: {}
  };
  
  switch (patternType) {
    case 'named':
      effect.name = match[1].trim();
      effect.type = detectEffectType(match[1]);
      Object.assign(effect.properties, extractEffectProperties(effect.type, match[2]));
      break;
      
    case 'add':
      effect.type = detectEffectType(match[1]);
      effect.target = match[2].trim();
      break;
      
    case 'effect':
      effect.type = detectEffectType(match[1]);
      effect.target = match[2].trim();
      break;
      
    case 'animate':
      effect.type = 'animation';
      effect.target = detectTarget(match[1], fullLine);
      break;
  }
  
  return normalizeWowEffect(effect);
}

function detectEffectType(text) {
  const typeMap = {
    'anim': 'animation',
    'grad': 'gradient',
    'glow': 'glow',
    'shadow': 'shadow',
    'hover': 'hover',
    'particle': 'particle',
    'blur': 'blur',
    'transform': 'transform',
    '3d': '3d',
    'transition': 'transition'
  };
  
  const lowercaseText = text.toLowerCase();
  
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowercaseText.includes(key)) {
      return value;
    }
  }
  
  return 'animation'; // Default
}

function deduplicateAndEnhanceEffects(effects) {
  // Remove duplicates based on type and target
  const uniqueEffects = new Map();
  
  effects.forEach(effect => {
    const key = `${effect.type}-${effect.target}`;
    if (!uniqueEffects.has(key) || effect.properties && Object.keys(effect.properties).length > 0) {
      uniqueEffects.set(key, effect);
    }
  });
  
  return Array.from(uniqueEffects.values());
}

function categorizeEffects(effects) {
  const categories = {
    visual: [],
    interactive: [],
    animation: [],
    advanced: []
  };
  
  effects.forEach(effect => {
    if (['gradient', 'shadow', 'glow', 'blur'].includes(effect.type)) {
      categories.visual.push(effect);
    } else if (['hover', 'click', 'interactive'].includes(effect.type)) {
      categories.interactive.push(effect);
    } else if (['animation', 'transition', 'transform'].includes(effect.type)) {
      categories.animation.push(effect);
    } else if (['particle', '3d'].includes(effect.type)) {
      categories.advanced.push(effect);
    }
  });
  
  return categories;
}

function calculatePerformanceImpact(effects) {
  let score = 0;
  
  const impactMap = {
    'animation': 2,
    'transition': 1,
    'transform': 1,
    'gradient': 1,
    'shadow': 1,
    'glow': 2,
    'blur': 3,
    'particle': 5,
    '3d': 4,
    'hover': 1,
    'interactive': 2
  };
  
  effects.forEach(effect => {
    score += impactMap[effect.type] || 1;
  });
  
  if (score <= 5) return 'low';
  if (score <= 10) return 'medium';
  if (score <= 15) return 'high';
  return 'very-high';
}

function checkBrowserSupport(effects) {
  const support = {
    chrome: true,
    firefox: true,
    safari: true,
    edge: true,
    mobile: true
  };
  
  effects.forEach(effect => {
    if (effect.type === '3d') {
      support.mobile = false; // Limited 3D support on mobile
    }
    if (effect.type === 'particle' && effect.requiresJS) {
      support.safari = false; // Potential performance issues
    }
  });
  
  return support;
}

function generateImplementationGuide(style, context) {
  const guide = {
    css: [],
    javascript: [],
    html: [],
    dependencies: []
  };
  
  // Generate CSS implementation
  if (style.elements) {
    guide.css.push(generateBaseCSS(style.elements));
  }
  
  // Generate effect implementations
  style.wowEffects?.forEach(effect => {
    const implementation = generateEffectImplementation(effect);
    
    if (implementation.css) guide.css.push(implementation.css);
    if (implementation.js) guide.javascript.push(implementation.js);
    if (implementation.html) guide.html.push(implementation.html);
    if (implementation.dependencies) guide.dependencies.push(...implementation.dependencies);
  });
  
  return guide;
}

function generateBaseCSS(elements) {
  return `
/* Base wallet styles */
.wallet {
  --bg-color: ${elements.colors?.background || '#000000'};
  --text-color: ${elements.colors?.text || '#FFFFFF'};
  --accent-color: ${elements.colors?.accent || '#00FF00'};
  --primary-color: ${elements.colors?.primary || '#0066FF'};
  --border-radius: ${elements.borderRadius || '12px'};
  
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: ${elements.typography?.body || 'Inter, sans-serif'};
  border-radius: var(--border-radius);
}

.wallet-header {
  font-family: ${elements.typography?.header || 'Inter, sans-serif'};
}
  `.trim();
}

function generateEffectImplementation(effect) {
  const implementations = {
    animation: {
      css: `
/* ${effect.name} animation */
${effect.target} {
  animation: ${effect.name} ${effect.duration} ${effect.easing} infinite;
}

@keyframes ${effect.name} {
  /* Add keyframes based on effect */
}
      `.trim()
    },
    gradient: {
      css: `
/* Gradient effect */
${effect.target} {
  background: linear-gradient(${effect.properties.angle || '45deg'}, ${effect.properties.colors?.join(', ') || '#000, #fff'});
}
      `.trim()
    },
    particle: {
      js: `
// Particle effect
const particleSystem = new ParticleSystem({
  container: '${effect.target}',
  particleCount: 50,
  // Add particle configuration
});
      `.trim(),
      dependencies: ['particle-system.js']
    }
  };
  
  return implementations[effect.type] || {};
}

function generateEffectName(type) {
  const names = {
    animation: 'wallet-animate',
    gradient: 'wallet-gradient',
    glow: 'wallet-glow',
    shadow: 'wallet-shadow',
    transform: 'wallet-transform',
    particle: 'wallet-particles',
    hover: 'wallet-hover',
    transition: 'wallet-transition',
    '3d': 'wallet-3d',
    blur: 'wallet-blur'
  };
  
  return names[type] || 'wallet-effect';
}

// Legacy functions for backward compatibility
export function analyzeStyleFromResponse(response) {
  const enhanced = analyzeEnhancedStyleFromResponse(response);
  if (enhanced) {
    // Convert to legacy format if needed
    return {
      layer: 'wallet',
      target: 'global',
      changes: {
        backgroundColor: enhanced.elements.colors?.background,
        textColor: enhanced.elements.colors?.text,
        accentColor: enhanced.elements.colors?.accent,
        primaryColor: enhanced.elements.colors?.primary,
        fontFamily: enhanced.elements.typography?.header,
      },
      reasoning: enhanced.metadata.style_reasoning
    };
  }
  return null;
}

export function validateStyleChanges(changes) {
  return changes && 
         typeof changes === 'object' &&
         (changes.elements || changes.changes || changes.styles);
}

export function validateEnhancedStyleChanges(changes) {
  return validateStyleChanges(changes) &&
         (changes.analysis || changes.elements || changes.metadata);
}
