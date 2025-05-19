
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

const SafeZoneToggle = () => {
  const { safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-white" />
        <Label htmlFor="show-safe-zone" className="text-sm text-white">
          Show Safe Zone
        </Label>
      </div>
      <Switch 
        id="show-safe-zone" 
        checked={safeZoneVisible} 
        onCheckedChange={setSafeZoneVisible} 
        className="data-[state=checked]:bg-primary" 
      />
    </div>
  );
};

export default SafeZoneToggle;
