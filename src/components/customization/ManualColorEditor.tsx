import React, { useState } from 'react';
import { Palette, AlertTriangle } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { useThemeStore } from '@/state/themeStore';
import { useExtendedWallet } from '@/context/WalletContextProvider';

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

  const handleColorChange = (newColor: string) => {
    setTempColor(newColor);
    console.log('[ManualEdit] 🎨 Color changed:', { 
      path: selectedElement?.json_path, 
      value: newColor 
    });
  };

  const applyColor = () => {
    if (!selectedElement?.json_path) {
      console.warn('[ManualEdit] ⚠️ No json_path for element:', selectedElement?.name);
      return;
    }
    
    // 🔧 Quick Fix: если путь указывает на объект (не свойство) — добавляем /backgroundColor
    let pathToUpdate = selectedElement.json_path;
    
    const lastPart = pathToUpdate.split('/').pop()?.toLowerCase() || '';
    const isPropertyPath = ['backgroundcolor', 'textcolor', 'color', 'bordercolor', 'iconcolor'].includes(lastPart);
    
    if (!isPropertyPath) {
      // Путь указывает на объект (например /homeLayer/actionButtons/swapButton)
      // → добавляем /backgroundColor
      pathToUpdate = pathToUpdate + '/backgroundColor';
      console.log('[ManualEdit] 🔧 Auto-appended /backgroundColor:', pathToUpdate);
    }
    
    const userId = walletProfile?.wallet_address || 'anonymous';
    
    console.log('[ManualEdit] 🎨 Applying color:', { 
      original: selectedElement.json_path,
      path: pathToUpdate, 
      value: tempColor, 
      userId 
    });
    
    useThemeStore.getState().updateThemeValue(pathToUpdate, tempColor, userId);
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
          {isOpen && (
            <>
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
