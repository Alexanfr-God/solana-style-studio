import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Download, Grid3X3, Crosshair } from 'lucide-react';
import { WCCAgentConfig, SafeZoneConfig } from '@/lib/wcc-agent';
import { toast } from 'sonner';

interface PlaygroundControlsProps {
  config: WCCAgentConfig;
  onContainerChange: (width: number, height: number) => void;
  onSafeZoneChange: (safeZone: SafeZoneConfig) => void;
  onHighlightChange: (enabled: boolean) => void;
  onGridChange: (enabled: boolean, step?: number) => void;
  onCopyJSON: () => Promise<boolean>;
  onDownloadJSON: () => void;
}

export function PlaygroundControls({
  config,
  onContainerChange,
  onSafeZoneChange,
  onHighlightChange,
  onGridChange,
  onCopyJSON,
  onDownloadJSON,
}: PlaygroundControlsProps) {
  const handleCopy = async () => {
    const success = await onCopyJSON();
    if (success) {
      toast.success('JSON copied to clipboard');
    }
  };

  return (
    <div className="space-y-4 w-80">
      {/* Container Settings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Crosshair className="w-4 h-4" />
            Container
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Width</Label>
              <Input
                type="number"
                value={config.containerWidth}
                onChange={(e) => onContainerChange(Number(e.target.value), config.containerHeight)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Height</Label>
              <Input
                type="number"
                value={config.containerHeight}
                onChange={(e) => onContainerChange(config.containerWidth, Number(e.target.value))}
                className="h-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safe Zone Settings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Safe Zone Padding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-xs">Padding (all sides): {config.safeZone?.padding ?? 16}px</Label>
            <Slider
              value={[config.safeZone?.padding ?? 16]}
              onValueChange={([value]) => onSafeZoneChange({ padding: value })}
              min={0}
              max={100}
              step={1}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Highlight Container</Label>
            <Switch
              checked={config.highlightEnabled ?? true}
              onCheckedChange={onHighlightChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Show Grid</Label>
            <Switch
              checked={config.gridEnabled ?? false}
              onCheckedChange={(checked) => onGridChange(checked)}
            />
          </div>
          {config.gridEnabled && (
            <div>
              <Label className="text-xs">Grid Step: {config.gridStep ?? 20}px</Label>
              <Slider
                value={[config.gridStep ?? 20]}
                onValueChange={([value]) => onGridChange(true, value)}
                min={10}
                max={50}
                step={5}
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Export JSON</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleCopy} variant="outline" className="w-full" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy JSON
          </Button>
          <Button onClick={onDownloadJSON} variant="outline" className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
