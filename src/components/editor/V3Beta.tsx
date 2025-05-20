
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const V3Beta = () => {
  const [maskImage, setMaskImage] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const { setSelectedMask, setMaskImageUrl } = useMaskEditorStore();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validImageTypes = ['image/png', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Please upload a transparent PNG or WebP image");
      return;
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setMaskImage(reader.result.toString());
        setIsApplied(false);
        toast.success("Mask image uploaded successfully");
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleOpenGPT = () => {
    window.open('https://chatgpt.com/g/g-682a38c975b881918621ac1517cf68db-wallet-coast-customs-v3', '_blank');
  };
  
  const handleApplyMask = () => {
    if (!maskImage) {
      toast.error("Please upload a mask image first");
      return;
    }
    
    // Apply the mask to the wallet
    setMaskImageUrl(maskImage);
    
    // Create a simplified mask object for the preview
    setSelectedMask({
      imageUrl: maskImage,
      layout: {
        top: '',
        bottom: '',
        left: '',
        right: '',
        core: 'transparent'
      },
      theme: 'Custom V3 Mask',
      style: 'custom',
      colorPalette: ['#9b87f5'],
      safeZone: {
        x: 432,
        y: 344,
        width: 160, 
        height: 336
      }
    });
    
    setIsApplied(true);
    toast.success("Mask applied to wallet");
  };
  
  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Try Fast Version (V3 Beta)</h2>
            <Badge 
              variant="default" 
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white"
            >
              BETA
            </Badge>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-white/80">
            ⚡ While the final version is in development, you can try out masks right now!
            This mode demonstrates how customization will work in the future.
          </p>
        </div>
        
        <Separator className="my-4 bg-white/10" />
        
        <div className="grid gap-4">
          <div>
            <Button 
              onClick={handleOpenGPT} 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white border-none"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with GPT
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-white/60 mt-1 text-center">
              Our custom GPT will generate a mask for your wallet
            </p>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileChange}
            accept="image/png,image/webp"
          />
          
          <div className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center bg-black/20">
            {maskImage ? (
              <div className="w-full space-y-3">
                <div className="aspect-square w-full max-h-48 overflow-hidden rounded-md relative">
                  <img 
                    src={maskImage} 
                    alt="Uploaded mask" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Button
                  variant="outline"
                  onClick={handleUploadClick}
                  className="border-white/10 text-white mb-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Mask (PNG)
                </Button>
                <p className="text-xs text-white/40 text-center">
                  Upload a transparent PNG image to use as your wallet mask
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleApplyMask}
            disabled={!maskImage || isApplied}
            className={isApplied ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Applied to Wallet
              </>
            ) : (
              "Apply to Wallet"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default V3Beta;
