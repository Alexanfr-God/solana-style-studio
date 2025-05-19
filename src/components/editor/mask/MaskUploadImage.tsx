
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MaskUploadImage = () => {
  const { maskImageUrl, setMaskImageUrl } = useMaskEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setMaskImageUrl(reader.result as string);
      setIsUploading(false);
      toast({
        title: "Mask uploaded",
        description: "Your mask image has been uploaded",
      });
    };
    
    reader.onerror = () => {
      setIsUploading(false);
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

  const handleRemoveImage = () => {
    setMaskImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast({
      title: "Image removed",
      description: "Mask image has been removed",
    });
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new change event
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        // Trigger the onChange handler
        const event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
      }
    }
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
      
      {maskImageUrl ? (
        <div className="relative">
          <img 
            src={maskImageUrl} 
            alt="Uploaded mask" 
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
        <div
          className={`w-full py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
            isDragging ? 'bg-white/20 border-primary' : 'bg-white/5 border-white/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 rounded-full bg-white/10">
              <Image className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Upload a mask image with transparent center</p>
              <p className="text-xs text-white/60 mt-1">PNG with transparency works best</p>
            </div>
            <Button 
              onClick={handleUploadClick} 
              variant="secondary" 
              className="mt-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Mask'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaskUploadImage;
