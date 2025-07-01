
import React from 'react';
import { Edit3, X } from 'lucide-react';

interface EditModeIndicatorProps {
  isActive: boolean;
  selectedElementName?: string;
  elementsCount: number;
  onExit: () => void;
}

export const EditModeIndicator: React.FC<EditModeIndicatorProps> = ({
  isActive,
  selectedElementName,
  elementsCount,
  onExit
}) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-400/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <Edit3 className="h-4 w-4" />
            <span className="text-sm font-medium">Edit Mode Active</span>
          </div>
          
          <div className="h-4 w-px bg-white/30"></div>
          
          <div className="text-xs opacity-80">
            {elementsCount} elements loaded
          </div>
          
          {selectedElementName && (
            <>
              <div className="h-4 w-px bg-white/30"></div>
              <div className="text-xs text-green-300">
                Selected: {selectedElementName}
              </div>
            </>
          )}
          
          <button
            onClick={onExit}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            title="Exit Edit Mode (ESC)"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
