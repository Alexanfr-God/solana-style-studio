
import { captureElementAsImage } from '@/utils/imageExport';

// Screenshot capture for Vision API
export async function captureWalletPreview(): Promise<Blob> {
  try {
    console.log('🖼️ Capturing wallet preview...');
    
    // Try to find the wallet preview element
    const selectors = [
      '.wallet-preview',
      '#wallet-preview', 
      '[data-testid="wallet-preview"]',
      '.wallet-container',
      '.unified-wallet-renderer'
    ];
    
    let previewElement: HTMLElement | null = null;
    
    for (const selector of selectors) {
      previewElement = document.querySelector(selector);
      if (previewElement) {
        console.log(`📍 Found wallet element: ${selector}`);
        break;
      }
    }
    
    if (!previewElement) {
      // Fallback: capture the main content area
      previewElement = document.querySelector('main') || document.body;
      console.log('⚠️ Using fallback element for capture');
    }
    
    const blob = await captureElementAsImage(previewElement);
    console.log('✅ Wallet preview captured successfully');
    
    return blob;
  } catch (error) {
    console.error('❌ Failed to capture wallet preview:', error);
    throw new Error(`Screenshot capture failed: ${error.message}`);
  }
}

export function getPreviewDataUrl(): string {
  // TODO: Return data:// URL for preview (future enhancement)
  throw new Error('getPreviewDataUrl not implemented yet');
}
