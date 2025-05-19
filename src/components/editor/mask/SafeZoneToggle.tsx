
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SafeZoneToggle = () => {
  const { safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();

  const handleToggle = (checked: boolean) => {
    setSafeZoneVisible(checked);
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-white" />
        <Label htmlFor="safe-zone" className="text-white text-sm">Show Safe Zone</Label>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Switch
              id="safe-zone"
              checked={safeZoneVisible}
              onCheckedChange={handleToggle}
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              When enabled, this shows the central area where UI elements will be displayed. 
              The costume should be designed around this area, not over it.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SafeZoneToggle;
