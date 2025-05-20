
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, BadgeAlert, ExternalLink, Trash2, Cat, CreditCard, Flame } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { LoginScreen } from '@/components/wallet/WalletScreens';
import { useCustomizationStore } from '@/stores/customizationStore';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useMaskEditorStore } from '@/stores/maskEditorStore';

const TryV3BetaButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMask, setCustomMask] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { loginStyle } = useCustomizationStore();
  const { setTopLayer, setBottomLayer, topLayer, bottomLayer } = useMaskEditorStore();

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
        
        // Clear any layers when uploading a custom mask
        setTopLayer(null);
        setBottomLayer(null);
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
    setTopLayer(null);
    setBottomLayer(null);
    toast.info('Mask removed');
  };

  const handleTryExampleMask = () => {
    // Use a sample Pepe-style mask image
    setCustomMask('/lovable-uploads/f2da1dab-e2e7-4a42-bcb5-8a24a140d4fc.png');
    setTopLayer(null);
    setBottomLayer(null);
    toast.success('Example mask applied');
  };

  const handleToggleJson = () => {
    setShowJson(!showJson);
  };

  const applyMaskLayers = (maskType: 'cats' | 'crypto' | 'pepe') => {
    // Clear any custom mask
    setCustomMask(null);
    
    // Set top and bottom layers based on the selected mask type
    switch (maskType) {
      case 'cats':
        // Updated paths to the new cat mask assets
        setTopLayer('/lovable-uploads/9388ce6f-be1d-42c8-b4d3-8d38453996a9.png');
        setBottomLayer('/lovable-uploads/8c936683-1e0b-407a-a7a4-425b5b6cb4b8.png');
        toast.success('Cute Cats mask applied');
        break;
      case 'crypto':
        setTopLayer('/lovable-uploads/a8a0aa8b-cabe-4031-b6c4-c3fd3c4007cd.png');
        setBottomLayer('/lovable-uploads/58a93618-7faf-4812-9de1-fec30544610f.png');
        toast.success('Crypto Meme mask applied');
        break;
      case 'pepe':
        setTopLayer('/lovable-uploads/d4fc8532-6040-450a-a8cf-d1d459c42e46.png');
        setBottomLayer('/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png');
        toast.success('Pepe Hacker mask applied');
        break;
    }
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
          
          {/* How it works instructions */}
          <div className="bg-black/40 rounded-lg border border-white/10 p-4">
            <h3 className="text-white font-medium mb-3">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-2xl mb-2">🎨</span>
                <p className="text-sm font-medium">1. Generate your custom mask with AI</p>
                <a 
                  href="https://chatgpt.com/g/g-682a38c975b881918621ac1517cf68db-wallet-coast-customs-v3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 text-xs flex items-center justify-center gap-1 text-purple-400 hover:text-purple-300"
                >
                  Open Mask Generator <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-2xl mb-2">⬆️</span>
                <p className="text-sm font-medium">2. Upload the PNG file you created</p>
                <span className="mt-2 text-xs text-white/40">Use PNG with transparency</span>
              </div>
              
              <div className="flex flex-col items-center text-center p-2 rounded-lg bg-black/20 border border-white/5">
                <span className="text-2xl mb-2">✨</span>
                <p className="text-sm font-medium">3. Apply it to the wallet interface</p>
                <span className="mt-2 text-xs text-white/40">See your design come to life</span>
              </div>
            </div>
          </div>
          
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
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    onClick={handleTryExampleMask}
                    className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white"
                  >
                    Try Example Mask
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleRemoveMask}
                    className="border-white/10 text-white flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Mask
                  </Button>
                </div>
                
                <Separator className="my-4 bg-white/10" />
                
                {/* Example Masks (V3 Beta) Section */}
                <div className="rounded-lg border border-white/10 p-4 bg-black/30 mt-4">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    🎨 Try Example Mask
                  </h3>
                  <p className="text-sm text-white/60 mb-4">
                    This is a demo of how custom Wallet Masks will work. Only the top and bottom are used — the center stays visible for the login UI. Try it now!
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
                      onClick={() => applyMaskLayers('cats')}
                    >
                      <Cat className="h-8 w-8 mb-2 text-purple-300" />
                      <span className="text-xs text-white/80">Cute Cats</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
                      onClick={() => applyMaskLayers('crypto')}
                    >
                      <CreditCard className="h-8 w-8 mb-2 text-blue-300" />
                      <span className="text-xs text-white/80">Crypto Meme</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center py-4 border-white/10 bg-black/20 hover:bg-black/40"
                      onClick={() => applyMaskLayers('pepe')}
                    >
                      <Flame className="h-8 w-8 mb-2 text-green-400" />
                      <span className="text-xs text-white/80">Pepe Hacker</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={handleRemoveMask}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Mask
                  </Button>
                </div>
                
                <Separator className="my-4 bg-white/10" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Show JSON</span>
                  <Button
                    variant="ghost"
                    onClick={handleToggleJson}
                    size="sm"
                    className={`${showJson ? 'bg-purple-500/20 text-purple-300' : 'bg-transparent text-white/40'}`}
                  >
                    {showJson ? 'Hide' : 'Show'}
                  </Button>
                </div>
                
                {showJson && (
                  <div className="mt-3 bg-black/50 border border-white/10 rounded p-3 overflow-auto max-h-40">
                    <pre className="text-xs text-green-400">
                      {JSON.stringify({
                        name: "Custom Wallet Mask",
                        styles: {
                          mask: customMask ? "full" : "none",
                          topLayer: topLayer ? topLayer.split('/').pop() : null,
                          bottomLayer: bottomLayer ? bottomLayer.split('/').pop() : null,
                          theme: "dark",
                          scale: 1.0
                        },
                        metadata: {
                          version: "v3-beta",
                          generated: new Date().toISOString()
                        }
                      }, null, 2)}
                    </pre>
                  </div>
                )}
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
              <div className="relative bg-black/20 p-6 rounded-xl border border-white/10 w-full h-full flex items-center justify-center">
                {/* Base wallet UI */}
                <div className="w-[320px] relative">
                  {/* Top Layer - correctly positioned relative to wallet with minimal overlap */}
                  {topLayer && (
                    <div 
                      className="absolute w-full pointer-events-none z-10"
                      style={{
                        top: '-55px', // Positioned much higher to only have 10-15px overlap
                        left: 0,
                        height: '40px',
                        overflow: 'visible'
                      }}
                    >
                      <img 
                        src={topLayer} 
                        alt="Top mask layer" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  <LoginScreen style={loginStyle} />
                  
                  {/* Bottom Layer - adjusted positioning */}
                  {bottomLayer && (
                    <div 
                      className="absolute w-full pointer-events-none z-10"
                      style={{
                        bottom: '-5px', // Better positioned at bottom
                        left: 0,
                        height: '40px',
                        overflow: 'visible'
                      }}
                    >
                      <img 
                        src={bottomLayer} 
                        alt="Bottom mask layer" 
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  
                  {/* Full mask overlay - only shown when using the custom upload or example mask */}
                  {customMask && (
                    <div 
                      className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-10"
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
