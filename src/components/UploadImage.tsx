import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../stores/customizationStore';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { frontendLogger } from '@/services/frontendLogger';

const UploadImage = () => {
  const { uploadedImage, setUploadedImage } = useCustomizationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      await frontendLogger.logUserError('FILE_TOO_LARGE', `File size: ${file.size} bytes`, 'upload_image');
      toast({
        title: "Image too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const imageUrl = reader.result as string;
      setUploadedImage(imageUrl);
      setIsUploading(false);
      
      // Log successful upload
      await frontendLogger.logImageUpload(imageUrl, file.size, file.type);
      
      toast({
        title: "Image uploaded",
        description: "Your reference image has been uploaded",
      });
    };
    
    reader.onerror = async () => {
      setIsUploading(false);
      
      // Log upload error
      await frontendLogger.logUserError('UPLOAD_ERROR', 'FileReader error', 'upload_image');
      
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Log image removal
    await frontendLogger.logUserInteraction('generate', 'upload_image', 'Image removed');
    
    toast({
      title: "Image removed",
      description: "Reference image has been removed",
    });
  };

  return (
    <div className="flex flex-col space-y-4">
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
            alt="Uploaded reference" 
            className="w-full h-auto rounded-md object-cover aspect-video"
          />
          <Button 
            variant="destructive" 
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleUploadClick} 
          variant="outline" 
          className="w-full py-8 border-dashed flex flex-col items-center justify-center gap-2"
          disabled={isUploading}
        >
          <Upload className="h-5 w-5" />
          <div className="text-sm">
            {isUploading ? 'Uploading...' : 'Upload reference image'}
          </div>
        </Button>
      )}
    </div>
  );
};

export default UploadImage;
