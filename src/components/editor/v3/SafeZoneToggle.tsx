
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Square } from 'lucide-react';
import { useMaskEditorStore } from '../../../stores/maskEditorStore';

const SafeZoneToggle = () => {
  const { safeZoneVisible, setSafeZoneVisible } = useMaskEditorStore();

  return (
    <div className="flex items-center space-x-3">
      <Switch 
        id="safe-zone-toggle" 
        checked={safeZoneVisible} 
        onCheckedChange={setSafeZoneVisible}
      />
      <div className="flex items-center">
        <Square className="h-4 w-4 text-white/70 mr-2" />
        <Label htmlFor="safe-zone-toggle" className="text-sm text-white">
          Show Safe Zone
        </Label>
      </div>
    </div>
  );
};

export default SafeZoneToggle;
