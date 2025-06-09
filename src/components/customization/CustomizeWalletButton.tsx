
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { customizeWalletWithAI } from '@/services/walletAiCustomizerService';

const CustomizeWalletButton = () => {
  const { 
    uploadedImage, 
    uploadedFile,
    isCustomizing, 
    onCustomizationStartWithTimeout, 
    applyStyleFromAiCustomizer,
    resetCustomizationState 
  } = useWalletCustomizationStore();

  const handleCustomize = async () => {
    if (!uploadedFile || !uploadedImage) {
      toast.error("Please upload a style inspiration image first!");
      return;
    }
    
    console.log('🎨 Starting wallet customization process...');
    onCustomizationStartWithTimeout();
    
    try {
      toast.info("Analyzing image and generating wallet style...");
      
      // Call the wallet-ai-customizer edge function
      const result = await customizeWalletWithAI(
        uploadedFile,
        'phantom', // walletId
        'Analyze this image and create a custom Web3 wallet style' // customPrompt
      );

      if (result.success) {
        // Apply the generated style
        applyStyleFromAiCustomizer(result);
        
        console.log('✅ Wallet customization completed successfully');
        toast.success(`Wallet customized successfully! 🎨`, {
          description: `AI analysis completed`
        });
      } else {
        throw new Error(result.error || 'Customization failed');
      }

    } catch (error) {
      console.error('💥 Customization error:', error);
      toast.error('Failed to customize wallet. Please try again.');
    } finally {
      // Always reset the customization state, regardless of success or failure
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
          Analyzing & Customizing...
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
