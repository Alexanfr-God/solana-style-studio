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
    if (!s) return {};
    const r: Record<string, string> = {};

    // Defensive: normalize fill — AI may return null/undefined/missing fill
    // Calling .startsWith() on undefined throws "Cannot read properties of undefined"
    const fill: string = (s.fill && typeof s.fill === 'string') ? s.fill : '';

    // ── Background / fill ──────────────────────────────────────────────────────
    if (s.type === 'glassmorphism') {
      // fill may be missing → fall back to semi-transparent white/black
      const glassFill = fill
        ? (fill.startsWith('rgba') || fill.startsWith('rgb') || fill.startsWith('#')
            ? fill
            : `${fill}${Math.round((s.fill_opacity ?? 0.08) * 255).toString(16).padStart(2,'0')}`)
        : `rgba(255,255,255,${s.fill_opacity ?? 0.08})`;
      r.backgroundColor = glassFill;
      r.backdropFilter = `blur(${s.blur ?? 14}px)`;
      r.WebkitBackdropFilter = `blur(${s.blur ?? 14}px)`;
      r.border = s.border_color ? `${s.border_width ?? 1}px solid ${s.border_color}` : '1px solid rgba(255,255,255,0.15)';
    } else if (s.type === 'neon') {
      if (fill) r.backgroundColor = fill;
      r.border = s.border_color ? `${s.border_width ?? 1}px solid ${s.border_color}` : 'none';
      const glowColor = s.border_color ?? fill ?? ca.safe_accent;
      r.boxShadow = `0 0 8px ${glowColor}, 0 0 20px ${glowColor}40, inset 0 0 8px ${glowColor}20`;
    } else if (s.type === 'gradient' && s.gradient) {
      r.background = `linear-gradient(${s.gradient.angle ?? 135}deg, ${s.gradient.from}, ${s.gradient.to})`;
    } else if (s.type === 'neumorphic') {
      if (fill) r.backgroundColor = fill;
      r.boxShadow = '4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.05)';
    } else if (s.type !== 'transparent') {
      if (fill) r.backgroundColor = fill;
      if (s.border_color) r.border = `${s.border_width ?? 1}px solid ${s.border_color}`;
    }

    if (s.border_radius) r.borderRadius = `${s.border_radius}px`;
    if (s.shadow) r.boxShadow = `${s.shadow.x}px ${s.shadow.y}px ${s.shadow.radius}px ${s.shadow.spread}px ${s.shadow.color}`;

    // ── Filter / transform ─────────────────────────────────────────────────────
    if (s.filter)    r.filter = s.filter;
    if (s.transform) r.transform = s.transform;

    // ── Text ──────────────────────────────────────────────────────────────────
    if (el.text?.color)          r.color = el.text.color;
    if (el.text?.size)           r.fontSize = `${el.text.size}px`;
    if (el.text?.weight)         r.fontWeight = String(el.text.weight);
    if (el.text?.opacity != null && el.text.opacity < 1)
                                 r.opacity = String(el.text.opacity);
    if (el.text?.letter_spacing) r.letterSpacing = `${el.text.letter_spacing}em`;
    if (el.text?.fontFamily)     r.fontFamily = `'${el.text.fontFamily}', sans-serif`;
    if (el.text?.textTransform)  r.textTransform = el.text.textTransform;
    if (el.text?.textShadow)     r.textShadow = el.text.textShadow;
    if (el.text?.lineHeight)     r.lineHeight = String(el.text.lineHeight);

    // ── Animation (encoded as JSON for DPR to decode) ─────────────────────────
    if (el.animation && el.animation.type !== 'none' && el.animation.duration_ms > 0) {
      r['--anim'] = JSON.stringify(el.animation);
    }

    return r;
  };

  // ── Map WCCOverlayV3 IDs → ALL phantom-layout.json anchors ───────────────────
  // password screen layout anchors: background, header, header-title, help-button,
  // header-line, logo, title, password-input, unlock-button, forgot-link

  // background (transparent when theme owns bg — handled separately at bottom)
  if (els['background-layer']) overrides['background'] = { ...toCSS(els['background-layer']) };

  // header bar
  if (els['header']) overrides['header'] = toCSS(els['header']);

  // "phantom" text in header → use header text style
  const headerFont = els['header']?.text?.fontFamily;
  overrides['header-title'] = {
    color: ca.safe_text,
    ...(headerFont ? { fontFamily: `'${headerFont}', sans-serif` } : {}),
    ...(els['header']?.text?.textShadow ? { textShadow: els['header'].text.textShadow } : {}),
  };

  // "?" help button → network-badge style (small badge-like)
  if (els['network-badge']) {
    overrides['help-button'] = { ...toCSS(els['network-badge']), color: ca.safe_text };
  }

  // separator line → subtle accent tint
  overrides['header-line'] = { backgroundColor: `${ca.safe_accent}33` };

  // ghost logo → tint via filter (hue trick on white SVG)
  if (els['btn-buy']?.icon) {
    const iconColor = els['btn-buy'].icon.tint;
    // Convert accent color to a sepia-tint filter effect for white SVGs
    overrides['logo'] = { filter: `drop-shadow(0 0 12px ${iconColor}) opacity(0.9)` };
  } else {
    overrides['logo'] = { filter: `drop-shadow(0 0 10px ${ca.safe_accent}) opacity(0.85)` };
  }

  // "Enter your Password" title → use balance-sol style (big prominent text)
  if (els['balance-sol']) {
    overrides['title'] = {
      ...toCSS(els['balance-sol']),
      // Don't carry the float animation to the title — just styling
      '--anim': '',
    };
    // Re-remove the empty anim key
    if (!overrides['title']['--anim']) delete overrides['title']['--anim'];
  } else {
    overrides['title'] = { color: ca.safe_text };
  }

  // password input → network-badge style (badge-like styling) with safe_text
  if (els['network-badge']) {
    overrides['password-input'] = { ...toCSS(els['network-badge']), color: ca.safe_text };
  }

  // unlock button → btn-buy (the hero CTA element)
  const btnEl = els['btn-buy'] ?? els['btn-send'];
  if (btnEl) {
    overrides['unlock-button'] = {
      ...toCSS(btnEl),
      backgroundColor: btnEl.style.fill ?? ca.safe_button_bg,
      color: btnEl.text?.color ?? ca.safe_text,
    };
  }

  // "Forgot Password?" link → safe_accent + elegant font
  const accentFont = els['account-address']?.text?.fontFamily ?? headerFont;
  overrides['forgot-link'] = {
    color: ca.safe_accent,
    ...(accentFont ? { fontFamily: `'${accentFont}', sans-serif` } : {}),
  };
  // Keep legacy key name too
  overrides['forgot-password-link'] = overrides['forgot-link'];

  // General text fallbacks
  overrides['phantom-text'] = { color: ca.safe_text };
  overrides['enter-password-text'] = { color: ca.safe_text };

  // ── Auto-transparent layout background when theme owns the background ──
  // The phantom-layout.json "background" element has a hardcoded gradient (zIndex 0).
  // It renders AFTER the <img> background in DPR (same zIndex, later DOM = on top).
  // Force it transparent so the theme's image/gradient shows through.
  const bg = theme.global.background;
  if (bg.url || (bg.type === 'gradient' && bg.gradient)) {
    overrides['background'] = {
      background: 'none',
      backgroundColor: 'transparent',
    };
  }

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
