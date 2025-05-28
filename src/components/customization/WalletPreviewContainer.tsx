
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Smartphone, Wallet } from 'lucide-react';

const WalletPreviewContainer = () => {
  const { walletStyle, selectedWallet, setSelectedWallet, isCustomizing } = useWalletCustomizationStore();

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full">
      <CardContent className="p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Wallet Preview</h3>
          
          {/* Wallet Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedWallet === 'phantom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('phantom')}
              className="text-xs"
            >
              Phantom
            </Button>
            <Button
              variant={selectedWallet === 'metamask' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('metamask')}
              className="text-xs"
              disabled
            >
              MetaMask
            </Button>
            <Button
              variant={selectedWallet === 'solflare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('solflare')}
              className="text-xs"
              disabled
            >
              Solflare
            </Button>
          </div>
        </div>
        
        {/* Preview Container */}
        <div className="flex items-center justify-center h-[500px]">
          <div 
            className={`
              relative w-[300px] h-[400px] rounded-2xl border-2 border-white/20 
              flex flex-col items-center justify-center gap-4 transition-all duration-1000
              ${isCustomizing ? 'scale-105 animate-pulse' : 'scale-100'}
            `}
            style={{ 
              backgroundColor: walletStyle.backgroundColor,
              backgroundImage: walletStyle.image ? `url(${walletStyle.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Wallet UI Placeholder */}
            <div className="absolute inset-4 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-white" />
                  <span className="text-white font-semibold text-sm capitalize">
                    {selectedWallet}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20" />
              </div>
              
              {/* Balance */}
              <div className="text-center mb-8">
                <div className="text-white/70 text-xs mb-1">Total Balance</div>
                <div className="text-white text-2xl font-bold">$2,847.32</div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">↑</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">↓</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-sm">↔</span>
                </div>
              </div>
              
              {/* Assets */}
              <div className="flex-1">
                <div className="text-white/70 text-xs mb-3">Assets</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500" />
                      <span className="text-white text-xs">SOL</span>
                    </div>
                    <span className="text-white text-xs">12.45</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/10 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500" />
                      <span className="text-white text-xs">USDC</span>
                    </div>
                    <span className="text-white text-xs">1,432.10</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Label */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
              Live Preview
            </div>
            
            {/* Customization Indicator */}
            {isCustomizing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded animate-bounce">
                Applying Style...
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Upload an image and click "Customize Wallet" to see the magic! ✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
