
import React, { useRef, useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

interface MaskUploadImageProps {
  disabled?: boolean;
}

const MaskUploadImage = ({ disabled = false }: MaskUploadImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setExternalMask, externalMask, maskImageUrl, setMaskImageUrl, setPrompt } = useMaskEditorStore();
  
  // Process the uploaded image
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
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
      // Process the image
      const imageUrl = await processImage(file);
      
      // For V3, we set both for compatibility
      setExternalMask(imageUrl);
      setMaskImageUrl(imageUrl);
      
      // Show analyzing state
      setIsAnalyzing(true);
      
      // Set a default prompt based on the image type
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
  
  const handleRemoveImage = () => {
    setExternalMask(null);
    setMaskImageUrl(null);
    toast.success('Mask removed from wallet preview');
  };
  
  const hasImage = externalMask || maskImageUrl;
  
  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />
      
      {hasImage ? (
        <div className="flex flex-col gap-2">
          <div className="relative w-full h-20 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
            <img
              src={externalMask || maskImageUrl || ''}
              alt="Uploaded mask"
              className="max-w-full max-h-full object-contain"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400 mb-1" />
                <p className="text-xs text-white/80">Processing...</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/10"
              onClick={handleUploadClick}
              disabled={disabled || isLoading}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Replace
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-white/10 hover:border-red-500/50 hover:text-red-400"
              onClick={handleRemoveImage}
              disabled={disabled || isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-20 border-dashed border-white/20 flex flex-col items-center justify-center gap-1"
          onClick={handleUploadClick}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload mask image</span>
              <span className="text-xs text-white/50">(PNG, JPG, SVG or WEBP)</span>
            </>
          )}
        </Button>
      )}
      
      {hasImage && !isAnalyzing && (
        <p className="text-xs text-white/60 mt-2 italic">
          ✓ Image loaded - check the wallet preview to see your mask
        </p>
      )}
    </div>
  );
};

export default MaskUploadImage;
