import React, { useState, useEffect } from 'react';
import { Palette, AlertTriangle } from 'lucide-react';
import ColorPicker from 'react-best-gradient-color-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { useThemeStore } from '@/state/themeStore';
import { useExtendedWallet } from '@/context/WalletContextProvider';
import { PathAnalyzer, PathAnalysis } from '@/services/pathAnalyzer';

export const ManualColorEditor: React.FC = () => {
  const { selectedElement } = useSmartEdit();
  const { walletProfile } = useExtendedWallet();
  const [tempColor, setTempColor] = useState('#3b82f6');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('backgroundColor');
  const [pathAnalysis, setPathAnalysis] = useState<PathAnalysis | null>(null);

  // Analyze path when element changes
  useEffect(() => {
    if (selectedElement?.json_path) {
      const analysis = PathAnalyzer.analyze(selectedElement.json_path);
      setPathAnalysis(analysis);
      setSelectedProperty(analysis.defaultProperty);
      
      console.log('[ManualEdit] 🔍 Path analyzed:', {
        path: selectedElement.json_path,
        type: analysis.type,
        defaultProperty: analysis.defaultProperty
      });
    }
  }, [selectedElement]);

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
    if (!selectedElement?.json_path || !pathAnalysis) {
      console.warn('[ManualEdit] ⚠️ No json_path or analysis:', selectedElement?.name);
      return;
    }
    
    // Build final path based on analysis type
    const finalPath = pathAnalysis.type === 'property'
      ? pathAnalysis.path
      : PathAnalyzer.buildPropertyPath(pathAnalysis.path, selectedProperty);
    
    const userId = walletProfile?.wallet_address || 'anonymous';
    
    console.log('[ManualEdit] 🎨 Applying color:', { 
      mode: pathAnalysis.type,
      original: selectedElement.json_path,
      final: finalPath,
      property: pathAnalysis.type === 'object' ? selectedProperty : pathAnalysis.defaultProperty,
      value: tempColor,
      userId 
    });
    
    useThemeStore.getState().updateThemeValue(finalPath, tempColor, userId);
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
          {pathAnalysis && (
            <div className="text-xs text-purple-400 font-mono">
              Mode: {pathAnalysis.type === 'property' ? '🎯 Simple' : '🎛️ Advanced'}
            </div>
          )}
          {isOpen && (
            <>
              {/* Advanced Mode: Property Selector */}
              {pathAnalysis?.type === 'object' && (
                <div className="space-y-2">
                  <label className="text-xs text-white/80">Property to edit:</label>
                  <select 
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-purple-500/30 rounded px-2 py-1.5 text-sm"
                  >
                    {pathAnalysis.availableProperties.map(prop => (
                      <option key={prop} value={prop}>{prop}</option>
                    ))}
                  </select>
                </div>
              )}
              
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
