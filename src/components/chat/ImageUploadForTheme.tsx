
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadForThemeProps {
  onImageUploaded: (imageUrl: string) => void;
  uploadedImageUrl?: string;
  onImageRemoved: () => void;
}

const ImageUploadForTheme: React.FC<ImageUploadForThemeProps> = ({ 
  onImageUploaded, 
  uploadedImageUrl,
  onImageRemoved 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select an image file (JPG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `theme-upload-${Date.now()}.${fileExt}`;
      const filePath = `theme-uploads/${fileName}`;

      console.log('🖼️ [STORAGE] Starting theme image upload:', {
        fileName,
        size: file.size,
        type: file.type
      });

      const { data, error } = await supabase.storage
        .from('generated-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ [STORAGE] Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      console.log('✅ [STORAGE] uploaded image url=', publicUrl);

      onImageUploaded(publicUrl);
      toast.success('🖼️ Image uploaded successfully!');

    } catch (error) {
      console.error('❌ [STORAGE] Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    onImageRemoved();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
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
        toast.error('Please upload an image file');
        return;
      }
      
      handleFileSelect(file);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {uploadedImageUrl ? (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={uploadedImageUrl} 
                alt="Uploaded theme image" 
                className="w-full h-32 object-cover rounded-md"
              />
              <Button 
                variant="destructive" 
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-white/60 text-center">
              Image ready for theme application
            </p>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
              isDragging 
                ? 'border-purple-400 bg-purple-500/10' 
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!isUploading ? handleUploadClick : undefined}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-white/10">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Image className="h-6 w-6 text-white" />
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">
                  {isUploading ? 'Uploading...' : 'Upload Theme Image'}
                </p>
                <p className="text-xs text-white/60">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-white/50">
                  Recommended image size: 1024×1024 for best results
                </p>
              </div>
              
              {!isUploading && (
                <Button variant="secondary" size="sm" className="mt-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadForTheme;
