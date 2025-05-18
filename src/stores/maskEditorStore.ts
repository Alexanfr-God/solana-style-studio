
import { create } from 'zustand';

export interface MaskLayout {
  layout: {
    top: string | null;
    bottom: string | null;
    left: string | null;
    right: string | null;
    core: string;
  };
  theme: string;
  style: string;
  color_palette: string[];
  safe_zone: {
    x: string;
    y: string;
    width: string;
    height: string;
  };
}

interface MaskEditorStore {
  prompt: string;
  setPrompt: (prompt: string) => void;
  
  uploadedImage: string | null;
  setUploadedImage: (imageUrl: string | null) => void;
  
  maskImageUrl: string | null;
  setMaskImageUrl: (imageUrl: string | null) => void;
  
  layoutJson: MaskLayout | null;
  setLayoutJson: (layout: MaskLayout | null) => void;
  
  previewVisible: boolean;
  setPreviewVisible: (visible: boolean) => void;
  
  safeZoneVisible: boolean;
  setSafeZoneVisible: (visible: boolean) => void;
  
  selectedMask: string | null;
  setSelectedMask: (maskId: string | null) => void;
  
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  
  reset: () => void;
}

const initialState = {
  prompt: '',
  uploadedImage: null,
  maskImageUrl: null,
  layoutJson: null,
  previewVisible: true,
  safeZoneVisible: true,
  selectedMask: null,
  isGenerating: false,
};

export const useMaskEditorStore = create<MaskEditorStore>((set) => ({
  ...initialState,
  setPrompt: (prompt) => set({ prompt }),
  setUploadedImage: (uploadedImage) => set({ uploadedImage }),
  setMaskImageUrl: (maskImageUrl) => set({ maskImageUrl }),
  setLayoutJson: (layoutJson) => set({ layoutJson }),
  setPreviewVisible: (previewVisible) => set({ previewVisible }),
  setSafeZoneVisible: (safeZoneVisible) => set({ safeZoneVisible }),
  setSelectedMask: (selectedMask) => set({ selectedMask }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  reset: () => set(initialState),
}));
