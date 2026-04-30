import React, { useEffect, useState } from 'react';

// ── Matches LayoutElement from @phantom-editor/shared ─────────────────────────
interface LayoutElement {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  styles: Record<string, string>;
  content: { text?: string; src?: string; alt?: string };
  label?: string;
  anchor?: string;
  screen?: string;
}

interface PhantomLayout {
  canvas: { width: number; height: number };
  screen: string;
  elements: LayoutElement[];
  publishedAt?: string;
}

interface Props {
  themeOverrides?: Record<string, Record<string, string>>;
  /** Full generated background for root container (url(...), gradient, solid color) */
  backgroundCSS?: string;
}

// ── Animation keyframes injected once into document head ──────────────────────
const DPR_KEYFRAMES = `
  @keyframes dpr-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes dpr-glow {
    0%,100% { box-shadow: 0 0 6px var(--dpr-gc,#ab9ff2), 0 0 14px var(--dpr-gc,#ab9ff2)55; }
    50%     { box-shadow: 0 0 20px var(--dpr-gc,#ab9ff2), 0 0 40px var(--dpr-gc,#ab9ff2)88; }
  }
  @keyframes dpr-pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%     { opacity:0.82; transform:scale(0.97); }
  }
  @keyframes dpr-float {
    0%,100% { transform:translateY(0px); }
    50%     { transform:translateY(-5px); }
  }
  @keyframes dpr-bounce {
    0%,100% { transform:translateY(0); }
    40%     { transform:translateY(-8px); }
    60%     { transform:translateY(-4px); }
  }
  @keyframes dpr-ripple {
    0%   { box-shadow:0 0 0 0  var(--dpr-rc,rgba(171,159,242,.45)); }
    70%  { box-shadow:0 0 0 12px rgba(0,0,0,0); }
    100% { box-shadow:0 0 0 0  rgba(0,0,0,0); }
  }
  @keyframes dpr-neon-flicker {
    0%,93%,97%,100% { opacity:1; }
    94%  { opacity:0.7; }
    96%  { opacity:0.85; }
    98%  { opacity:0.6; }
  }
`;

// ── Google Fonts catalog — family name → encoded URL param ────────────────────
const FONT_URLS: Record<string, string> = {
  'Orbitron':           'Orbitron:wght@400;700;900',
  'Space Grotesk':      'Space+Grotesk:wght@300;400;500;600;700',
  'Space Mono':         'Space+Mono:wght@400;700',
  'Exo 2':              'Exo+2:wght@300;400;600;700',
  'Rajdhani':           'Rajdhani:wght@400;500;600;700',
  'Audiowide':          'Audiowide',
  'Press Start 2P':     'Press+Start+2P',
  'VT323':              'VT323',
  'Silkscreen':         'Silkscreen',
  'Playfair Display':   'Playfair+Display:wght@400;700',
  'Cormorant Garamond': 'Cormorant+Garamond:wght@300;400;600',
  'Bebas Neue':         'Bebas+Neue',
  'Anton':              'Anton',
  'Black Ops One':      'Black+Ops+One',
  'DM Sans':            'DM+Sans:wght@300;400;500;600',
  'Manrope':            'Manrope:wght@300;400;500;600;700',
  'Syne':               'Syne:wght@400;700;800',
  'Inter':              'Inter:wght@300;400;500;600;700',
};

// ── Convert animation spec (encoded as JSON in '--anim') → CSS properties ─────
interface AnimSpec { type: string; duration_ms: number; loop: boolean; color?: string; delay_ms?: number; easing?: string; intensity?: number; }

