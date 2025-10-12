import React, { useEffect, useState, useRef } from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { jsonBridge } from '@/services/jsonBridgeService';
interface InteractiveElementSelectorProps {
  isActive: boolean;
  onElementSelect: (element: WalletElement) => void;
  onExit: () => void;
  containerRef: React.RefObject<HTMLElement>;
}

export const InteractiveElementSelector: React.FC<InteractiveElementSelectorProps> = ({
  isActive,
  onElementSelect,
  onExit,
  containerRef
}) => {
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    
    // Load element mappings from jsonBridge
    jsonBridge.loadElementMappings().catch(err => {
      console.error('[InteractiveElementSelector] Failed to load element mappings:', err);
    });
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isActive) return;

      // Находим элемент под курсором
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!elementAtPoint || !container.contains(elementAtPoint)) {
        setHoveredElement(null);
        setTooltip(null);
        return;
      }

      // Используем ТОЛЬКО jsonBridge для проверки и получения информации
      const mapping = jsonBridge.findMappingByDomElement(elementAtPoint);
      
      if (mapping) {
        if (elementAtPoint !== hoveredElement) {
          setHoveredElement(elementAtPoint);
          
          setTooltip({
            x: e.clientX + 10,
            y: e.clientY - 30,
            text: mapping.json_path 
              ? `${mapping.name} (${mapping.type})\n${mapping.json_path}`
              : `${mapping.name} (${mapping.type})`
          });
        }
      } else {
        setHoveredElement(null);
        setTooltip(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!isActive) return;

      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!elementAtPoint || !container.contains(elementAtPoint)) return;

      // ✅ Проверяем, что клик НЕ внутри dropdown меню
      const isInsideDropdown = elementAtPoint.closest('[data-element-id^="account-dropdown"]') ||
                               elementAtPoint.closest('[data-element-id^="wallet-list"]');
      
      if (isInsideDropdown) {
        // 🔓 Пропускаем клик - пусть dropdown обработает его сам
        console.log('[ElementSelector] ⏭️ Click inside dropdown, skipping');
        return; // НЕ вызываем preventDefault/stopPropagation
      }

      // Используем ТОЛЬКО jsonBridge
      const mapping = jsonBridge.findMappingByDomElement(elementAtPoint);
      
      if (mapping) {
        e.preventDefault();
        e.stopPropagation();
        
        // Создаем WalletElement из jsonBridge mapping
        const walletElement: WalletElement = {
          id: mapping.id,
          name: mapping.name,
          type: mapping.type,
          screen: mapping.screen || 'unknown',
          selector: mapping.selector,
          json_path: mapping.json_path,
          description: `Editable element: ${mapping.name}`,
          customizable: true
        };
        
        setSelectedElement(elementAtPoint);
        onElementSelect(walletElement);
        
        console.log('[ElementSelector] ✅ Selected:', {
          name: mapping.name,
          path: mapping.json_path,
          selector: mapping.selector
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    // Добавляем обработчики событий
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, hoveredElement, containerRef, onElementSelect, onExit]);

  // Очищаем состояние при выходе из режима
  useEffect(() => {
    if (!isActive) {
      setHoveredElement(null);
      setSelectedElement(null);
      setTooltip(null);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Overlay для подсветки элементов */}
      {hoveredElement && (
        <div
          ref={overlayRef}
          className="fixed pointer-events-none z-50 border-2 border-purple-500 bg-purple-500/20 rounded transition-all duration-150"
          style={{
            left: hoveredElement.offsetLeft,
            top: hoveredElement.offsetTop,
            width: hoveredElement.offsetWidth,
            height: hoveredElement.offsetHeight,
          }}
        />
      )}

      {/* Подсветка выбранного элемента */}
      {selectedElement && (
        <div
          className="fixed pointer-events-none z-40 border-2 border-green-500 bg-green-500/20 rounded"
          style={{
            left: selectedElement.offsetLeft,
            top: selectedElement.offsetTop,
            width: selectedElement.offsetWidth,
            height: selectedElement.offsetHeight,
          }}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-black/80 text-white px-2 py-1 rounded text-xs pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Индикатор режима редактирования */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Edit Mode Active</span>
          <span className="text-xs opacity-80">(Press ESC to exit)</span>
        </div>
      </div>
    </>
  );
};
