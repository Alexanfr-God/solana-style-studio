
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Wand, Loader2 } from 'lucide-react';
import { useMaskGeneration } from '@/hooks/useMaskGeneration';
import GenerationProgress from './generation/GenerationProgress';
import GenerationError from './generation/GenerationError';
import GenerationControls from './generation/GenerationControls';

interface GenerateMaskButtonProps {
  disabled?: boolean;
}

const GenerateMaskButton = ({ disabled = false }: GenerateMaskButtonProps) => {
  const { prompt, maskImageUrl, externalMask } = useMaskEditorStore();
  
  const {
    progress,
    showProgress,
    hasGenerationError,
    useBackupStrategy,
    debugMode,
    isGenerating,
    handleGenerate,
    toggleBackupStrategy,
    toggleDebugMode
  } = useMaskGeneration();

  const hasExistingContent = !!prompt || !!maskImageUrl || !!externalMask;

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        className="w-full bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600"
        disabled={isGenerating || (!prompt && !maskImageUrl) || disabled}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Costume...
          </>
        ) : (
          <>
            <Wand className="mr-2 h-4 w-4" />
            Generate Wallet Costume
          </>
        )}
      </Button>
      
      <GenerationProgress progress={progress} showProgress={showProgress} />
      
      <GenerationError hasError={hasGenerationError} />
      
      {hasExistingContent && !isGenerating && (
        <GenerationControls
          useBackupStrategy={useBackupStrategy}
          debugMode={debugMode}
          isGenerating={isGenerating}
          onToggleBackup={toggleBackupStrategy}
          onToggleDebug={toggleDebugMode}
        />
      )}
    </div>
  );
};

export default GenerateMaskButton;
