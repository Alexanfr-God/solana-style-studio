
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { toast } from 'sonner';

const ImageUploadSection = () => {
  const { uploadedImage, setUploadedImage } = useWalletCustomizationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setIsUploading(false);
      toast.success("Style inspiration image uploaded!");
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to upload image. Please try again.");
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success("Image removed");
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Style Inspiration</h3>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {uploadedImage ? (
          <div className="relative">
            <img 
              src={uploadedImage} 
              alt="Style inspiration" 
              className="w-full h-48 rounded-lg object-cover"
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Style Reference
            </div>
          </div>
        ) : (
          <div className="w-full py-12 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Image className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">Upload inspiration image</p>
              <p className="text-white/60 text-sm">
                AI will analyze colors, patterns, and style
              </p>
            </div>
            <Button 
              onClick={handleUploadClick} 
              variant="secondary" 
              className="mt-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
