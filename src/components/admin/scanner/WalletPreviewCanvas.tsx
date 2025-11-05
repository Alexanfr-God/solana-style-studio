import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { ElementHighlight } from './ElementHighlight';
import { cn } from '@/lib/utils';

export const WalletPreviewCanvas = () => {
  const { walletType, setWalletType, foundElements, currentScreen } = useAiScannerStore();
  
  const walletTypes: Array<'WCC' | 'MetaMask' | 'Phantom'> = ['WCC', 'MetaMask', 'Phantom'];
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Wallet selector */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50">
        <h3 className="text-sm font-semibold">Preview - {currentScreen}</h3>
        <div className="flex gap-2">
          {walletTypes.map(type => (
            <Badge
              key={type}
              variant={walletType === type ? 'default' : 'outline'}
              className={cn(
                "cursor-pointer transition-all",
                walletType === type && "shadow-sm"
              )}
              onClick={() => setWalletType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Wallet Preview iframe */}
      <div className="flex-1 relative overflow-hidden bg-muted/20">
        <iframe
          src="/?enableThemeProbe=1"
          className="w-full h-full rounded-lg border-0"
          title="Wallet Preview"
        />
        
        {/* Element highlights overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {foundElements.map(el => (
            <ElementHighlight key={el.id} element={el} />
          ))}
        </div>
      </div>
    </div>
  );
};
