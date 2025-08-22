
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
