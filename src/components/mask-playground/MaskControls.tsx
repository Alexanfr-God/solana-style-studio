import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Upload, X, Move, Maximize } from 'lucide-react';
import { MaskConfig } from '@/lib/wcc-agent';

interface MaskControlsProps {
  mask: MaskConfig | null | undefined;
  maskImageUrl: string | null;
  onMaskChange: (mask: MaskConfig | null) => void;
  onImageUpload: (url: string) => void;
  onImageClear: () => void;
}

const ANCHOR_PRESETS = [
  { label: 'Top Left', x: 0, y: 0 },
  { label: 'Top Center', x: 0.5, y: 0 },
  { label: 'Top Right', x: 1, y: 0 },
  { label: 'Center Left', x: 0, y: 0.5 },
  { label: 'Center', x: 0.5, y: 0.5 },
  { label: 'Center Right', x: 1, y: 0.5 },
  { label: 'Bottom Left', x: 0, y: 1 },
  { label: 'Bottom Center', x: 0.5, y: 1 },
  { label: 'Bottom Right', x: 1, y: 1 },
];

export function MaskControls({
  mask,
  maskImageUrl,
  onMaskChange,
  onImageUpload,
  onImageClear,
}: MaskControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageUpload(url);
      
      // Initialize mask config if not exists
      if (!mask) {
        onMaskChange({
          src: file.name,
          fit: 'cover',
          anchor: { x: 0.5, y: 0 },
          offset: { dx: 0, dy: 0 },
          scale: 1.0,
          opacity: 1.0,
        });
      }
    }
  };

  const updateMask = (updates: Partial<MaskConfig>) => {
    if (mask) {
      onMaskChange({ ...mask, ...updates });
    }
  };

  const getCurrentAnchorLabel = () => {
    if (!mask) return 'Top Center';
    const preset = ANCHOR_PRESETS.find(p => p.x === mask.anchor.x && p.y === mask.anchor.y);
    return preset?.label || 'Custom';
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="w-4 h-4" />
          Mask
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {maskImageUrl ? (
            <div className="relative">
              <img
                src={maskImageUrl}
                alt="Mask preview"
                className="w-full h-20 object-contain bg-muted rounded border border-border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={onImageClear}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PNG
            </Button>
          )}
        </div>

        {mask && maskImageUrl && (
          <>
            {/* Fit Mode */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Maximize className="w-3 h-3" />
                Fit
              </Label>
              <Select
                value={mask.fit}
                onValueChange={(value: 'cover' | 'contain' | 'stretch') => updateMask({ fit: value })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="stretch">Stretch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Anchor */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Move className="w-3 h-3" />
                Anchor
              </Label>
              <Select
                value={getCurrentAnchorLabel()}
                onValueChange={(label) => {
                  const preset = ANCHOR_PRESETS.find(p => p.label === label);
                  if (preset) {
                    updateMask({ anchor: { x: preset.x, y: preset.y } });
                  }
                }}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANCHOR_PRESETS.map((preset) => (
                    <SelectItem key={preset.label} value={preset.label}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Offset */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Offset X</Label>
                <Input
                  type="number"
                  value={mask.offset.dx}
                  onChange={(e) => updateMask({ offset: { ...mask.offset, dx: Number(e.target.value) } })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Offset Y</Label>
                <Input
                  type="number"
                  value={mask.offset.dy}
                  onChange={(e) => updateMask({ offset: { ...mask.offset, dy: Number(e.target.value) } })}
                  className="h-8"
                />
              </div>
            </div>

            {/* Scale */}
            <div>
              <Label className="text-xs">Scale: {mask.scale.toFixed(2)}</Label>
              <Slider
                value={[mask.scale]}
                onValueChange={([value]) => updateMask({ scale: value })}
                min={0.5}
                max={2.0}
                step={0.05}
                className="mt-2"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs">Opacity: {Math.round(mask.opacity * 100)}%</Label>
              <Slider
                value={[mask.opacity]}
                onValueChange={([value]) => updateMask({ opacity: value })}
                min={0}
                max={1}
                step={0.05}
                className="mt-2"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
