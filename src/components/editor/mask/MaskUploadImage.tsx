
import React, { useRef, useState } from 'react';
import { Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

interface MaskUploadImageProps {
  disabled?: boolean;
}

const MaskUploadImage = ({ disabled = false }: MaskUploadImageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setExternalMask, externalMask, maskImageUrl, setMaskImageUrl } = useMaskEditorStore();
  
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
      const imageUrl = URL.createObjectURL(file);
      // For V3, we set both for compatibility
      setExternalMask(imageUrl);
      setMaskImageUrl(imageUrl);
      
      toast.success('Image uploaded successfully');
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
          <div className="w-full h-32 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
            <img
              src={externalMask || maskImageUrl || ''}
              alt="Uploaded mask"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-white/10"
            onClick={handleRemoveImage}
            disabled={disabled || isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Remove Image
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-32 border-dashed border-white/20 flex flex-col items-center justify-center gap-2"
          onClick={handleUploadClick}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              <span className="text-sm">Upload your own mask image</span>
              <span className="text-xs text-white/50">(PNG, JPG, SVG or WEBP)</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default MaskUploadImage;
