
import React, { useEffect, useState } from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';
import { ElementHighlightOverlay } from './ElementHighlightOverlay';
import { useEditModeManager } from '@/hooks/useEditModeManager';

interface AdvancedInteractiveElementSelectorProps {
  isActive: boolean;
  currentLayer: string;
  onElementSelect: (element: WalletElement) => void;
  onExit: () => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const AdvancedInteractiveElementSelector: React.FC<AdvancedInteractiveElementSelectorProps> = ({
  isActive,
  currentLayer,
  onElementSelect,
  onExit,
  containerRef
}) => {
  const [hoveredPosition, setHoveredPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  
  const { state, setHoveredElement, selectElement } = useEditModeManager();

  const getElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const container = containerRef.current;
    
    console.log('🔍 Debug positioning:');
    console.log('  Element rect:', rect);
    console.log('  Container:', container);
    
    if (container) {
      const containerRect = container.getBoundingClientRect();
      console.log('  Container rect:', containerRect);
      
      // Учитываем прокрутку контейнера
      const scrollTop = container.scrollTop || 0;
      const scrollLeft = container.scrollLeft || 0;
      console.log('  Container scroll:', { scrollTop, scrollLeft });
      
      // Вычисляем позицию относительно контейнера
      const relativePosition = {
        x: rect.left - containerRect.left + scrollLeft,
        y: rect.top - containerRect.top + scrollTop,
        width: rect.width,
        height: rect.height
      };
      
      console.log('  Relative position:', relativePosition);
      return relativePosition;
    }
    
    // Fallback к абсолютным координатам
    const absolutePosition = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };
    
    console.log('  Absolute position (fallback):', absolutePosition);
    return absolutePosition;
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
        if (elementInfo && elementInfo.screen === currentLayer) {
          setHoveredElement(elementInfo, elementAtPoint);
          const position = getElementPosition(elementAtPoint);
          setHoveredPosition(position);
          console.log(`🎯 Hovering over: ${elementInfo.name} (layer: ${currentLayer})`);
          console.log('  Position set to:', position);
        } else {
          setHoveredElement(null, null);
          setHoveredPosition(null);
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
        const elementInfo = walletElementsMapper.getElementInfo(elementAtPoint);
        
        if (elementInfo && elementInfo.screen === currentLayer) {
          // Prevent default behavior and stop propagation to block normal wallet actions
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          selectElement(elementInfo, elementAtPoint);
          const position = getElementPosition(elementAtPoint);
          setSelectedPosition(position);
          onElementSelect(elementInfo);
          console.log('✅ Element selected (layer:', currentLayer, '):', elementInfo.name);
          console.log('  Selected position set to:', position);
        }
      }
    };

    // Handle window resize and scroll to update positions
    const handleResize = () => {
      if (state.hoveredDomElement) {
        const newPosition = getElementPosition(state.hoveredDomElement);
        setHoveredPosition(newPosition);
        console.log('🔄 Hovered position updated on resize:', newPosition);
      }
      if (state.selectedDomElement) {
        const newPosition = getElementPosition(state.selectedDomElement);
        setSelectedPosition(newPosition);
        console.log('🔄 Selected position updated on resize:', newPosition);
      }
    };

    const handleScroll = () => {
      if (state.hoveredDomElement) {
        const newPosition = getElementPosition(state.hoveredDomElement);
        setHoveredPosition(newPosition);
        console.log('📜 Hovered position updated on scroll:', newPosition);
      }
      if (state.selectedDomElement) {
        const newPosition = getElementPosition(state.selectedDomElement);
        setSelectedPosition(newPosition);
        console.log('📜 Selected position updated on scroll:', newPosition);
      }
    };

    // Add event listeners with capture flag to intercept events early
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousedown', handleClick, true); // Also block mousedown
    window.addEventListener('resize', handleResize);
    container.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousedown', handleClick, true);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, currentLayer, containerRef, onElementSelect, selectElement, setHoveredElement, state.hoveredDomElement, state.selectedDomElement]);

  // Clear states when edit mode is deactivated
  useEffect(() => {
    if (!isActive) {
      setHoveredPosition(null);
      setSelectedPosition(null);
    }
  }, [isActive]);

  // Debug: Log available selectors when edit mode is activated
  useEffect(() => {
    if (isActive) {
      console.log('🔍 Debug: Advanced Edit Mode activated, checking available selectors...');
      walletElementsMapper.debugLogAvailableSelectors();
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
        containerRef={containerRef}
      />

      {/* Selection overlay */}
      <ElementHighlightOverlay
        element={state.selectedDomElement}
        walletElement={state.selectedElement}
        isSelected={true}
        isHovered={false}
        position={selectedPosition}
        containerRef={containerRef}
      />
    </>
  );
};
