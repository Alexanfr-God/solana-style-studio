import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import WalletContainer from '@/components/wallet/WalletContainer';
import { ElementHighlight } from './ElementHighlight';
import { BridgeSnapshotCanvas } from './BridgeSnapshotCanvas';
import { useBridgeSnapshot, BridgeElement } from '@/hooks/useBridgeSnapshot';
import { Loader2 } from 'lucide-react';

export const WalletPreviewCanvas = () => {
  const { foundElements, currentScreen, scanSource, setCurrentElement, addElement } = useAiScannerStore();
  const { snapshot: bridgeSnapshot, loading: bridgeLoading } = useBridgeSnapshot();

  // Handle element click from bridge canvas
  const handleBridgeElementClick = (element: BridgeElement) => {
    // Map bridge element to store format
    const mappedElement = {
      id: element.selector || element.id,
      role: `${element.tag}.${element.selector?.split('.')[1] || 'element'}`,
      type: mapTagToType(element.tag),
      status: 'found' as const,
      style: element.styles ? {
        bg: element.styles.backgroundColor,
        text: element.styles.color,
        border: element.styles.borderColor,
        radius: element.styles.borderRadius,
      } : {},
      metrics: {
        width: element.rect.width,
        height: element.rect.height,
      },
    };

    // Add to found elements if not exists
    const exists = foundElements.some(el => el.id === mappedElement.id);
    if (!exists) {
      addElement(mappedElement);
    }
    
    setCurrentElement(mappedElement);
  };

  // Map HTML tag to element type
  const mapTagToType = (tag: string): 'button' | 'input' | 'icon' | 'background' => {
    const tagLower = tag.toLowerCase();
    if (tagLower === 'button' || tagLower === 'a') return 'button';
    if (tagLower === 'input' || tagLower === 'textarea') return 'input';
    if (tagLower === 'svg' || tagLower === 'img') return 'icon';
    return 'background';
  };

  // Bridge Mode
  if (scanSource === 'extension-bridge') {
    if (bridgeLoading && !bridgeSnapshot) {
      return (
        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-background/50">
            <h3 className="text-sm font-semibold">Bridge Mode - Waiting for snapshot...</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Polling for extension snapshots...</p>
              <p className="text-xs mt-1">Click "Send UI Snapshot" in your extension</p>
            </div>
          </div>
        </div>
      );
    }

    if (!bridgeSnapshot) {
      return (
        <div className="relative h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-background/50">
            <h3 className="text-sm font-semibold">Bridge Mode - No snapshot</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No extension snapshots found</p>
              <p className="text-xs mt-1">Open your extension and click "Send UI Snapshot"</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <BridgeSnapshotCanvas
        snapshot={bridgeSnapshot}
        onElementClick={handleBridgeElementClick}
        selectedElementId={foundElements.find(el => el.id)?.id}
      />
    );
  }

  // Local Mode (default)
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
