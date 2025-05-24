
import { create } from 'zustand';

export type MaskLayerType = 'login' | 'wallet';
export type MaskStyleType = 'cartoon' | 'meme' | 'luxury' | 'modern' | 'realistic' | 'fantasy' | 'minimalist';

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
  id?: string;
  imageUrl: string;
  layout: MaskLayout;
  theme: string;
  style: string;
  colorPalette: string[];
  safeZone: SafeZone;
  name?: string;
}

interface MaskEditorState {
  activeLayer: MaskLayerType;
  prompt: string;
  maskImageUrl: string | null;
  externalMask: string | null;
  referenceImage: string | null;
  styleHintImage: string | null;
  selectedMask: Mask | null;
  previewVisible: boolean;
  safeZoneVisible: boolean;
  isGenerating: boolean;
  maskStyle: MaskStyleType;
  
  // Legacy V3 beta properties - kept for compatibility
  topLayer: string | null;
  bottomLayer: string | null;
  
  setActiveLayer: (layer: MaskLayerType) => void;
  setPrompt: (prompt: string) => void;
  setMaskImageUrl: (imageUrl: string | null) => void;
  setExternalMask: (imageUrl: string | null) => void;
  setReferenceImage: (imageUrl: string | null) => void;
  setStyleHintImage: (imageUrl: string | null) => void;
  setSelectedMask: (mask: Mask | null) => void;
  setPreviewVisible: (visible: boolean) => void;
  setSafeZoneVisible: (visible: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setMaskStyle: (style: MaskStyleType) => void;
  
  // Legacy setters - kept for compatibility
  setTopLayer: (imageUrl: string | null) => void;
  setBottomLayer: (imageUrl: string | null) => void;
  resetLayers: () => void;
  
  resetEditor: () => void;
}

// Default safe zone for the V3 editor - representing the wallet UI area
const defaultSafeZone: SafeZone = {
  x: 0,
  y: 0,
  width: 320,
  height: 569
};

export const useMaskEditorStore = create<MaskEditorState>((set) => ({
  activeLayer: 'login',
  prompt: '',
  maskImageUrl: null,
  externalMask: null,
  referenceImage: null,
  styleHintImage: null,
  selectedMask: null,
  previewVisible: true,
  safeZoneVisible: true,
  isGenerating: false,
  maskStyle: 'cartoon',
  
  // Legacy V3 beta properties
  topLayer: null,
  bottomLayer: null,
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setPrompt: (prompt) => set({ prompt }),
  setMaskImageUrl: (imageUrl) => set({ maskImageUrl: imageUrl }),
  setExternalMask: (imageUrl) => set({ externalMask: imageUrl }),
  setReferenceImage: (imageUrl) => set({ referenceImage: imageUrl }),
  setStyleHintImage: (imageUrl) => set({ styleHintImage: imageUrl }),
  setSelectedMask: (mask) => set({ selectedMask: mask }),
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setSafeZoneVisible: (visible) => set({ safeZoneVisible: visible }),
  setIsGenerating: (isGenerating) => set({ isGenerating: isGenerating }),
  setMaskStyle: (style) => set({ maskStyle: style }),
  
  // Legacy setters
  setTopLayer: (imageUrl) => set({ topLayer: imageUrl }),
  setBottomLayer: (imageUrl) => set({ bottomLayer: imageUrl }),
  resetLayers: () => set({ topLayer: null, bottomLayer: null }),
  
  resetEditor: () => set({
    prompt: '',
    maskImageUrl: null,
    externalMask: null,
    referenceImage: null,
    styleHintImage: null,
    selectedMask: null,
    isGenerating: false,
    topLayer: null,
    bottomLayer: null
  })
}));
