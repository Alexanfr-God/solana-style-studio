
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface ImageFeedbackProps {
  imageId: string;
  imageUrl: string;
  onFeedback?: (rating: 'like' | 'dislike', feedback?: string) => void;
}

// ARCHIVED: Legacy feedback component
// Tables moved to archive schema: archive.image_feedback
// Component kept for reference but functionality disabled
const ImageFeedback: React.FC<ImageFeedbackProps> = ({ 
  imageId, 
  imageUrl, 
  onFeedback 
}) => {
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (newRating: 'like' | 'dislike') => {
    console.warn('🚫 Image feedback is archived. Tables moved to archive schema.');
    toast.error('Image feedback is currently disabled');

    // ARCHIVED: Legacy feedback submission - disabled
    // Original functionality moved to archive schema
    setRating(newRating);
    
    if (onFeedback) {
      onFeedback(newRating, feedback);
    }

    // Commented out to prevent calls to archived tables
    // try {
    //   setIsSubmitting(true);
    //   const { error } = await supabase
    //     .from('image_feedback') // Now archive.image_feedback
    //     .insert({
    //       image_id: imageId,
    //       user_id: auth.user?.id,
    //       rating: newRating,
    //       feedback_text: feedback || null,
    //     });
    //   
    //   if (error) throw error;
    //   toast.success('Thank you for your feedback!');
    // } catch (error) {
    //   toast.error('Failed to submit feedback');
    //   console.error('Feedback submission error:', error);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Rate this image:</span>
          <div className="text-xs text-orange-400">
            ⚠️ Feedback archived
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={rating === 'like' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('like')}
            disabled={true} // Disabled - archived functionality
            className="flex items-center gap-2 opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            Like
          </Button>
          
          <Button
            variant={rating === 'dislike' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('dislike')}
            disabled={true} // Disabled - archived functionality
            className="flex items-center gap-2 opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            Dislike
          </Button>
        </div>

        <div className="mt-2 text-xs text-white/50">
          Legacy feedback system archived. New feedback system coming soon.
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageFeedback;
