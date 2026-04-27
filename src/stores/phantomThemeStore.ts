import { create } from 'zustand';

interface ElementStyle {
  style: {
    type: string;
    fill: string;
    fill_opacity: number;
    blur?: number;
    border_color?: string;
    border_width?: number;
    border_radius: number;
    gradient?: { from: string; to: string; angle: number };
  };
  text?: { color: string; size: number; weight: number; opacity: number };
  animation?: { type: string; duration_ms: number; loop: boolean; color?: string };
  icon?: { tint: string; opacity: number };
}

interface BackgroundResult {
  type: string;
  url?: string;
  gradient?: { from: string; to: string; angle: number };
  color?: string;
  blur?: number;
  opacity: number;
}

interface ColorAnalysis {
  dominant: string[];
  luminance: 'dark' | 'light' | 'mixed';
  forbidden: string[];
  safe_text: string;
  safe_accent: string;
  safe_button_bg: string;
  palette: { primary: string; secondary: string; neutral: string; highlight: string };
}

export interface WCCOverlayV3 {
  version: 3;
  wallet: 'phantom';
  theme_name: string;
  generated_at: string;
  global: { background: BackgroundResult; color_analysis: ColorAnalysis };
  elements: Record<string, ElementStyle>;
}

interface PhantomThemeStore {
  phantomTheme: WCCOverlayV3 | null;
  setPhantomTheme: (theme: WCCOverlayV3) => void;
  clearPhantomTheme: () => void;
}

export const usePhantomThemeStore = create<PhantomThemeStore>((set) => ({
  phantomTheme: null,
  setPhantomTheme: (theme) => set({ phantomTheme: theme }),
  clearPhantomTheme: () => set({ phantomTheme: null }),
}));

// Convert WCCOverlayV3 element styles → DynamicPhantomRenderer themeOverrides
// Maps from PHANTOM_ELEMENT_MAP IDs to phantom-layout.json anchor names
export function buildThemeOverrides(theme: WCCOverlayV3): Record<string, Record<string, string>> {
  const els = theme.elements;
  const ca = theme.global.color_analysis;
  const overrides: Record<string, Record<string, string>> = {};

  const toCSS = (el: ElementStyle | undefined): Record<string, string> => {
    if (!el) return {};
    const s = el.style;
    const r: Record<string, string> = {};

    if (s.type === 'glassmorphism') {
      // Real glassmorphism: semi-transparent fill + backdrop-filter blur
      r.backgroundColor = s.fill.startsWith('rgba') ? s.fill : `${s.fill}${Math.round((s.fill_opacity ?? 0.1) * 255).toString(16).padStart(2,'0')}`;
      r.backdropFilter = `blur(${s.blur ?? 12}px)`;
      r.WebkitBackdropFilter = `blur(${s.blur ?? 12}px)`;
      r.border = s.border_color ? `${s.border_width ?? 1}px solid ${s.border_color}` : '1px solid rgba(255,255,255,0.15)';
    } else if (s.type === 'neon') {
      r.backgroundColor = s.fill;
      r.border = s.border_color ? `${s.border_width ?? 1}px solid ${s.border_color}` : 'none';
      r.boxShadow = s.border_color
        ? `0 0 8px ${s.border_color}, 0 0 20px ${s.border_color}40, inset 0 0 8px ${s.border_color}20`
        : '';
    } else if (s.type === 'gradient' && s.gradient) {
      r.background = `linear-gradient(${s.gradient.angle}deg, ${s.gradient.from}, ${s.gradient.to})`;
    } else if (s.type === 'neumorphic') {
      r.backgroundColor = s.fill;
      r.boxShadow = '4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.05)';
    } else if (s.type !== 'transparent') {
      r.backgroundColor = s.fill;
      if (s.border_color) r.border = `${s.border_width ?? 1}px solid ${s.border_color}`;
    }

    if (s.border_radius) r.borderRadius = `${s.border_radius}px`;
    if (s.shadow) r.boxShadow = `${s.shadow.x}px ${s.shadow.y}px ${s.shadow.radius}px ${s.shadow.spread}px ${s.shadow.color}`;
    if (el.text?.color) r.color = el.text.color;
    if (el.text?.size) r.fontSize = `${el.text.size}px`;
    if (el.text?.weight) r.fontWeight = String(el.text.weight);

    return r;
  };

  // Map WCCOverlayV3 IDs → phantom-layout.json anchors
  if (els['background-layer']) overrides['background'] = { ...toCSS(els['background-layer']) };
  if (els['header'])           overrides['header'] = toCSS(els['header']);
  if (els['btn-send'] || els['btn-buy']) {
    const btnEl = els['btn-buy'] ?? els['btn-send'];
    overrides['unlock-button'] = {
      ...toCSS(btnEl),
      backgroundColor: btnEl?.style.fill ?? ca.safe_button_bg,
      color: btnEl?.text?.color ?? ca.safe_text,
    };
  }
  if (els['network-badge']) {
    overrides['password-input'] = {
      ...toCSS(els['network-badge']),
      color: ca.safe_text,
    };
  }

  // Apply safe_text to text elements
  const textStyle = { color: ca.safe_text };
  overrides['phantom-text'] = textStyle;
  overrides['enter-password-text'] = textStyle;
  overrides['forgot-password-link'] = { color: ca.safe_accent };

  return overrides;
}

// Convert WCCOverlayV3 background → CSS background string for the container
export function buildContainerBackground(theme: WCCOverlayV3): string {
  const bg = theme.global.background;
  if (bg.type === 'gradient' && bg.gradient) {
    return `linear-gradient(${bg.gradient.angle}deg, ${bg.gradient.from}, ${bg.gradient.to})`;
  }
  if (bg.url) {
    console.log('[buildContainerBackground] image url:', bg.url.slice(0, 100));
    return `url(${bg.url})`;
  }
  if (bg.color) return bg.color;
  return '#131217';
}
