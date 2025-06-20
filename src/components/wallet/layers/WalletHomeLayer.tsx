
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeContent from '../content/HomeContent';

const WalletHomeLayer = () => {
  const { walletStyle, setCurrentLayer } = useWalletCustomizationStore();

  const handleLockWallet = () => {
    setCurrentLayer('login');
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <HomeContent />
      
      {/* LOCK Button - positioned at bottom left */}
      <div className="absolute bottom-4 left-4">
        <Button
          onClick={handleLockWallet}
          size="sm"
          className="bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm"
        >
          <Lock className="h-4 w-4 mr-1" />
          LOCK
        </Button>
      </div>
    </div>
  );
};

export default WalletHomeLayer;
