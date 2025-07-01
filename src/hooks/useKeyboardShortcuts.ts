
import { useEffect } from 'react';

interface KeyboardShortcuts {
  onEscape?: () => void;
  onEnter?: () => void;
  onDelete?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onSpace?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          shortcuts.onEscape?.();
          break;
        case 'Enter':
          event.preventDefault();
          shortcuts.onEnter?.();
          break;
        case 'Delete':
        case 'Backspace':
          event.preventDefault();
          shortcuts.onDelete?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          shortcuts.onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          shortcuts.onArrowDown?.();
          break;
        case ' ':
          event.preventDefault();
          shortcuts.onSpace?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, isActive]);
};
