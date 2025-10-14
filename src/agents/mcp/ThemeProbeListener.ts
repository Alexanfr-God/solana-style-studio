/**
 * ThemeProbeListener - Listens for ThemeProbe commands from AdminPanel
 * Runs ThemeProbe.buildMapping() locally in Preview and sends results back
 */

import { ThemeProbe } from './ThemeProbe';
import { ZustandThemeAdapter } from './ZustandThemeAdapter';
import type { ThemeProbeCommand, ThemeProbeResponse } from './ThemeProbeBridge';

let isRegistered = false;

/**
 * Register listener for ThemeProbe commands
 * Should be called once when Preview page loads
 */
export function registerThemeProbeListener() {
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
  (window as any).ThemeProbe = {
    run: async (screen: 'lock' | 'home') => {
      console.log(`[ThemeProbeListener] Running probe for screen="${screen}"`);
      const result = await probe.buildMapping({ screen });
      console.log(`[ThemeProbeListener] Probe complete:`, {
        items: result.items.length,
        coverage: result.coverage,
        totals: result.totals
      });
      return result;
    }
  };

  // Listen for commands from AdminPanel
  window.addEventListener('message', async (e: MessageEvent<ThemeProbeCommand>) => {
    const data = e.data;
    
    // Validate message
    if (!data || data.type !== 'THEME_PROBE_RUN') return;
    
    console.log(`[ThemeProbeListener] Received command:`, data);

    const response: ThemeProbeResponse = {
      type: 'THEME_PROBE_RESULT',
      id: data.id,
      screen: data.screen
    };

    try {
      // Run ThemeProbe
      const result = await probe.buildMapping({ 
        screen: data.screen,
        idPrefixes: data.screen === 'home' 
          ? ['home-', 'action-', 'header-']
          : ['lock-', 'unlock-']
      });

      console.log(`[ThemeProbeListener] Probe successful:`, {
        totalElements: result.items.length,
        coverage: result.coverage,
        totals: result.totals
      });

      response.result = result;
    } catch (error) {
      console.error(`[ThemeProbeListener] Probe failed:`, error);
      response.type = 'THEME_PROBE_ERROR';
      response.error = error instanceof Error ? error.message : String(error);
    }

    // Send response back to AdminPanel
    if (e.source && 'postMessage' in e.source) {
      (e.source as WindowProxy).postMessage(response, e.origin);
      console.log(`[ThemeProbeListener] Sent response back to admin`);
    }
  });

  console.log('[ThemeProbeListener] Listener registered successfully');
}
