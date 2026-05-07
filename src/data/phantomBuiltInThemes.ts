import type { WCCOverlayV3 } from '@/stores/phantomThemeStore';
import phantomOriginalCover from '@/assets/phantom-original-cover.png';

/**
 * "Gold BTC" — recently minted Phantom skin (mint GzS4v8H6...).
 * Theme data is inlined from the on-chain NFT so the click applies instantly
 * without a network round-trip to IPFS.
 */
export const PHANTOM_BUILTIN_GOLD_BTC: WCCOverlayV3 = {
  version: 3,
  wallet: 'phantom',
  theme_name: 'Gold BTC',
  generated_at: '2026-05-03T17:43:37.880Z',
  global: {
    background: {
      type: 'image',
      url: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/generated-images/backgrounds/49TycAdY/1777830204705.png',
      opacity: 0.9,
      blur: 0,
      animated: true,
      animation_preset: 'cosmic-pulse',
    } as any,
    color_analysis: {
      dominant: ['#0a0f30', '#d4a44f', '#4b6b9c'],
      luminance: 'dark',
      forbidden: ['#0a0f30', '#0b1033', '#0c1136'],
      safe_text: '#F5F5F5',
      safe_accent: '#FF5733',
      safe_button_bg: '#4b6b9c',
      palette: {
        primary: '#d4a44f',
        secondary: '#4b6b9c',
        neutral: '#0a0f30',
        highlight: '#FF5733',
      },
    } as any,
  },
  elements: {
    'background-layer': {
      style: { type: 'transparent', fill: 'transparent', fill_opacity: 0, blur: 20, border_color: 'rgba(212,164,79,0.12)', border_width: 1, border_radius: 0 } as any,
    },
    'header': {
      style: { type: 'glassmorphism', fill: '#FF5733', fill_opacity: 0.05, blur: 20, border_color: 'rgba(212,164,79,0.10)', border_width: 1, border_radius: 0 } as any,
      text: { color: '#F5F5F5', size: 14, weight: 500, opacity: 1 },
    },
    'network-badge': {
      style: { type: 'solid', fill: 'rgba(75,107,156,0.15)', fill_opacity: 0.15, border_radius: 12 },
      text: { color: '#F5F5F5', size: 12, weight: 600, opacity: 1 } as any,
    },
    'balance-sol': {
      style: { type: 'solid', fill: 'transparent', fill_opacity: 0, border_radius: 0 },
      text: { color: '#F5F5F5', size: 40, weight: 800, opacity: 1 } as any,
    },
    'balance-usd': {
      style: { type: 'solid', fill: 'transparent', fill_opacity: 0, border_radius: 0 },
      text: { color: '#F5F5F5', size: 14, weight: 400, opacity: 0.55 },
    } as any,
    'btn-buy': {
      style: { type: 'gradient', fill: '#0a0f30', fill_opacity: 1, border_radius: 20, gradient: { from: '#4b6b9c', to: '#3a557a', angle: 90 } } as any,
      text: { color: '#FFFFFF', size: 12, weight: 600, opacity: 1 } as any,
    },
    'btn-send': {
      style: { type: 'gradient', fill: '#0a0f30', fill_opacity: 1, border_radius: 20, gradient: { from: '#4b6b9c', to: '#3a557a', angle: 90 } } as any,
      text: { color: '#FFFFFF', size: 12, weight: 600, opacity: 1 } as any,
    },
    'btn-swap': {
      style: { type: 'gradient', fill: '#0a0f30', fill_opacity: 1, border_radius: 20, gradient: { from: '#4b6b9c', to: '#3a557a', angle: 90 } } as any,
      text: { color: '#FFFFFF', size: 12, weight: 600, opacity: 1 } as any,
    },
    'btn-receive': {
      style: { type: 'gradient', fill: '#0a0f30', fill_opacity: 1, border_radius: 20, gradient: { from: '#4b6b9c', to: '#3a557a', angle: 90 } } as any,
      text: { color: '#FFFFFF', size: 12, weight: 600, opacity: 1 } as any,
    },
    'account-address': {
      style: { type: 'solid', fill: 'rgba(75,107,156,0.15)', fill_opacity: 0.15, border_radius: 8 },
      text: { color: '#F5F5F5', size: 12, weight: 400, opacity: 1 } as any,
    },
  } as any,
};

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

/**
 * "Phantom 2" — most recently minted Phantom skin (mint 4dGLLUTX...).
 * Theme data inlined from on-chain NFT for instant apply.
 */
