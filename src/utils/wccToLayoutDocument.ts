/**
 * wccToLayoutDocument
 *
 * Converts a WCCOverlayV3 theme → LayoutDocument that the
 * Phantom Overlay Editor macOS agent understands.
 *
 * Transport: Supabase Realtime broadcast on channel "wcc:overlay"
 * (avoids ws:// mixed-content block from HTTPS wacocu.app).
 * The local sync-server subscribes to the same channel and forwards
 * as layout:push to the agent via ws://localhost:3333.
 *
 * Anchor positions come from PHANTOM_SCREENS["password"] in
 * packages/shared/src/schema.ts (400×600 canvas).
 */

import { buildThemeOverrides, buildContainerBackground } from '@/stores/phantomThemeStore';
import type { WCCOverlayV3 } from '@/stores/phantomThemeStore';
import { supabase } from '@/integrations/supabase/client';

// Anchor → position / type (mirrors PHANTOM_SCREENS["password"])
// Logo lives at the top center where Phantom natively shows its ghost mascot;
// our overlay paints its own themed glyph there (👻) so Phantom's logo never
// has to "show through" the background.
const PASSWORD_ANCHORS = [
  { id: 'background',     x: 0,   y: 0,   width: 400, height: 600, type: 'container', zIndex: 0, content: {} },
  { id: 'header',         x: 0,   y: 0,   width: 400, height: 48,  type: 'container', zIndex: 1, content: {} },
  { id: 'header-title',   x: 140, y: 10,  width: 120, height: 28,  type: 'text',      zIndex: 2, content: { text: 'phantom' } },
  { id: 'help-button',    x: 358, y: 10,  width: 28,  height: 28,  type: 'button',    zIndex: 2, content: { text: '?' } },
  { id: 'header-line',    x: 0,   y: 48,  width: 400, height: 1,   type: 'container', zIndex: 1, content: {} },
  { id: 'logo',           x: 140, y: 110, width: 120, height: 140, type: 'text',      zIndex: 2, content: { text: '👻' } },
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

      // Animated background support — CSS keyframes defined in AgentOverlay
      const bgData = theme.global.background;
      if (bgData.animated && bgData.animation_preset) {
        if (bgData.animation_preset === 'gradient-shift') {
          const ac = bgData.animation_colors;
          if (ac && ac.length >= 3) {
            bgStyles.background = `linear-gradient(-45deg, ${ac.join(', ')})`;
          }
          bgStyles.backgroundSize = '400% 400%';
          bgStyles.animation = 'wcc-gradient-shift 12s ease infinite';
        } else if (bgData.animation_preset === 'aurora') {
          bgStyles.animation = 'wcc-aurora 14s ease-in-out infinite';
        } else if (bgData.animation_preset === 'cosmic-pulse') {
          bgStyles.animation = 'wcc-cosmic-pulse 6s ease-in-out infinite';
        }
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
 * Send a WCCOverlayV3 theme to the local Phantom Overlay macOS agent.
 *
 * Uses Supabase Realtime broadcast (WSS) to avoid the Chrome mixed-content
 * block that prevents HTTPS pages from opening ws:// connections.
 *
 * Flow:
 *   WCC app (HTTPS) → Supabase channel "wcc:overlay" (WSS)
 *   → sync-server (Node.js, no restrictions) receives broadcast
 *   → sync-server forwards layout:push to agent via ws://localhost:3333
 *   → macOS agent renders overlay on top of Phantom window
 */
export async function pushThemeToPhantom(theme: WCCOverlayV3): Promise<void> {
  const layoutDoc = wccToLayoutDocument(theme);

  console.log(`[WCCBridge] 📤 Broadcasting layout to Supabase channel wcc:overlay (${layoutDoc.elements.length} elements)`);

  const response = await supabase
    .channel('wcc:overlay')
    .send({
      type: 'broadcast',
      event: 'wcc:layout-push',
      payload: layoutDoc,
    });

  if (response === 'error') {
    throw new Error('Supabase broadcast failed — check your connection');
  }

  if (response === 'timed out') {
    throw new Error('Supabase broadcast timed out');
  }

  console.log('[WCCBridge] ✅ Broadcast sent, response:', response);
  // "ok" means delivered to channel — sync-server will forward to agent
}
