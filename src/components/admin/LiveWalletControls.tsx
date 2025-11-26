import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Paintbrush, RotateCcw } from 'lucide-react';

interface LiveWalletControlsProps {
  onApplyTheme: (cssRules: string[]) => void;
  disabled?: boolean;
}

export const LiveWalletControls: React.FC<LiveWalletControlsProps> = ({
  onApplyTheme,
  disabled = false
}) => {
  // Theme values
  const [backgroundColor, setBackgroundColor] = useState('#1a1a1a');
  const [buttonColor, setButtonColor] = useState('#6366f1');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');
  const [borderRadius, setBorderRadius] = useState(12);
  const [inputBgColor, setInputBgColor] = useState('#2a2a2a');

  const handleApply = () => {
    const cssRules = [
      // Main background
      `body { background: ${backgroundColor} !important; }`,
      `.unlock-screen-container { background: ${backgroundColor} !important; }`,
      
      // Buttons
      `button[type="submit"] { 
        background: ${buttonColor} !important; 
        color: ${buttonTextColor} !important;
        border-radius: ${borderRadius}px !important;
      }`,
      `.login-unlock-button {
        background: ${buttonColor} !important; 
        color: ${buttonTextColor} !important;
        border-radius: ${borderRadius}px !important;
      }`,
      
      // Inputs
      `input[type="password"] {
        background: ${inputBgColor} !important;
        border-radius: ${borderRadius}px !important;
      }`,
      `.login-password-input {
        background: ${inputBgColor} !important;
        border-radius: ${borderRadius}px !important;
      }`,
    ];

    onApplyTheme(cssRules);
  };

  const handleReset = () => {
    setBackgroundColor('#1a1a1a');
    setButtonColor('#6366f1');
    setButtonTextColor('#ffffff');
    setBorderRadius(12);
    setInputBgColor('#2a2a2a');
  };

  return (
    <div className="space-y-6">
      {/* Background */}
      <div className="space-y-3">
        <Label htmlFor="bg-color" className="text-sm font-semibold">
          Background Color
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            id="bg-color"
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-10 w-20 cursor-pointer"
            disabled={disabled}
          />
          <Input
            type="text"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="flex-1 font-mono text-sm"
            disabled={disabled}
          />
        </div>
      </div>

      <Separator />

      {/* Button Colors */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Button Styling</Label>
        
        <div className="space-y-2">
          <Label htmlFor="btn-color" className="text-xs text-muted-foreground">
            Background
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="btn-color"
              type="color"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="h-10 w-20 cursor-pointer"
              disabled={disabled}
            />
            <Input
              type="text"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="flex-1 font-mono text-sm"
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="btn-text-color" className="text-xs text-muted-foreground">
            Text Color
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="btn-text-color"
              type="color"
              value={buttonTextColor}
              onChange={(e) => setButtonTextColor(e.target.value)}
              className="h-10 w-20 cursor-pointer"
              disabled={disabled}
            />
            <Input
              type="text"
              value={buttonTextColor}
              onChange={(e) => setButtonTextColor(e.target.value)}
              className="flex-1 font-mono text-sm"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Input Fields */}
      <div className="space-y-3">
        <Label htmlFor="input-bg-color" className="text-sm font-semibold">
          Input Field Background
        </Label>
        <div className="flex gap-2 items-center">
          <Input
            id="input-bg-color"
            type="color"
            value={inputBgColor}
            onChange={(e) => setInputBgColor(e.target.value)}
            className="h-10 w-20 cursor-pointer"
            disabled={disabled}
          />
          <Input
            type="text"
            value={inputBgColor}
            onChange={(e) => setInputBgColor(e.target.value)}
            className="flex-1 font-mono text-sm"
            disabled={disabled}
          />
        </div>
      </div>

      <Separator />

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="border-radius" className="text-sm font-semibold">
            Border Radius
          </Label>
          <span className="text-sm text-muted-foreground">{borderRadius}px</span>
        </div>
        <Slider
          id="border-radius"
          value={[borderRadius]}
          onValueChange={([value]) => setBorderRadius(value)}
          min={0}
          max={32}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleApply}
          disabled={disabled}
          className="flex-1"
        >
          <Paintbrush className="h-4 w-4 mr-2" />
          Apply Theme
        </Button>
        <Button
          onClick={handleReset}
          disabled={disabled}
          variant="outline"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {disabled && (
        <p className="text-xs text-muted-foreground text-center">
          Connect and scan DOM first to enable theme controls
        </p>
      )}
    </div>
  );
};
