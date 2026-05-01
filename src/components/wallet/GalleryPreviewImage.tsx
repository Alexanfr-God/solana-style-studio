import { useEffect, useState } from 'react';

// Convert IPFS URI to HTTP gateway URL (mirrors logic in MintedGallerySection)
function ipfsToHttp(uri: string): string {
  if (!uri) return uri;
  if (uri.startsWith('ipfs://')) {
    return `https://gateway.lighthouse.storage/ipfs/${uri.replace('ipfs://', '')}`;
  }
  if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;
  return `https://gateway.lighthouse.storage/ipfs/${uri}`;
}

// Heuristic: detect a placeholder/empty image_url that should NOT be shown.
function isPlaceholder(url: string | null | undefined): boolean {
  if (!url) return true;
  // 1×1 transparent PNG used as old placeholder
  if (url.startsWith('data:image/png;base64,iVBORw0KGgo')) return true;
  return false;
}

interface Props {
  imageUrl?: string | null;
  metadataUri?: string | null;
  alt: string;
  className?: string;
}

/**
 * Renders a minted-NFT preview. If `imageUrl` is missing or a known placeholder
 * (e.g. 1×1 PNG that produced the green-background bug for early Phantom mints),
 * we fetch the metadata JSON from `metadataUri` and pull `image` (or properties.files[0])
 * as a fallback so users see the actual artwork.
 */
export function GalleryPreviewImage({ imageUrl, metadataUri, alt, className }: Props) {
  const initial = isPlaceholder(imageUrl) ? null : imageUrl ?? null;
  const [src, setSrc] = useState<string | null>(initial);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (src || !metadataUri) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(ipfsToHttp(metadataUri));
        if (!res.ok) return;
        const meta = await res.json();
        const candidate: string | undefined =
          (typeof meta?.image === 'string' && meta.image) ||
          meta?.properties?.files?.find((f: any) => typeof f?.uri === 'string' && f.type?.startsWith?.('image'))?.uri;
        if (!candidate) return;
        const resolved = ipfsToHttp(candidate);
        if (!cancelled && !isPlaceholder(resolved)) setSrc(resolved);
      } catch {
        /* swallow — fall through to "No Preview" */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, metadataUri]);

  if (!src || errored) {
    return (
      <div className={`flex items-center justify-center text-white/30 ${className ?? ''}`}>
        No Preview
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
    />
  );
}
