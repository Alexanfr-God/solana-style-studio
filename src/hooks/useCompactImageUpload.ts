
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { uploadToStorage } from '@/ai/storage';

export const useCompactImageUpload = () => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    console.log('[UPLOAD] start', file.name, 'size=', file.size);

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

      const publicUrl = await uploadToStorage(new Blob([file]), filePath);
      
      console.log('[STORAGE] uploaded url=', publicUrl);
      setUploadedImageUrl(publicUrl);
      console.log('[CHAT] uploadedImageUrl set');
      
      toast.success('🖼️ Image uploaded successfully!');
      return publicUrl;

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      toast.error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileSelect(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setUploadedImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Image removed');
  };

  return {
    uploadedImageUrl,
    isUploading,
    fileInputRef,
    handleFileChange,
    openFileDialog,
    removeImage
  };
};
