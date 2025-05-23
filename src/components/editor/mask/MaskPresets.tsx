
import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Sparkles, Cat, Flame, Palette, Wand } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface PresetMask {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
  previewImage?: string;
}

const presets: PresetMask[] = [
  {
    id: 'cute-cats',
    name: 'Cute Cats',
    icon: <Cat className="h-5 w-5 text-purple-300" />,
    prompt: 'Cute cartoon cats hugging around a wallet, kawaii style, pastel colors',
    previewImage: '/lovable-uploads/9388ce6f-be1d-42c8-b4d3-8d38453996a9.png'
  },
  {
    id: 'hacker-style',
    name: 'Hacker Style',
    icon: <Flame className="h-5 w-5 text-green-400" />,
    prompt: 'Cyberpunk hacker style decoration around a digital wallet, matrix code, green glowing elements',
    previewImage: '/lovable-uploads/d4fc8532-6040-450a-a8cf-d1d459c42e46.png'
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    icon: <Palette className="h-5 w-5 text-yellow-400" />,
    prompt: 'Luxury gold and diamond decorative pattern around a wallet, elegant, high-end fashion style',
  },
  {
    id: 'abstract-art',
    name: 'Abstract Art',
    icon: <Sparkles className="h-5 w-5 text-blue-400" />,
    prompt: 'Abstract geometric patterns surrounding a wallet, colorful modern art style, dynamic shapes',
  },
];

const MaskPresets = () => {
  const { setPrompt, setIsGenerating, setSafeZoneVisible } = useMaskEditorStore();

  const handleSelectPreset = (preset: PresetMask) => {
    setPrompt(preset.prompt);
    toast.success(`Preset "${preset.name}" selected! Click Generate to create this mask.`);
    setSafeZoneVisible(true); // Show safe zone when selecting a preset
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wand className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-medium text-white">Preset Masks</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              className="flex flex-col items-center justify-center p-3 h-auto border-white/10 bg-black/20 hover:bg-black/40"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.icon}
              <span className="mt-2 text-xs">{preset.name}</span>
            </Button>
          ))}
        </div>
        
        <p className="text-xs text-white/50 mt-3">
          Click a preset to use its prompt, then click Generate
        </p>
      </CardContent>
    </Card>
  );
};

export default MaskPresets;
