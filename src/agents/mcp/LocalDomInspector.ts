import { DomInspector, DomInspectionResult } from './DomInspector';

/**
 * LocalDomInspector - Scans current preview DOM
 * 
 * Finds wallet container using fallback candidates, then scans for
 * [data-element-id^="lock-"] or [data-element-id^="home-"] elements.
 */

const WALLET_CONTAINER_CANDIDATES = [
  '[data-wallet-container]',
  '[data-testid="wallet-preview"]',
  '.wallet-preview'
];

export class LocalDomInspector implements DomInspector {
  scan(screen: 'lock' | 'home'): DomInspectionResult[] {
    const results: DomInspectionResult[] = [];
    
    // Find wallet container using candidate selectors
    let walletRoot: Element | null = null;
    for (const candidate of WALLET_CONTAINER_CANDIDATES) {
      walletRoot = document.querySelector(candidate);
      if (walletRoot) {
        console.log(`[LocalDomInspector] ✅ Found wallet container: ${candidate}`);
        break;
      }
    }
    
    if (!walletRoot) {
      console.warn('[LocalDomInspector] ❌ Wallet container not found. Tried:', WALLET_CONTAINER_CANDIDATES);
      return results;
    }

    // Scan for elements with matching prefix
    const prefix = screen === 'lock' ? 'lock-' : 'home-';
    const elements = walletRoot.querySelectorAll(`[data-element-id^="${prefix}"]`);
    
    elements.forEach((el) => {
      const id = el.getAttribute('data-element-id');
      if (id) {
        results.push({
          id,
          selector: `[data-element-id="${id}"]`,
          element: el instanceof HTMLElement ? el : undefined
        });
      }
    });

    console.log(`[LocalDomInspector] 🔍 Found ${results.length} elements for screen="${screen}"`);
    return results;
  }
}
