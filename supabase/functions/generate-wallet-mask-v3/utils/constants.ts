
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
  
  // Updated to use the black square guide image for better DALL-E positioning
  GUIDE_IMAGE_URL: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-guide.png",
  FALLBACK_GUIDE_URL: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/mask-wallet-cutout-v3.png",
  WALLET_BASE_IMAGE: "https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/wallet-base/wallet-ui-frame.png",
  
  // FIXED: Use absolute URLs for fallback masks to prevent background removal errors
  FALLBACK_MASKS: {
    cartoon: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/cats-mask.png',
    meme: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/pepe-mask.png', 
    luxury: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/crypto-mask.png',
    modern: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/abstract-mask.png',
    realistic: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/abstract-mask.png',
    fantasy: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/abstract-mask.png',
    minimalist: 'https://opxordptvpvzmhakvdde.supabase.co/storage/v1/object/public/external-masks/clean%20Example.png'
  }
};

export function getFallbackMask(style: string): string {
  const fallbacks = V4_CONFIG.FALLBACK_MASKS;
  return fallbacks[style as keyof typeof fallbacks] || fallbacks.modern;
}
