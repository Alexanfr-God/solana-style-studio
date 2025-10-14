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

    // Scan ALL elements with data-element-id in the container
    const elements = walletRoot.querySelectorAll(`[data-element-id]`);
    
    elements.forEach((el) => {
      const id = el.getAttribute('data-element-id');
      if (!id) return;

      // For 'lock' screen: only lock-* elements
      if (screen === 'lock' && !id.startsWith('lock-') && !id.startsWith('unlock-')) {
        return;
      }

      // For 'home' screen: home-* and action-* elements
      if (screen === 'home' && !id.startsWith('home-') && !id.startsWith('action-') && !id.startsWith('header-')) {
        return;
      }

      results.push({
        id,
        selector: `[data-element-id="${id}"]`,
        element: el instanceof HTMLElement ? el : undefined
      });
    });

    console.log(`[LocalDomInspector] 🔍 Found ${results.length} elements for screen="${screen}"`);
    return results;
  }
}
