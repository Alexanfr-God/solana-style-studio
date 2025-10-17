/**
 * Deep DOM utilities for ThemeVisionOverlay
 * Supports Shadow DOM traversal and wallet root discovery
 */

const WALLET_ROOT_SELECTORS = [
  '[data-wallet-container]',
  '[data-wallet-root]',
  '.wallet-container',
  '#wallet-preview',
];

/**
 * Wait for wallet root element to appear in DOM
 * Retries with delay to handle slow mounting
 */
export async function waitForWalletRoot(
  maxAttempts = 20,
  delayMs = 300
): Promise<HTMLElement> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[domDeep] Attempt ${attempt}/${maxAttempts} to find wallet root`);
    
    for (const selector of WALLET_ROOT_SELECTORS) {
      const el = document.querySelector(selector) as HTMLElement;
      if (el) {
        console.log(`[domDeep] ✅ Wallet root found: ${selector}`);
        return el;
      }
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('[domDeep] ❌ Wallet root not found after', maxAttempts, 'attempts');
  console.error('[domDeep] DOM snapshot:', document.body.innerHTML.slice(0, 500));
  throw new Error('Wallet root not found. Make sure wallet preview is mounted.');
}

/**
 * Query all elements including Shadow DOM
 * @param root - Root element to search from
 * @param selector - CSS selector
 */
export function queryAllDeep(root: HTMLElement | Document, selector: string): HTMLElement[] {
  const results: HTMLElement[] = [];
  
  function traverse(node: HTMLElement | Document | ShadowRoot) {
    // Query in current context
    const elements = node.querySelectorAll(selector);
    results.push(...Array.from(elements) as HTMLElement[]);
    
    // Traverse into Shadow DOM
    const children = node instanceof Document ? 
      [node.documentElement] : 
      Array.from((node as HTMLElement).children || []);
      
    for (const child of children) {
      if (child instanceof HTMLElement && child.shadowRoot) {
        traverse(child.shadowRoot);
      }
    }
  }
  
  traverse(root);
  return results;
}

/**
 * Check if element is visible in viewport
 * Considers transform, opacity, display, visibility
 */
export function isElementVisible(el: HTMLElement): boolean {
  // Check basic visibility
  if (!el.offsetParent && el.tagName !== 'BODY') {
    return false;
  }
  
  const rects = el.getClientRects();
  if (rects.length === 0) {
    return false;
  }
  
  // Check computed styles
  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) === 0
  ) {
    return false;
  }
  
  // Check if element has meaningful size
  const rect = rects[0];
  return rect.width > 0 && rect.height > 0;
}

/**
 * Get bounding rect relative to a container
 */
export function getRelativeBoundingRect(
  element: HTMLElement,
  container: HTMLElement
): DOMRect | null {
  if (!isElementVisible(element)) {
    return null;
  }
  
  const elRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  return new DOMRect(
    elRect.left - containerRect.left,
    elRect.top - containerRect.top,
    elRect.width,
    elRect.height
  );
}
