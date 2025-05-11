
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { captureElementAsImage, uploadToIpfs } from '@/utils/imageExport';

interface ExportToIpfsProps {
  targetRef: React.RefObject<HTMLElement>;
  onSuccess?: (ipfsUrl: string, imageUrl: string) => void;
}

const ExportToIpfsButton: React.FC<ExportToIpfsProps> = ({ targetRef, onSuccess }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const handleExport = async () => {
    if (!targetRef.current) {
      toast.error('Could not find wallet element to capture');
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Step 1: Capture the wallet as an image
      toast.info('Capturing wallet design...');
      const imageBlob = await captureElementAsImage(targetRef.current);
      
      // Step 2: Upload to IPFS via NFT.Storage
      toast.info('Uploading to IPFS...');
      
      // Set NFT.Storage API key for this session
      process.env.NFT_STORAGE_API_KEY = apiKey;
      
      const { ipfsUrl, imageUrl } = await uploadToIpfs(imageBlob);
      
      // Step 3: Show success message
      toast.success('Successfully uploaded to IPFS!');
      
      if (onSuccess) {
        onSuccess(ipfsUrl, imageUrl);
      }
      
      // Hide the API key input after successful upload
      setShowApiKeyInput(false);
      
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <>
      {showApiKeyInput ? (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            placeholder="Enter NFT.Storage API Key"
            className="px-3 py-2 border rounded-md bg-black/20 backdrop-blur-sm text-white border-white/20"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || !apiKey} 
              className="flex-1"
              variant="default"
            >
              {isExporting ? <Loader className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
              {isExporting ? 'Exporting...' : 'Upload with this key'}
            </Button>
            <Button 
              onClick={() => setShowApiKeyInput(false)}
              variant="outline"
              className="border-white/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowApiKeyInput(true)}
          disabled={isExporting}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          {isExporting ? <Loader className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
          Export to IPFS
        </Button>
      )}
    </>
  );
};

export default ExportToIpfsButton;
