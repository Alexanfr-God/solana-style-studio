
import { supabase } from '@/integrations/supabase/client';

// ARCHIVED: Legacy image generation functionality
// Tables moved to archive schema: archive.generated_images, archive.image_feedback
// This service is kept for reference but disabled by default

export interface ImageGenerationRequest {
  prompt: string;
  userId?: string;
  style?: string;
  aspectRatio?: string;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  id: string;
}

export class ImageGeneratorService {
  // ARCHIVED: Legacy functionality - disabled
  static async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.warn('🚫 ImageGeneratorService is archived. Use new AI services instead.');
    throw new Error('ImageGeneratorService is archived. Functionality moved to new AI services.');
  }

  // ARCHIVED: Legacy functionality - disabled
  static async saveGeneratedImage(imageUrl: string, prompt: string, userId: string) {
    console.warn('🚫 saveGeneratedImage is archived. Tables moved to archive schema.');
    // Commented out to prevent calls to archived tables
    // const { data, error } = await supabase
    //   .from('generated_images') // Now archive.generated_images
    //   .insert({
    //     image_url: imageUrl,
    //     prompt,
    //     user_id: userId,
    //   });
    
    throw new Error('saveGeneratedImage is archived. Use new AI services instead.');
  }

  // ARCHIVED: Legacy functionality - disabled
  static async getUserGeneratedImages(userId: string) {
    console.warn('🚫 getUserGeneratedImages is archived. Tables moved to archive schema.');
    // Commented out to prevent calls to archived tables
    // const { data, error } = await supabase
    //   .from('generated_images') // Now archive.generated_images
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });
    
    throw new Error('getUserGeneratedImages is archived. Use new AI services instead.');
  }
}
