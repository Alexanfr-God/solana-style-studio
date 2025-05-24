
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MaskLayerSelector = () => {
  const { activeLayer, setActiveLayer } = useMaskEditorStore();

  const handleLayerChange = (layer: 'background' | 'foreground') => {
    setActiveLayer(layer);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-white/80">
        Active Layer
      </Label>
      
      <div className="flex gap-2">
        <Button
          variant={activeLayer === 'background' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLayerChange('background')}
          className="flex-1"
        >
          Background
        </Button>
        
        <Button
          variant={activeLayer === 'foreground' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleLayerChange('foreground')}
          className="flex-1"
        >
          Foreground
        </Button>
      </div>
    </div>
  );
};

export default MaskLayerSelector;
