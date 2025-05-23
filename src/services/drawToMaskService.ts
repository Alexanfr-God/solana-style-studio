
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🐱 === STARTING AI CAT MASK GENERATION ===');
    console.log('Drawing data length:', drawingImageBase64?.length || 0);
    console.log('Drawing data preview:', drawingImageBase64?.substring(0, 50));
    console.log('Style transfer enabled:', useStyleTransfer);
    
    if (!drawingImageBase64 || drawingImageBase64.length < 100) {
      throw new Error('Invalid drawing data provided');
    }
    
    // Show progress to user
    toast.info('🎨 Analyzing your cat drawing...', {
      description: 'AI is creating a professional cat mask design'
    });
    
    console.log('📡 Calling Supabase Edge Function...');
    
    // Call the Supabase Edge Function for cat mask generation
    const { data, error } = await supabase.functions.invoke('generate-mask-from-drawing', {
      body: {
        drawingImageBase64: drawingImageBase64,
        useStyleTransfer: useStyleTransfer
      }
    });

    console.log('📡 Edge function response received');
    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }

    if (!data) {
      console.error('❌ No data returned from edge function');
      throw new Error('No response from AI generation service');
    }

    if (!data.mask_image_url) {
      console.error('❌ No mask image URL in response:', data);
      throw new Error('No mask image returned from AI');
    }

    console.log('🔍 Validating generated mask URL...');
    console.log('Mask URL:', data.mask_image_url);
    
    // Test if the URL is accessible (only for remote URLs)
    if (data.mask_image_url.startsWith('http')) {
      try {
        const testResponse = await fetch(data.mask_image_url, { method: 'HEAD' });
        console.log('URL test response status:', testResponse.status);
        if (!testResponse.ok) {
          console.warn('⚠️ Generated URL may not be accessible:', testResponse.status);
        }
      } catch (urlError) {
        console.warn('⚠️ Could not verify URL accessibility:', urlError);
      }
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
        style: "ai-generated-cat",
        color_palette: ["#000000", "#ffffff"],
        generation_method: data.layout_json?.generation_method || "dall-e-3",
        cat_type: data.layout_json?.cat_type || "sitting"
      }
    };

    console.log('✅ === SUCCESSFUL CAT MASK GENERATION ===');
    console.log('Final result:', result);
    
    toast.success('🐱 Cat mask created successfully!', {
      description: `AI generated a ${result.layoutJson.cat_type} cat design`
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 === CAT MASK GENERATION FAILURE ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    // Enhanced fallback
    toast.error('❌ AI generation failed. Using demo cat mask.');
    return createEnhancedFallbackResponse();
  }
}

function createEnhancedFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackMask = '/external-masks/cats-mask.png';
  
  console.log('🚨 Using enhanced fallback cat mask:', fallbackMask);
  
  return {
    imageUrl: fallbackMask,
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
      generation_method: "fallback-local",
      cat_type: "demo"
    }
  };
}
