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
import { ChevronDown, Wallet, Chrome, Ghost } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { LiveWalletPreview } from '@/components/admin/LiveWalletPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type PreviewMode = 'wcc' | 'metamask' | 'phantom';

interface Props {
  value?: PreviewMode;
  onChange?: (mode: PreviewMode) => void;
}

export const WalletPreviewModeSelector: React.FC<Props> = ({ value, onChange }) => {
  const [internalMode, setInternalMode] = useState<PreviewMode>('wcc');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const { setSelectedWallet } = useWalletCustomizationStore();

  // Support controlled (value/onChange) or uncontrolled mode
  const previewMode = value ?? internalMode;

  const handleModeChange = (mode: PreviewMode) => {
    if (onChange) {
      onChange(mode);
    } else {
      setInternalMode(mode);
    }

    if (mode === 'phantom') {
      // Render local Phantom mockup — no CDP Bridge needed
      setSelectedWallet('phantom');
      setShowLivePreview(false);
    } else if (mode === 'wcc') {
      setSelectedWallet('phantom');
      setShowLivePreview(false);
    } else {
      // MetaMask → CDP Bridge
      setShowLivePreview(true);
    }
  };

  const getModeLabel = () => {
    switch (previewMode) {
      case 'wcc':     return 'WCC';
      case 'metamask': return 'MetaMask';
      case 'phantom': return 'Phantom';
    }
  };

  const getModeIcon = () => {
    if (previewMode === 'phantom') return <Ghost className="h-4 w-4 text-purple-400" />;
    if (previewMode === 'wcc')     return <Wallet className="h-4 w-4" />;
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
              <div className="text-xs text-muted-foreground">Local wallet preview (current)</div>
            </div>
          </DropdownMenuItem>

          {/* Phantom — local mockup from Overlay Editor */}
          <DropdownMenuItem
            onClick={() => handleModeChange('phantom')}
            className="cursor-pointer"
          >
            <Ghost className="h-4 w-4 mr-2 text-purple-400" />
            <div className="flex-1">
              <div className="font-medium text-purple-300">Phantom</div>
              <div className="text-xs text-muted-foreground">Phantom mockup preview</div>
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
              <div className="text-xs text-muted-foreground">Live MetaMask via Chrome</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* CDP Bridge dialog — only for MetaMask */}
      <Dialog open={showLivePreview} onOpenChange={setShowLivePreview}>
        <DialogContent className="max-w-[95vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Live MetaMask Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <LiveWalletPreview
              walletType="metamask"
              onClose={() => setShowLivePreview(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
