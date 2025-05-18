
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
      
      {editorMode === 'create-style' ? (
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
      ) : editorMode === 'decorate' ? (
        <V3EditorContainer />
      ) : null}
    </div>
  );
};

export default V1Customizer;
