
import { create } from 'zustand';

export type MaskStyleType = 'modern' | 'cartoon' | 'realistic' | 'fantasy' | 'minimalist';

interface MaskEditorState {
  prompt: string;
  externalMask: string | null;
  isGenerating: boolean;
  maskStyle: MaskStyleType;
  maskImageUrl: string | null;
  activeLayer: 'background' | 'foreground';
  safeZoneVisible: boolean;
  selectedMask: string | null;
  
  setPrompt: (prompt: string) => void;
  setExternalMask: (imageUrl: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setMaskStyle: (style: MaskStyleType) => void;
  setMaskImageUrl: (imageUrl: string | null) => void;
  setActiveLayer: (layer: 'background' | 'foreground') => void;
  setSafeZoneVisible: (visible: boolean) => void;
  setSelectedMask: (mask: string | null) => void;
  resetEditor: () => void;
}

export const useMaskEditorStore = create<MaskEditorState>((set) => ({
  prompt: '',
  externalMask: null,
  isGenerating: false,
  maskStyle: 'modern',
  maskImageUrl: null,
  activeLayer: 'background',
  safeZoneVisible: false,
  selectedMask: null,
  
  setPrompt: (prompt) => set({ prompt }),
  setExternalMask: (imageUrl) => set({ externalMask: imageUrl }),
  setIsGenerating: (isGenerating) => set({ isGenerating: isGenerating }),
  setMaskStyle: (style) => set({ maskStyle: style }),
  setMaskImageUrl: (imageUrl) => set({ maskImageUrl: imageUrl }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setSafeZoneVisible: (visible) => set({ safeZoneVisible: visible }),
  setSelectedMask: (mask) => set({ selectedMask: mask }),
  
  resetEditor: () => set({
    prompt: '',
    externalMask: null,
    isGenerating: false,
    maskImageUrl: null,
    selectedMask: null,
    safeZoneVisible: false
  })
}));
