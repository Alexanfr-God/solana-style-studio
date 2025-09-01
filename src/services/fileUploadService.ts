
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileUploadRequest {
  mode: 'upload';
  file_data: string;
  file_name: string;
  user_id: string;
  folder?: string;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

// System user ID for wallet authentication
const WALLET_SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';

export class FileUploadService {
  static async uploadFile(
    fileData: string,
    fileName: string,
    userId: string,
    folder?: string
  ): Promise<FileUploadResponse> {
    try {
      console.log('📤 Starting file upload via llm-patch:', {
        fileName,
        userId,
        folder: folder || 'user-uploads'
      });

      // For wallet users, use the system user ID for file uploads
      const uploadUserId = userId.startsWith('wallet_') ? WALLET_SYSTEM_USER_ID : userId;

      const { data, error } = await supabase.functions.invoke('llm-patch', {
        body: {
          mode: 'upload',
          file_data: fileData,
          file_name: fileName,
          user_id: uploadUserId,
          folder: folder || 'user-uploads'
        } as FileUploadRequest
      });

      if (error) {
        console.error('❌ Upload function error:', error);
        toast.error(`Upload failed: ${error.message}`);
        throw new Error(`Upload service error: ${error.message}`);
      }

      if (!data?.success) {
        console.error('❌ Upload failed:', data?.error);
        toast.error(`Upload failed: ${data?.error || 'Unknown error'}`);
        throw new Error(data?.error || 'Upload failed');
      }

      console.log('✅ File uploaded successfully:', data.url);
      toast.success('🎯 File uploaded successfully!');
      
      return data as FileUploadResponse;

    } catch (error) {
      console.error('💥 Error in file upload:', error);
      throw error;
    }
  }

  static async uploadImageFromBlob(
    blob: Blob,
    fileName: string,
    userId: string,
    folder?: string
  ): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await this.uploadFile(base64Data, fileName, userId, folder);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(blob);
    });
  }

  static async uploadImageFromFile(
    file: File,
    userId: string,
    folder?: string
  ): Promise<FileUploadResponse> {
    return this.uploadImageFromBlob(file, file.name, userId, folder);
  }
}
