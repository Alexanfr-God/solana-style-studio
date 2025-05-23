
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Generates AI cat mask using simplified approach
 */
export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🐱 === STARTING AI CAT MASK GENERATION ===');
    console.log('Drawing data length:', drawingImageBase64.length);
    console.log('Style transfer enabled:', useStyleTransfer);
    
    // Show progress to user
    toast.info('Analyzing your cat drawing...', {
      description: 'AI is creating a professional cat mask design'
    });
    
    // Call the Supabase Edge Function for cat mask generation
    const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
      body: {
        drawingImageBase64: drawingImageBase64,
        useStyleTransfer: useStyleTransfer
      }
    });

    console.log('Edge function response:', { data, error });

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
          top: "AI-generated cat head with ears",
          bottom: "AI-generated cat paws and body", 
          left: null,
          right: null,
          core: "transparent wallet area"
        },
        style: "ai-generated-minimalist-cat",
        color_palette: ["#000000", "#ffffff"],
        generation_method: useStyleTransfer ? "dall-e-stylized" : "dall-e-minimalist",
        cat_type: data.layout_json?.cat_type || "sitting"
      }
    };

    console.log('✅ === SUCCESSFUL CAT MASK GENERATION ===');
    console.log('Generated mask URL:', result.imageUrl);
    console.log('Layout analysis:', result.layoutJson);
    
    toast.success('Cat mask created successfully!', {
      description: `AI generated a ${result.layoutJson.cat_type} cat design around your wallet`
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 === CAT MASK GENERATION FAILURE ===');
    console.error('Error details:', error);
    
    // Enhanced fallback with rotation
    toast.error('AI generation failed. Using demo cat mask.');
    return createCatFallbackResponse();
  }
}

/**
 * Creates a fallback response with predefined cat mask (rotated for variety)
 */
function createCatFallbackResponse(): { imageUrl: string; layoutJson: any } {
  // Rotate through different cat masks for variety
  const catMasks = [
    '/external-masks/cats-mask.png',
    '/external-masks/pepe-mask.png',
    '/external-masks/abstract-mask.png'
  ];
  
  const randomIndex = Math.floor(Math.random() * catMasks.length);
  const selectedMask = catMasks[randomIndex];
  
  console.log('🚨 Using fallback cat mask:', selectedMask);
  
  return {
    imageUrl: selectedMask,
    layoutJson: {
      layout: {
        top: "Demo cat head design",
        bottom: "Demo cat paws and body",
        left: null,
        right: null,
        core: "transparent wallet area"
      },
      style: "demo-cat-fallback",
      color_palette: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
      generation_method: "fallback-demo",
      cat_type: "demo"
    }
  };
}
