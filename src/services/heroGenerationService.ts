
import { supabase } from '@/integrations/supabase/client';

export interface HeroGenerationRequest {
  style: string;
  mood: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface HeroResult {
  layer: string;
  imageUrl: string;
}

export const generateHeroesForAllLayers = async (
  request: HeroGenerationRequest
): Promise<{ [key: string]: string }> => {
  const layers = [
    'login', 'home', 'apps', 'swap', 'history', 
    'search', 'receive', 'send', 'buy'
  ];

  const heroes: { [key: string]: string } = {};

  try {
    // Generate heroes for all layers in parallel
    const generationPromises = layers.map(async (layer) => {
      const { data, error } = await supabase.functions.invoke('generate-hero-character', {
        body: {
          style: request.style,
          layer: layer,
          mood: request.mood,
          colors: request.colors
        }
      });

      if (error) {
        console.error(`Error generating hero for ${layer}:`, error);
        return null;
      }

      return {
        layer,
        imageUrl: data.imageUrl
      };
    });

    const results = await Promise.all(generationPromises);
    
    // Collect successful results
    results.forEach(result => {
      if (result) {
        heroes[result.layer] = result.imageUrl;
      }
    });

    console.log('Generated heroes for layers:', Object.keys(heroes));
    return heroes;
    
  } catch (error) {
    console.error('Error generating heroes:', error);
    throw error;
  }
};

export const generateSingleHero = async (
  layer: string,
  request: HeroGenerationRequest
): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-hero-character', {
      body: {
        style: request.style,
        layer: layer,
        mood: request.mood,
        colors: request.colors
      }
    });

    if (error) {
      throw new Error(`Error generating hero for ${layer}: ${error.message}`);
    }

    return data.imageUrl;
  } catch (error) {
    console.error(`Error generating single hero for ${layer}:`, error);
    throw error;
  }
};
