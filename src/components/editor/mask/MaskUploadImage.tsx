
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { useImageUpload } from '@/hooks/useImageUpload';
import ImageUploadButton from './upload/ImageUploadButton';
import UploadedImageDisplay from './upload/UploadedImageDisplay';

interface MaskUploadImageProps {
  disabled?: boolean;
}

const MaskUploadImage = ({ disabled = false }: MaskUploadImageProps) => {
  const { externalMask, maskImageUrl } = useMaskEditorStore();
  const { 
    fileInputRef, 
    isLoading, 
    isAnalyzing, 
    handleFileChange, 
    triggerUpload 
  } = useImageUpload();

  const hasImage = externalMask || maskImageUrl;
  const imageUrl = externalMask || maskImageUrl || '';

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
        <UploadedImageDisplay
          imageUrl={imageUrl}
          isAnalyzing={isAnalyzing}
          onReplace={triggerUpload}
          disabled={disabled || isLoading}
        />
      ) : (
        <ImageUploadButton
          onClick={triggerUpload}
          disabled={disabled}
          isLoading={isLoading}
        />
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
