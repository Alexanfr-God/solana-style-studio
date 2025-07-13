
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffectsSettings } from '@/hooks/useEffectsSettings';
import { Sparkles } from 'lucide-react';

export const SplashCursorToggle = () => {
  const { splashCursor } = useEffectsSettings();

  return (
    <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
      <Sparkles className="h-5 w-5 text-purple-500" />
      <div className="flex-1">
        <Label htmlFor="splash-cursor" className="text-sm font-medium">
          Splash Cursor Effect
        </Label>
        <p className="text-xs text-muted-foreground">
          Enable fluid cursor animation
        </p>
      </div>
      <Switch
        id="splash-cursor"
        checked={splashCursor.enabled}
        onCheckedChange={splashCursor.setEnabled}
      />
    </div>
  );
};
