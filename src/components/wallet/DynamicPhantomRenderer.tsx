import React, { useEffect, useState } from 'react';

// Matches LayoutElement from @phantom-editor/shared
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
  // Full generated background for root container (url, gradient, solid)
  backgroundCSS?: string;
}

export const DynamicPhantomRenderer: React.FC<Props> = ({ themeOverrides = {}, backgroundCSS }) => {
  const [layout, setLayout] = useState<PhantomLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Try local public/ first, fall back to GitHub raw (always up-to-date with Overlay Editor publishes)
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
  const scaleX = 384 / canvas.width;   // wacocu container is w-96 = 384px
  const scaleY = 650 / canvas.height;  // wacocu container is h-[650px]

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Detect background type and extract URL for <img> rendering
  const bgImageUrl = backgroundCSS?.startsWith('url(')
    ? backgroundCSS.slice(4, -1).replace(/^["']|["']$/g, '')
    : null;
  const bgGradient = backgroundCSS && backgroundCSS.includes('gradient') ? backgroundCSS : null;
  const bgColor = backgroundCSS && !bgImageUrl && !bgGradient ? backgroundCSS : null;

  console.log('[DPR] backgroundCSS:', backgroundCSS, '→ url:', bgImageUrl, 'gradient:', !!bgGradient, 'color:', bgColor);

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
      {/* Background image rendered as <img> to bypass CSS background limitations */}
      {bgImageUrl && (
        <img
          src={bgImageUrl}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
          }}
          onLoad={() => console.log('[DPR] ✅ Background image loaded:', bgImageUrl.slice(0, 80))}
          onError={() => console.error('[DPR] ❌ Background image FAILED:', bgImageUrl.slice(0, 80))}
        />
      )}
      {sorted.map(el => {
        const override = themeOverrides[el.anchor ?? ''] ?? {};

        // Build rich CSS from override — support glassmorphism, neon, gradient
        const richOverride: React.CSSProperties = { ...override as React.CSSProperties };
        if (override.backdropFilter) {
          (richOverride as Record<string, string>).WebkitBackdropFilter = override.backdropFilter;
        }

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
        };

        const phantomId = el.anchor ?? el.id;

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
              // Ghost placeholder when no image src
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
