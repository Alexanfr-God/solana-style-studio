
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Label } from '@/components/ui/label';

const MaskStyleSelector = () => {
  const { maskStyle, setMaskStyle } = useMaskEditorStore();

  const styleOptions = [
    { value: 'modern', label: 'Modern Digital Art' },
    { value: 'cartoon', label: 'Cartoon Style' },
    { value: 'realistic', label: 'Realistic' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'minimalist', label: 'Minimalist' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="mask-style" className="text-sm text-white/80">
        Art Style
      </Label>
      
      <select 
        id="mask-style"
        value={maskStyle} 
        onChange={(e) => setMaskStyle(e.target.value as any)}
        className="w-full h-10 px-3 py-2 bg-black/20 border border-white/10 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {styleOptions.map((style) => (
          <option key={style.value} value={style.value} className="bg-black text-white">
            {style.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MaskStyleSelector;