function animToCSS(raw: string | undefined): React.CSSProperties {
  if (!raw) return {};
  let anim: AnimSpec;
  try { anim = JSON.parse(raw); } catch { return {}; }
  if (!anim.type || anim.type === 'none' || !anim.duration_ms) return {};

  const dur   = `${anim.duration_ms}ms`;
  const ease  = anim.easing ?? 'ease-in-out';
  const iter  = anim.loop ? 'infinite' : '1';
  const delay = anim.delay_ms ? `${anim.delay_ms}ms` : '0s';
  const name  = `dpr-${anim.type.replace(/_/g, '-')}`;

  const css: React.CSSProperties & Record<string, string> = {
    animation: `${name} ${dur} ${ease} ${delay} ${iter}`,
  };

  // CSS custom props for color-driven animations (glow, ripple)
  const c = anim.color;
  if (c) {
    css['--dpr-gc'] = c;
    css['--dpr-rc'] = `${c}73`;
  }

  // Shimmer needs a shimmer gradient baked into backgroundImage
  if (anim.type === 'shimmer') {
    const shimColor = c ?? '#ab9ff2';
    const mag = anim.intensity ?? 0.55;
    css.backgroundImage = `linear-gradient(90deg, transparent 25%, ${shimColor}${Math.round(mag * 255).toString(16).padStart(2,'0')} 50%, transparent 75%)`;
    css.backgroundSize = '200% 100%';
  }

  return css;
}

