
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const ImageUploadSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { uploadedImage, setUploadedImage } = useWalletCustomizationStore();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
        toast.success('Image uploaded - ready for customization!');
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error('Error uploading image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Error processing file');
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    toast.info('Image removed');
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Upload Style Inspiration
            </h2>
            <p className="text-gray-400 text-sm">
              Upload an image to generate your custom wallet style
            </p>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-4">
            {!uploadedImage ? (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload" 
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  ) : (
                    <Upload className="w-12 h-12 text-white/60" />
                  )}
                  <div className="text-white/80">
                    <p className="font-medium">
                      {isUploading ? 'Uploading...' : 'Click to Upload Image'}
                    </p>
                    <p className="text-sm text-white/60 mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                  <Image className="w-3 h-3 inline mr-1" />
                  Ready for customization
                </div>
              </div>
            )}
          </div>

          {/* Simple Info Section */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <h4 className="text-purple-300 font-medium mb-2 text-sm">
              🎨 How it works
            </h4>
            <div className="text-purple-200 text-xs space-y-1">
              <p>1. Upload your inspiration image</p>
              <p>2. Click "Customize Wallet" below</p>
              <p>3. AI will analyze and apply the style</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUploadSection;
