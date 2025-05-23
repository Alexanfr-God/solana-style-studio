
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  try {
    console.log('🐱 === STARTING AI CAT MASK GENERATION ===');
    console.log('Drawing data length:', drawingImageBase64?.length || 0);
    console.log('Style transfer enabled:', useStyleTransfer);
    
    if (!drawingImageBase64 || drawingImageBase64.length < 100) {
      throw new Error('Invalid drawing data provided');
    }
    
    toast.info('🎨 Analyzing your cat drawing...', {
      description: 'AI is creating a professional cat mask design'
    });
    
    console.log('📡 Calling Supabase Edge Function...');
    
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

    // The Edge Function now returns imageUrl directly (as base64)
    if (!data.imageUrl) {
      console.error('❌ No imageUrl in response:', data);
      throw new Error('No mask image returned from AI');
    }

    console.log('✅ Received image data type:', data.imageUrl.startsWith('data:') ? 'base64' : 'url');
    console.log('✅ Image data length:', data.imageUrl.length);
    
    const result = {
      imageUrl: data.imageUrl, // This is now base64 or local path
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
        generation_method: data.layout_json?.generation_method || "dall-e-3-base64",
        cat_type: data.layout_json?.cat_type || "sitting"
      }
    };

    console.log('✅ === SUCCESSFUL CAT MASK GENERATION ===');
    console.log('Final result imageUrl type:', result.imageUrl.startsWith('data:') ? 'base64' : 'local');
    
    toast.success('🐱 Cat mask created successfully!', {
      description: `AI generated a ${result.layoutJson.cat_type} cat design`
    });
    
    return result;
    
  } catch (error) {
    console.error('💥 === CAT MASK GENERATION FAILURE ===');
    console.error('Error details:', error);
    
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
