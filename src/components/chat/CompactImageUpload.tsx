
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { X, Loader2, Image } from 'lucide-react';
import { useCompactImageUpload } from '@/hooks/useCompactImageUpload';

interface CompactImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

const CompactImageUpload: React.FC<CompactImageUploadProps> = ({ 
  onImageUploaded, 
  onImageRemoved,
  disabled 
}) => {
  const {
    uploadedImageUrl,
    isUploading,
    fileInputRef,
    handleFileChange,
    openFileDialog,
    removeImage
  } = useCompactImageUpload(onImageUploaded); // Pass callback directly to hook

  const handleRemove = () => {
    console.log('[UPLOAD] Removing uploaded image');
    removeImage();
    onImageRemoved();
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={openFileDialog}
            disabled={disabled || isUploading}
            className="border-white/20 text-white/80 hover:text-white w-10 h-10"
            aria-label="Upload image"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload image (Recommended: 1024×1024)</p>
        </TooltipContent>
      </Tooltip>

      {uploadedImageUrl && (
        <Badge variant="secondary" className="flex items-center gap-1 max-w-32">
          <div className="w-4 h-4 rounded bg-green-500/20 flex-shrink-0" />
          <span className="text-xs truncate">Image ready</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-4 w-4 p-0 hover:bg-destructive/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
    </div>
  );
};

export default CompactImageUpload;
