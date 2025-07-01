
import { useState, useCallback } from 'react';
import { WalletElement } from './useWalletElements';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

export interface SmartEditContext {
  selectedElement: WalletElement | null;
  isEditMode: boolean;
  contextualPrompt: string;
  elementHistory: WalletElement[];
}

export const useSmartEditContext = () => {
  const [selectedElement, setSelectedElement] = useState<WalletElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [elementHistory, setElementHistory] = useState<WalletElement[]>([]);
  
  const { walletStyle, currentLayer } = useWalletCustomizationStore();

  const generateContextualPrompt = useCallback((element: WalletElement | null) => {
    if (!element) return '';

    const currentStyle = {
      backgroundColor: walletStyle.backgroundColor,
      accentColor: walletStyle.accentColor,
      fontFamily: walletStyle.fontFamily || 'Inter',
      borderRadius: walletStyle.borderRadius || '12px'
    };

    return `
Context: Smart Edit Mode for wallet element
Element: ${element.name} (${element.type})
Screen: ${element.screen}
Current Theme: ${currentStyle.backgroundColor ? 'Dark' : 'Light'} theme
Accent Color: ${currentStyle.accentColor || 'Purple'}
Font: ${currentStyle.fontFamily}
Border Radius: ${currentStyle.borderRadius}
Layer: ${currentLayer}

Please provide specific styling suggestions for this ${element.type} element called "${element.name}" that would enhance its appearance while maintaining consistency with the current wallet design.
`.trim();
  }, [walletStyle, currentLayer]);

  const updateSelectedElement = useCallback((element: WalletElement | null) => {
    setSelectedElement(element);
    
    if (element) {
      setElementHistory(prev => {
        const filtered = prev.filter(e => e.id !== element.id);
        return [element, ...filtered].slice(0, 5); // Keep last 5 elements
      });
    }
  }, []);

  const getContextualPrompt = useCallback(() => {
    return generateContextualPrompt(selectedElement);
  }, [selectedElement, generateContextualPrompt]);

  const getSmartSuggestions = useCallback((element: WalletElement) => {
    const basePrompt = generateContextualPrompt(element);
    
    return {
      quick: `${basePrompt}\n\nProvide 3 quick styling improvements for this element.`,
      detailed: `${basePrompt}\n\nAnalyze and provide comprehensive styling recommendations including colors, typography, spacing, and effects.`,
      contextual: `${basePrompt}\n\nConsider the element's role in the ${element.screen} screen and suggest contextually appropriate styling.`
    };
  }, [generateContextualPrompt]);

  return {
    selectedElement,
    isEditMode,
    elementHistory,
    setIsEditMode,
    updateSelectedElement,
    getContextualPrompt,
    getSmartSuggestions,
    contextualPrompt: getContextualPrompt()
  };
};
