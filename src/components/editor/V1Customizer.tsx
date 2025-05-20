import React, { useState } from 'react';
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
import { useCustomizationStore } from '@/stores/customizationStore';
import MaskEditor from './mask/MaskEditor';
import V3Beta from './V3Beta';

const V1Customizer = () => {
  const [activeTab, setActiveTab] = useState<'style-editor' | 'mask-editor' | 'rider'>('style-editor');
  const { editorMode } = useCustomizationStore();

  const renderEditorContent = () => {
    switch (activeTab) {
      case 'mask-editor':
        return <MaskEditor />;
      case 'rider':
        return <WalletRider />;
      case 'style-editor':
      default:
        return (
          <Card className="bg-black/30 backdrop-blur-md border-white/10 p-4">
            <CardContent className="p-0">
              <div className="w-full">
                {/* V3 Beta Section at the top */}
                <div className="mb-6">
                  <V3Beta />
                </div>
                
                <Separator className="my-6 bg-white/10" />

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Main customization form */}
                  <div className="flex-1">
                    <div className="flex flex-col space-y-6 md:space-y-8">
                      <Card className="bg-black/30 backdrop-blur-md border-white/10">
                        <CardContent className="p-4 md:p-6">
                          <h2 className="text-xl font-bold mb-4 text-white">Create Your Base Style</h2>
                          
                          <div className="space-y-6">
                            <LayerSelector />
                            
                            <Separator orientation="horizontal" />
                            
                            <div>
                              <h3 className="text-sm font-medium mb-4 text-white">Upload your own image to generate a custom theme</h3>
                              <UploadImage />
                            </div>
                            
                            <Separator orientation="horizontal" />
                            
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

                  {/* Preview */}
                  <div className="flex-1">
                    <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
                      <div className="flex items-center justify-center py-4">
                        <DualWalletPreview />
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  // Show dual wallet preview when in normal mode with viewport width >= 1280px
  const showDualPreview = 
    typeof window !== 'undefined' && 
    window.innerWidth >= 1280;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      {/* Editor Header */}
      <EditorHeader />
      
      {/* Editor Tabs - fixed prop passing */}
      <div className="mb-6">
        <EditorTabs />
      </div>
      
      <div className="mt-6">
        {/* Main Editor Content */}
        {renderEditorContent()}
      </div>
    </div>
  );
};

// Original V1 Editor component
const CreateStyleEditor = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-1">
        <div className="flex flex-col space-y-6 md:space-y-8">
          <Card className="bg-black/30 backdrop-blur-md border-white/10">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Create Your Base Style</h2>
              
              <div className="space-y-6">
                <LayerSelector />
                
                <Separator orientation="horizontal" />
                
                <div>
                  <h3 className="text-sm font-medium mb-4 text-white">Upload your own image to generate a custom theme</h3>
                  <UploadImage />
                </div>
                
                <Separator orientation="horizontal" />
                
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
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-center py-4">
            <DualWalletPreview />
          </div>
        </Card>
      </div>
    </div>
  );
};

// Placeholder for Fine-Tune Editor
const FineTuneEditor = () => {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="text-center">
        <h3 className="text-xl font-medium text-white/70 mb-2">Coming Soon</h3>
        <p className="text-white/50">The fine-tune editor is under development.</p>
      </div>
    </div>
  );
};

export default V1Customizer;
