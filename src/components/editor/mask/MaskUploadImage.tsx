
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

const MaskUploadImage = () => {
  const { setMaskImageUrl, maskImageUrl } = useMaskEditorStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded file
    const imageUrl = URL.createObjectURL(file);
    setMaskImageUrl(imageUrl);
  };

  return (
    <div className="w-full">
      <label 
        htmlFor="mask-upload" 
        className="cursor-pointer block w-full"
      >
        <Card className={`border-2 border-dashed border-white/20 shadow-none hover:border-primary/50 transition-colors ${maskImageUrl ? 'bg-black/40' : 'bg-black/20'}`}>
          <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
            {maskImageUrl ? (
              <div className="w-full aspect-square relative">
                <img 
                  src={maskImageUrl} 
                  alt="Uploaded wallet skin" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-white/70" />
                <p className="text-sm text-white/70">
                  Click to upload a wallet skin
                </p>
                <p className="text-xs text-white/50">
                  PNG with transparent center recommended
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </label>
      <input 
        type="file" 
        id="mask-upload" 
        accept="image/*" 
        className="sr-only" 
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default MaskUploadImage;