export const PHANTOM_BUILTIN_PHANTOM_2: WCCOverlayV3 = {
  version: 3,
  wallet: 'phantom',
  theme_name: 'Phantom 2',
  generated_at: '2026-05-06T23:54:54.832Z',
  global: {
    background: {
      type: 'image',
      url: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/generated-images/backgrounds/49TycAdY/1778111665018.png',
      opacity: 0.9,
      blur: 0,
      animated: true,
      animation_preset: 'cosmic-pulse',
    } as any,
    color_analysis: {
      dominant: ['#0a0e1a', '#1a2540', '#d94a3a'],
      luminance: 'dark',
      forbidden: ['#0a0e1a', '#0d1220', '#151b2e', '#1a2540', '#0f1423'],
      safe_text: '#f5f5f5',
      safe_accent: '#00d4ff',
      safe_button_bg: '#4a90e2',
      palette: {
        primary: '#4a90e2',
        secondary: '#00d4ff',
        neutral: '#8a9bb0',
        highlight: '#ff8c42',
      },
    } as any,
  },
  elements: {
    'background-layer': {
      style: { type: 'transparent', fill: 'transparent', fill_opacity: 0, border_radius: 0 } as any,
    },
    'header': {
      style: { type: 'glassmorphism', fill: 'rgba(107, 70, 193, 0.05)', fill_opacity: 0.05, blur: 20, border_color: 'rgba(107, 70, 193, 0.10)', border_width: 1, border_radius: 0 } as any,
      text: { color: '#f5f5f5', size: 14, weight: 500, opacity: 1 },
    },
    'network-badge': {
      style: { type: 'solid', fill: 'rgba(107, 70, 193, 0.15)', fill_opacity: 0.15, border_color: 'rgba(107, 70, 193, 0.25)', border_width: 1, border_radius: 6 } as any,
      text: { color: '#f5f5f5', size: 11, weight: 600, opacity: 1 } as any,
    },
    'balance-sol': {
      style: { type: 'transparent', fill: 'rgba(0, 0, 0, 0)', fill_opacity: 0, border_radius: 0 } as any,
      text: { color: '#f5f5f5', size: 42, weight: 700, opacity: 1 } as any,
    },
    'balance-usd': {
      style: { type: 'transparent', fill: 'rgba(0, 0, 0, 0)', fill_opacity: 0, border_radius: 0 } as any,
      text: { color: '#8a9bb0', size: 14, weight: 400, opacity: 0.55 },
    },
    'btn-buy': {
      style: { type: 'solid', fill: '#7D5BD4', fill_opacity: 1, border_radius: 12 },
      text: { color: '#ffffff', size: 13, weight: 600, opacity: 1 } as any,
      icon: { tint: '#ffffff', opacity: 1 },
    },
    'btn-send': {
      style: { type: 'solid', fill: '#6B46C1', fill_opacity: 1, border_radius: 12 },
      text: { color: '#ffffff', size: 13, weight: 600, opacity: 1 } as any,
      icon: { tint: '#ffffff', opacity: 1 },
    },
    'btn-swap': {
      style: { type: 'solid', fill: '#6B46C1', fill_opacity: 1, border_radius: 12 },
      text: { color: '#ffffff', size: 13, weight: 600, opacity: 1 } as any,
      icon: { tint: '#ffffff', opacity: 1 },
    },
    'btn-receive': {
      style: { type: 'solid', fill: '#6B46C1', fill_opacity: 1, border_radius: 12 },
      text: { color: '#ffffff', size: 13, weight: 600, opacity: 1 } as any,
      icon: { tint: '#ffffff', opacity: 1 },
    },
    'account-address': {
      style: { type: 'transparent', fill: 'rgba(0, 0, 0, 0)', fill_opacity: 0, border_radius: 0 } as any,
      text: { color: '#b8c5d6', size: 12, weight: 400, opacity: 0.75 },
    },
    'token-list-item': {
      style: { type: 'glassmorphism', fill: 'rgba(107, 70, 193, 0.04)', fill_opacity: 0.04, blur: 16, border_color: 'rgba(107, 70, 193, 0.08)', border_width: 1, border_radius: 12 } as any,
      text: { color: '#f5f5f5', size: 14, weight: 500, opacity: 1 },
      icon: { tint: '#b8a3e8', opacity: 0.9 },
    } as any,
  } as any,
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
    coverUrl: phantomOriginalCover,
    themeData: PHANTOM_BUILTIN_ORIGINAL,
    isPlaceholder: false,
  },
  {
    id: 'phantom-gold-btc',
    name: 'Gold BTC',
    description: 'Recently minted Phantom skin',
    coverUrl: 'https://gateway.lighthouse.storage/ipfs/QmefA7pxFkmWXLhwhTC35SEuXJBN7EfnWY8t8zcoVnEb44',
    themeData: PHANTOM_BUILTIN_GOLD_BTC,
    isPlaceholder: false,
  },
  {
    id: 'phantom-2',
    name: 'Phantom 2',
    description: 'Recently minted Phantom skin',
    coverUrl: 'https://gateway.lighthouse.storage/ipfs/QmXJYdj93o5p94nbhkDMqyfuUkjdN3ynC8UqD7iPxUzuCM',
    themeData: PHANTOM_BUILTIN_PHANTOM_2,
    isPlaceholder: false,
  },
  ...Array.from({ length: 17 }, (_, i) => ({
    id: `phantom-soon-${i + 1}`,
    name: 'Coming Soon',
    description: 'New Phantom skin in the works',
    coverUrl: '/placeholder.svg',
    isPlaceholder: true,
  })),
];