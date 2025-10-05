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
      console.warn('[ManualColorEditor] ❌ No json_path for element:', selectedElement?.id);
      toast({
        title: "Element not mapped",
        description: "This element doesn't have a theme path yet. Run AI Scanner first.",
        variant: "destructive"
      });
      return;
    }

    const pathToUpdate = selectedElement.json_path + '/background';
    
    console.log('[ManualColorEditor] 🎨 Step 1: User changed color to:', newColor);
    console.log('[ManualColorEditor] 📍 Path:', pathToUpdate);
    
    try {
      // Шаг 2: Обновляем themeStore (который сам обновит БД и вызовет событие)
      const { useThemeStore } = await import('@/state/themeStore');
      console.log('[ManualColorEditor] 🔄 Step 2: Updating themeStore...');
      
      await useThemeStore.getState().updateThemeValue(pathToUpdate, newColor);
      
      console.log('[ManualColorEditor] ✅ Step 3: Done! Theme updated, DB saved, event dispatched');
      
      toast({
        title: "✓ Color updated",
        description: `${selectedElement.name}: ${newColor}`,
      });
    } catch (error) {
      console.error('[ManualColorEditor] ❌ Failed to update color:', error);
      toast({
        title: "Failed to update color",
        description: error instanceof Error ? error.message : "Unknown error",
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