// ── Inject keyframes + Google Fonts into document head (idempotent) ───────────
function ensureStyles(fontFamilies: string[]) {
  if (typeof document === 'undefined') return;

  // Keyframes (inject once)
  const KF_ID = 'dpr-keyframes';
  if (!document.getElementById(KF_ID)) {
    const style = document.createElement('style');
    style.id = KF_ID;
    style.textContent = DPR_KEYFRAMES;
    document.head.appendChild(style);
    console.log('[DPR] keyframes injected');
  }

  // Google Fonts (one <link> per unique family)
  fontFamilies.forEach(family => {
    const id = `dpr-font-${family.replace(/\s+/g, '-').toLowerCase()}`;
    if (document.getElementById(id)) return;
    const param = FONT_URLS[family];
    if (!param) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${param}&display=swap`;
    document.head.appendChild(link);
    console.log('[DPR] loaded font:', family);
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export const DynamicPhantomRenderer: React.FC<Props> = ({ themeOverrides = {}, backgroundCSS }) => {
  const [layout, setLayout] = useState<PhantomLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const GITHUB_RAW = 'https://raw.githubusercontent.com/Alexanfr-God/solana-style-studio/main/public/phantom-layout.json';

  useEffect(() => {
    const tryFetch = (url: string) =>
      fetch(url, { cache: 'no-store' }).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

    tryFetch('/phantom-layout.json')
      .catch(() => tryFetch(GITHUB_RAW))
      .then(setLayout)
      .catch(e => setError(e.message));
  }, []);

  // Inject styles/fonts whenever themeOverrides change
  useEffect(() => {
    const fonts = new Set<string>();
    Object.values(themeOverrides).forEach(o => {
      const ff = (o as Record<string, string>).fontFamily;
      if (ff) {
        // fontFamily is stored as "'Orbitron', sans-serif" — extract the name
        const match = ff.match(/^'([^']+)'/);
        if (match) fonts.add(match[1]);
      }
    });
    ensureStyles(Array.from(fonts));
  }, [themeOverrides]);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: '#131217' }}>
        <span style={{ fontSize: 32 }}>👻</span>
        <p style={{ color: '#888', fontSize: 13 }}>Phantom layout not published yet</p>
        <p style={{ color: '#555', fontSize: 11 }}>Open Overlay Editor → click "Publish to WCC"</p>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: '#131217' }}>
        <div style={{ color: '#555', fontSize: 12 }}>Loading Phantom layout…</div>
      </div>
    );
  }

  const { canvas, elements } = layout;
  const scaleX = 384 / canvas.width;
  const scaleY = 650 / canvas.height;

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Detect background type
  const bgImageUrl = backgroundCSS?.startsWith('url(')
    ? backgroundCSS.slice(4, -1).replace(/^["']|["']$/g, '')
    : null;
  const bgGradient = backgroundCSS && backgroundCSS.includes('gradient') ? backgroundCSS : null;
  const bgColor    = backgroundCSS && !bgImageUrl && !bgGradient ? backgroundCSS : null;

  console.log('[DPR] backgroundCSS:', backgroundCSS?.slice(0, 60), '→ url:', !!bgImageUrl, 'gradient:', !!bgGradient);

  return (
    <div
      data-phantom-id="root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: bgColor ?? '#131217',
        ...(bgGradient ? { backgroundImage: bgGradient, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
      }}
    >
      {/* Background image as <img> — bypasses CSS background-size/position quirks */}
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0, pointerEvents: 'none',
          }}
          onLoad={() => console.log('[DPR] ✅ bg image loaded:', bgImageUrl.slice(0, 70))}
          onError={() => console.error('[DPR] ❌ bg image FAILED:', bgImageUrl.slice(0, 70))}
        />
      )}

      {sorted.map(el => {
        // ── KEY FIX: skip layout's background element when theme owns the bg ──
        if ((bgImageUrl || bgGradient) && el.anchor === 'background') return null;

        const anchor = el.anchor ?? el.id;
        const override = themeOverrides[anchor] ?? {};

        // Build richOverride from the override object
        const richOverride: React.CSSProperties & Record<string, string> = { ...override as React.CSSProperties & Record<string, string> };
        if (override.backdropFilter) {
          richOverride.WebkitBackdropFilter = override.backdropFilter;
        }

        // Decode animation spec and merge
        const animCSS = animToCSS(override['--anim']);

        const mergedStyles: React.CSSProperties = {
          position: 'absolute',
          left:   Math.round(el.x * scaleX),
          top:    Math.round(el.y * scaleY),
          width:  Math.round(el.width * scaleX),
          height: Math.round(el.height * scaleY),
          opacity: el.opacity,
          zIndex:  el.zIndex,
          boxSizing: 'border-box',
          ...el.styles as React.CSSProperties,
          ...richOverride,
          ...animCSS,  // animation always wins (overrides static styles)
        };

        // Remove internal keys that shouldn't be inline styles
        delete (mergedStyles as Record<string, unknown>)['--anim'];

        const phantomId = anchor;

        switch (el.type) {
          case 'text':
            return (
              <div
                key={el.id}
                data-phantom-id={phantomId}
                style={{ ...mergedStyles, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {el.content.text}
              </div>
            );

          case 'button':
            return (
              <button
                key={el.id}
                data-phantom-id={phantomId}
                style={{ ...mergedStyles, cursor: 'pointer', border: 'none' }}
              >
                {el.content.text}
              </button>
            );

          case 'input':
            return (
              <input
                key={el.id}
                data-phantom-id={phantomId}
                type="password"
                placeholder={el.content.text ?? 'Password'}
                style={{ ...mergedStyles, outline: 'none' }}
                readOnly
              />
            );

          case 'image':
            return el.content.src ? (
              <img
                key={el.id}
                data-phantom-id={phantomId}
                src={el.content.src}
                alt={el.content.alt ?? ''}
                style={{ ...mergedStyles, objectFit: 'contain' }}
              />
            ) : (
              <div key={el.id} data-phantom-id={phantomId} style={mergedStyles}>
                <svg viewBox="0 0 60 60" width="100%" height="100%" fill="none">
                  <path d="M30 5C18.95 5 10 13.95 10 25v25l6.67-5.56 6.66 5.56 6.67-5.56 6.67 5.56 6.66-5.56L50 50V25C50 13.95 41.05 5 30 5z" fill="#ab9ff2"/>
                  <circle cx="23" cy="26" r="3" fill="white"/>
                  <circle cx="37" cy="26" r="3" fill="white"/>
                </svg>
              </div>
            );

          case 'container':
          default:
            return (
              <div
                key={el.id}
                data-phantom-id={phantomId}
                style={mergedStyles}
              />
            );
        }
      })}
    </div>
  );
};
