
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Image, X } from 'lucide-react';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';

const MaskImageUpload = () => {
  const { uploadedImage, setUploadedImage } = useMaskEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white font-medium">Upload Mask Image</span>
        {uploadedImage && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {uploadedImage ? (
        <div className="relative w-full h-32 rounded-md overflow-hidden bg-white/5">
          <img 
            src={uploadedImage} 
            alt="Uploaded mask" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Image
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-24 border-dashed border-white/30 bg-white/5 hover:bg-white/10 text-white/70 flex flex-col items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-6 w-6 mb-2 opacity-70" />
          <span>Upload a transparent PNG mask</span>
        </Button>
      )}

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
        ref={fileInputRef}
      />

      <div className="text-xs text-white/60 italic">
        For best results, use PNG images with transparent center for the wallet UI
      </div>
    </div>
  );
};

export default MaskImageUpload;
