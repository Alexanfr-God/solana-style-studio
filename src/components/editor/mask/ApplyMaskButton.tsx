
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

const ApplyMaskButton = () => {
  const { selectedMask } = useMaskEditorStore();

  const handleApplyMask = () => {
    // In a real implementation, this would save the mask to the main application state
    // For now, we'll just show a toast
    if (selectedMask) {
      toast.success("Wallet costume applied successfully");
    } else {
      toast.error("No costume selected to apply");
    }
  };

  return (
    <Button
      onClick={handleApplyMask}
      className="w-full"
      disabled={!selectedMask}
      variant="default"
    >
      <Check className="mr-2 h-4 w-4" />
      Apply Costume
    </Button>
  );
};

export default ApplyMaskButton;
