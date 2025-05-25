
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAndUploadGuideImage } from '@/utils/createGuideImage';

const CreateGuideImageButton = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGuideImage = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    
    try {
      toast.info('🎨 Creating mask guide image...');
      
      const imageUrl = await createAndUploadGuideImage();
      
      toast.success('✅ Guide image created and uploaded successfully!');
      toast.info(`📍 URL: ${imageUrl}`);
      
    } catch (error) {
      console.error('Failed to create guide image:', error);
      toast.error(`❌ Failed to create guide image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={handleCreateGuideImage}
      disabled={isCreating}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Guide Image...
        </>
      ) : (
        <>
          <Image className="mr-2 h-4 w-4" />
          Create Guide Image
        </>
      )}
    </Button>
  );
};

export default CreateGuideImageButton;
