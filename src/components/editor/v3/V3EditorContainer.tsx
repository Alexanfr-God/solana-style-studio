
import React from 'react';
import { useEditorStore } from '../../../stores/editorStore';
import MaskPromptInput from './MaskPromptInput';
import MaskImageUpload from './MaskImageUpload';
import GenerateMaskButton from './GenerateMaskButton';
import MaskPreviewCanvas from './MaskPreviewCanvas';
import SafeZoneToggle from './SafeZoneToggle';
import ApplyMaskButton from './ApplyMaskButton';

const V3EditorContainer = () => {
  const { editorMode } = useEditorStore();

  if (editorMode !== 'decorate') {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Create Wallet Decoration</h3>
        <p className="text-sm text-white/70">
          Design a custom decorative mask to enhance your wallet appearance. 
          The central UI will remain clear and functional.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-5">
          <MaskPromptInput />
          <MaskImageUpload />
          <GenerateMaskButton />
          <SafeZoneToggle />
          <ApplyMaskButton />
        </div>

        <div className="w-full md:w-2/3">
          <MaskPreviewCanvas />
        </div>
      </div>
    </div>
  );
};

export default V3EditorContainer;
