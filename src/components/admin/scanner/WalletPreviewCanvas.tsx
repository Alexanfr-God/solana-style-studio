import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import WalletContainer from '@/components/wallet/WalletContainer';
import { ElementHighlight } from './ElementHighlight';

export const WalletPreviewCanvas = () => {
  const { foundElements, currentScreen } = useAiScannerStore();
  
  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50">
        <h3 className="text-sm font-semibold">Local WalletContainer - {currentScreen}</h3>
        <div className="text-xs text-muted-foreground">
          {foundElements.length} elements found
        </div>
      </div>
      
      {/* WalletContainer Preview with Element Highlights */}
      <div className="flex-1 relative overflow-auto bg-muted/20 flex items-center justify-center p-8">
        <div className="relative" data-wallet-container>
          <WalletContainer />
          
          {/* Overlay element highlights */}
          {foundElements.map(element => (
            <ElementHighlight key={element.id} element={element} />
          ))}
        </div>
      </div>
    </div>
  );
};
