
import React from 'react';
import { Button } from '@/components/ui/button';
import { useCustomizationStore } from '../../stores/customizationStore';
import { useToast } from '@/hooks/use-toast';
import { RefreshCcw } from 'lucide-react';

const ResetButton = () => {
  const { activeLayer, resetLayer } = useCustomizationStore();
  const { toast } = useToast();

  const handleReset = () => {
    resetLayer(activeLayer);
    toast({
      title: "Reset complete",
      description: `${activeLayer === 'login' ? 'Login Screen' : 'Wallet Screen'} has been reset to default style`,
    });
  };

  return (
    <Button
      onClick={handleReset}
      variant="outline"
      className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20"
    >
      <RefreshCcw className="mr-2 h-4 w-4" />
      Reset to Default
    </Button>
  );
};

export default ResetButton;
