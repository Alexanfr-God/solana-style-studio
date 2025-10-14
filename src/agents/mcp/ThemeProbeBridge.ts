/**
 * ThemeProbeBridge - PostMessage bridge for Admin → Preview communication
 * Allows AdminPanel to trigger ThemeProbe scanning in Preview page where wallet DOM exists
 */

export interface ThemeProbeCommand {
  type: 'THEME_PROBE_RUN';
  id: string;
  screen: 'lock' | 'home';
}

export interface ThemeProbeResponse {
  type: 'THEME_PROBE_RESULT' | 'THEME_PROBE_ERROR';
  id: string;
  screen: 'lock' | 'home';
  result?: any;
  error?: string;
}

const PREVIEW_URL = window.location.origin + '/';

/**
 * Run ThemeProbe in Preview page via PostMessage
 * Opens preview in popup if needed, sends command, waits for result
 */
export async function runThemeProbeInPreview(
  screen: 'lock' | 'home',
  timeoutMs = 30000
): Promise<any> {
  console.log(`[Bridge] Starting ThemeProbe for screen="${screen}"`);

  // Check if we're already on the preview page
  const isOnPreviewPage = document.querySelector('[data-wallet-container]');
  if (isOnPreviewPage) {
    console.log('[Bridge] Already on preview page, running locally');
    // Check if ThemeProbe is available
    if ((window as any).ThemeProbe) {
      return await (window as any).ThemeProbe.run(screen);
    } else {
      throw new Error('ThemeProbe not available on preview page');
    }
  }

  // Open preview page in popup
  const popup = window.open(
    PREVIEW_URL,
    'theme-probe-preview',
    'width=1200,height=800,menubar=no,toolbar=no,location=no'
  );

  if (!popup) {
    throw new Error('Failed to open preview popup. Please allow popups for this site.');
  }

  const id = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      popup.close();
      reject(new Error('ThemeProbe timeout - preview did not respond'));
    }, timeoutMs);

    function onMessage(e: MessageEvent<ThemeProbeResponse>) {
      const data = e.data;
      if (!data || (data.type !== 'THEME_PROBE_RESULT' && data.type !== 'THEME_PROBE_ERROR')) return;
      if (data.id !== id) return;

      console.log(`[Bridge] Received response:`, data);

      cleanup();

      if (data.type === 'THEME_PROBE_ERROR') {
        popup.close();
        reject(new Error(data.error || 'Unknown error in preview'));
      } else {
        popup.close();
        resolve(data.result);
      }
    }

    function cleanup() {
      clearTimeout(timer);
      window.removeEventListener('message', onMessage as any);
    }

    window.addEventListener('message', onMessage as any);

    // Wait for popup to load, then send command
    const checkLoaded = setInterval(() => {
      try {
        if (popup.closed) {
          cleanup();
          clearInterval(checkLoaded);
          reject(new Error('Preview popup was closed'));
          return;
        }

        // Try to send message
        popup.postMessage(
          {
            type: 'THEME_PROBE_RUN',
            id,
            screen
          } as ThemeProbeCommand,
          PREVIEW_URL
        );

        console.log(`[Bridge] Sent THEME_PROBE_RUN command to preview`);
      } catch (err) {
        console.warn('[Bridge] Failed to send message, retrying...', err);
      }
    }, 500);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkLoaded), 5000);
  });
}
