import type { WCCOverlayV3 } from '@/stores/phantomThemeStore';

/**
 * "Original" Phantom skin — visual baseline that mirrors the default
 * phantom-layout.json look (purple gradient bg + subtle glass elements).
 * Used as the first card in the Phantom themes coverflow.
 */
export const PHANTOM_BUILTIN_ORIGINAL: WCCOverlayV3 = {
  version: 3,
  wallet: 'phantom',
  theme_name: 'Original',
  generated_at: new Date(0).toISOString(),
  global: {
    background: {
      type: 'gradient',
      gradient: { from: '#1a1625', to: '#2d1b4e', angle: 135 },
      opacity: 1,
    },
    color_analysis: {
      dominant: ['#ab9ff2', '#1a1625'],
      luminance: 'dark',
      forbidden: [],
      safe_text: '#ffffff',
      safe_accent: '#ab9ff2',
      safe_button_bg: '#ab9ff2',
      palette: {
        primary: '#ab9ff2',
        secondary: '#7b6fcc',
        neutral: '#2d1b4e',
        highlight: '#ffffff',
      },
    },
  },
  elements: {
    'background-layer': {
      style: {
        type: 'transparent',
        fill: 'transparent',
        fill_opacity: 0,
        border_radius: 0,
      },
    },
    'header': {
      style: {
        type: 'transparent',
        fill: 'transparent',
        fill_opacity: 0,
        border_radius: 0,
      },
      text: { color: '#ffffff', size: 16, weight: 600, opacity: 1 },
    },
    'network-badge': {
      style: {
        type: 'glassmorphism',
        fill: 'rgba(255,255,255,0.08)',
        fill_opacity: 0.08,
        blur: 14,
        border_color: 'rgba(255,255,255,0.15)',
        border_width: 1,
        border_radius: 12,
      },
      text: { color: '#ffffff', size: 14, weight: 500, opacity: 1 },
    },
    'balance-sol': {
      style: {
        type: 'transparent',
        fill: 'transparent',
        fill_opacity: 0,
        border_radius: 0,
      },
      text: { color: '#ffffff', size: 28, weight: 700, opacity: 1 },
    },
    'btn-buy': {
      style: {
        type: 'solid',
        fill: '#ab9ff2',
        fill_opacity: 1,
        border_radius: 14,
      },
      text: { color: '#1a1625', size: 16, weight: 600, opacity: 1 },
      icon: { tint: '#ab9ff2', opacity: 0.9 },
    },
    'btn-send': {
      style: {
        type: 'glassmorphism',
        fill: 'rgba(255,255,255,0.08)',
        fill_opacity: 0.08,
        blur: 14,
        border_color: 'rgba(171,159,242,0.3)',
        border_width: 1,
        border_radius: 14,
      },
      text: { color: '#ffffff', size: 16, weight: 600, opacity: 1 },
    },
    'account-address': {
      style: {
        type: 'transparent',
        fill: 'transparent',
        fill_opacity: 0,
        border_radius: 0,
      },
      text: { color: '#ab9ff2', size: 12, weight: 400, opacity: 0.8 },
    },
  },
};

export interface PhantomPresetCard {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  themeData?: WCCOverlayV3;
  isPlaceholder: boolean;
}

export const PHANTOM_PRESETS: PhantomPresetCard[] = [
  {
    id: 'phantom-original',
    name: 'Original',
    description: 'The default Phantom look',
    coverUrl: '/placeholder.svg',
    themeData: PHANTOM_BUILTIN_ORIGINAL,
    isPlaceholder: false,
  },
  ...Array.from({ length: 19 }, (_, i) => ({
    id: `phantom-soon-${i + 1}`,
    name: 'Coming Soon',
    description: 'New Phantom skin in the works',
    coverUrl: '/placeholder.svg',
    isPlaceholder: true,
  })),
];