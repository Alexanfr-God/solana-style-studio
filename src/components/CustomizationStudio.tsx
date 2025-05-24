
import React from 'react';
import V1Customizer from './editor/V1Customizer';
import V3MaskEditor from './editor/v3/V3MaskEditor';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '@/stores/customizationStore';

const CustomizationStudio = () => {
  const { editorMode, setEditorMode } = useCustomizationStore();

  return (
    <div className="w-full py-4 md:py-6 px-2 md:px-6 bg-black">
      <div className="max-w-screen-xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-black/20 backdrop-blur-sm rounded-lg p-1">
            <Button
              variant={editorMode === 'create-style' ? 'default' : 'ghost'}
              onClick={() => setEditorMode('create-style')}
              className="text-sm"
            >
              Style Creator
            </Button>
            <Button
              variant={editorMode === 'v3-mask' ? 'default' : 'ghost'}
              onClick={() => setEditorMode('v3-mask')}
              className="text-sm"
            >
              Costume Generator
            </Button>
          </div>
        </div>

        {/* Render appropriate editor */}
        {editorMode === 'v3-mask' ? <V3MaskEditor /> : <V1Customizer />}
      </div>
    </div>
  );
};

export default CustomizationStudio;
