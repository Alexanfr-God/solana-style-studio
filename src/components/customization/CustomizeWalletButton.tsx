
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Wand2, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

const CustomizeWalletButton = () => {
  const { 
    uploadedImage, 
    isCustomizing, 
    onCustomizationStartWithTimeout, 
    resetCustomizationState 
  } = useWalletCustomizationStore();

  const handleCustomize = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a style inspiration image first!");
      return;
    }
    
    console.log('🎨 Starting wallet customization process...');
    onCustomizationStartWithTimeout();
    
    try {
      toast.info("Analyzing image and generating wallet style...", {
        description: "This may take 2-4 minutes for best results",
        duration: 10000
      });
      
      // Simulate customization process
      setTimeout(() => {
        if (useWalletCustomizationStore.getState().isCustomizing) {
          toast.info("AI is processing your design...", {
            description: "Creating custom color palette and layout",
            duration: 8000
          });
        }
      }, 30000);
      
      setTimeout(() => {
        if (useWalletCustomizationStore.getState().isCustomizing) {
          toast.info("Finalizing wallet customization...", {
            description: "Almost ready! Applying finishing touches",
            duration: 8000
          });
        }
      }, 90000);
      
      // Mock customization result
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('✅ Wallet customization completed successfully');
      toast.success(`Wallet customized successfully! 🎨`, {
        description: `AI analysis completed`
      });

    } catch (error) {
      console.error('💥 Customization error:', error);
      toast.error('Failed to customize wallet', {
        description: 'Please try again with a different image or try again later.',
        duration: 8000
      });
    } finally {
      console.log('🔄 Resetting customization state in finally block');
      resetCustomizationState();
    }
  };

  return (
    <Button 
      onClick={handleCustomize}
      disabled={isCustomizing || !uploadedImage}
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
          <div className="flex flex-col items-start">
            <span>Analyzing & Customizing...</span>
            <span className="text-xs opacity-75 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              This may take 2-4 minutes
            </span>
          </div>
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
