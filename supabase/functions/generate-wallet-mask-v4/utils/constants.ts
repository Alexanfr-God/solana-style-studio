
// All constants and configuration for V4 mask generation

export const SAFE_ZONE = {
  x: 352,
  y: 228,
  width: 320,
  height: 569
};

export const GUIDE_IMAGE_URL = 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png';

export const OUTPUT_SIZE = 1024;

export const STYLES = [
  'cartoon',
  'meme', 
  'luxury',
  'modern',
  'realistic',
  'fantasy',
  'minimalist'
] as const;

export const FALLBACK_MASKS = {
  cartoon: '/external-masks/cats-mask.png',
  meme: '/external-masks/pepe-mask.png',
  luxury: '/external-masks/crypto-mask.png',
  modern: '/external-masks/cyber-mask.png',
  realistic: '/external-masks/abstract-mask.png',
  fantasy: '/external-masks/abstract-mask.png',
  minimalist: '/external-masks/clean Example.png'
};

export const API_TIMEOUTS = {
  DALLE: 30000,      // 30 seconds
  HUGGING_FACE: 20000, // 20 seconds
  STORAGE: 15000     // 15 seconds
};
