
import React, { useRef, useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

interface MaskUploadImageProps {
  disabled?: boolean;
}

const MaskUploadImage = ({ disabled = false }: MaskUploadImageProps) => {
  const referenceFileInputRef = useRef<HTMLInputElement>(null);
  const styleHintFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoadingReference, setIsLoadingReference] = useState(false);
  const [isLoadingStyleHint, setIsLoadingStyleHint] = useState(false);
  
  const { 
    referenceImage, 
    setReferenceImage, 
    styleHintImage, 
    setStyleHintImage 
  } = useMaskEditorStore();
  
  const processImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const handleReferenceUpload = () => {
    referenceFileInputRef.current?.click();
  };
  
  const handleStyleHintUpload = () => {
    styleHintFileInputRef.current?.click();
  };
  
  const handleReferenceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!/image\/(png|jpg|jpeg|webp|svg\+xml)/.test(file.type)) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP, SVG)');
      return;
    }
    
    setIsLoadingReference(true);
    
    try {
      const imageUrl = await processImage(file);
      setReferenceImage(imageUrl);
      toast.success('Reference image uploaded successfully');
    } catch (error) {
      console.error('Error uploading reference image:', error);
      toast.error('Failed to upload reference image. Please try again.');
    } finally {
      setIsLoadingReference(false);
      if (referenceFileInputRef.current) {
        referenceFileInputRef.current.value = '';
      }
    }
  };
  
  const handleStyleHintFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!/image\/(png|jpg|jpeg|webp|svg\+xml)/.test(file.type)) {
      toast.error('Please upload an image file (PNG, JPG, JPEG, WEBP, SVG)');
      return;
    }
    
    setIsLoadingStyleHint(true);
    
    try {
      const imageUrl = await processImage(file);
      setStyleHintImage(imageUrl);
      toast.success('Style hint image uploaded successfully');
    } catch (error) {
      console.error('Error uploading style hint image:', error);
      toast.error('Failed to upload style hint image. Please try again.');
    } finally {
      setIsLoadingStyleHint(false);
      if (styleHintFileInputRef.current) {
        styleHintFileInputRef.current.value = '';
      }
    }
  };
  
  const handleRemoveReference = () => {
    setReferenceImage(null);
    toast.success('Reference image removed');
  };
  
  const handleRemoveStyleHint = () => {
    setStyleHintImage(null);
    toast.success('Style hint image removed');
  };

  const ImageUploadCard = ({ 
    title, 
    description, 
    image, 
    isLoading, 
    onUpload, 
    onRemove 
  }: {
    title: string;
    description: string;
    image: string | null;
    isLoading: boolean;
    onUpload: () => void;
    onRemove: () => void;
  }) => (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="text-xs text-white/60 mb-2">{description}</div>
      
      {image ? (
        <div className="relative w-full h-24 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute top-2 right-2 flex gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0 bg-black/40 border-white/20"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-black/90 border-white/10">
                <DialogTitle className="text-white">{title}</DialogTitle>
                <div className="flex items-center justify-center p-4">
                  <img
                    src={image}
                    alt={title}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                </div>
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0 bg-black/40 border-white/20 hover:border-red-500/50 hover:text-red-400"
              onClick={onRemove}
              disabled={disabled || isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-24 border-dashed border-white/20 flex flex-col items-center justify-center gap-1"
          onClick={onUpload}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload {title}</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
  
  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={referenceFileInputRef}
        onChange={handleReferenceFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />
      
      <input
        type="file"
        ref={styleHintFileInputRef}
        onChange={handleStyleHintFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
      />
      
      <ImageUploadCard
        title="Reference Image"
        description="Main inspiration (cat, meme, character, etc.)"
        image={referenceImage}
        isLoading={isLoadingReference}
        onUpload={handleReferenceUpload}
        onRemove={handleRemoveReference}
      />
      
      <ImageUploadCard
        title="Style Hint Image"
        description="Optional: Pattern, texture, or style reference"
        image={styleHintImage}
        isLoading={isLoadingStyleHint}
        onUpload={handleStyleHintUpload}
        onRemove={handleRemoveStyleHint}
      />
      
      {(referenceImage || styleHintImage) && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-md">
          <p className="text-xs text-purple-300">
            💡 Tip: The AI will combine these images with your text prompt to create a unique wallet costume that flows around your UI.
          </p>
        </div>
      )}
    </div>
  );
};

export default MaskUploadImage;
