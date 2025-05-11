
import html2canvas from 'html2canvas';

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

// Upload a blob to IPFS using Pinata
export const uploadToIpfs = async (
  imageBlob: Blob,
  pinataJWT: string,
  name: string = "Wallet Skin",
  description: string = "Custom Solana Wallet Design by Wallet Coast Customs"
): Promise<{ipfsUrl: string, imageUrl: string}> => {
  try {
    if (!pinataJWT) {
      throw new Error("Pinata JWT token is not available");
    }
    
    // Create a FormData object and append the image blob
    const formData = new FormData();
    const file = new File([imageBlob], 'wallet-skin.png', { type: 'image/png' });
    formData.append('file', file);
    
    // Add metadata for Pinata
    const metadata = JSON.stringify({
      name,
      keyvalues: {
        description,
        createdAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Add options for Pinata (optional)
    const options = JSON.stringify({
      cidVersion: 1
    });
    formData.append('pinataOptions', options);
    
    // Upload to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Pinata API error:', errorData);
      throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Return both the IPFS gateway URL and the raw IPFS URL
    const hash = result.IpfsHash;
    return {
      ipfsUrl: `ipfs://${hash}`,
      imageUrl: `https://gateway.pinata.cloud/ipfs/${hash}`
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
