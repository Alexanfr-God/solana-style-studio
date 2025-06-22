// Enhanced Supabase storage management utilities

import { WalletConfiguration, WowEffect } from '../types/wallet.ts';
import { CompleteStylePreset } from '../types/styles.ts';

// Cache configuration
const CACHE_CONFIG = {
  designExamples: {
    key: 'design-examples',
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  },
  userStyles: {
    key: 'user-styles',
    ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  wowEffects: {
    key: 'wow-effects',
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  },
  aiResponses: {
    key: 'ai-responses',
    ttl: 60 * 60 * 1000 // 1 hour
  }
};

// In-memory cache
const memoryCache = new Map<string, { data: any, expires: number }>();

// Load design examples from Supabase storage
export async function loadDesignExamples(supabase: any) {
  try {
    // Check cache first
    const cached = getFromCache(CACHE_CONFIG.designExamples.key);
    if (cached) {
      console.log('✅ Loaded design examples from cache');
      return cached;
    }
    
    const examples = [];
    console.log('🎨 Loading design examples from Supabase Storage...');
    
    // Load poster folders with enhanced metadata
    const posterPromises = [];
    for (let i = 1; i <= 10; i++) {
      const posterNum = String(i).padStart(3, '0');
      posterPromises.push(loadPosterData(supabase, posterNum));
    }
    
    // Load additional style presets
    const presetPromises = [
      loadStylePreset(supabase, 'cyberpunk'),
      loadStylePreset(supabase, 'luxury'),
      loadStylePreset(supabase, 'minimal'),
      loadStylePreset(supabase, 'cosmic'),
      loadStylePreset(supabase, 'retro')
    ];
    
    // Wait for all loads
    const [posterResults, presetResults] = await Promise.all([
      Promise.all(posterPromises),
      Promise.all(presetPromises)
    ]);
    
    // Combine results
    examples.push(...posterResults.filter(Boolean));
    examples.push(...presetResults.filter(Boolean));
    
    console.log(`📚 Total loaded examples: ${examples.length}`);
    
    // Enhance with additional metadata
    const enhancedExamples = examples.map(example => enhanceExampleMetadata(example));
    
    // Cache the results
    setCache(CACHE_CONFIG.designExamples.key, enhancedExamples);
    
    return enhancedExamples;
    
  } catch (error) {
    console.error('❌ Error loading design examples:', error);
    return getDefaultExamples();
  }
}

// Load individual poster data
async function loadPosterData(supabase: any, posterNum: string) {
  try {
    const { data, error } = await supabase.storage
      .from('ai-examples-json')
      .download(`poster-${posterNum}/metadata.json`);
    
    if (data && !error) {
      const metadata = JSON.parse(await data.text());
      
      // Load associated images if available
      const images = await loadPosterImages(supabase, posterNum);
      
      return {
        ...metadata,
        id: metadata.id || `poster-${posterNum}`,
        images,
        source: 'poster'
      };
    }
  } catch (error) {
    console.warn(`Failed to load poster-${posterNum}:`, error.message);
  }
  
  return null;
}

// Load poster images
async function loadPosterImages(supabase: any, posterNum: string) {
  const images = {
    thumbnail: null,
    full: null,
    layers: []
  };
  
  try {
    // Get public URLs for images
    const { data: files } = await supabase.storage
      .from('ai-examples-json')
      .list(`poster-${posterNum}`, { limit: 10 });
    
    if (files) {
      files.forEach(file => {
        const publicUrl = supabase.storage
          .from('ai-examples-json')
          .getPublicUrl(`poster-${posterNum}/${file.name}`).data.publicUrl;
        
        if (file.name.includes('thumb')) {
          images.thumbnail = publicUrl;
        } else if (file.name.includes('full')) {
          images.full = publicUrl;
        } else if (file.name.includes('layer')) {
          images.layers.push(publicUrl);
        }
      });
    }
  } catch (error) {
    console.warn(`Failed to load images for poster-${posterNum}`);
  }
  
  return images;
}

// Load style preset
async function loadStylePreset(supabase: any, presetName: string) {
  try {
    const { data, error } = await supabase.storage
      .from('style-presets')
      .download(`${presetName}/preset.json`);
    
    if (data && !error) {
      const preset = JSON.parse(await data.text());
      return {
        ...preset,
        id: preset.id || presetName,
        source: 'preset'
      };
    }
  } catch (error) {
    console.warn(`Failed to load preset ${presetName}:`, error.message);
  }
  
  return null;
}

// Choose style based on user request
export function chooseStyle(userRequest: string, examples: any[]) {
  const request = userRequest.toLowerCase();
  const scores = new Map<any, number>();
  
  // Enhanced keyword matching with scoring
  examples.forEach(example => {
    let score = 0;
    
    // Check direct name match
    if (example.id && request.includes(example.id.toLowerCase())) {
      score += 10;
    }
    
    // Check description
    const description = (example.description || '').toLowerCase();
    const descriptionWords = description.split(/\s+/);
    const requestWords = request.split(/\s+/);
    
    requestWords.forEach(word => {
      if (descriptionWords.includes(word) && word.length > 3) {
        score += 2;
      }
    });
    
    // Check mood
    const mood = (example.background?.mood || example.mood || '').toLowerCase();
    if (mood && request.includes(mood)) {
      score += 5;
    }
    
    // Check colors
    if (example.colors) {
      const colorKeywords = extractColorKeywords(request);
      colorKeywords.forEach(keyword => {
        if (JSON.stringify(example.colors).toLowerCase().includes(keyword)) {
          score += 3;
        }
      });
    }
    
    // Check effects
    if (example.effects) {
      const effectKeywords = extractEffectKeywords(request);
      effectKeywords.forEach(keyword => {
        if (JSON.stringify(example.effects).toLowerCase().includes(keyword)) {
          score += 3;
        }
      });
    }
    
    // Check tags
    if (example.tags && Array.isArray(example.tags)) {
      example.tags.forEach(tag => {
        if (request.includes(tag.toLowerCase())) {
          score += 4;
        }
      });
    }
    
    scores.set(example, score);
  });
  
  // Sort by score and return best match
  const sortedExamples = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);
  
  // Return best match if score is significant
  if (sortedExamples.length > 0 && sortedExamples[0][1] > 5) {
    console.log(`✅ Chosen style: ${sortedExamples[0][0].id} (score: ${sortedExamples[0][1]})`);
    return sortedExamples[0][0];
  }
  
  // Return null if no good match
  console.log('ℹ️ No specific style matched, will create custom');
  return null;
}

