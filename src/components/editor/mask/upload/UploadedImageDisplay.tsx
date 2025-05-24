
import React from 'react';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

interface UploadedImageDisplayProps {
  imageUrl: string;
  isAnalyzing: boolean;
  onReplace: () => void;
  disabled?: boolean;
}

const UploadedImageDisplay = ({ 
  imageUrl, 
  isAnalyzing, 
  onReplace, 
  disabled = false 
}: UploadedImageDisplayProps) => {
  const { setExternalMask, setMaskImageUrl } = useMaskEditorStore();

  const handleRemoveImage = () => {
    setExternalMask(null);
    setMaskImageUrl(null);
    toast.success('Mask removed from wallet preview');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative w-full h-20 bg-black/20 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt="Uploaded mask"
          className="max-w-full max-h-full object-contain"
        />
        
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400 mb-1" />
            <p className="text-xs text-white/80">Processing...</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-white/10"
          onClick={onReplace}
          disabled={disabled}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          Replace
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-white/10 hover:border-red-500/50 hover:text-red-400"
          onClick={handleRemoveImage}
          disabled={disabled}
        >
          <X className="mr-2 h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default UploadedImageDisplay;
