
import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';

interface ElementHighlightOverlayProps {
  element: HTMLElement | null;
  walletElement: WalletElement | null;
  isSelected: boolean;
  isHovered: boolean;
  position: { x: number; y: number; width: number; height: number } | null;
}

export const ElementHighlightOverlay: React.FC<ElementHighlightOverlayProps> = ({
  element,
  walletElement,
  isSelected,
  isHovered,
  position
}) => {
  if (!position) return null;

  const overlayStyle = {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    width: position.width,
    height: position.height,
    pointerEvents: 'none' as const,
    zIndex: 1000,
    transition: 'all 0.2s ease-in-out',
  };

  if (isSelected) {
    return (
      <div
        style={overlayStyle}
        className="border-2 border-green-400 bg-green-400/10 rounded animate-pulse"
      >
        <div className="absolute -top-8 left-0 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          ✓ {walletElement?.name || 'Selected'}
        </div>
      </div>
    );
  }

  if (isHovered) {
    return (
      <div
        style={overlayStyle}
        className="border-2 border-purple-400 bg-purple-400/15 rounded"
      >
        <div className="absolute -top-8 left-0 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          {walletElement?.name || 'Hover'}
        </div>
      </div>
    );
  }

  return null;
};
