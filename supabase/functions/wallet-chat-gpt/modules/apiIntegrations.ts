// Enhanced External API integrations

// API Configuration
const API_CONFIGS = {
  googleFonts: {
    baseUrl: 'https://www.googleapis.com/webfonts/v1/webfonts',
    key: () => Deno.env.get('GOOGLE_FONTS_API_KEY'),
    cache: new Map(),
    cacheExpiry: 24 * 60 * 60 * 1000 // 24 hours
  },
  iconLibraries: {
    // Placeholder for future icon API integrations
    phosphor: {
      baseUrl: 'https://api.phosphoricons.com/v1',
      cdn: 'https://unpkg.com/phosphor-icons@1.4.2/src/icons'
    },
    heroicons: {
      baseUrl: 'https://heroicons.com/api/v2',
      cdn: 'https://unpkg.com/heroicons@2.0.18'
    },
    lucide: {
      baseUrl: 'https://lucide.dev/api',
      cdn: 'https://unpkg.com/lucide@latest/dist/esm/icons'
    },
    // Ready for custom icon service
    custom: {
      baseUrl: null, // To be configured
      apiKey: () => Deno.env.get('CUSTOM_ICONS_API_KEY')
    }
  },
  gradients: {
    // Future gradient library API
    baseUrl: 'https://api.gradients.io/v1',
    apiKey: () => Deno.env.get('GRADIENTS_API_KEY')
  },
  patterns: {
    // Future pattern library API
    heroPatterns: 'https://heropatterns.com/api',
    patternPad: 'https://patternpad.com/api/v1'
  },
  animations: {
    // Future animation library API
    lottie: 'https://lottiefiles.com/api/v1',
    rive: 'https://rive.app/api/v1'
  }
};

// Google Fonts Integration
export async function fetchGoogleFonts(options = {}) {
  try {
    const apiKey = API_CONFIGS.googleFonts.key();
    
    if (!apiKey) {
      console.warn('⚠️ Google Fonts API key not configured, using cached popular fonts');
      return getPopularFonts();
    }
    
    // Check cache first
    const cacheKey = 'google-fonts-' + JSON.stringify(options);
    const cached = getFromCache('googleFonts', cacheKey);
    if (cached) {
      console.log('✅ Returning cached Google Fonts');
      return cached;
    }
    
    // Build API URL with parameters
    const params = new URLSearchParams({
      key: apiKey,
      sort: options.sort || 'popularity',
      ...(options.category && { category: options.category })
    });
    
    const url = `${API_CONFIGS.googleFonts.baseUrl}?${params}`;
    console.log('🔍 Fetching fonts from Google Fonts API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.status}`);
    }
    
    const data = await response.json();
    const fonts = data.items || [];
    
    // Process and categorize fonts
    const processedFonts = {
      all: fonts.map(f => ({
        family: f.family,
        category: f.category,
        variants: f.variants,
        subsets: f.subsets,
        files: f.files,
        popularity: fonts.indexOf(f) + 1
      })),
      byCategory: categorizeGoogleFonts(fonts),
      popular: fonts.slice(0, 20).map(f => f.family),
      recommended: getRecommendedFonts(fonts)
    };
    
    // Cache the results
    setCache('googleFonts', cacheKey, processedFonts);
    
    console.log(`✅ Fetched ${fonts.length} fonts from Google Fonts`);
    return processedFonts;
    
  } catch (error) {
    console.error('❌ Error fetching Google Fonts:', error);
    return getPopularFonts(); // fallback
  }
}

// Get font CSS URL for embedding
export function getGoogleFontUrl(fontFamilies, options = {}) {
  const families = Array.isArray(fontFamilies) ? fontFamilies : [fontFamilies];
  
  const familyParams = families.map(family => {
    const weights = options.weights || ['400', '500', '600', '700'];
    return `${family.replace(/ /g, '+')}:wght@${weights.join(';')}`;
  }).join('&family=');
  
  const params = new URLSearchParams({
    display: options.display || 'swap'
  });
  
  return `https://fonts.googleapis.com/css2?family=${familyParams}&${params}`;
}

