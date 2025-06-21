
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { PlaygroundLoginScreen, PlaygroundWalletScreen } from '@/components/wallet/WalletScreens';

const WalletPreviewContainer = () => {
  const { activeLayer } = useWalletCustomizationStore();

  console.log('🔍 WalletPreviewContainer - Active layer:', activeLayer);

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-center py-4">
          <div className="max-w-[320px] w-full">
            {activeLayer === 'login' ? (
              <PlaygroundLoginScreen />
            ) : (
              <PlaygroundWalletScreen />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
