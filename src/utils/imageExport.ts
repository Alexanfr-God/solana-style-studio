
import html2canvas from 'html2canvas';
import { NFTStorage } from 'nft.storage';

// Capture a DOM element as an image and return a blob
export const captureElementAsImage = async (element: HTMLElement): Promise<Blob> => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      useCORS: true,
      scale: 2, // Higher quality
      logging: false,
    });
    
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to Blob"));
        }
      }, 'image/png', 0.95);
    });
  } catch (error) {
    console.error('Error capturing element:', error);
    throw error;
  }
};

// Upload a blob to IPFS using NFT.Storage
export const uploadToIpfs = async (
  imageBlob: Blob, 
  name: string = "Wallet Skin", 
  description: string = "Custom Solana Wallet Design by Wallet Coast Customs"
): Promise<{ipfsUrl: string, imageUrl: string}> => {
  try {
    // NFT.Storage API key should be provided as environment variable or via UI
    const apiKey = process.env.NFT_STORAGE_API_KEY;
    
    if (!apiKey) {
      throw new Error("NFT.Storage API key is not available");
    }
    
    const client = new NFTStorage({ token: apiKey });
    
    // Create a File object from Blob with metadata
    const imageFile = new File([imageBlob], 'wallet-skin.png', { type: 'image/png' });
    
    // Store the file on IPFS
    const metadata = await client.store({
      name,
      description,
      image: imageFile,
    });
    
    // Return both the IPFS URL to the metadata and the direct image URL
    return {
      ipfsUrl: metadata.url,
      imageUrl: metadata.data.image.href
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
