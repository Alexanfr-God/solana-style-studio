
import React, { useState } from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const MaskUploadImage = () => {
  const { setMaskImageUrl, maskImageUrl } = useMaskEditorStore();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `mask-uploads/${fileName}`;
      
      // Create the bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('mask-uploads');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        await supabase.storage.createBucket('mask-uploads', {
          public: true,
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('mask-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('mask-uploads')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB");
      return;
    }

    setIsUploading(true);
    
    try {
      // First upload to Supabase Storage
      const publicUrl = await uploadImageToSupabase(file);
      
      if (!publicUrl) {
        toast.error("Failed to upload image. Please try again.");
        setIsUploading(false);
        return;
      }

      // Set the public URL in the store
      setMaskImageUrl(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Error during upload:', error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label 
        htmlFor="mask-upload" 
        className={`cursor-pointer block w-full ${isUploading ? 'pointer-events-none' : ''}`}
      >
        <Card className={`border-2 border-dashed border-white/20 shadow-none hover:border-primary/50 transition-colors ${maskImageUrl ? 'bg-black/40' : 'bg-black/20'}`}>
          <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
            {isUploading ? (
              <div className="py-8 flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-white/70 animate-spin mb-2" />
                <p className="text-sm text-white/70">
                  Uploading image...
                </p>
              </div>
            ) : maskImageUrl ? (
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
        disabled={isUploading}
      />
    </div>
  );
};

export default MaskUploadImage;
