
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';
import { useToast } from '@/hooks/use-toast';

const ApplyMaskButton = () => {
  const { maskImageUrl, layoutJson } = useMaskEditorStore();
  const { toast } = useToast();

  const handleApplyMask = () => {
    if (!maskImageUrl || !layoutJson) {
      toast({
        title: "No mask available",
        description: "Please generate or upload a mask first",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would save the mask to the wallet
    toast({
      title: "Mask applied successfully",
      description: "Your custom decoration has been applied to the wallet",
    });
  };

  return (
    <Button
      onClick={handleApplyMask}
      variant="default"
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
      disabled={!maskImageUrl || !layoutJson}
    >
      <Check className="mr-2 h-4 w-4" />
      Apply Mask
    </Button>
  );
};

export default ApplyMaskButton;
