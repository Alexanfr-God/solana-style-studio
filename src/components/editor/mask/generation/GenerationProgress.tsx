
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  progress: number;
  showProgress: boolean;
}

const GenerationProgress = ({ progress, showProgress }: GenerationProgressProps) => {
  if (!showProgress) return null;

  const getProgressMessage = (progress: number) => {
    if (progress < 30) return "Analyzing prompt...";
    if (progress < 60) return "Building enhanced prompt...";
    if (progress < 90) return "Generating with AI...";
    return "Finalizing mask...";
  };

  return (
    <div className="space-y-1">
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-white/50 text-center">
        {getProgressMessage(progress)}
      </p>
    </div>
  );
};

export default GenerationProgress;
