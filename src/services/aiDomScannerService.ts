import { supabase } from '@/integrations/supabase/client';

interface DomScanResult {
  success: boolean;
  mappings: Array<{
    element_id: string;
    json_path: string;
    confidence: number;
  }>;
  totalProcessed: number;
  totalMapped: number;
}

export async function scanDomWithAI(
  screenshotUrl?: string,
  screen: string = 'home'
): Promise<DomScanResult> {
  try {
    console.log('🔍 Starting AI DOM scan for screen:', screen);

    // Capture DOM structure
    const walletContainer = document.querySelector('[data-wallet-container]');
    if (!walletContainer) {
      throw new Error('Wallet container not found');
    }

    const domStructure = captureDomStructure(walletContainer);

    // Call AI DOM Scanner edge function
    const { data, error } = await supabase.functions.invoke('ai-dom-scanner', {
      body: {
        screenshotUrl,
        domStructure,
        screen
      }
    });

    if (error) throw error;

    console.log('✅ AI DOM scan completed:', data);
    return data;

  } catch (error) {
    console.error('❌ AI DOM scan failed:', error);
    throw error;
  }
}

function captureDomStructure(container: Element): any {
  const elements: any[] = [];

  function traverse(element: Element, depth: number = 0) {
    if (depth > 5) return; // Limit depth

    const classes = Array.from(element.classList);
    const id = element.id;
    const dataElementId = element.getAttribute('data-element-id');
    const text = element.textContent?.trim().substring(0, 50);

    if (classes.length > 0 || id || dataElementId) {
      elements.push({
        tag: element.tagName.toLowerCase(),
        classes,
        id,
        dataElementId,
        text,
        depth
      });
    }

    Array.from(element.children).forEach(child => {
      traverse(child, depth + 1);
    });
  }

  traverse(container);
  return elements;
}

export async function captureWalletScreenshot(screen: string): Promise<string | null> {
  try {
    const walletContainer = document.querySelector('[data-wallet-container]');
    if (!walletContainer) return null;

    // Use html2canvas or similar to capture screenshot
    // For now, return null - screenshot is optional
    return null;
  } catch (error) {
    console.error('❌ Screenshot capture failed:', error);
    return null;
  }
}
