
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Create a custom toggle component instead of using the Switch directly
const SimpleToggle = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        checked ? 'bg-primary' : 'bg-input'
      }`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span 
        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} 
      />
    </button>
  );
};

const SafeZoneToggle = () => {
  const { safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();

  const handleToggle = (checked: boolean) => {
    setSafeZoneVisible(checked);
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Shield className="h-4 w-4 text-white" />
        <Label htmlFor="safe-zone" className="text-white text-sm">Show Safe Zone Guide</Label>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SimpleToggle
              checked={safeZoneVisible}
              onCheckedChange={handleToggle}
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>
              Visualizes the safe zone guidance. The <span className="text-red-400">RED</span> area indicates where NOT to draw.
              This is the central UI area that must remain transparent. 
              The costume design should be created around this area, not over it.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SafeZoneToggle;