// Save user style configuration
export async function saveUserStyle(
  supabase: any,
  userId: string,
  styleName: string,
  configuration: WalletConfiguration
) {
  try {
    const fileName = `${userId}/${styleName}-${Date.now()}.json`;
    
    const { data, error } = await supabase.storage
      .from('user-styles')
      .upload(fileName, JSON.stringify(configuration, null, 2), {
        contentType: 'application/json',
        upsert: false
      });
    
    if (error) throw error;
    
    console.log(`✅ Saved user style: ${styleName}`);
    
    // Also save to database for quick access
    await supabase
      .from('user_saved_styles')
      .insert({
        user_id: userId,
        style_name: styleName,
        file_path: fileName,
        configuration: configuration,
        created_at: new Date().toISOString()
      });
    
    // Invalidate cache
    clearCache(`user-styles-${userId}`);
    
    return { success: true, path: fileName };
    
  } catch (error) {
    console.error('❌ Error saving user style:', error);
    return { success: false, error: error.message };
  }
}

// Load user styles
export async function loadUserStyles(supabase: any, userId: string) {
  try {
    const cacheKey = `user-styles-${userId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    // Load from database
    const { data, error } = await supabase
      .from('user_saved_styles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const styles = data || [];
    setCache(cacheKey, styles);
    
    return styles;
    
  } catch (error) {
    console.error('❌ Error loading user styles:', error);
    return [];
  }
}

// Save wow effect configuration
export async function saveWowEffect(
  supabase: any,
  effect: WowEffect,
  category: string
) {
  try {
    const fileName = `effects/${category}/${effect.id}.json`;
    
    const { data, error } = await supabase.storage
      .from('wow-effects')
      .upload(fileName, JSON.stringify(effect, null, 2), {
        contentType: 'application/json',
        upsert: true
      });
    
    if (error) throw error;
    
    console.log(`✅ Saved wow effect: ${effect.name}`);
    return { success: true, path: fileName };
    
  } catch (error) {
    console.error('❌ Error saving wow effect:', error);
    return { success: false, error: error.message };
  }
}

// Load wow effects library
export async function loadWowEffects(supabase: any) {
  try {
    const cached = getFromCache(CACHE_CONFIG.wowEffects.key);
    if (cached) return cached;
    
    const effects = [];
    const categories = ['visual', 'animation', 'interactive', 'advanced'];
    
    for (const category of categories) {
      const { data: files } = await supabase.storage
        .from('wow-effects')
        .list(`effects/${category}`, { limit: 100 });
      
      if (files) {
        for (const file of files) {
          if (file.name.endsWith('.json')) {
            const { data } = await supabase.storage
              .from('wow-effects')
              .download(`effects/${category}/${file.name}`);
            
            if (data) {
              const effect = JSON.parse(await data.text());
              effects.push({ ...effect, category });
            }
          }
        }
      }
    }
    
    setCache(CACHE_CONFIG.wowEffects.key, effects);
    return effects;
    
  } catch (error) {
    console.error('❌ Error loading wow effects:', error);
    return getDefaultWowEffects();
  }
}

// Cache AI responses for performance
export async function cacheAIResponse(
  supabase: any,
  requestHash: string,
  response: any
) {
  try {
    const cacheKey = `ai-response-${requestHash}`;
    setCache(cacheKey, response, CACHE_CONFIG.aiResponses.ttl);
    
    // Also save to database for longer persistence
    await supabase
      .from('ai_response_cache')
      .upsert({
        request_hash: requestHash,
        response: response,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    
    return true;
  } catch (error) {
    console.error('Failed to cache AI response:', error);
    return false;
  }
}

// Get cached AI response
export async function getCachedAIResponse(supabase: any, requestHash: string) {
  try {
    // Check memory cache first
    const cacheKey = `ai-response-${requestHash}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;
    
    // Check database
    const { data } = await supabase
      .from('ai_response_cache')
      .select('response')
      .eq('request_hash', requestHash)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (data) {
      setCache(cacheKey, data.response);
      return data.response;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Helper functions

function enhanceExampleMetadata(example: any) {
  return {
    ...example,
    tags: example.tags || extractTags(example),
    preview: example.images?.thumbnail || generatePreview(example),
    popularity: example.popularity || 0,
    effects: example.effects || [],
    compatibility: {
      wallets: example.compatibility?.wallets || ['phantom', 'metamask'],
      themes: example.compatibility?.themes || ['dark', 'light']
    }
  };
}

function extractTags(example: any): string[] {
  const tags = new Set<string>();
  
  // Extract from description
  const description = (example.description || '').toLowerCase();
  const tagKeywords = ['minimal', 'vibrant', 'dark', 'light', 'modern', 'retro', 'elegant', 'bold'];
  
  tagKeywords.forEach(keyword => {
    if (description.includes(keyword)) {
      tags.add(keyword);
    }
  });
  
  // Extract from mood
  if (example.mood) {
    tags.add(example.mood.toLowerCase());
  }
  
  // Extract from colors
  if (example.colors?.primary) {
    if (isColorDark(example.colors.primary)) {
      tags.add('dark-theme');
    } else {
      tags.add('light-theme');
    }
  }
  
  return Array.from(tags);
}

function generatePreview(example: any): string {
  // Generate a simple CSS gradient preview
  const colors = example.colors || { primary: '#9945ff', secondary: '#00d4ff' };
  return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary || colors.primary} 100%)`;
}

function extractColorKeywords(text: string): string[] {
  const keywords = [];
  const colorWords = ['red', 'blue', 'green', 'purple', 'pink', 'orange', 'yellow', 'black', 'white', 'gold', 'silver'];
  
  colorWords.forEach(color => {
    if (text.includes(color)) {
      keywords.push(color);
    }
  });
  
  return keywords;
}

function extractEffectKeywords(text: string): string[] {
  const keywords = [];
  const effectWords = ['glow', 'neon', 'gradient', 'shadow', 'blur', 'animation', 'particle', '3d', 'hover', 'transition'];
  
  effectWords.forEach(effect => {
    if (text.includes(effect)) {
      keywords.push(effect);
    }
  });
  
  return keywords;
}

function isColorDark(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Cache management functions

function getFromCache(key: string): any {
  const cached = memoryCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  memoryCache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttl?: number): void {
  const expires = Date.now() + (ttl || CACHE_CONFIG.designExamples.ttl);
  memoryCache.set(key, { data, expires });
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  
  Array.from(memoryCache.keys()).forEach(key => {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  });
}

// Default data fallbacks

function getDefaultExamples(): any[] {
  return [
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      description: 'Clean minimal design with dark theme',
      colors: {
        primary: '#ffffff',
        secondary: '#666666',
        background: '#000000',
        accent: '#0066ff'
      },
      mood: 'minimal',
      tags: ['minimal', 'dark', 'clean']
    },
    {
      id: 'neon-cyber',
      name: 'Neon Cyber',
      description: 'Cyberpunk style with neon accents',
      colors: {
        primary: '#00ff88',
        secondary: '#ff0088',
        background: '#0a0a0a',
        accent: '#00ffff'
      },
      mood: 'vibrant',
      tags: ['neon', 'cyberpunk', 'vibrant']
    }
  ];
}

function getDefaultWowEffects(): WowEffect[] {
  return [
    {
      id: 'glow-pulse',
      type: 'glow',
      name: 'Pulse Glow',
      description: 'Gentle pulsing glow effect',
      target: '.wallet-button',
      properties: {
        color: '#00ff88',
        size: '20px',
        duration: '2s'
      },
      category: 'visual',
      performance: 'low'
    },
    {
      id: 'gradient-shift',
      type: 'gradient',
      name: 'Gradient Shift',
      description: 'Smooth gradient color transition',
      target: '.wallet-background',
      properties: {
        colors: ['#ff0088', '#00ff88', '#0088ff'],
        duration: '10s'
      },
      category: 'visual',
      performance: 'medium'
    }
  ];
}

// Public cache functions for external use
export {
  cacheAIResponse as cacheResult,
  getCachedAIResponse as getCachedResult,
  clearCache
};
