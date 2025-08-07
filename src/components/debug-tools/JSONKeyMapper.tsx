
import React, { useEffect, useState } from 'react';
import { JsonThemeElement } from '@/utils/jsonThemeAnalyzer';

interface JSONKeyMapperProps {
  selectedElement: JsonThemeElement | null;
  onDomElementFound: (element: HTMLElement | null) => void;
}

export const JSONKeyMapper: React.FC<JSONKeyMapperProps> = ({
  selectedElement,
  onDomElementFound
}) => {
  const [domElement, setDomElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedElement) {
      setDomElement(null);
      onDomElementFound(null);
      return;
    }

    // Strategy 1: Try data-element-id
    let element = document.querySelector(`[data-element-id="${selectedElement.key}"]`) as HTMLElement;
    
    if (!element) {
      // Strategy 2: Try with path components
      const pathParts = selectedElement.path.split('.');
      for (const part of pathParts) {
        element = document.querySelector(`[data-element-id="${part}"]`) as HTMLElement;
        if (element) break;
      }
    }

    if (!element) {
      // Strategy 3: Try class-based selection
      element = document.querySelector(`.${selectedElement.key}`) as HTMLElement;
    }

    if (!element) {
      // Strategy 4: Smart matching based on key patterns
      element = findElementByKeyPattern(selectedElement.key);
    }

    console.log(`🔍 Mapping ${selectedElement.key}:`, element ? 'Found' : 'Not found');
    
    setDomElement(element);
    onDomElementFound(element);
  }, [selectedElement, onDomElementFound]);

  return null; // This is a utility component without UI
};

// Smart pattern matching for common UI elements
const findElementByKeyPattern = (key: string): HTMLElement | null => {
  const patterns: Record<string, string[]> = {
    'assetCard': ['.asset-item', '[data-testid*="asset"]', '.token-item'],
    'tokenAmount': ['.token-amount', '.balance-amount', '[data-testid*="balance"]'],
    'sendButton': ['button[data-action="send"]', '.send-btn', '.action-button'],
    'receiveButton': ['button[data-action="receive"]', '.receive-btn'],
    'swapButton': ['button[data-action="swap"]', '.swap-btn'],
    'buyButton': ['button[data-action="buy"]', '.buy-btn'],
    'totalBalance': ['.total-balance', '.main-balance', '[data-testid*="total"]'],
    'searchInput': ['input[placeholder*="search"]', '.search-input', '[data-testid*="search"]'],
    'passwordInput': ['input[type="password"]', '.password-input'],
    'backButton': ['.back-button', 'button[aria-label*="back"]', '.header-back'],
    'closeButton': ['.close-button', 'button[aria-label*="close"]', '.modal-close'],
    'accountDropdown': ['.account-dropdown', '.account-selector', '[data-testid*="account"]'],
    'navigationTab': ['.nav-tab', '.bottom-nav button', '.navigation-item'],
    'qrButton': ['button[data-action*="qr"]', '.qr-btn', '[data-testid*="qr"]'],
    'copyButton': ['button[data-action*="copy"]', '.copy-btn', '[data-testid*="copy"]'],
  };

  const selectors = patterns[key] || [];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      console.log(`🎯 Found ${key} using pattern: ${selector}`);
      return element;
    }
  }

  return null;
};

// Utility function to add data-element-id to elements that don't have them
export const addMissingElementIds = () => {
  const mappings = [
    { selector: '.total-balance-value', id: 'totalBalance' },
    { selector: '.asset-item', id: 'assetCard' },
    { selector: '.token-amount', id: 'tokenAmount' },
    { selector: '.send-button', id: 'sendButton' },
    { selector: '.receive-button', id: 'receiveButton' },
    { selector: '.swap-button', id: 'swapButton' },
    { selector: '.buy-button', id: 'buyButton' },
    { selector: '.search-input', id: 'searchInput' },
    { selector: '.password-input', id: 'passwordInput' },
    { selector: '.back-button', id: 'backButton' },
    { selector: '.close-button', id: 'closeButton' },
    { selector: '.account-dropdown', id: 'accountDropdown' },
  ];

  mappings.forEach(({ selector, id }) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element, index) => {
      if (!element.getAttribute('data-element-id')) {
        element.setAttribute('data-element-id', index === 0 ? id : `${id}-${index}`);
      }
    });
  });

  console.log('📋 Added missing data-element-id attributes');
};
