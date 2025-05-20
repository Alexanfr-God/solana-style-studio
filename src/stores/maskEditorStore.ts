
import { create } from 'zustand';

export type MaskLayerType = 'login' | 'wallet';

export interface SafeZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MaskLayout {
  top: string | null;
  bottom: string | null;
  left: string | null;
  right: string | null;
  core: string;
}

export interface Mask {
  imageUrl: string;
  layout: MaskLayout;
  theme: string;
  style: string;
  colorPalette: string[];
  safeZone: SafeZone;
}

interface MaskEditorState {
  activeLayer: MaskLayerType;
  prompt: string;
  maskImageUrl: string | null;
  selectedMask: Mask | null;
  previewVisible: boolean;
  safeZoneVisible: boolean;
  isGenerating: boolean;
  
  // New beta mask properties
  topLayer: string | null;
  bottomLayer: string | null;
  
  setActiveLayer: (layer: MaskLayerType) => void;
  setPrompt: (prompt: string) => void;
  setMaskImageUrl: (imageUrl: string | null) => void;
  setSelectedMask: (mask: Mask | null) => void;
  setPreviewVisible: (visible: boolean) => void;
  setSafeZoneVisible: (visible: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  
  // New beta mask setters
  setTopLayer: (imageUrl: string | null) => void;
  setBottomLayer: (imageUrl: string | null) => void;
  resetLayers: () => void;
  
  resetEditor: () => void;
}

// Updated safe zone coordinates to match DALL-E canvas
const defaultSafeZone: SafeZone = {
  x: 432, // center X - width/2
  y: 344, // center Y - height/2
  width: 160,
  height: 336
};

export const useMaskEditorStore = create<MaskEditorState>((set) => ({
  activeLayer: 'login',
  prompt: '',
  maskImageUrl: null,
  selectedMask: null,
  previewVisible: true,
  safeZoneVisible: false, // Changed to false by default
  isGenerating: false,
  
  // Initialize beta mask properties
  topLayer: null,
  bottomLayer: null,
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setPrompt: (prompt) => set({ prompt }),
  setMaskImageUrl: (imageUrl) => set({ maskImageUrl: imageUrl }),
  setSelectedMask: (mask) => set({ selectedMask: mask }),
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setSafeZoneVisible: (visible) => set({ safeZoneVisible: visible }),
  setIsGenerating: (isGenerating) => set({ isGenerating: isGenerating }),
  
  // Beta mask setters
  setTopLayer: (imageUrl) => set({ topLayer: imageUrl }),
  setBottomLayer: (imageUrl) => set({ bottomLayer: imageUrl }),
  resetLayers: () => set({ topLayer: null, bottomLayer: null }),
  
  resetEditor: () => set({
    prompt: '',
    maskImageUrl: null,
    selectedMask: null,
    isGenerating: false,
    topLayer: null,
    bottomLayer: null
  })
}));
