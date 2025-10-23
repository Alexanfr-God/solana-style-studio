import { NFTStorage, File } from 'npm:nft.storage@7.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MintRequest {
  imageData: string;      // base64 image data
  themeName: string;
  themeData: any;         // JSON темы
  description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, themeName, themeData, description }: MintRequest = await req.json();

    console.log('[upload-to-ipfs] Function invoked');
    console.log('[upload-to-ipfs] Theme name:', themeName);
    
    // Диагностика секрета
    const nftStorageKey = Deno.env.get('NFT_STORAGE_KEY');
    console.log('[upload-to-ipfs] NFT_STORAGE_KEY set:', !!nftStorageKey);
    
    // Диагностика payload
    console.log('[upload-to-ipfs] Request body keys:', Object.keys({ imageData, themeName, themeData, description }));
    console.log('[upload-to-ipfs] Image data size:', imageData?.length || 0, 'chars');
    console.log('[upload-to-ipfs] Theme data keys:', Object.keys(themeData || {}));
    
    if (!nftStorageKey) {
      console.error('❌ NFT_STORAGE_KEY not configured');
      throw new Error('NFT_STORAGE_KEY not configured');
    }

    console.log('📦 Starting IPFS upload for theme:', themeName);

    const client = new NFTStorage({ token: nftStorageKey });

    // 1. Конвертируем base64 в blob (изображение)
    const base64Data = imageData.includes('base64,') 
      ? imageData.split('base64,')[1] 
      : imageData;
    
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const imageFile = new File([imageBuffer], 'wallet-theme.png', { type: 'image/png' });

    // 2. Загружаем JSON темы отдельно
    console.log('📤 Uploading theme JSON to IPFS...');
    const themeJsonString = JSON.stringify(themeData, null, 2);
    const themeJsonFile = new File([themeJsonString], 'theme.json', { type: 'application/json' });
    const themeCid = await client.storeBlob(themeJsonFile);
    
    // 3. Вычисляем SHA256 хеш темы
    const themeBuffer = new TextEncoder().encode(themeJsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', themeBuffer);
    const themeSha256 = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('📤 Uploading image and metadata to IPFS...');

    // 4. Загружаем изображение и создаём полную metadata
    const metadata = await client.store({
      name: `WCC: ${themeName}`,
      description: description || `Custom wallet theme created with Wallet Coast Customs`,
      image: imageFile,
      wcc_theme_uri: `ipfs://${themeCid}`,
      wcc_theme_sha256: themeSha256,
      schemaVersion: 'wcc-theme-v1',
      attributes: [
        { trait_type: 'Theme ID', value: themeName },
        { trait_type: 'Created At', value: new Date().toISOString() },
        { trait_type: 'Schema Version', value: 'wcc-theme-v1' }
      ],
      properties: {
        creator: 'Wallet Coast Customs',
        category: 'wallet-theme',
        createdAt: new Date().toISOString(),
        files: [
          { uri: metadata.data.image, type: 'image/png' },
          { uri: `ipfs://${themeCid}`, type: 'application/json' }
        ]
      }
    });

    // 5. Формируем ответ с обеими версиями ссылок
    const imageCid = metadata.data.image.replace('ipfs://', '');
    const metadataCid = metadata.url.replace('ipfs://', '');

    console.log('✅ Upload successful!');
    console.log('📍 Metadata CID:', metadataCid);
    console.log('🖼️ Image CID:', imageCid);
    console.log('📄 Theme CID:', themeCid);
    console.log('🔐 Theme SHA256:', themeSha256);

    return new Response(
      JSON.stringify({
        success: true,
        metadataUri: `ipfs://${metadataCid}`,
        metadataUrl: `https://nftstorage.link/ipfs/${metadataCid}`,
        imageUri: `ipfs://${imageCid}`,
        imageUrl: `https://nftstorage.link/ipfs/${imageCid}`,
        themeCid: themeCid,
        themeUrl: `https://nftstorage.link/ipfs/${themeCid}`,
        themeSha256: themeSha256,
        schemaVersion: 'wcc-theme-v1'
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