// Icon API Integration (Placeholder for future implementation)
export async function fetchIcons(library = 'phosphor', options = {}) {
  try {
    console.log(`🎨 Fetching icons from ${library}...`);
    
    const config = API_CONFIGS.iconLibraries[library];
    if (!config) {
      throw new Error(`Unknown icon library: ${library}`);
    }
    
    // For now, return CDN URLs for popular icons
    // This will be replaced with actual API calls when icon services are integrated
    const popularIcons = {
      phosphor: [
        { name: 'house', url: `${config.cdn}/house.svg` },
        { name: 'wallet', url: `${config.cdn}/wallet.svg` },
        { name: 'coin', url: `${config.cdn}/coin.svg` },
        { name: 'arrow-up', url: `${config.cdn}/arrow-up.svg` },
        { name: 'arrow-down', url: `${config.cdn}/arrow-down.svg` },
        { name: 'gear', url: `${config.cdn}/gear.svg` },
        { name: 'user', url: `${config.cdn}/user.svg` },
        { name: 'lock', url: `${config.cdn}/lock.svg` }
      ],
      heroicons: [
        { name: 'home', url: `${config.cdn}/24/solid/home.svg` },
        { name: 'wallet', url: `${config.cdn}/24/solid/wallet.svg` },
        { name: 'currency-dollar', url: `${config.cdn}/24/solid/currency-dollar.svg` },
        { name: 'arrow-trending-up', url: `${config.cdn}/24/solid/arrow-trending-up.svg` },
        { name: 'cog', url: `${config.cdn}/24/solid/cog.svg` }
      ],
      lucide: [
        { name: 'home', url: `${config.cdn}/home.js` },
        { name: 'wallet', url: `${config.cdn}/wallet.js` },
        { name: 'coins', url: `${config.cdn}/coins.js` },
        { name: 'trending-up', url: `${config.cdn}/trending-up.js` },
        { name: 'settings', url: `${config.cdn}/settings.js` }
      ]
    };
    
    return {
      library,
      icons: popularIcons[library] || [],
      cdn: config.cdn,
      searchUrl: config.baseUrl,
      categories: ['finance', 'navigation', 'action', 'system']
    };
    
  } catch (error) {
    console.error(`❌ Error fetching icons from ${library}:`, error);
    return {
      library,
      icons: [],
      error: error.message
    };
  }
}

// Search for specific icons
export async function searchIcons(query, libraries = ['phosphor', 'heroicons', 'lucide']) {
  const results = await Promise.all(
    libraries.map(lib => fetchIconsByQuery(lib, query))
  );
  
  return {
    query,
    results: results.filter(r => r.icons.length > 0),
    totalCount: results.reduce((sum, r) => sum + r.icons.length, 0)
  };
}

// Gradient API Integration (Placeholder)
export async function fetchGradients(options = {}) {
  try {
    console.log('🎨 Fetching gradients...');
    
    // Placeholder implementation - return popular gradients
    const gradients = [
      {
        id: 'sunset',
        name: 'Sunset',
        colors: ['#FF512F', '#F09819'],
        angle: 45,
        type: 'linear'
      },
      {
        id: 'ocean',
        name: 'Ocean',
        colors: ['#2E3192', '#1BFFFF'],
        angle: 90,
        type: 'linear'
      },
      {
        id: 'forest',
        name: 'Forest',
        colors: ['#5A3F37', '#2C7744'],
        angle: 135,
        type: 'linear'
      },
      {
        id: 'cosmic',
        name: 'Cosmic',
        colors: ['#C33764', '#1D2671'],
        angle: 45,
        type: 'linear'
      },
      {
        id: 'neon',
        name: 'Neon',
        colors: ['#00F5FF', '#FF00E4', '#00F5FF'],
        stops: [0, 50, 100],
        type: 'radial'
      }
    ];
    
    return {
      gradients: options.type ? gradients.filter(g => g.type === options.type) : gradients,
      categories: ['warm', 'cool', 'vibrant', 'subtle'],
      generateCSS: (gradient) => generateGradientCSS(gradient)
    };
    
  } catch (error) {
    console.error('❌ Error fetching gradients:', error);
    return { gradients: [], error: error.message };
  }
}

// Pattern API Integration (Placeholder)
export async function fetchPatterns(options = {}) {
  try {
    console.log('🎨 Fetching patterns...');
    
    // Placeholder patterns
    const patterns = [
      {
        id: 'dots',
        name: 'Dots',
        type: 'geometric',
        svg: generateDotsPattern()
      },
      {
        id: 'lines',
        name: 'Lines',
        type: 'geometric',
        svg: generateLinesPattern()
      },
      {
        id: 'waves',
        name: 'Waves',
        type: 'organic',
        svg: generateWavesPattern()
      }
    ];
    
    return {
      patterns: options.type ? patterns.filter(p => p.type === options.type) : patterns,
      categories: ['geometric', 'organic', 'abstract'],
      generateCSS: (pattern) => generatePatternCSS(pattern)
    };
    
  } catch (error) {
    console.error('❌ Error fetching patterns:', error);
    return { patterns: [], error: error.message };
  }
}

