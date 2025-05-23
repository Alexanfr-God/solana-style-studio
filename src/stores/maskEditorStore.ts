
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
  
  drawingImageUrl: string | null;
  prompt: string;
  maskStyle: string;
  
  setActiveLayer: (layer: MaskLayerType) => void;
  setMaskImageUrl: (imageUrl: string | null) => void;
  setExternalMask: (imageUrl: string | null) => void;
  setSelectedMask: (mask: Mask | null) => void;
  setPreviewVisible: (visible: boolean) => void;
  setSafeZoneVisible: (visible: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setDrawingImageUrl: (imageUrl: string | null) => void;
  setPrompt: (prompt: string) => void;
  setMaskStyle: (style: string) => void;
  
  resetEditor: () => void;
}

const defaultSafeZone: SafeZone = {
  x: 0,
  y: 0,
  width: 320,
  height: 569
};

export const useMaskEditorStore = create<MaskEditorState>((set, get) => ({
  activeLayer: 'login',
  maskImageUrl: null,
  externalMask: null,
  selectedMask: null,
  previewVisible: true,
  safeZoneVisible: true,
  isGenerating: false,
  drawingImageUrl: null,
  prompt: '',
  maskStyle: '',
  
  setActiveLayer: (layer) => {
    console.log('🏪 STORE: Setting activeLayer to:', layer);
    set({ activeLayer: layer });
  },
  
  setMaskImageUrl: (imageUrl) => {
    const currentState = get();
    console.log('🏪 STORE: Setting maskImageUrl');
    console.log('  - Previous value:', currentState.maskImageUrl);
    console.log('  - New value:', imageUrl);
    console.log('  - New value length:', imageUrl ? imageUrl.length : 0);
    console.log('  - Current externalMask:', currentState.externalMask);
    
    set({ maskImageUrl: imageUrl });
    
    const newState = get();
    console.log('🏪 STORE: maskImageUrl updated');
    console.log('  - Final value:', newState.maskImageUrl);
    console.log('  - Should show custom mask:', Boolean(newState.maskImageUrl && !newState.externalMask));
  },
  
  setExternalMask: (imageUrl) => {
    const currentState = get();
    console.log('🏪 STORE: Setting externalMask');
    console.log('  - Previous value:', currentState.externalMask);
    console.log('  - New value:', imageUrl);
    console.log('  - Current maskImageUrl:', currentState.maskImageUrl);
    
    set({ externalMask: imageUrl });
    
    const newState = get();
    console.log('🏪 STORE: externalMask updated');
    console.log('  - Final value:', newState.externalMask);
    console.log('  - Should show external mask:', Boolean(newState.externalMask));
  },
  
  setSelectedMask: (mask) => {
    console.log('🏪 STORE: Setting selectedMask:', mask);
    set({ selectedMask: mask });
  },
  
  setPreviewVisible: (visible) => set({ previewVisible: visible }),
  setSafeZoneVisible: (visible) => set({ safeZoneVisible: visible }),
  
  setIsGenerating: (isGenerating) => {
    console.log('🏪 STORE: Setting isGenerating to:', isGenerating);
    set({ isGenerating: isGenerating });
  },
  
  setDrawingImageUrl: (imageUrl) => {
    console.log('🏪 STORE: Setting drawingImageUrl to:', imageUrl ? 'data present' : 'null');
    set({ drawingImageUrl: imageUrl });
  },
  
  setPrompt: (prompt) => {
    console.log('🏪 STORE: Setting prompt to:', prompt);
    set({ prompt: prompt });
  },
  
  setMaskStyle: (style) => {
    console.log('🏪 STORE: Setting maskStyle to:', style);
    set({ maskStyle: style });
  },
  
  resetEditor: () => {
    console.log('🏪 STORE: Resetting all editor state');
    set({
      maskImageUrl: null,
      externalMask: null,
      selectedMask: null,
      isGenerating: false,
      drawingImageUrl: null,
      prompt: '',
      maskStyle: ''
    });
    console.log('🏪 STORE: Reset complete');
  }
}));
