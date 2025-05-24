
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface GenerationErrorProps {
  hasError: boolean;
}

const GenerationError = ({ hasError }: GenerationErrorProps) => {
  if (!hasError) return null;

  return (
    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-md flex items-center text-xs text-red-300">
      <AlertCircle className="h-3 w-3 mr-1" />
      Generation error. Using fallback mask. Check console for details.
    </div>
  );
};

export default GenerationError;
