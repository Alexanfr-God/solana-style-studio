
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Wand2, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { customizeWalletWithAI } from '@/services/walletAiCustomizerService';

const CustomizeWalletButton = () => {
  const { 
    uploadedImage, 
    isCustomizing, 
    onCustomizationStartWithTimeout, 
    applyStyleFromAiCustomizer,
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
      // Улучшенные сообщения с индикацией времени
      toast.info("Analyzing image and generating wallet style...", {
        description: "This may take 2-4 minutes for best results",
        duration: 10000
      });
      
      // Показываем промежуточные сообщения
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
      
      // Call the wallet-ai-customizer edge function
      const result = await customizeWalletWithAI(
        uploadedImage,
        'phantom', // walletId
        'Analyze this image and create a custom Web3 wallet style' // customPrompt
      );

      if (result.success) {
        // Apply the generated style
        applyStyleFromAiCustomizer(result);
        
        console.log('✅ Wallet customization completed successfully');
        toast.success(`Wallet customized successfully! 🎨`, {
          description: `AI analysis completed in ${result.processingTime || 'under 5 minutes'}`
        });
      } else {
        // Обработка различных типов ошибок
        if (result.error === 'AI processing timeout') {
          toast.error('AI processing is taking longer than expected', {
            description: 'The design is complex and needs more time. Try a simpler image or try again later.',
            duration: 10000
          });
        } else {
          throw new Error(result.error || 'Customization failed');
        }
      }

    } catch (error) {
      console.error('💥 Customization error:', error);
      
      // Улучшенная обработка ошибок
      if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
        toast.error('AI processing timeout', {
          description: 'The AI is taking longer than expected. Your image might be too complex. Try again with a simpler image.',
          duration: 10000
        });
      } else if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
        toast.error('Connection issue', {
          description: 'Please check your internet connection and try again.',
          duration: 8000
        });
      } else {
        toast.error('Failed to customize wallet', {
          description: 'Please try again with a different image or try again later.',
          duration: 8000
        });
      }
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
