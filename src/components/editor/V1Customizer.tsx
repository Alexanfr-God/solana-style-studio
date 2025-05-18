
import React from 'react';
import EditorTabs from './EditorTabs';
import PromptInput from './PromptInput';
import UploadImage from './UploadImage';
import GenerateButton from './GenerateButton';
import LayerSelector from './LayerSelector';
import ResetButton from './ResetButton';
import StylingTip from './StylingTip';
import { useEditorStore } from '../../stores/editorStore';
import V3EditorContainer from './v3/V3EditorContainer';

const V1Customizer = () => {
  const { editorMode } = useEditorStore();

  return (
    <div className="p-6 rounded-xl bg-black/20 backdrop-blur-md space-y-6">
      <EditorTabs />
      
      {editorMode === 'create-style' && (
        <div className="space-y-6">
          <LayerSelector />
          <PromptInput />
          <UploadImage />
          <GenerateButton />
          <div className="flex items-center justify-between gap-4 pt-2">
            <ResetButton />
            <StylingTip />
          </div>
        </div>
      )}
      
      {editorMode === 'fine-tune' && (
        <div className="space-y-6">
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium text-white mb-2">Fine-tune Editor</h3>
            <p className="text-sm text-white/70">
              The UI/UX customization feature will be available soon.
            </p>
          </div>
        </div>
      )}
      
      {editorMode === 'decorate' && <V3EditorContainer />}
    </div>
  );
};

export default V1Customizer;
