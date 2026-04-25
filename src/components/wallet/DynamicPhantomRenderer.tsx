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
  // Optional theme overrides keyed by anchor (e.g. "unlock-button": { backgroundColor: "#f00" })
  themeOverrides?: Record<string, Record<string, string>>;
}

export const DynamicPhantomRenderer: React.FC<Props> = ({ themeOverrides = {} }) => {
  const [layout, setLayout] = useState<PhantomLayout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/phantom-layout.json', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
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

  return (
    <div
      data-phantom-id="root"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#131217',
      }}
    >
      {sorted.map(el => {
        const override = themeOverrides[el.anchor ?? ''] ?? {};
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
          ...override,
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
