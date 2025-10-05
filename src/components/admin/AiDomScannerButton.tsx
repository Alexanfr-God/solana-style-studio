import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scan, Loader2 } from 'lucide-react';
import { scanDomWithAI } from '@/services/aiDomScannerService';
import { toast } from 'sonner';

interface AiDomScannerButtonProps {
  screen?: string;
}

// Все доступные экраны для сканирования
const ALL_SCREENS = ['login', 'home', 'lockLayer', 'send', 'receive', 'buy', 'apps'];

export const AiDomScannerButton: React.FC<AiDomScannerButtonProps> = ({ 
  screen 
}) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      
      // Если screen не указан - сканируем все экраны
      const screensToScan = screen ? [screen] : ALL_SCREENS;
      
      toast.info(`🔍 AI scanning ${screensToScan.length} screen(s)...`);

      let totalMapped = 0;
      let totalProcessed = 0;

      for (const currentScreen of screensToScan) {
        console.log(`[AiDomScanner] 📊 Scanning screen: ${currentScreen}`);
        
        const result = await scanDomWithAI(undefined, currentScreen);

        if (result.success) {
          const mapped = result.totalMapped || 0;
          const total = result.totalProcessed || 0;
          totalMapped += mapped;
          totalProcessed += total;
          console.log(`[AiDomScanner] ✅ ${currentScreen}: mapped ${mapped} of ${total} elements`);
        }
      }

      toast.success(
        `✅ Total: ${totalProcessed} elements, Mapped: ${totalMapped} across ${screensToScan.length} screen(s)`
      );
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
