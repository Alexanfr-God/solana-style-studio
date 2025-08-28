
// Инструменты для генерации JSON патчей
import type { Operation } from 'fast-json-patch';
import { ROUTES, UILayer } from './routes';
import { getExistingPath } from './findPath';

export const tools = {
  setBackgroundColor(layer: UILayer, hex: string, theme: any): Operation[] {
    const path = getExistingPath(theme, ROUTES[layer]?.backgroundColor || []);
    return path ? [{ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex }] : [];
  },

  setBackgroundImage(layer: UILayer, url: string, theme: any): Operation[] {
    const path = getExistingPath(theme, ROUTES[layer]?.backgroundImage || []);
    return path ? [{ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: url }] : [];
  },

  setPrimaryButtonBg(layer: UILayer, hex: string, theme: any): Operation[] {
    const path = getExistingPath(theme, ROUTES[layer]?.primaryButtonBg || []);
    return path ? [{ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex }] : [];
  },

  setPrimaryButtonText(layer: UILayer, hex: string, theme: any): Operation[] {
    const path = getExistingPath(theme, ROUTES[layer]?.primaryButtonText || []);
    return path ? [{ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex }] : [];
  },

  setTextColor(layer: UILayer, hex: string, theme: any): Operation[] {
    const path = getExistingPath(theme, ROUTES[layer]?.textColor || []);
    return path ? [{ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex }] : [];
  },

  setFontFamily(font: string): Operation[] {
    return [{ op: 'replace', path: '/global/fontFamily', value: font }];
  }
};

// Массовые операции (fan-out по всем слоям)
export function setAllLayersPrimaryButtons(hex: string, theme: any): Operation[] {
  const ops: Operation[] = [];
  const layers = Object.keys(ROUTES) as UILayer[];
  
  layers.forEach(layer => {
    const candidates = ROUTES[layer]?.primaryButtonBg || [];
    candidates.forEach(candidate => {
      const path = getExistingPath(theme, [candidate]);
      if (path) {
        ops.push({ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex });
      }
    });
  });
  
  return ops;
}

export function setAllLayersTextColor(hex: string, theme: any): Operation[] {
  const ops: Operation[] = [];
  const layers = Object.keys(ROUTES) as UILayer[];
  
  layers.forEach(layer => {
    const candidates = ROUTES[layer]?.textColor || [];
    candidates.forEach(candidate => {
      const path = getExistingPath(theme, [candidate]);
      if (path) {
        ops.push({ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex });
      }
    });
  });
  
  return ops;
}

export function setAllLayersBackground(hex: string, theme: any): Operation[] {
  const ops: Operation[] = [];
  const layers = Object.keys(ROUTES) as UILayer[];
  
  layers.forEach(layer => {
    const candidates = ROUTES[layer]?.backgroundColor || [];
    candidates.forEach(candidate => {
      const path = getExistingPath(theme, [candidate]);
      if (path) {
        ops.push({ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: hex });
      }
    });
  });
  
  return ops;
}

export function setAllFonts(font: string, theme: any): Operation[] {
  const ops: Operation[] = [];
  
  // Глобальный шрифт
  ops.push({ op: 'replace', path: '/global/fontFamily', value: font });
  
  // Дубли в основные узлы, где UI читает напрямую
  const fontTargets = [
    'lockLayer.title.fontFamily',
    'homeLayer.header.textColor', // Заменим на fontFamily если есть
    'homeLayer.totalBalanceValue.fontFamily',
    'searchLayer.searchInputFont.fontFamily',
    'sidebarLayer.header.accountTitle.fontFamily'
  ];
  
  fontTargets.forEach(target => {
    const path = getExistingPath(theme, [target]);
    if (path) {
      ops.push({ op: 'replace', path: `/${path.replace(/\./g, '/')}`, value: font });
    }
  });
  
  return ops;
}
