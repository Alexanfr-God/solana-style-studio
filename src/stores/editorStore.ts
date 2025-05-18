
import { create } from 'zustand';

type EditorMode = 'create-style' | 'fine-tune' | 'decorate';

interface EditorStore {
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  editorMode: 'create-style',
  setEditorMode: (mode) => set({ editorMode: mode }),
}));
