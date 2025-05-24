
import React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const ImageUploadButton = ({ onClick, disabled = false, isLoading = false }: ImageUploadButtonProps) => {
  return (
    <Button
      variant="outline"
      className="w-full h-20 border-dashed border-white/20 flex flex-col items-center justify-center gap-1"
      onClick={onClick}
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
  );
};

export default ImageUploadButton;
