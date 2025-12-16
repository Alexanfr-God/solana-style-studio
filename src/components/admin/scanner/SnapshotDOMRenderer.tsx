import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SnapshotElement {
  tag: string;
  id?: string | null;
  classes?: string[];
  text?: string | null;
  rect?: { x: number; y: number; width: number; height: number };
  styles?: Record<string, string>;
}

interface SnapshotTheme {
  background?: string;
  color?: string;
  accent?: string;
  fontFamily?: string;
}

interface SnapshotDOMRendererProps {
  elements: SnapshotElement[];
  theme?: SnapshotTheme;
  title?: string;
  selectedElementId?: string | null;
  onElementClick?: (element: SnapshotElement) => void;
  onElementHover?: (element: SnapshotElement | null) => void;
}

export const SnapshotDOMRenderer: React.FC<SnapshotDOMRendererProps> = ({
  elements,
  theme,
  title,
  selectedElementId,
  onElementClick,
  onElementHover,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getElementStyle = (el: SnapshotElement): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      fontFamily: theme?.fontFamily || 'inherit',
    };

    // Apply element-specific styles
    if (el.styles) {
      Object.assign(baseStyle, el.styles);
    }

    // Style based on tag type
    switch (el.tag?.toUpperCase()) {
      case 'BUTTON':
        return {
          ...baseStyle,
          backgroundColor: theme?.accent || '#6366f1',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
        };
      case 'INPUT':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: theme?.color || '#ffffff',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(255,255,255,0.2)',
        };
      case 'H1':
      case 'H2':
      case 'H3':
        return {
          ...baseStyle,
          fontWeight: 600,
          fontSize: el.tag === 'H1' ? '20px' : el.tag === 'H2' ? '16px' : '14px',
        };
      case 'SPAN':
        return {
          ...baseStyle,
          fontSize: '12px',
          opacity: 0.8,
        };
      default:
        return baseStyle;
    }
  };

  const renderElement = (el: SnapshotElement, index: number) => {
    const elementId = el.id || `el-${index}`;
    const isSelected = selectedElementId === elementId;
    const isHovered = hoveredId === elementId;

    return (
      <div
        key={elementId}
        className={cn(
          'relative transition-all duration-150 cursor-pointer',
          isSelected && 'ring-2 ring-primary ring-offset-1',
          isHovered && !isSelected && 'ring-1 ring-primary/50'
        )}
        style={getElementStyle(el)}
        onClick={() => onElementClick?.(el)}
        onMouseEnter={() => {
          setHoveredId(elementId);
          onElementHover?.(el);
        }}
        onMouseLeave={() => {
          setHoveredId(null);
          onElementHover?.(null);
        }}
      >
        {/* Element indicator */}
        {(isHovered || isSelected) && (
          <div className="absolute -top-5 left-0 text-[10px] bg-primary text-primary-foreground px-1 rounded whitespace-nowrap z-10">
            {el.tag?.toLowerCase()}{el.id ? `#${el.id}` : ''}
          </div>
        )}
        
        {el.text || `[${el.tag}]`}
      </div>
    );
  };

  // Group elements by type for better layout
  const buttons = elements.filter(el => el.tag?.toUpperCase() === 'BUTTON');
  const headings = elements.filter(el => ['H1', 'H2', 'H3'].includes(el.tag?.toUpperCase() || ''));
  const statusElements = elements.filter(el => 
    el.classes?.some(c => c.includes('status')) || el.id?.includes('status')
  );
  const otherElements = elements.filter(el => 
    !buttons.includes(el) && !headings.includes(el) && !statusElements.includes(el)
  );

  return (
    <div 
      className="rounded-lg overflow-hidden shadow-xl"
      style={{
        backgroundColor: theme?.background || '#1a1a2e',
        color: theme?.color || '#ffffff',
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      {/* Mock popup header */}
      <div 
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-xs opacity-70 flex-1 text-center truncate">
          {title || 'Extension Popup'}
        </span>
      </div>

      {/* Content area */}
      <div className="p-4 space-y-3">
        {/* Headings */}
        {headings.map((el, i) => renderElement(el, i))}
        
        {/* Status elements */}
        {statusElements.length > 0 && (
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme?.accent || '#22c55e' }}
            />
            {statusElements.map((el, i) => renderElement(el, headings.length + i))}
          </div>
        )}

        {/* Other elements */}
        {otherElements.map((el, i) => renderElement(el, headings.length + statusElements.length + i))}

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="pt-2 space-y-2">
            {buttons.map((el, i) => renderElement(el, elements.length - buttons.length + i))}
          </div>
        )}

        {/* Empty state */}
        {elements.length === 0 && (
          <div className="text-center text-sm opacity-50 py-8">
            No elements to render
          </div>
        )}
      </div>

      {/* Footer with element count */}
      <div 
        className="px-3 py-1.5 text-[10px] opacity-50 border-t text-center"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {elements.length} elements captured
      </div>
    </div>
  );
};
