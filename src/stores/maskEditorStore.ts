
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
  maskImageUrl: string | null;
  externalMask: string | null;
  selectedMask: Mask | null;
  previewVisible: boolean;
  safeZoneVisible: boolean;
  isGenerating: boolean;
  
  // Drawing-specific state
  drawingImageUrl: string | null;
  
  // Actions
  setActiveLayer: (layer: MaskLayerType) => void;
  setMaskImageUrl: (imageUrl: string | null) => void;
  setExternalMask: (imageUrl: string | null) => void;
  setSelectedMask: (mask: Mask | null) => void;
  setPreviewVisible: (visible: boolean) => void;
  setSafeZoneVisible: (visible: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setDrawingImageUrl: (imageUrl: string | null) => void;
  
  resetEditor: () => void;
}

// Default safe zone for the wallet UI area
const defaultSafeZone: SafeZone = {
  x: 0,
  y: 0,
  width: 320,
  height: 569
};

export const useMaskEditorStore = create<MaskEditorState>((set) => ({
  activeLayer: 'login',
  maskImageUrl: null,
  externalMask: null,
  selectedMask: null,
  previewVisible: true,
  safeZoneVisible: true,
  isGenerating: false,
  drawingImageUrl: null,
  
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setMaskImageUrl: (imageUrl) => set({ maskImageUrl: imageUrl }),
  setExternalMask: (imageUrl) => set({ externalMask: imageUrl }),
  setSelectedMask: (mask) => set({ selectedMask: mask }),
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setSafeZoneVisible: (visible) => set({ safeZoneVisible: visible }),
  setIsGenerating: (isGenerating) => set({ isGenerating: isGenerating }),
  setDrawingImageUrl: (imageUrl) => set({ drawingImageUrl: imageUrl }),
  
  resetEditor: () => set({
    maskImageUrl: null,
    externalMask: null,
    selectedMask: null,
    isGenerating: false,
    drawingImageUrl: null
  })
}));
