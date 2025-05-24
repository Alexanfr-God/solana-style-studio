
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import DualWalletPreview from '@/components/wallet/DualWalletPreview';
import MaskPromptInput from './MaskPromptInput';
import MaskStyleSelector from './MaskStyleSelector';
import GenerateMaskButton from './GenerateMaskButton';

const V3MaskEditor = () => {
  const { 
    resetEditor, 
    externalMask,
    prompt
  } = useMaskEditorStore();

  const handleReset = () => {
    resetEditor();
    toast.success("Editor reset");
  };

  const hasActiveMask = !!externalMask;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-1">
        <Card className="bg-black/30 backdrop-blur-md border-white/10">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Wallet Costume Creator</h2>
              <div className="bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-xs px-2 py-1 rounded">
                AI-Powered
              </div>
            </div>
            
            <div className="space-y-6">
              <MaskPromptInput />
              
              <MaskStyleSelector />
              
              <div className="space-y-3">
                <GenerateMaskButton />
                
                {(hasActiveMask || prompt) && (
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    className="w-full border-white/10 text-white/80 hover:text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear & Reset
                  </Button>
                )}
              </div>
              
              {hasActiveMask && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md">
                  <p className="text-xs text-green-300">
                    ✓ Costume active! Your custom design is applied to the wallet preview →
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="bg-black/30 backdrop-blur-md border-white/10 p-2 md:p-4">
          <div className="flex items-center justify-between py-2 px-4">
            <h3 className="text-sm font-medium text-white">Live Wallet Preview</h3>
            <div className="text-xs text-white/50">
              {hasActiveMask ? "Custom costume active" : "Ready for costume generation"}
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <DualWalletPreview />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default V3MaskEditor;
