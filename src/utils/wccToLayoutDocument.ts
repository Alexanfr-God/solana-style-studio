/**
 * wccToLayoutDocument
 *
 * Converts a WCCOverlayV3 theme → LayoutDocument that the
 * Phantom Overlay Editor Chrome extension understands.
 *
 * The extension renders LayoutElement[] in a Shadow DOM on top of
 * the real Phantom wallet (ws://localhost:3333 → layout:push).
 *
 * Anchor positions come from PHANTOM_SCREENS["password"] in
 * packages/shared/src/schema.ts (400×600 canvas).
 */

import { buildThemeOverrides, buildContainerBackground } from '@/stores/phantomThemeStore';
import type { WCCOverlayV3 } from '@/stores/phantomThemeStore';

// Anchor → position / type (mirrors PHANTOM_SCREENS["password"])
const PASSWORD_ANCHORS = [
  { id: 'background',     x: 0,   y: 0,   width: 400, height: 600, type: 'container', zIndex: 0, content: {} },
  { id: 'header',         x: 0,   y: 0,   width: 400, height: 48,  type: 'container', zIndex: 1, content: {} },
  { id: 'header-title',   x: 140, y: 10,  width: 120, height: 28,  type: 'text',      zIndex: 2, content: { text: 'phantom' } },
  { id: 'help-button',    x: 358, y: 10,  width: 28,  height: 28,  type: 'button',    zIndex: 2, content: { text: '?' } },
  { id: 'header-line',    x: 0,   y: 48,  width: 400, height: 1,   type: 'container', zIndex: 1, content: {} },
  { id: 'title',          x: 40,  y: 290, width: 320, height: 36,  type: 'text',      zIndex: 2, content: { text: 'Enter your Password' } },
  { id: 'password-input', x: 24,  y: 344, width: 352, height: 52,  type: 'input',     zIndex: 2, content: { placeholder: 'Password' } },
  { id: 'unlock-button',  x: 24,  y: 488, width: 352, height: 52,  type: 'button',    zIndex: 2, content: { text: 'Unlock' } },
  { id: 'forgot-link',    x: 100, y: 556, width: 200, height: 24,  type: 'text',      zIndex: 2, content: { text: 'Forgot Password?' } },
] as const;

export interface SimpleLayoutElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
  styles: Record<string, string>;
  content: Record<string, unknown>;
  label?: string;
  anchor?: string;
  screen?: string;
}

export interface SimpleLayoutDocument {
  version: '1';
  timestamp: number;
  elements: SimpleLayoutElement[];
}

function makeId(): string {
  // crypto.randomUUID() may not be available in all contexts — use fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Convert WCCOverlayV3 → LayoutDocument ready to send via layout:push
 */
export function wccToLayoutDocument(theme: WCCOverlayV3): SimpleLayoutDocument {
  const overrides = buildThemeOverrides(theme);
  const bgCSS    = buildContainerBackground(theme);

  const elements: SimpleLayoutElement[] = [];

  for (const anchor of PASSWORD_ANCHORS) {
    // Background gets special treatment — use buildContainerBackground result
    if (anchor.id === 'background') {
      const bgStyles: Record<string, string> = {
        borderRadius: '0px',
        border: 'none',
      };

      if (bgCSS.startsWith('url(')) {
        bgStyles.backgroundImage = bgCSS;
        bgStyles.backgroundSize  = 'cover';
        bgStyles.backgroundPosition = 'center';
        bgStyles.backgroundRepeat   = 'no-repeat';
      } else if (bgCSS.startsWith('linear-gradient')) {
        bgStyles.background = bgCSS;
      } else {
        bgStyles.backgroundColor = bgCSS;
      }

      elements.push({
        id: makeId(),
        type: 'container',
        x: anchor.x, y: anchor.y,
        width: anchor.width, height: anchor.height,
        zIndex: anchor.zIndex,
        opacity: 1,
        locked: false,
        styles: bgStyles,
        content: {},
        label: 'Background',
        anchor: 'background',
        screen: 'password',
      });
      continue;
    }

    // All other anchors — use CSS from buildThemeOverrides
    const css = overrides[anchor.id] as Record<string, string> | undefined;
    if (!css || Object.keys(css).length === 0) continue;

    // Remove internal animation key — extension doesn't handle it yet
    const { '--anim': _anim, ...cleanCss } = css as Record<string, string>;

    elements.push({
      id: makeId(),
      type: anchor.type,
      x: anchor.x, y: anchor.y,
      width: anchor.width, height: anchor.height,
      zIndex: anchor.zIndex,
      opacity: 1,
      locked: false,
      styles: cleanCss,
      content: anchor.content as Record<string, unknown>,
      label: anchor.id,
      anchor: anchor.id,
      screen: 'password',
    });
  }

  return {
    version: '1',
    timestamp: Date.now(),
    elements,
  };
}

/**
 * Send a WCCOverlayV3 theme to the local Phantom Overlay Extension
 * via WebSocket on ws://localhost:3333.
 *
 * Returns a promise that resolves when layout:ack is received (or
 * rejects after timeout).
 */
export async function pushThemeToPhantom(theme: WCCOverlayV3): Promise<void> {
  const layoutDoc = wccToLayoutDocument(theme);

  return new Promise<void>((resolve, reject) => {
    let ws: WebSocket;

    try {
      ws = new WebSocket('ws://localhost:3333');
    } catch (e) {
      reject(new Error('Could not create WebSocket to ws://localhost:3333'));
      return;
    }

    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Phantom bridge timeout (10s) — is the overlay server running?'));
    }, 10_000);

    ws.onopen = () => {
      console.log('[WCCBridge] ✅ Connected to Phantom Overlay server');

      // Identify as desktop client
      ws.send(JSON.stringify({
        type: 'client:hello',
        role: 'desktop',
        clientId: makeId(),
      }));

      // Push the theme layout immediately
      ws.send(JSON.stringify({
        type: 'layout:push',
        payload: layoutDoc,
      }));

      console.log(`[WCCBridge] 📤 layout:push sent (${layoutDoc.elements.length} elements)`);
    };

    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data as string);
        if (msg.type === 'layout:ack') {
          console.log('[WCCBridge] ✅ layout:ack received');
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket error — make sure npm run dev (port 3333) is running'));
    };

    ws.onclose = (ev: CloseEvent) => {
      if (ev.code !== 1000 && ev.code !== 1006) {
        // 1006 = abnormal closure (server not running)
        clearTimeout(timeout);
        reject(new Error(`WebSocket closed unexpectedly (code ${ev.code})`));
      }
    };
  });
}
