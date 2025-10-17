import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ProbeStatus } from '@/stores/themeProbeStore';

const SCREENS = [
  'lock',
  'home',
  'send',
  'receive',
  'apps',
  'buy',
  'swap',
  'history',
  'search',
  'all',
] as const;

export type ScreenType = typeof SCREENS[number];

interface ControlsPanelProps {
  screen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
  overlayEnabled: boolean;
  onOverlayToggle: () => void;
  onProbePaint: () => void;
  onExport: () => void;
  activeFilters: Set<ProbeStatus>;
  onFilterToggle: (status: ProbeStatus) => void;
  isProbing: boolean;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  screen,
  onScreenChange,
  overlayEnabled,
  onOverlayToggle,
  onProbePaint,
  onExport,
  activeFilters,
  onFilterToggle,
  isProbing,
}) => {
  const filters: Array<{ status: ProbeStatus; label: string; color: string }> = [
    { status: 'OK', label: 'OK', color: 'text-green-600' },
    { status: 'AMBIGUOUS', label: 'Ambiguous', color: 'text-yellow-600' },
    { status: 'UNMAPPED', label: 'Unmapped', color: 'text-red-600' },
    { status: 'NON_SCALAR', label: 'Non-Scalar', color: 'text-gray-600' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1">AI-Vision</h2>
        <p className="text-sm text-muted-foreground">
          Visual theme coverage analysis with ThemeProbe
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Screen Selector */}
        <div className="space-y-2">
          <Label htmlFor="screen-select">Screen</Label>
          <Select value={screen} onValueChange={(v) => onScreenChange(v as ScreenType)}>
            <SelectTrigger id="screen-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCREENS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overlay Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="overlay-toggle" className="flex items-center gap-2">
            Visual Theme Overlay
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">V</kbd>
          </Label>
          <Switch
            id="overlay-toggle"
            checked={overlayEnabled}
            onCheckedChange={onOverlayToggle}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={onProbePaint}
            disabled={isProbing}
            className="w-full"
          >
            {isProbing ? 'Probing...' : 'Probe & Paint'}
          </Button>
          <Button
            onClick={onExport}
            variant="outline"
            className="w-full"
          >
            Export Mapping
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <Label>Filters</Label>
          <div className="space-y-2">
            {filters.map(({ status, label, color }) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={`filter-${status}`}
                  checked={activeFilters.has(status)}
                  onCheckedChange={() => onFilterToggle(status)}
                />
                <label
                  htmlFor={`filter-${status}`}
                  className={`text-sm font-medium cursor-pointer ${color}`}
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
