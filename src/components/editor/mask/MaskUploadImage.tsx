
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';

const MaskUploadImage = () => {
  const { 
    referenceImage, 
    styleHintImage,
    setReferenceImage, 
    setStyleHintImage 
  } = useMaskEditorStore();
  
  const referenceInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (file: File, type: 'reference' | 'style') => {
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onloadend = () => {
      if (type === 'reference') {
        setReferenceImage(reader.result as string);
        toast.success("Reference image uploaded");
      } else {
        setStyleHintImage(reader.result as string);
        toast.success("Style hint image uploaded");
      }
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to upload image. Please try again.");
    };
    
    reader.readAsDataURL(file);
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'reference');
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, 'style');
  };

  const removeReference = () => {
    setReferenceImage(null);
    if (referenceInputRef.current) referenceInputRef.current.value = '';
    toast.success("Reference image removed");
  };

  const removeStyleHint = () => {
    setStyleHintImage(null);
    if (styleInputRef.current) styleInputRef.current.value = '';
    toast.success("Style hint image removed");
  };

  return (
    <div className="space-y-6">
      {/* Reference Image Upload */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-white">Reference Image</h3>
        <input
          type="file"
          ref={referenceInputRef}
          onChange={handleReferenceChange}
          accept="image/*"
          className="hidden"
        />
        
        {referenceImage ? (
          <div className="relative">
            <img 
              src={referenceImage} 
              alt="Reference" 
              className="w-full h-32 rounded-md object-cover"
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={removeReference}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-full py-6 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 bg-white/5">
            <Image className="h-5 w-5 text-white/60" />
            <p className="text-xs text-white/60 text-center">Upload your main reference</p>
            <Button 
              onClick={() => referenceInputRef.current?.click()} 
              variant="secondary" 
              size="sm"
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
          </div>
        )}
      </div>

      {/* Style Hint Image Upload */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-white">Style Hint (Optional)</h3>
        <input
          type="file"
          ref={styleInputRef}
          onChange={handleStyleChange}
          accept="image/*"
          className="hidden"
        />
        
        {styleHintImage ? (
          <div className="relative">
            <img 
              src={styleHintImage} 
              alt="Style hint" 
              className="w-full h-32 rounded-md object-cover"
            />
            <Button 
              variant="destructive" 
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={removeStyleHint}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-full py-6 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 bg-white/5">
            <Image className="h-5 w-5 text-white/60" />
            <p className="text-xs text-white/60 text-center">Additional style reference</p>
            <Button 
              onClick={() => styleInputRef.current?.click()} 
              variant="secondary" 
              size="sm"
              disabled={isUploading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaskUploadImage;
