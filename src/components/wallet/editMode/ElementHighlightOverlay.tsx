
import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';

interface ElementHighlightOverlayProps {
  element: HTMLElement | null;
  walletElement: WalletElement | null;
  isSelected: boolean;
  isHovered: boolean;
  position: { x: number; y: number; width: number; height: number } | null;
  containerRef: React.RefObject<HTMLElement>;
}

export const ElementHighlightOverlay: React.FC<ElementHighlightOverlayProps> = ({
  element,
  walletElement,
  isSelected,
  isHovered,
  position,
  containerRef
}) => {
  if (!position || !containerRef.current) return null;

  const container = containerRef.current;
  const containerRect = container.getBoundingClientRect();
  
  console.log('🎨 Overlay rendering:');
  console.log('  Position prop:', position);
  console.log('  Container rect:', containerRect);
  
  // Позиционируем overlay относительно контейнера кошелька
  const overlayStyle = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    pointerEvents: 'none' as const,
    zIndex: 9999, // Очень высокий z-index чтобы быть поверх всего
    transition: 'all 0.1s ease-out',
    borderRadius: '4px',
  };
  
  console.log('  Final overlay style:', overlayStyle);

  const labelStyle = {
    position: 'absolute' as const,
    top: -28,
    left: 0,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500' as const,
    whiteSpace: 'nowrap' as const,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    zIndex: 10000,
  };

  if (isSelected) {
    return (
      <div
        style={overlayStyle}
        className="border-2 border-green-400 bg-green-400/15 shadow-lg"
      >
        <div 
          style={{
            ...labelStyle,
            backgroundColor: '#22c55e',
            color: 'white',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
          }}
        >
          <div>✓ {walletElement?.name || 'Selected'}</div>
          {walletElement?.json_path && (
            <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>
              {walletElement.json_path}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isHovered) {
    return (
      <div
        style={overlayStyle}
        className="border-2 border-purple-400 bg-purple-400/20 shadow-lg"
      >
        <div 
          style={{
            ...labelStyle,
            backgroundColor: '#a855f7',
            color: 'white',
            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
          }}
        >
          <div>{walletElement?.name || 'Hover'}</div>
          {walletElement?.json_path && (
            <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>
              {walletElement.json_path}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
