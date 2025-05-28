
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CustomizeWalletButton = () => {
  const { uploadedImage, customizeWallet, isCustomizing, onCustomizationStart } = useWalletCustomizationStore();

  const handleCustomize = () => {
    if (!uploadedImage) {
      toast.error("Please upload a style inspiration image first!");
      return;
    }
    
    onCustomizationStart();
    customizeWallet();
    toast.success("Applying style to your wallet! 🎨");
  };

  return (
    <Button 
      onClick={handleCustomize}
      disabled={isCustomizing}
      className={`
        w-full h-12 text-lg font-semibold transition-all duration-300
        ${uploadedImage 
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' 
          : 'bg-gray-600 text-gray-300 cursor-not-allowed'
        }
        ${isCustomizing ? 'animate-pulse' : ''}
      `}
    >
      {isCustomizing ? (
        <>
          <Sparkles className="h-5 w-5 mr-2 animate-spin" />
          Customizing...
        </>
      ) : (
        <>
          <Wand2 className="h-5 w-5 mr-2" />
          Customize Wallet
        </>
      )}
    </Button>
  );
};

export default CustomizeWalletButton;