// Image validation and optimization
export async function validateImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    
    return {
      valid: response.ok && contentType?.startsWith('image/'),
      contentType,
      size: parseInt(response.headers.get('content-length') || '0'),
      dimensions: await getImageDimensions(url)
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Get image dimensions without downloading full image
async function getImageDimensions(url) {
  try {
    // This is a simplified version - in production, use a proper image parsing library
    const response = await fetch(url, {
      headers: {
        'Range': 'bytes=0-1023' // Get first 1KB
      }
    });
    
    // Placeholder - actual implementation would parse image headers
    return { width: null, height: null };
  } catch {
    return { width: null, height: null };
  }
}

// Color API utilities
export async function analyzeColors(imageUrl) {
  try {
    console.log('🎨 Analyzing colors from image...');
    
    // Placeholder - in production, use a color extraction service
    // Like Google Vision API or a custom color extraction service
    return {
      dominant: '#1a1a1a',
      palette: ['#1a1a1a', '#9945ff', '#ab4aba', '#00d4ff', '#ffffff'],
      accent: '#9945ff',
      background: '#1a1a1a',
      text: '#ffffff'
    };
    
  } catch (error) {
    console.error('❌ Error analyzing colors:', error);
    return null;
  }
}

// Helper Functions

function getPopularFonts() {
  return {
    all: [],
    popular: [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
      'Source Sans Pro', 'Raleway', 'PT Sans', 'Lora', 'Merriweather',
      'Playfair Display', 'Poppins', 'Ubuntu', 'Oswald', 'Nunito',
      'Work Sans', 'Quicksand', 'Rubik', 'Archivo', 'DM Sans'
    ],
    byCategory: {
      'sans-serif': ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'],
      'serif': ['Lora', 'Merriweather', 'Playfair Display'],
      'display': ['Oswald', 'Bebas Neue'],
      'monospace': ['Source Code Pro', 'JetBrains Mono']
    },
    recommended: ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'DM Sans']
  };
}

function categorizeGoogleFonts(fonts) {
  const categories = {};
  
  fonts.forEach(font => {
    const category = font.category || 'other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(font.family);
  });
  
  return categories;
}

function getRecommendedFonts(fonts) {
  // Recommend fonts based on popularity and readability
  const recommended = fonts
    .filter(f => 
      f.category === 'sans-serif' && 
      f.variants.includes('regular') &&
      f.variants.includes('bold')
    )
    .slice(0, 10)
    .map(f => f.family);
  
  return recommended;
}

// Cache management
const cache = new Map();

function getFromCache(service, key) {
  const cacheKey = `${service}-${key}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < API_CONFIGS[service]?.cacheExpiry) {
    return cached.data;
  }
  
  return null;
}

function setCache(service, key, data) {
  const cacheKey = `${service}-${key}`;
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

async function fetchIconsByQuery(library, query) {
  // Placeholder for icon search
  return {
    library,
    query,
    icons: []
  };
}

function generateGradientCSS(gradient) {
  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle}deg, ${gradient.colors.join(', ')})`;
  } else if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${gradient.colors.join(', ')})`;
  }
  return '';
}

function generatePatternCSS(pattern) {
  return `url("data:image/svg+xml,${encodeURIComponent(pattern.svg)}")`;
}

function generateDotsPattern() {
  return `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.3"/>
  </svg>`;
}

function generateLinesPattern() {
  return `<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" stroke-width="1" opacity="0.3"/>
  </svg>`;
}

function generateWavesPattern() {
  return `<svg width="100" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,10 Q25,0 50,10 T100,10" stroke="currentColor" fill="none" opacity="0.3"/>
  </svg>`;
}

// Export configuration for frontend
export function getAPIConfiguration() {
  return {
    googleFonts: {
      available: !!API_CONFIGS.googleFonts.key(),
      cssUrl: 'https://fonts.googleapis.com/css2'
    },
    icons: {
      libraries: Object.keys(API_CONFIGS.iconLibraries),
      recommended: 'phosphor'
    },
    features: {
      fonts: true,
      icons: true,
      gradients: true,
      patterns: true,
      colorAnalysis: true
    }
  };
}
