
import { useState } from 'react';
import { FileUploadService } from '@/services/fileUploadService';
import { toast } from 'sonner';

export interface IconUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export const useIconManager = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadIcon = async (
    file: File,
    elementId: string,
    userId: string
  ): Promise<IconUploadResult> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('🎯 Uploading icon for element:', elementId);

      // Use new file upload service via llm-patch
      const result = await FileUploadService.uploadImageFromFile(
        file,
        userId,
        `custom-icons/${elementId}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Icon uploaded successfully:', result.url);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadError(errorMessage);
      console.error('💥 Error uploading icon:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  };

  const uploadIconFromDataUrl = async (
    dataUrl: string,
    fileName: string,
    elementId: string,
    userId: string
  ): Promise<IconUploadResult> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('🎯 Uploading icon from data URL for element:', elementId);

      const result = await FileUploadService.uploadFile(
        dataUrl,
        fileName,
        userId,
        `custom-icons/${elementId}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Icon uploaded successfully:', result.url);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadError(errorMessage);
      console.error('💥 Error uploading icon:', error);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadIcon,
    uploadIconFromDataUrl,
    isUploading,
    uploadError
  };
};
