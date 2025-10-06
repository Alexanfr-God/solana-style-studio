import React, { useState } from 'react';
import { Palette, AlertTriangle } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { toast } from '@/hooks/use-toast';

export const ManualColorEditor: React.FC = () => {
  const { selectedElement } = useSmartEdit();
  const [color, setColor] = useState('#3b82f6');
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

  const handleColorChange = async (newColor: string) => {
    setColor(newColor);
    
    if (!selectedElement?.json_path) {
      toast({
        title: "Ошибка",
        description: "У элемента отсутствует json_path",
        variant: "destructive"
      });
      return;
    }
    
    const pathToUpdate = selectedElement.json_path + '/background';
    
    console.log('[ManualEdit] 🎯', {
      element: selectedElement.name,
      selector: selectedElement.selector,
      json_path: pathToUpdate,
      newColor
    });
    
    try {
      const { useThemeStore } = await import('@/state/themeStore');
      
      // Вызываем ТОЛЬКО themeStore.updateThemeValue
      await useThemeStore.getState().updateThemeValue(pathToUpdate, newColor);
      
      toast({
        title: "✅ Успешно",
        description: `Цвет обновлён: ${selectedElement.name}`,
      });
      
    } catch (error) {
      console.error('[ManualEdit] ❌ Error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить цвет",
        variant: "destructive"
      });
    }
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
            Editing: {selectedElement.json_path}/background
          </div>
          <div className="text-xs text-white/60 font-mono">
            Element: {selectedElement.name} ({selectedElement.selector})
          </div>
          {isOpen && (
            <ColorPicker
              value={color}
              onChange={handleColorChange}
              width={280}
              hidePresets={true}
              hideEyeDrop={true}
              hideAdvancedSliders={true}
              hideColorGuide={true}
              hideInputType={false}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
