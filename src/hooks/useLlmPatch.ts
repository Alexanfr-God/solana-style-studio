
import { useState } from 'react';
import { LlmPatchService, type PatchRequest, type PatchResponse } from '@/services/llmPatchService';
import { toast } from 'sonner';

export const useLlmPatch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPatch = async (request: PatchRequest): Promise<PatchResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await LlmPatchService.applyPatch(request);
      toast.success('🎨 Theme updated successfully!');
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to update theme: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    applyPatch,
    isLoading,
    error
  };
};
