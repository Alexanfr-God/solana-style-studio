
import React from 'react';

interface ImageFeedbackWrapperProps {
  imageUrl: string;
  prompt: string;
  children?: React.ReactNode;
}

const ImageFeedbackWrapper: React.FC<ImageFeedbackWrapperProps> = ({ 
  children
}) => {
  return (
    <div className="relative">
      {children}
    </div>
  );
};

export default ImageFeedbackWrapper;
