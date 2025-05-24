
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

interface GenerationControlsProps {
  useBackupStrategy: boolean;
  debugMode: boolean;
  isGenerating: boolean;
  onToggleBackup: () => void;
  onToggleDebug: () => void;
}

const GenerationControls = ({ 
  useBackupStrategy, 
  debugMode, 
  isGenerating,
  onToggleBackup, 
  onToggleDebug 
}: GenerationControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={useBackupStrategy ? "destructive" : "secondary"}
        size="sm"
        className="flex-1"
        onClick={onToggleBackup}
        disabled={isGenerating}
      >
        {useBackupStrategy ? "Use AI Generation" : "Use Quick Fallbacks"}
      </Button>
      
      <Button
        variant={debugMode ? "default" : "outline"}
        size="sm"
        className="flex-1 border-white/10"
        onClick={onToggleDebug}
        disabled={isGenerating}
      >
        <Bug className="mr-2 h-3 w-3" />
        {debugMode ? "Debug: ON" : "Debug: OFF"}
      </Button>
    </div>
  );
};

export default GenerationControls;
