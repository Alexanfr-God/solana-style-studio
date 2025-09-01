
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface FileUploadRequest {
  file_data: string; // base64
  file_name: string;
  user_id: string;
  folder?: string;
}

interface FileUploadResponse {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export class FileUploadModule {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  async uploadFile(request: FileUploadRequest): Promise<FileUploadResponse> {
    try {
      console.log('📤 Starting file upload:', {
        fileName: request.file_name,
        userId: request.user_id,
        folder: request.folder
      });

      // Convert base64 to blob
      const base64Data = request.file_data.split(',')[1] || request.file_data;
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Generate unique file path
      const timestamp = Date.now();
      const folder = request.folder || 'user-uploads';
      const fileName = `${folder}/${request.user_id}/${timestamp}_${request.file_name}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('generated-images')
        .upload(fileName, binaryData, {
          contentType: this.getContentType(request.file_name),
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('❌ Upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('generated-images')
        .getPublicUrl(data.path);

      console.log('✅ File uploaded successfully:', data.path);
      
      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error) {
      console.error('💥 File upload error:', error);
      return {
        success: false,
        error: error.message || 'Unknown upload error'
      };
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  async deleteFile(filePath: string, userId: string): Promise<boolean> {
    try {
      // Verify user owns this file (security check)
      if (!filePath.includes(`user-uploads/${userId}/`)) {
        console.error('❌ Unauthorized delete attempt');
        return false;
      }

      const { error } = await this.supabase.storage
        .from('generated-images')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        return false;
      }

      console.log('🗑️ File deleted:', filePath);
      return true;
    } catch (error) {
      console.error('💥 Delete error:', error);
      return false;
    }
  }
}
