
import React from 'react';
import { WalletElement } from '@/hooks/useWalletElements';

interface ElementTooltipProps {
  element: WalletElement;
  position: { x: number; y: number };
  isVisible: boolean;
}

export const ElementTooltip: React.FC<ElementTooltipProps> = ({
  element,
  position,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none transition-opacity duration-200"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-lg shadow-lg border border-purple-400/30 backdrop-blur-sm">
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-sm">{element.name}</div>
          <div className="text-xs opacity-80">{element.type}</div>
          {element.description && (
            <div className="text-xs opacity-70 max-w-48 truncate">
              {element.description}
            </div>
          )}
        </div>
        <div
          className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"
          style={{
            left: '12px',
            bottom: '-4px'
          }}
        />
      </div>
    </div>
  );
};
