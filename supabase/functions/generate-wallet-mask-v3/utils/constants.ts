
// V4 Architecture: Centralized constants and configuration
export const V4_CONFIG = {
  // Guide image with black rectangle for reference
  GUIDE_IMAGE_URL: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png',
  
  // Wallet base for context
  WALLET_BASE_IMAGE: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/ui_frame_base.png',
  
  // Fixed safe zone coordinates (1024x1024 output)
  SAFE_ZONE: {
    x: 352,
    y: 228, 
    width: 320,
    height: 569
  },
  
  // DALL-E configuration
  DALLE_CONFIG: {
    model: "dall-e-3",
    size: "1024x1024" as const,
    quality: "hd" as const,
    response_format: "url" as const
  },
  
  // V4 Principles
  CORE_PRINCIPLES: {
    NO_BACKGROUND: true,
    FOCUS_ON_CHARACTER: true,
    PHYSICAL_INTERACTION: true,
    PNG_READY: true
  }
};

export const FALLBACK_MASKS = {
  cartoon: '/external-masks/cats-mask.png',
  meme: '/external-masks/pepe-mask.png', 
  luxury: '/external-masks/crypto-mask.png',
  modern: '/external-masks/cyber-mask.png',
  realistic: '/external-masks/abstract-mask.png',
  fantasy: '/external-masks/abstract-mask.png',
  minimalist: '/external-masks/clean Example.png'
};

export function getFallbackMask(style: string): string {
  return FALLBACK_MASKS[style as keyof typeof FALLBACK_MASKS] || '/external-masks/abstract-mask.png';
}
