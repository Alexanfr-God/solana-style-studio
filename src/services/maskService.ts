
import { MaskLayout } from '../stores/maskEditorStore';

// Mock function - in real app would call API
export const generateMask = async (prompt: string, uploadedImage: string | null): Promise<{
  imageUrl: string;
  layout: MaskLayout;
}> => {
  console.log("Generating mask with prompt:", prompt);
  console.log("Using uploaded image:", uploadedImage ? "yes" : "no");
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Sample mask image (in real app would be from API)
  const demoImageUrl = "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/public/demo-mask.png";
  
  // Sample layout JSON
  const demoLayout: MaskLayout = {
    layout: {
      top: "Character ears",
      bottom: "Character paws",
      left: null,
      right: null,
      core: "untouched"
    },
    theme: "Cartoon character",
    style: "flat cartoon / meme",
    color_palette: ["#f4d03f", "#222222", "#ffffff"],
    safe_zone: {
      x: "20%",
      y: "20%",
      width: "60%",
      height: "60%"
    }
  };
  
  return {
    imageUrl: demoImageUrl,
    layout: demoLayout
  };
};
