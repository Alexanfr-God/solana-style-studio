
import React from 'react';
import ImageFeedback from './ImageFeedback';

interface ImageFeedbackWrapperProps {
  imageId: string;
  imageUrl: string;
  showFeedback?: boolean;
}

// ARCHIVED: Legacy feedback wrapper
// Functionality disabled due to archive migration
const ImageFeedbackWrapper: React.FC<ImageFeedbackWrapperProps> = ({
  imageId,
  imageUrl,
  showFeedback = false
}) => {
  // Don't render feedback component if archived
  if (!showFeedback) {
    return null;
  }

  console.warn('🚫 ImageFeedbackWrapper is archived. Tables moved to archive schema.');

  return (
    <div className="mt-4">
      <ImageFeedback
        imageId={imageId}
        imageUrl={imageUrl}
        onFeedback={(rating, feedback) => {
          console.log('🚫 Archived feedback:', { imageId, rating, feedback });
        }}
      />
    </div>
  );
};

export default ImageFeedbackWrapper;
