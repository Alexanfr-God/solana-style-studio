import React, { useState, useMemo } from 'react';
import { Palette, AlertTriangle } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { useThemeStore } from '@/state/themeStore';
import { useExtendedWallet } from '@/context/WalletContextProvider';

// Helper to get value from theme by path
const getByPath = (obj: any, path: string): any => {
  if (!path) return obj;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanPath.split('/').filter(Boolean).reduce((acc, k) => acc?.[k], obj);
};

export const ManualColorEditor: React.FC = () => {
  const { selectedElement } = useSmartEdit();
  const { walletProfile } = useExtendedWallet();
  const [tempColor, setTempColor] = useState('#3b82f6');
  const [isOpen, setIsOpen] = useState(false);

  // Если нет выбранного элемента - не показываем
  if (!selectedElement) {
    return null;
  }

  // Если нет json_path - показываем предупреждение
  if (!selectedElement.json_path) {
    return (
      <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-500 shadow-lg flex items-center justify-center" title="Element has no JSON path">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </div>
    );
  }

  // Get current value from theme
  const currentValue = useMemo(() => {
    const theme = useThemeStore.getState().theme;
    return getByPath(theme, selectedElement?.json_path || '');
  }, [selectedElement]);

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    console.log('[ManualEdit] 🎨 Color changed:', { 
      path: selectedElement?.json_path, 
      value: newColor 
    });
  };

  const applyColor = () => {
    if (!selectedElement?.json_path) {
      console.warn('[ManualEdit] ⚠️ No json_path');
      return;
    }
    
    const userId = walletProfile?.wallet_address || 'anonymous';
    
    console.log('[ManualEdit] 🎨 Applying color:', { 
      path: selectedElement.json_path,
      value: tempColor,
      mode: 'full',
      userId 
    });
    
    // ✅ Используем ТОЛЬКО json_path как есть, БЕЗ конкатенаций
    useThemeStore.getState().updateThemeValue(
      selectedElement.json_path, 
      tempColor, 
      userId,
      { mode: 'full' }  // ✅ Новый параметр
    );
    
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
          title="Manual Color Editor"
        >
          <Palette className="h-5 w-5 text-white" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 bg-gray-900/95 border-purple-500/30 backdrop-blur-sm" align="start">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-white">
            Editing: {selectedElement.json_path}
          </div>
          <div className="text-xs text-white/60 font-mono">
            Element: {selectedElement.name} ({selectedElement.selector})
          </div>
          <div className="text-xs text-purple-400">
            Current: {currentValue || 'not set'}
          </div>
          {isOpen && (
            <>
              {/* Color Picker */}
              <ColorPicker
                value={tempColor}
                onChange={handleColorChange}
                width={280}
                hidePresets={true}
                hideEyeDrop={true}
                hideAdvancedSliders={true}
                hideColorGuide={true}
                hideInputType={false}
              />
              
              {/* Apply Button */}
              <Button 
                onClick={applyColor}
                className="w-full mt-3"
                size="sm"
              >
                Apply Color
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
