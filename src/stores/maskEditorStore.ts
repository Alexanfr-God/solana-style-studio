
import { create } from 'zustand';

export type MaskStyleType = 'modern' | 'cartoon' | 'realistic' | 'fantasy' | 'minimalist';

interface MaskEditorState {
  prompt: string;
  externalMask: string | null;
  isGenerating: boolean;
  maskStyle: MaskStyleType;
  
  setPrompt: (prompt: string) => void;
  setExternalMask: (imageUrl: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setMaskStyle: (style: MaskStyleType) => void;
  resetEditor: () => void;
}

export const useMaskEditorStore = create<MaskEditorState>((set) => ({
  prompt: '',
  externalMask: null,
  isGenerating: false,
  maskStyle: 'modern',
  
  setPrompt: (prompt) => set({ prompt }),
  setExternalMask: (imageUrl) => set({ externalMask: imageUrl }),
  setIsGenerating: (isGenerating) => set({ isGenerating: isGenerating }),
  setMaskStyle: (style) => set({ maskStyle: style }),
  
  resetEditor: () => set({
    prompt: '',
    externalMask: null,
    isGenerating: false
  })
}));
