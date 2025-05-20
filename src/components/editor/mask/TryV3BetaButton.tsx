
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { MaskInstructionsSection } from './mask-dialog/MaskInstructionsSection';
import { MaskUploadSection } from './mask-dialog/MaskUploadSection';
import { MaskExamplesSection } from './mask-dialog/MaskExamplesSection';
import { MaskPreviewSection } from './mask-dialog/MaskPreviewSection';

const TryV3BetaButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMask, setCustomMask] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const { setTopLayer, setBottomLayer, topLayer, bottomLayer } = useMaskEditorStore();

  const handleToggleJson = () => {
    setShowJson(!showJson);
  };

  const handleRemoveMask = () => {
    setCustomMask(null);
    setTopLayer(null);
    setBottomLayer(null);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-yellow-400 to-purple-500 hover:from-yellow-500 hover:to-purple-600 text-white shadow-lg flex items-center gap-2"
        size="sm"
      >
        <BadgeAlert className="h-4 w-4" />
        Try V3 BETA Mask
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl bg-black border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center gap-2">
              <BadgeAlert className="h-5 w-5 text-yellow-400" />
              <span className="bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
                Beta V3 Mode
              </span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              This is a preview version — while we are building the full AI-powered mask editor, 
              you can already try uploading your own masks and applying them to the wallet interface.
            </DialogDescription>
          </DialogHeader>
          
          <Separator className="bg-white/10" />
          
          <MaskInstructionsSection />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <div className="space-y-4">
              <MaskUploadSection 
                customMask={customMask} 
                setCustomMask={setCustomMask}
                handleRemoveMask={handleRemoveMask}
              />
              
              <MaskExamplesSection 
                setCustomMask={setCustomMask}
                setTopLayer={setTopLayer}
                setBottomLayer={setBottomLayer}
                handleRemoveMask={handleRemoveMask}
                showJson={showJson}
                handleToggleJson={handleToggleJson}
                customMask={customMask}
                topLayer={topLayer}
                bottomLayer={bottomLayer}
              />
            </div>
            
            <MaskPreviewSection 
              topLayer={topLayer}
              bottomLayer={bottomLayer}
              customMask={customMask}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TryV3BetaButton;
