
import React from 'react';
import LayerSelector from './LayerSelector';
import UploadImage from './UploadImage';
import PromptInput from './PromptInput';
import GenerateButton from './GenerateButton';
import WalletPreview from './WalletPreview';
import ResetButton from './ResetButton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

const CustomizationStudio = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-solana-purple to-solana-blue bg-clip-text text-transparent pb-2">
          Solana Wallet Customization Studio
        </h1>
        <p className="text-muted-foreground">
          Customize your wallet interface with AI-powered style generation
        </p>
      </header>
      
      <div className="customization-studio">
        <div className="studio-sidebar">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <LayerSelector />
                
                <Separator />
                
                <div className="space-y-1">
                  <h3 className="text-sm font-medium mb-2">Reference Image</h3>
                  <UploadImage />
                </div>
                
                <Separator />
                
                <PromptInput />
                
                <div className="flex flex-col space-y-3">
                  <GenerateButton />
                  <ResetButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="preview-area">
          <WalletPreview />
        </div>
      </div>
    </div>
  );
};

export default CustomizationStudio;
