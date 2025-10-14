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

/**
 * Find wallet root container using fallback candidates
 */
export function findWalletRoot(): Element | null {
  for (const candidate of WALLET_CONTAINER_CANDIDATES) {
    const root = document.querySelector(candidate);
    if (root) {
      console.log(`[findWalletRoot] ✅ Found wallet container: ${candidate}`);
      return root;
    }
  }
  console.warn('[findWalletRoot] ❌ Wallet container not found. Tried:', WALLET_CONTAINER_CANDIDATES);
  return null;
}

export class LocalDomInspector implements DomInspector {
  scan(screen: 'lock' | 'home'): DomInspectionResult[] {
    const results: DomInspectionResult[] = [];
    
    const walletRoot = findWalletRoot();
    if (!walletRoot) {
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
