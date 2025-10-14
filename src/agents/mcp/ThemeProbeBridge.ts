/**
 * ThemeProbeBridge - PostMessage bridge for Admin → Preview communication
 * Allows AdminPanel to trigger ThemeProbe scanning in Preview page where wallet DOM exists
 */

type Scope = 'home' | 'lock' | 'all';
const VERSION = 'theme-probe/v1';
const PREVIEW_IFRAME_SEL = 'iframe[data-preview], iframe#preview, #preview-iframe';

let popupRef: Window | null = null;

export interface ThemeProbeCommand {
  type: 'THEME_PROBE_RUN' | 'THEME_PROBE_PING';
  id: string;
  version: string;
  screen?: Scope;
}

export interface ThemeProbeResponse {
  type: 'THEME_PROBE_RESULT' | 'THEME_PROBE_READY';
  id: string;
  version: string;
  screen?: Scope;
  result?: any;
  error?: string;
  origin?: string;
  summary?: any;
}

function waitForMessage<T>(predicate: (e: MessageEvent) => boolean, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener('message', onMsg as any);
      reject(new Error('ThemeProbe timeout - preview did not respond'));
    }, timeoutMs);
    
    function onMsg(e: MessageEvent) {
      try {
        if (predicate(e)) {
          clearTimeout(timer);
          window.removeEventListener('message', onMsg as any);
          resolve(e.data as T);
        }
      } catch (err) {
        console.warn('[Bridge] Message handler error:', err);
      }
    }
    
    window.addEventListener('message', onMsg as any);
  });
}

async function ensurePreviewReady(urlIfPopup: string, timeoutMs = 15000): Promise<{ target: Window; origin: string }> {
  console.log('[Bridge] Ensuring preview is ready...');
  
  // 1) Try to find iframe
  const iframe = document.querySelector(PREVIEW_IFRAME_SEL) as HTMLIFrameElement | null;
  if (iframe?.contentWindow) {
    console.log('[Bridge] Found preview iframe, sending PING');
    const id = crypto.randomUUID();
    iframe.contentWindow.postMessage({ type: 'THEME_PROBE_PING', id, version: VERSION }, '*');
    
    const ready: any = await waitForMessage(
      e => e.data?.type === 'THEME_PROBE_READY' && e.data?.id === id && e.data?.version === VERSION,
      timeoutMs
    );
    
    console.log('[Bridge] Iframe preview is READY');
    return { target: iframe.contentWindow, origin: ready.origin || '*' };
  }

  // 2) Fallback: open popup
  console.log('[Bridge] No iframe found, opening popup');
  if (!popupRef || popupRef.closed) {
    popupRef = window.open(urlIfPopup, 'wallet-preview', 'width=1200,height=800,menubar=no,toolbar=no,location=no');
    if (!popupRef) throw new Error('Failed to open preview window. Please allow popups for this site.');
  }

  console.log('[Bridge] Waiting for popup READY signal...');
  const ready: any = await waitForMessage(
    e => e.data?.type === 'THEME_PROBE_READY' && e.source === popupRef && e.data?.version === VERSION,
    timeoutMs
  );

  console.log('[Bridge] Popup preview is READY');
  return { target: popupRef, origin: ready.origin || '*' };
}

/**
 * Run ThemeProbe in Preview page via PostMessage
 * Opens preview in popup if needed, sends command, waits for result
 */
export async function runThemeProbeInPreview(
  screen: Scope,
  urlIfPopup = '/?enableThemeProbe=1&debugProbe=1',
  timeoutMs = 60000
): Promise<any> {
  console.log(`[Bridge] Starting ThemeProbe for screen="${screen}"`);

  const { target, origin } = await ensurePreviewReady(urlIfPopup, 15000);
  const id = crypto.randomUUID();

  console.log(`[Bridge] Sending THEME_PROBE_RUN command to preview`);
  target.postMessage({ 
    type: 'THEME_PROBE_RUN', 
    id, 
    version: VERSION, 
    screen 
  }, origin);

  const res: any = await waitForMessage(
    e => e.data?.type === 'THEME_PROBE_RESULT' && e.data?.id === id && e.data?.version === VERSION,
    timeoutMs
  );

  if (res.error) {
    console.error('[Bridge] ThemeProbe error:', res.error);
    throw new Error(res.error);
  }

  console.log('[Bridge] ThemeProbe result OK', res.summary);
  return res.result || res;
}
