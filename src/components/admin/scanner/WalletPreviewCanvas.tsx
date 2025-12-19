import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import WalletContainer from '@/components/wallet/WalletContainer';
import { ElementHighlight } from './ElementHighlight';
import { BridgeSnapshotCanvas } from './BridgeSnapshotCanvas';
import { useBridgeSnapshot, BridgeElement } from '@/hooks/useBridgeSnapshot';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export const WalletPreviewCanvas = () => {
  const { foundElements, currentScreen, scanSource, setCurrentElement, addElement } = useAiScannerStore();
  const { 
    snapshot: bridgeSnapshot, 
    loading: bridgeLoading, 
    error: bridgeError,
    refresh,
    availableExtensions,
    selectedExtension,
    setSelectedExtension,
    onlyRealSnapshots,
    setOnlyRealSnapshots,
    clearTestData,
  } = useBridgeSnapshot();

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

  // Handle clear test data
  const handleClearTestData = async () => {
    try {
      const count = await clearTestData();
      toast.success(`Deleted ${count} test snapshots`);
    } catch (err) {
      toast.error('Failed to clear test data');
    }
  };

  // Bridge Mode
  if (scanSource === 'extension-bridge') {
    // Filter extensions based on onlyRealSnapshots
    const filteredExtensions = onlyRealSnapshots 
      ? availableExtensions.filter(ext => ext.isReal)
      : availableExtensions;

    // Extension selector header
    const ExtensionHeader = () => (
      <div className="flex items-center justify-between p-3 border-b bg-background/50 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Snapshot:</span>
          <Select 
            value={selectedExtension || ''} 
            onValueChange={(val) => setSelectedExtension(val || null)}
          >
            <SelectTrigger className="h-7 text-xs min-w-[140px] max-w-[200px]">
              <SelectValue placeholder="Select snapshot..." />
            </SelectTrigger>
            <SelectContent>
              {filteredExtensions.map(ext => (
                <SelectItem key={ext.id} value={ext.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ext.label}</span>
                    {ext.source === 'playwright' && (
                      <Badge variant="outline" className="text-[9px] border-cyan-500/50 text-cyan-500 py-0 px-1">
                        Playwright
                      </Badge>
                    )}
                    {ext.hasScreenshot && (
                      <Badge variant="outline" className="text-[9px] border-green-500/50 text-green-500 py-0 px-1">
                        📷
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-[10px]">
                      {ext.elementsWithRect} els
                    </span>
                  </div>
                </SelectItem>
              ))}
              {filteredExtensions.length === 0 && (
                <SelectItem value="" disabled className="text-xs">
                  {onlyRealSnapshots ? 'No real snapshots found' : 'No extensions found'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Clear Test Data Button */}
          {!onlyRealSnapshots && availableExtensions.some(e => !e.isReal) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-amber-500 hover:text-amber-600"
              onClick={handleClearTestData}
              title="Clear all test snapshots"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Test
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => refresh()}
            disabled={bridgeLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${bridgeLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    );

    // Get current element from store for selection highlight
    const currentElementId = foundElements.find(el => el.status === 'found')?.id;
    
    return (
      <div className="relative h-full flex flex-col">
        <ExtensionHeader />
        <div className="flex-1 overflow-hidden">
          <BridgeSnapshotCanvas
            snapshot={bridgeSnapshot}
            onElementClick={handleBridgeElementClick}
            selectedElementId={currentElementId}
            onlyRealSnapshots={onlyRealSnapshots}
            onOnlyRealSnapshotsChange={setOnlyRealSnapshots}
            loading={bridgeLoading}
            error={bridgeError}
          />
        </div>
      </div>
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
