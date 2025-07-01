
import { useState, useCallback, useRef } from 'react';
import { WalletElement } from '@/hooks/useWalletElements';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface EditModeState {
  isActive: boolean;
  selectedElement: WalletElement | null;
  selectedDomElement: HTMLElement | null;
  hoveredElement: WalletElement | null;
  hoveredDomElement: HTMLElement | null;
  history: WalletElement[];
}

export const useEditModeManager = () => {
  const [state, setState] = useState<EditModeState>({
    isActive: false,
    selectedElement: null,
    selectedDomElement: null,
    hoveredElement: null,
    hoveredDomElement: null,
    history: []
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const activateEditMode = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
    console.log('🎯 Edit Mode activated');
  }, []);

  const deactivateEditMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      selectedElement: null,
      selectedDomElement: null,
      hoveredElement: null,
      hoveredDomElement: null
    }));
    console.log('🚪 Edit Mode deactivated');
  }, []);

  const selectElement = useCallback((element: WalletElement, domElement: HTMLElement) => {
    setState(prev => ({
      ...prev,
      selectedElement: element,
      selectedDomElement: domElement,
      history: [element, ...prev.history.filter(e => e.id !== element.id)].slice(0, 10)
    }));
    console.log('✅ Element selected:', element.name);
  }, []);

  const setHoveredElement = useCallback((element: WalletElement | null, domElement: HTMLElement | null) => {
    setState(prev => ({
      ...prev,
      hoveredElement: element,
      hoveredDomElement: domElement
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedElement: null,
      selectedDomElement: null
    }));
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    const { history, selectedElement } = stateRef.current;
    if (history.length === 0) return;

    const currentIndex = selectedElement ? history.findIndex(e => e.id === selectedElement.id) : -1;
    let nextIndex;

    if (direction === 'up') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : history.length - 1;
    } else {
      nextIndex = currentIndex < history.length - 1 ? currentIndex + 1 : 0;
    }

    const nextElement = history[nextIndex];
    if (nextElement) {
      // Here we would need to find the DOM element, but for now just update the selection
      setState(prev => ({
        ...prev,
        selectedElement: nextElement
      }));
    }
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEscape: deactivateEditMode,
    onDelete: clearSelection,
    onArrowUp: () => navigateHistory('up'),
    onArrowDown: () => navigateHistory('down'),
  }, state.isActive);

  return {
    state,
    activateEditMode,
    deactivateEditMode,
    selectElement,
    setHoveredElement,
    clearSelection,
    navigateHistory
  };
};
