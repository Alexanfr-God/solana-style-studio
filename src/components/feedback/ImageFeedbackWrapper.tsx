
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import ImageFeedback from './ImageFeedback';
import { Link } from 'react-router-dom';

interface ImageFeedbackWrapperProps {
  imageUrl: string;
  prompt: string;
  children?: React.ReactNode;
}

const ImageFeedbackWrapper: React.FC<ImageFeedbackWrapperProps> = ({ 
  imageUrl, 
  prompt,
  children
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  const toggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };
  
  const handleFeedbackSubmitted = () => {
    setFeedbackSubmitted(true);
    setShowFeedback(false);
  };
  
  return (
    <div className="relative">
      {children}
      
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        {!feedbackSubmitted ? (
          <Button 
            size="sm" 
            variant={showFeedback ? "secondary" : "default"} 
            className="flex items-center gap-2"
            onClick={toggleFeedback}
          >
            {showFeedback ? (
              <>
                <X className="h-4 w-4" /> Close
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" /> Feedback
              </>
            )}
          </Button>
        ) : (
          <Card className="p-2 bg-green-50 border-green-200">
            <CardContent className="p-2 text-xs text-green-600 flex items-center gap-1">
              ✓ Thanks for your feedback!
            </CardContent>
          </Card>
        )}
      </div>
      
      {showFeedback && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="flex justify-end mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleFeedback}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ImageFeedback 
              imageUrl={imageUrl}
              prompt={prompt}
              onFeedbackSubmitted={handleFeedbackSubmitted}
            />
            <div className="mt-4 text-center">
              <Link 
                to="/feedback-analytics" 
                className="text-xs text-primary hover:underline"
              >
                View all feedback analytics
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageFeedbackWrapper;
