
import React, { useEffect, useState } from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';
import { ElementHighlightOverlay } from './ElementHighlightOverlay';
import { useEditModeManager } from '@/hooks/useEditModeManager';

interface AdvancedInteractiveElementSelectorProps {
  isActive: boolean;
  onElementSelect: (element: WalletElement) => void;
  onExit: () => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const AdvancedInteractiveElementSelector: React.FC<AdvancedInteractiveElementSelectorProps> = ({
  isActive,
  onElementSelect,
  onExit,
  containerRef
}) => {
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const { state, setHoveredElement, selectElement } = useEditModeManager();

  const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
  };

  useEffect(() => {
    if (!isActive || !containerRef.current) {
      setHoveredPosition(null);
      setSelectedPosition(null);
      return;
    }

    const container = containerRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!elementAtPoint || !container.contains(elementAtPoint)) {
        setHoveredElement(null, null);
        setHoveredPosition(null);
        return;
      }

      if (walletElementsMapper.isElementCustomizable(elementAtPoint)) {
        const elementInfo = walletElementsMapper.getElementInfo(elementAtPoint);
        if (elementInfo) {
          setHoveredElement(elementInfo, elementAtPoint);
          setHoveredPosition(getElementPosition(elementAtPoint));
        }
      } else {
        setHoveredElement(null, null);
        setHoveredPosition(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isActive) return;

      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!elementAtPoint || !container.contains(elementAtPoint)) return;

      if (walletElementsMapper.isElementCustomizable(elementAtPoint)) {
        e.preventDefault();
        e.stopPropagation();
        
        const elementInfo = walletElementsMapper.getElementInfo(elementAtPoint);
        if (elementInfo) {
          selectElement(elementInfo, elementAtPoint);
          setSelectedPosition(getElementPosition(elementAtPoint));
          onElementSelect(elementInfo);
          console.log('✅ Advanced Element selected:', elementInfo.name, elementInfo.selector);
        }
      }
    };

    // Handle window resize to update positions
    const handleResize = () => {
      if (state.hoveredDomElement) {
        setHoveredPosition(getElementPosition(state.hoveredDomElement));
      }
      if (state.selectedDomElement) {
        setSelectedPosition(getElementPosition(state.selectedDomElement));
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive, containerRef, onElementSelect, selectElement, setHoveredElement, state.hoveredDomElement, state.selectedDomElement]);

  // Clear states when edit mode is deactivated
  useEffect(() => {
    if (!isActive) {
      setHoveredPosition(null);
      setSelectedPosition(null);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Hover overlay */}
      <ElementHighlightOverlay
        element={state.hoveredDomElement}
        walletElement={state.hoveredElement}
        isSelected={false}
        isHovered={true}
        position={hoveredPosition}
      />

      {/* Selection overlay */}
      <ElementHighlightOverlay
        element={state.selectedDomElement}
        walletElement={state.selectedElement}
        isSelected={true}
        isHovered={false}
        position={selectedPosition}
      />
    </>
  );
};
