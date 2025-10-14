/**
 * ThemeProbeListener - Listens for ThemeProbe commands from AdminPanel
 * Runs ThemeProbe.buildMapping() locally in Preview and sends results back
 */

import { ThemeProbe } from './ThemeProbe';
import { ZustandThemeAdapter } from './ZustandThemeAdapter';

type Scope = 'home' | 'lock' | 'all';
const VERSION = 'theme-probe/v1';

declare global {
  interface Window {
    ThemeProbe?: { run: (scope: Scope) => Promise<any> };
  }
}

let isRegistered = false;

/**
 * Register listener for ThemeProbe commands
 * Should be called once when Preview page loads
 */
export function registerThemeProbeListener() {
  // Check if enabled via URL param
  const enabled = /[?&]enableThemeProbe=1/.test(location.search) || location.pathname === '/';
  if (!enabled && location.pathname !== '/') {
    console.log('[ThemeProbeListener] Not enabled (use ?enableThemeProbe=1)');
    return;
  }

  if (isRegistered) {
    console.warn('[ThemeProbeListener] Already registered');
    return;
  }

  console.log('[ThemeProbeListener] Registering message listener');
  isRegistered = true;

  // Create ThemeProbe instance
  const adapter = new ZustandThemeAdapter();
  const probe = new ThemeProbe(adapter);

  // Export to window for direct access
  window.ThemeProbe = {
    run: async (scope: Scope) => {
      console.log(`[ThemeProbe][preview] 🚀 Running wallet-scoped probe for scope="${scope}"`);
      
      const result = await probe.buildMapping({ 
        scope: scope === 'all' ? 'all' : scope
      });
      
      console.log(`[ThemeProbe][preview] ✅ Probe complete:`, {
        walletRoot: result.walletRoot,
        activeLayers: result.activeLayers,
        items: result.items.length,
        coverage: (result.coverage * 100).toFixed(1) + '%',
        totals: result.totals,
        layerSummary: result.layerSummary
      });
      
      return result;
    }
  };

  async function reply(target: WindowProxy, origin: string, payload: any) {
    target.postMessage(payload, origin);
  }

  // Listen for commands from AdminPanel
  window.addEventListener('message', async (e: MessageEvent) => {
    const d = e.data || {};
    
    // PING → READY handshake
    if (d.type === 'THEME_PROBE_PING' && d.version === VERSION) {
      console.log('[ThemeProbe][preview] PING received from', e.origin);
      const target = (window.opener && e.source === window.opener) 
        ? window.opener 
        : (window.parent || e.source);
      
      if (target) {
        await reply(target, e.origin, { 
          type: 'THEME_PROBE_READY', 
          id: d.id, 
          version: VERSION, 
          origin: location.origin 
        });
        console.log('[ThemeProbe][preview] Sent READY response');
      }
      return;
    }

    // RUN → RESULT execution
    if (d.type === 'THEME_PROBE_RUN' && d.version === VERSION) {
      console.log('[ThemeProbe][preview] RUN command received, scope:', d.screen);
      const target = (window.opener && e.source === window.opener) 
        ? window.opener 
        : (window.parent || e.source);

      try {
        if (!window.ThemeProbe?.run) {
          throw new Error('ThemeProbe.run is not available in preview');
        }

        const result = await window.ThemeProbe.run(d.screen || 'home');
        
        if (target) {
          await reply(target, e.origin, { 
            type: 'THEME_PROBE_RESULT', 
            id: d.id, 
            version: VERSION, 
            result, 
            summary: result?.summary || { totalElements: result?.items?.length || 0 }
          });
          console.log('[ThemeProbe][preview] Sent RESULT response');
        }
      } catch (error) {
        console.error('[ThemeProbe][preview] Probe failed:', error);
        if (target) {
          await reply(target, e.origin, { 
            type: 'THEME_PROBE_RESULT', 
            id: d.id, 
            version: VERSION, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    }
  });

  // Auto-READY for popup: tell opener/parent we're ready
  const parentWin = window.opener || (window.parent !== window ? window.parent : null);
  if (parentWin) {
    console.log('[ThemeProbe][preview] Sending auto-READY to parent/opener');
    parentWin.postMessage({ 
      type: 'THEME_PROBE_READY', 
      id: 'init', 
      version: VERSION, 
      origin: location.origin 
    }, '*');
  }

  console.log('[ThemeProbeListener] Listener registered successfully');
}
