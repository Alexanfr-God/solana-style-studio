import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Wallet, Chrome } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { LiveWalletPreview } from '@/components/admin/LiveWalletPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PreviewMode = 'wcc' | 'metamask' | 'phantom';

export const WalletPreviewModeSelector = () => {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('wcc');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const { setSelectedWallet } = useWalletCustomizationStore();

  const handleModeChange = (mode: PreviewMode) => {
    setPreviewMode(mode);
    
    if (mode === 'wcc') {
      // Local WCC preview
      setSelectedWallet('phantom');
      setShowLivePreview(false);
    } else {
      // External wallet preview via CDP Bridge
      setShowLivePreview(true);
    }
  };

  const getModeLabel = () => {
    switch (previewMode) {
      case 'wcc':
        return 'WCC';
      case 'metamask':
        return 'MetaMask';
      case 'phantom':
        return 'Phantom';
    }
  };

  const getModeIcon = () => {
    if (previewMode === 'wcc') {
      return <Wallet className="h-4 w-4" />;
    }
    return <Chrome className="h-4 w-4" />;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {getModeIcon()}
            <span>{getModeLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Preview Mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleModeChange('wcc')}
            className="cursor-pointer"
          >
            <Wallet className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">WCC Local</div>
              <div className="text-xs text-muted-foreground">
                Local wallet preview (current)
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            External Wallets (CDP Bridge)
          </DropdownMenuLabel>
          
          <DropdownMenuItem
            onClick={() => handleModeChange('metamask')}
            className="cursor-pointer"
          >
            <Chrome className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">MetaMask</div>
              <div className="text-xs text-muted-foreground">
                Live MetaMask via Chrome
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => handleModeChange('phantom')}
            className="cursor-pointer"
          >
            <Chrome className="h-4 w-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">Phantom</div>
              <div className="text-xs text-muted-foreground">
                Live Phantom via Chrome
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Live Preview Dialog */}
      <Dialog open={showLivePreview} onOpenChange={setShowLivePreview}>
        <DialogContent className="max-w-[95vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Live {previewMode === 'metamask' ? 'MetaMask' : 'Phantom'} Preview
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <LiveWalletPreview
              walletType={previewMode as 'metamask' | 'phantom'}
              onClose={() => setShowLivePreview(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
