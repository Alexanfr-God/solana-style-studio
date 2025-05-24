
import { useRef, useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

export const useImageUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setExternalMask, setMaskImageUrl, setPrompt } = useMaskEditorStore();

  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!/image\/(png|jpg|jpeg|webp|svg\+xml)/.test(file.type)) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP, SVG)');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const imageUrl = await processImage(file);
      
      setExternalMask(imageUrl);
      setMaskImageUrl(imageUrl);
      
      setIsAnalyzing(true);
      
      setTimeout(() => {
        const imageType = file.name.toLowerCase().includes('abstract') 
          ? 'abstract pattern' 
          : file.name.toLowerCase().includes('cat') 
          ? 'cat-themed' 
          : 'custom design';
        
        setPrompt(`Create a ${imageType} wallet costume based on the uploaded image`);
        setIsAnalyzing(false);
        toast.success('Image uploaded successfully - check the wallet preview');
      }, 1500);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    fileInputRef,
    isLoading,
    isAnalyzing,
    handleFileChange,
    triggerUpload
  };
};
