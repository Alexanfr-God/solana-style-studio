
// Utility logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [ImageProcessor::${component}] [${level}] ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

export class ImageProcessor {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  
  constructor() {
    log('Constructor', 'INFO', 'ImageProcessor initialized');
  }
  
  async processUploadedImage(file: File) {
    log('ProcessImage', 'INFO', 'Starting image processing', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const startTime = Date.now();
    
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      const processingTime = Date.now() - startTime;
      
      const result = {
        base64Data: dataUrl,
        imageSize: file.size,
        format: file.type,
        processedAt: new Date().toISOString(),
        processingTime
      };
      
      log('ProcessImage', 'INFO', 'Image processing completed', {
        processingTime: `${processingTime}ms`,
        base64Length: base64.length,
        format: file.type
      });
      
      return result;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      log('ProcessImage', 'ERROR', 'Image processing failed', {
        processingTime: `${processingTime}ms`,
        error: error.message,
        fileName: file.name
      });
      throw error;
    }
  }
  
  private validateImageFile(file: File) {
    log('ValidateFile', 'DEBUG', 'Validating image file');
    
    // Check if file exists
    if (!file) {
      return {
        valid: false,
        error: 'No file provided'
      };
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`
      };
    }
    
    if (file.size < 100) {
      return {
        valid: false,
        error: 'File too small. Minimum size: 100 bytes'
      };
    }
    
    // Check file format
    if (!this.allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed: ${this.allowedFormats.join(', ')}`
      };
    }
    
    log('ValidateFile', 'DEBUG', 'File validation passed');
    
    return {
      valid: true
    };
  }
  
  getImageMetadata(file: File) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      sizeFormatted: this.formatFileSize(file.size)
    };
  }
  
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
