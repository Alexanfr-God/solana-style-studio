
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface MaskUploadImageProps {
  disabled?: boolean;
}

const MaskUploadImage = ({ disabled = false }: MaskUploadImageProps) => {
  const { maskImageUrl, setMaskImageUrl } = useMaskEditorStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, WEBP)");
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }

    setIsUploading(true);
    try {
      // Create a unique filename to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `mask-uploads/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }

      // Set the public URL to the store
      setMaskImageUrl(urlData.publicUrl);
      toast.success("Image uploaded successfully");

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error 
          ? `Upload failed: ${error.message}` 
          : "Upload failed: Unknown error"
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setMaskImageUrl(null);
    toast.info("Image removed");
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center bg-black/20">
        {maskImageUrl ? (
          <div className="w-full space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-md relative">
              <img 
                src={maskImageUrl} 
                alt="Uploaded mask" 
                className="w-full h-full object-cover"
              />
            </div>
            <Button 
              variant="destructive" 
              onClick={handleRemoveImage} 
              className="w-full"
              size="sm"
              disabled={disabled}
            >
              Remove Image
            </Button>
          </div>
        ) : (
          <>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              disabled={isUploading || disabled}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || disabled}
              className="border-white/10 text-white w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </>
              )}
            </Button>
            <p className="text-xs text-white/40 mt-2 text-center">
              Upload an image to use as a reference
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MaskUploadImage;
