
// V4 Enhanced Architecture: Configuration constants
export const V4_CONFIG = {
  DALLE_CONFIG: {
    model: "dall-e-3",
    size: "1024x1024" as const,
    response_format: "url" as const,
    quality: "standard" as const
  },
  
  SAFE_ZONE: {
    x: 352,
    y: 228,
    width: 320,
    height: 569
  },
  
  GUIDE_IMAGE_URL: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png",
  WALLET_BASE_IMAGE: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/wallet-ui-frame.png",
  
  FALLBACK_MASKS: {
    cartoon: '/external-masks/cats-mask.png',
    meme: '/external-masks/pepe-mask.png', 
    luxury: '/external-masks/crypto-mask.png',
    modern: '/external-masks/abstract-mask.png',
    realistic: '/external-masks/abstract-mask.png',
    fantasy: '/external-masks/abstract-mask.png',
    minimalist: '/external-masks/clean Example.png'
  }
};

export function getFallbackMask(style: string): string {
  const fallbacks = V4_CONFIG.FALLBACK_MASKS;
  return fallbacks[style as keyof typeof fallbacks] || fallbacks.modern;
}
