
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, BadgeAlert } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';

const TryV3BetaButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMask, setCustomMask] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { loginStyle } = useCustomizationStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // Check if the file is a PNG
    if (file.type !== 'image/png') {
      toast.error('Please upload a PNG image with transparency');
      return;
    }
    
    setIsUploading(true);
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setCustomMask(e.target.result);
        setIsUploading(false);
        toast.success('Mask uploaded successfully');
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read the file');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveMask = () => {
    setCustomMask(null);
    toast.info('Mask removed');
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
        <DialogContent className="max-w-4xl bg-black border border-white/10">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 p-4 bg-black/30">
                <h3 className="text-white font-medium mb-3">Upload your custom mask</h3>
                <p className="text-sm text-white/60 mb-4">
                  Upload a PNG with transparent center. This is a demo of how Wallet Coast masks will work.
                </p>
                
                <div className="flex flex-col space-y-4">
                  {customMask ? (
                    <div className="relative">
                      <img 
                        src={customMask} 
                        alt="Custom mask" 
                        className="w-full h-auto object-contain bg-white/5 rounded-lg p-2"
                      />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute top-2 right-2" 
                        onClick={handleRemoveMask}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 bg-black/20">
                      <Upload className="h-10 w-10 text-white/40 mb-3" />
                      <p className="text-white/60 text-center mb-4">Drag & drop a PNG or click to browse</p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('mask-upload')?.click()}
                        disabled={isUploading}
                        className="bg-white/5 border-white/10 text-white"
                      >
                        {isUploading ? 'Uploading...' : 'Upload PNG Mask'}
                      </Button>
                      <input
                        id="mask-upload"
                        type="file"
                        accept="image/png"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="rounded-lg border border-white/10 p-4 bg-black/30 flex flex-col space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-white/40 text-xs">MASK PREVIEW TIPS</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>
                
                <ul className="text-sm text-white/60 space-y-2 list-disc pl-5">
                  <li>Use PNG with transparent center where the wallet UI will be visible</li>
                  <li>Design your mask with a size of at least 500x500px</li>
                  <li>Keep important elements away from the center (wallet area)</li>
                  <li>Light colors work best on the dark wallet background</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                {/* Base wallet UI */}
                <div className="w-[320px]">
                  <LoginScreen style={loginStyle} />
                </div>
                
                {/* Mask overlay */}
                {customMask && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <img 
                      src={customMask} 
                      alt="Mask overlay" 
                      className="max-width-150% max-height-150%"
                      style={{
                        position: 'absolute',
                        width: '150%', // Make it larger than the wallet to show framing
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-xs text-white/40 text-center mb-2">This is a preview of how your mask will appear</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TryV3BetaButton;
