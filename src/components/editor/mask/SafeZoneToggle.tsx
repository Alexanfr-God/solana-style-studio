
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SafeZoneToggleProps {
  disabled?: boolean;
}

const SafeZoneToggle = ({ disabled = false }: SafeZoneToggleProps) => {
  const { safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();

  const handleToggle = (checked: boolean) => {
    setSafeZoneVisible(checked);
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-white" />
        <Label htmlFor="safe-zone" className="text-white text-sm">Show Protected Wallet Area</Label>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Switch
              id="safe-zone"
              checked={safeZoneVisible}
              onCheckedChange={handleToggle}
              disabled={disabled}
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Shows the protected wallet UI area (320×569px). Masks will be displayed around this area, 
              not on top of it. This ensures your wallet UI remains clearly visible.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SafeZoneToggle;
