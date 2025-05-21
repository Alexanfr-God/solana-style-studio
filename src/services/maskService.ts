
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mask, MaskLayout } from '@/stores/maskEditorStore';
import { v4 as uuidv4 } from 'uuid';

// Default safe zone dimensions for the mask generator
const DEFAULT_SAFE_ZONE = {
  x: 0,
  y: 0,
  width: 320,
  height: 569
};

// Interface for the generated mask response
interface GeneratedMask {
  id: string;
  imageUrl: string;
  prompt?: string;
  layer?: string;
}

// Interface for storing mask in database
interface MaskData {
  id: string;
  image_url: string;
  prompt: string;
  layer_type: string;
  status: string;
}

/**
 * Generates a mask using the Supabase Edge Function
 */
export const generateMask = async (
  prompt: string,
  layer: string = 'login',
  referenceImageUrl?: string | null,
): Promise<GeneratedMask> => {
  try {
    // For demo purposes, we're using hardcoded sample images
    // In production, this would call an actual AI service
    
    // Sample image URLs for different types of prompts
    const sampleMasks = [
      '/lovable-uploads/9388ce6f-be1d-42c8-b4d3-8d38453996a9.png', // Cute cats
      '/lovable-uploads/d4fc8532-6040-450a-a8cf-d1d459c42e46.png', // Cyberpunk
      '/lovable-uploads/f2da1dab-e2e7-4a42-bcb5-8a24a140d4fc.png', // Pepe style
      '/lovable-uploads/a8a0aa8b-cabe-4031-b6c4-c3fd3c4007cd.png', // Abstract
    ];
    
    // For demo - select an image based on the prompt content
    let selectedMaskIndex = 0;
    
    if (prompt.toLowerCase().includes('cyber') || prompt.toLowerCase().includes('hack')) {
      selectedMaskIndex = 1;
    } else if (prompt.toLowerCase().includes('abstract') || prompt.toLowerCase().includes('geometric')) {
      selectedMaskIndex = 3;
    } else if (prompt.toLowerCase().includes('pepe') || prompt.toLowerCase().includes('meme')) {
      selectedMaskIndex = 2;
    }
    
    // In a real implementation, we would call the AI service here
    // const { data, error } = await supabase.functions.invoke('generate-wallet-mask', {
    //   body: { 
    //     prompt, 
    //     layer,
    //     referenceImageUrl
    //   }
    // });
    
    // if (error) {
    //   console.error('Error generating mask:', error);
    //   throw new Error(error.message || 'Failed to generate mask');
    // }
    
    // Use the mock data for now
    const mockResponse = {
      id: uuidv4(),
      imageUrl: sampleMasks[selectedMaskIndex],
      prompt,
      layer
    };
    
    // Save the generated mask to the ai_requests table
    await saveMaskToDatabase({
      id: mockResponse.id,
      image_url: mockResponse.imageUrl,
      prompt: prompt,
      layer_type: layer,
      status: 'completed'
    });
    
    return mockResponse;
  } catch (error) {
    console.error('Error in generateMask:', error);
    throw error;
  }
};

/**
 * Saves a generated mask to the database
 */
const saveMaskToDatabase = async (maskData: MaskData): Promise<void> => {
  try {
    const { error } = await supabase
      .from('ai_requests')
      .insert([
        {
          id: maskData.id,
          prompt: maskData.prompt,
          image_url: maskData.image_url,
          layer_type: maskData.layer_type,
          status: maskData.status
        }
      ]);
      
    if (error) {
      console.error('Error saving mask to database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in saveMaskToDatabase:', error);
    // Don't throw here to prevent blocking the user experience
  }
};

/**
 * Fetches all masks from the database
 */
export const fetchAllMasks = async (): Promise<Mask[]> => {
  try {
    // Get masks from the ai_requests table that are for wallet masks
    const { data: requestData, error: requestError } = await supabase
      .from('ai_requests')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    
    if (requestError) {
      throw requestError;
    }
    
    // Transform the data to the Mask interface
    const masks: Mask[] = requestData
      .filter(item => item.image_url) // Only include items with image URLs
      .map(item => {
        // Create a default layout
        const layout: MaskLayout = {
          top: null,
          bottom: null,
          left: null,
          right: null,
          core: 'transparent'
        };
        
        return {
          id: item.id,
          imageUrl: item.image_url,
          layout: layout,
          theme: 'default',
          style: item.layer_type || 'login',
          colorPalette: ['#000000', '#FFFFFF'],
          safeZone: DEFAULT_SAFE_ZONE,
          name: `Mask ${item.id.substring(0, 8)}`
        };
      });
    
    return masks;
  } catch (error) {
    console.error('Error fetching masks:', error);
    toast.error('Failed to load masks');
    return [];
  }
};

/**
 * Get a specific mask by ID
 */
export const getMaskById = async (maskId: string): Promise<Mask | null> => {
  try {
    // Get mask from the ai_requests table
    const { data, error } = await supabase
      .from('ai_requests')
      .select('*')
      .eq('id', maskId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return null;
    }
    
    // Create a default layout
    const layout: MaskLayout = {
      top: null,
      bottom: null,
      left: null,
      right: null,
      core: 'transparent'
    };
    
    const mask: Mask = {
      id: data.id,
      imageUrl: data.image_url,
      layout: layout,
      theme: 'default',
      style: data.layer_type || 'login',
      colorPalette: ['#000000', '#FFFFFF'],
      safeZone: DEFAULT_SAFE_ZONE,
      name: `Mask ${data.id.substring(0, 8)}`
    };
    
    return mask;
  } catch (error) {
    console.error('Error fetching mask by ID:', error);
    toast.error('Failed to load mask');
    return null;
  }
};
