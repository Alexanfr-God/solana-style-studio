
import React from 'react';
import { useCustomizationStore } from '../../stores/customizationStore';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

const StylingTip = () => {
  const { stylingTip } = useCustomizationStore();

  return (
    <div className="flex items-center justify-center">
      <Button variant="ghost" className="flex items-center gap-2 text-white/90 hover:text-white">
        <Lightbulb className="h-4 w-4" />
        <span className="text-xs">{stylingTip}</span>
      </Button>
    </div>
  );
};

export default StylingTip;
