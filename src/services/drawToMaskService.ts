
import { toast } from 'sonner';

export async function generateMaskFromDrawing(
  drawingImageBase64: string,
  useStyleTransfer: boolean = false
): Promise<{ imageUrl: string; layoutJson: any } | undefined> {
  console.log('🚫 Draw to mask service is temporarily disabled');
  
  toast.error('🚫 Mask generation temporarily disabled', {
    description: 'This feature is under maintenance'
  });
  
  return createDisabledFallbackResponse();
}

function createDisabledFallbackResponse(): { imageUrl: string; layoutJson: any } {
  const fallbackMask = '/external-masks/cats-mask.png';
  
  console.log('🚨 Using disabled fallback mask:', fallbackMask);
  
  return {
    imageUrl: fallbackMask,
    layoutJson: {
      layout: {
        top: "Service temporarily disabled",
        bottom: "Please try again later",
        left: null,
        right: null,
        core: "transparent wallet area"
      },
      style: "disabled-fallback",
      color_palette: ["#ff6b6b", "#4ecdc4"],
      generation_method: "disabled-service",
      cat_type: "unavailable"
    }
  };
}
