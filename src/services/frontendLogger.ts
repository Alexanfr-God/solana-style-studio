
import { logger, UserInteractionLog } from './walletDesignerLogger';
import { supabase } from '@/integrations/supabase/client';

export class FrontendLogger {
  private currentUserId: string | null = null;

  constructor() {
    this.initializeUserTracking();
  }

  private async initializeUserTracking() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      this.currentUserId = user?.id || null;
    } catch (error) {
      console.warn('Failed to get user for logging:', error);
    }
  }

  // Image Upload Tracking
  async logImageUpload(imageUrl: string, fileSize: number, fileType: string): Promise<void> {
    await logger.logUserInteraction(
      'upload',
      'image_upload_component',
      `Uploaded ${fileType} image (${(fileSize / 1024 / 1024).toFixed(2)}MB)`,
      this.currentUserId || undefined
    );

    console.log(`📁 [Upload] Image uploaded: ${fileType}, ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // Style Generation Tracking
  async logStyleGeneration(prompt: string, hasImage: boolean): Promise<void> {
    await logger.logUserInteraction(
      'generate',
      'style_generation',
      `Generated style with prompt: "${prompt.substring(0, 50)}..." ${hasImage ? 'with image' : 'text-only'}`,
      this.currentUserId || undefined
    );

    console.log(`🎨 [Generate] Style generation triggered: ${hasImage ? 'with image' : 'text-only'}`);
  }

  // Style Application Tracking
  async logStyleApplication(styleName: string, styleData: any): Promise<void> {
    await logger.logUserInteraction(
      'apply_style',
      'wallet_preview',
      `Applied style: ${styleName}`,
      this.currentUserId || undefined
    );

    console.log(`✨ [Apply] Style applied: ${styleName}`);
  }

  // User Feedback Tracking
  async logUserFeedback(action: 'like' | 'dislike', elementId: string, feedback?: string): Promise<void> {
    await logger.logUserInteraction(
      action,
      elementId,
      feedback,
      this.currentUserId || undefined
    );

    console.log(`👍👎 [Feedback] ${action} on ${elementId}${feedback ? `: ${feedback}` : ''}`);
  }

  // Save to Library Tracking
  async logSaveToLibrary(styleName: string): Promise<void> {
    await logger.logUserInteraction(
      'save_style',
      'style_library',
      `Saved style to library: ${styleName}`,
      this.currentUserId || undefined
    );

    console.log(`💾 [Save] Style saved to library: ${styleName}`);
  }

  // Wallet Customization Tracking
  async logWalletCustomization(customizationType: string, details: string): Promise<void> {
    await logger.logUserInteraction(
      'generate', // Using generate as the closest action type
      'wallet_customization',
      `${customizationType}: ${details}`,
      this.currentUserId || undefined
    );

    console.log(`🔧 [Customize] ${customizationType}: ${details}`);
  }

  // Performance Tracking
  async logPageLoad(pageName: string, loadTime: number): Promise<void> {
    await logger.logUserInteraction(
      'generate', // Using generate as a generic action
      `page_${pageName}`,
      `Page loaded in ${loadTime.toFixed(2)}ms`,
      this.currentUserId || undefined
    );

    console.log(`⏱️ [Performance] ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  // Error Tracking
  async logUserError(errorType: string, errorMessage: string, componentId?: string): Promise<void> {
    await logger.logUserInteraction(
      'generate', // Using generate as a generic action
      componentId || 'unknown_component',
      `Error: ${errorType} - ${errorMessage}`,
      this.currentUserId || undefined
    );

    console.error(`❌ [Error] ${errorType}: ${errorMessage}`);
  }

  // Session Analytics
  getSessionStats(): {
    uploadsCount: number;
    generationsCount: number;
    likesCount: number;
    dislikesCount: number;
  } {
    const metrics = logger.getPerformanceMetrics();
    return {
      uploadsCount: 0, // Would need to track these separately
      generationsCount: 0,
      likesCount: 0,
      dislikesCount: 0
    };
  }
}

// Global frontend logger instance
export const frontendLogger = new FrontendLogger();
