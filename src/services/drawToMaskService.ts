
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Generates minimalist cat mask using AI based on user drawing
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🐱 === STARTING AI CAT MASK GENERATION ===');
    console.log('Drawing size:', drawingImageBase64.length);
    console.log('Using style transfer:', useStyleTransfer);
    
    // Call the Supabase Edge Function for cat mask generation
    const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
      body: {
        drawingImageBase64: drawingImageBase64,
        useStyleTransfer: useStyleTransfer
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }

    if (!data || !data.mask_image_url) {
      console.error('Invalid response from edge function:', data);
      throw new Error('No mask image returned from AI');
    }

    const result = {
      imageUrl: data.mask_image_url,
      layoutJson: data.layout_json || {
        layout: {
          top: "AI-generated cat head",
          bottom: "AI-generated cat paws", 
          left: null,
          right: null,
          core: "transparent wallet area"
        },
        style: "ai-generated-minimalist-cat",
        color_palette: ["#000000", "#ffffff"],
        generation_method: useStyleTransfer ? "dall-e-stylized" : "dall-e-minimalist"
      }
    };

    console.log('✅ === SUCCESSFUL CAT MASK GENERATION ===');
    console.log('Generated mask URL:', result.imageUrl);
    
    toast.success('Minimalist cat mask created!', {
      description: 'AI generated a cute cat design around your wallet'
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 === CAT MASK GENERATION FAILURE ===');
    console.error('Error details:', error);
    
    // Fallback to predefined cat mask
    toast.error('AI generation failed. Using fallback cat mask.');
    return createCatFallbackResponse();
  }
}

/**
 * Creates a fallback response with predefined cat mask
 */
function createCatFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackCatMask = '/external-masks/cats-mask.png';
  
  console.log('🚨 Using fallback cat mask:', fallbackCatMask);
  
  return {
    imageUrl: fallbackCatMask,
    layoutJson: {
      layout: {
        top: "Fallback cat head",
        bottom: "Fallback cat paws",
        left: null,
        right: null,
        core: "transparent wallet area"
      },
      style: "fallback-cat",
      color_palette: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
      generation_method: "fallback"
    }
  };
}
