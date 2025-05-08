
import React from 'react';
import LayerSelector from './LayerSelector';
import UploadImage from './UploadImage';
import PromptInput from './PromptInput';
import GenerateButton from './GenerateButton';
import ResetButton from './ResetButton';
import DualWalletPreview from '../wallet/DualWalletPreview';
import EditorHeader from './EditorHeader';
import WalletRider from './WalletRider';
import EditorTabs from './EditorTabs';
import StyleNotesDisplay from '../wallet/StyleNotesDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const V1Customizer = () => {
  return (
    <div className="min-h-screen bg-black bg-[url('/stars-bg.png')] bg-repeat p-4 md:p-6 overflow-hidden">
      <div className="max-w-screen-xl mx-auto">
        <EditorHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="flex flex-col space-y-8">
              <WalletRider />
              
              <EditorTabs />
              
              <Card className="bg-black/30 backdrop-blur-md border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-white">Create Your Base Style</h2>
                  
                  <div className="space-y-6">
                    <LayerSelector />
                    
                    <Separator className="bg-white/10" />
                    
                    <div>
                      <h3 className="text-sm font-medium mb-4 text-white">Upload your own image to generate a custom theme</h3>
                      <UploadImage />
                    </div>
                    
                    <Separator className="bg-white/10" />
                    
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-white flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.5 8.5L18.5 11M10 4L8 6H5C4.44772 6 4 6.44772 4 7V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V9C20 8.44772 19.5523 8 19 8H12L10 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        AI Style Generator
                      </h3>
                      <PromptInput />
                      <StyleNotesDisplay />
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <GenerateButton />
                      <ResetButton />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full bg-black/30 backdrop-blur-md border-white/10 p-4">
              <div className="h-full flex items-center justify-center">
                <DualWalletPreview />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default V1Customizer;
