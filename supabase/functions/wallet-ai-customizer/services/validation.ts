
// Utility logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [Validation::${component}] [${level}] ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

export class ValidationService {
  private supportedWalletTypes = [
    'phantom',
    'solana', 
    'metamask',
    'coinbase',
    'trust',
    'demo'
  ];
  
  private maxPromptLength = 500;
  private maxImageSize = 10 * 1024 * 1024; // 10MB
  
  constructor() {
    log('Constructor', 'INFO', 'ValidationService initialized');
  }
  
  async validateCustomizeRequest(data: {
    walletId: string;
    imageFile: File;
    customPrompt: string;
  }) {
    log('ValidateRequest', 'INFO', 'Validating customize request', {
      walletId: data.walletId,
      hasImage: !!data.imageFile,
      promptLength: data.customPrompt?.length || 0
    });
    
    try {
      // Validate wallet ID
      const walletValidation = this.validateWalletId(data.walletId);
      if (!walletValidation.valid) {
        return walletValidation;
      }
      
      // Validate image
      const imageValidation = this.validateImageFile(data.imageFile);
      if (!imageValidation.valid) {
        return imageValidation;
      }
      
      // Validate prompt
      const promptValidation = this.validateCustomPrompt(data.customPrompt);
      if (!promptValidation.valid) {
        return promptValidation;
      }
      
      log('ValidateRequest', 'INFO', 'Request validation passed');
      
      return {
        valid: true,
        message: 'Request validation successful'
      };
      
    } catch (error) {
      log('ValidateRequest', 'ERROR', 'Request validation failed', {
        error: error.message
      });
      
      return {
        valid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }
  
  validateWalletId(walletId: string) {
    log('ValidateWallet', 'DEBUG', `Validating wallet ID: ${walletId}`);
    
    if (!walletId) {
      return {
        valid: false,
        error: 'Wallet ID is required'
      };
    }
    
    if (typeof walletId !== 'string') {
      return {
        valid: false,
        error: 'Wallet ID must be a string'
      };
    }
    
    if (walletId.length < 2 || walletId.length > 50) {
      return {
        valid: false,
        error: 'Wallet ID must be between 2 and 50 characters'
      };
    }
    
    // Check if wallet type is supported
    const normalizedWalletId = walletId.toLowerCase();
    const isSupported = this.supportedWalletTypes.some(type => 
      normalizedWalletId.includes(type)
    );
    
    if (!isSupported) {
      log('ValidateWallet', 'WARN', `Unsupported wallet type: ${walletId}`, {
        supportedTypes: this.supportedWalletTypes
      });
      
      // Allow unsupported wallets with warning
      return {
        valid: true,
        warning: `Wallet type '${walletId}' is not in supported list, but will be processed`,
        supportedTypes: this.supportedWalletTypes
      };
    }
    
    log('ValidateWallet', 'DEBUG', 'Wallet ID validation passed');
    
    return {
      valid: true,
      walletType: normalizedWalletId
    };
  }
  
  validateImageFile(file: File) {
    log('ValidateImage', 'DEBUG', 'Validating image file', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    if (!file) {
      return {
        valid: false,
        error: 'Image file is required'
      };
    }
    
    // Check file size
    if (file.size > this.maxImageSize) {
      return {
        valid: false,
        error: `Image file too large. Maximum size: ${this.maxImageSize / 1024 / 1024}MB`
      };
    }
    
    if (file.size < 100) {
      return {
        valid: false,
        error: 'Image file too small. Minimum size: 100 bytes'
      };
    }
    
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid image format. Allowed formats: ${allowedTypes.join(', ')}`
      };
    }
    
    // Check file name
    if (!file.name || file.name.length > 255) {
      return {
        valid: false,
        error: 'Invalid file name'
      };
    }
    
    log('ValidateImage', 'DEBUG', 'Image file validation passed');
    
    return {
      valid: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeFormatted: this.formatFileSize(file.size)
      }
    };
  }
  
  validateCustomPrompt(prompt: string) {
    log('ValidatePrompt', 'DEBUG', 'Validating custom prompt', {
      promptLength: prompt?.length || 0
    });
    
    // Prompt is optional, so empty is valid
    if (!prompt) {
      return {
        valid: true,
        message: 'No custom prompt provided, will use default'
      };
    }
    
    if (typeof prompt !== 'string') {
      return {
        valid: false,
        error: 'Custom prompt must be a string'
      };
    }
    
    if (prompt.length > this.maxPromptLength) {
      return {
        valid: false,
        error: `Custom prompt too long. Maximum length: ${this.maxPromptLength} characters`
      };
    }
    
    // Check for potentially harmful content
    const harmfulPatterns = [
      /\b(hack|crack|exploit|malware|virus)\b/i,
      /\b(steal|phish|scam|fraud)\b/i,
      /<script|javascript:|data:/i
    ];
    
    const hasHarmfulContent = harmfulPatterns.some(pattern => 
      pattern.test(prompt)
    );
    
    if (hasHarmfulContent) {
      return {
        valid: false,
        error: 'Custom prompt contains potentially harmful content'
      };
    }
    
    log('ValidatePrompt', 'DEBUG', 'Custom prompt validation passed');
    
    return {
      valid: true,
      processedPrompt: prompt.trim(),
      length: prompt.length
    };
  }
  
  async validateRatingRequest(data: {
    sessionId: string;
    rating: number;
    feedback?: string;
  }) {
    log('ValidateRating', 'INFO', 'Validating rating request', {
      sessionId: data.sessionId,
      rating: data.rating
    });
    
    // Validate session ID
    if (!data.sessionId || typeof data.sessionId !== 'string') {
      return {
        valid: false,
        error: 'Valid session ID is required'
      };
    }
    
    // Validate rating
    if (typeof data.rating !== 'number') {
      return {
        valid: false,
        error: 'Rating must be a number'
      };
    }
    
    if (data.rating < 1 || data.rating > 5) {
      return {
        valid: false,
        error: 'Rating must be between 1 and 5'
      };
    }
    
    // Validate feedback (optional)
    if (data.feedback) {
      if (typeof data.feedback !== 'string') {
        return {
          valid: false,
          error: 'Feedback must be a string'
        };
      }
      
      if (data.feedback.length > 1000) {
        return {
          valid: false,
          error: 'Feedback too long. Maximum length: 1000 characters'
        };
      }
    }
    
    log('ValidateRating', 'INFO', 'Rating validation passed');
    
    return {
      valid: true,
      processedData: {
        sessionId: data.sessionId,
        rating: Math.round(data.rating),
        feedback: data.feedback?.trim() || null
      }
    };
  }
  
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // Health check validation
  validateSystemHealth() {
    log('SystemHealth', 'INFO', 'Validating system health');
    
    const envVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = envVars.filter(varName => !Deno.env.get(varName));
    
    const health = {
      healthy: missingVars.length === 0,
      timestamp: new Date().toISOString(),
      environment: {
        requiredVars: envVars,
        missingVars,
        configuredVars: envVars.filter(varName => !!Deno.env.get(varName))
      }
    };
    
    log('SystemHealth', health.healthy ? 'INFO' : 'WARN', 'System health check completed', health);
    
    return health;
  }
}
