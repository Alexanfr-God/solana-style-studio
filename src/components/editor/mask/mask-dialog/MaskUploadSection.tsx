
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface MaskUploadSectionProps {
  customMask: string | null;
  setCustomMask: (mask: string | null) => void;
  handleRemoveMask: () => void;
}

export const MaskUploadSection = ({ customMask, setCustomMask, handleRemoveMask }: MaskUploadSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Check if the file is a PNG
    if (file.type !== 'image/png') {
      toast.error('Please upload a PNG image with transparency');
      return;
    }
    
    setIsUploading(true);
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setCustomMask(e.target.result);
        setIsUploading(false);
        toast.success('Mask uploaded successfully');
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read the file');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleTryExampleMask = () => {
    // Use a sample Pepe-style mask image
    setCustomMask('/lovable-uploads/f2da1dab-e2e7-4a42-bcb5-8a24a140d4fc.png');
    toast.success('Example mask applied');
  };

  return (
    <div className="rounded-lg border border-white/10 p-4 bg-black/30">
      <h3 className="text-white font-medium mb-3">Upload your custom mask</h3>
      <p className="text-sm text-white/60 mb-4">
        Upload a PNG with transparent center. This is a demo of how Wallet Coast masks will work.
      </p>
      
      <div className="flex flex-col space-y-4">
        {customMask ? (
          <div className="relative">
            <img 
              src={customMask} 
              alt="Custom mask" 
              className="w-full h-auto object-contain bg-white/5 rounded-lg p-2"
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="absolute top-2 right-2" 
              onClick={handleRemoveMask}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 bg-black/20">
            <Upload className="h-10 w-10 text-white/40 mb-3" />
            <p className="text-white/60 text-center mb-4">Drag & drop a PNG or click to browse</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById('mask-upload')?.click()}
              disabled={isUploading}
              className="bg-white/5 border-white/10 text-white"
            >
              {isUploading ? 'Uploading...' : 'Upload PNG Mask'}
            </Button>
            <input
              id="mask-upload"
              type="file"
              accept="image/png"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button
          onClick={handleTryExampleMask}
          className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white"
        >
          Try Example Mask
        </Button>
        
        <Button
          variant="outline"
          onClick={handleRemoveMask}
          className="border-white/10 text-white flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Remove Mask
        </Button>
      </div>
    </div>
  );
};
