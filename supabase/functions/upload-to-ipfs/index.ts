import { NFTStorage, File } from 'npm:nft.storage@7.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MintRequest {
  imageData: string;      // base64 image data
  themeName: string;
  description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, themeName, description }: MintRequest = await req.json();

    console.log('📦 Starting IPFS upload for theme:', themeName);

    // Получаем NFT.Storage API key из секретов
    const nftStorageKey = Deno.env.get('NFT_STORAGE_KEY');
    if (!nftStorageKey) {
      throw new Error('NFT_STORAGE_KEY not configured');
    }

    const client = new NFTStorage({ token: nftStorageKey });

    // Конвертируем base64 в blob
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageFile = new File([imageBuffer], 'wallet-theme.png', { type: 'image/png' });

    console.log('📤 Uploading image to IPFS...');

    // Загружаем через NFT.Storage (автоматически создает metadata)
    const metadata = await client.store({
      name: `WCC: ${themeName}`,
      description: description || `Custom wallet theme created with Wallet Coast Customs`,
      image: imageFile,
      properties: {
        creator: 'Wallet Coast Customs',
        category: 'wallet-theme',
        createdAt: new Date().toISOString(),
      }
    });

    const metadataUri = metadata.url.replace('ipfs://', 'https://nftstorage.link/ipfs/');
    const imageUri = metadata.data.image.replace('ipfs://', 'https://nftstorage.link/ipfs/');

    console.log('✅ Upload successful!');
    console.log('📍 Metadata URI:', metadataUri);
    console.log('🖼️ Image URI:', imageUri);

    return new Response(
      JSON.stringify({
        success: true,
        metadataUri,
        imageUri,
        ipfsHash: metadata.ipnft,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to upload to IPFS',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
