import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scan, Loader2 } from 'lucide-react';
import { scanDomWithAI } from '@/services/aiDomScannerService';
import { toast } from 'sonner';

interface AiDomScannerButtonProps {
  screen?: string;
}

export const AiDomScannerButton: React.FC<AiDomScannerButtonProps> = ({ 
  screen = 'home' 
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      toast.info(`🔍 AI scanning ${screen} screen...`);

      const result = await scanDomWithAI(undefined, screen);

      if (result.success) {
        toast.success(
          `✅ Mapped ${result.totalMapped} of ${result.totalProcessed} elements`
        );
      } else {
        toast.error('❌ AI scan failed');
      }
    } catch (error) {
      console.error('AI scan error:', error);
      toast.error('❌ AI scan failed: ' + (error as Error).message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Button
      onClick={handleScan}
      disabled={isScanning}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isScanning ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Scanning...
        </>
      ) : (
        <>
          <Scan className="h-4 w-4" />
          AI Scan Elements
        </>
      )}
    </Button>
  );
};
