
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Send, Plus, X, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';

interface ImageFeedbackProps {
  imageUrl: string;
  prompt: string;
  onFeedbackSubmitted?: () => void;
}

type FeedbackTag = {
  id: string;
  text: string;
}

const COMMON_TAGS = [
  'quality', 'composition', 'colors', 'style', 'creativity', 'accuracy'
];

const ImageFeedback: React.FC<ImageFeedbackProps> = ({ imageUrl, prompt, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState<number>(3);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tags, setTags] = useState<FeedbackTag[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const { connected } = useWallet();
  
  const handleAddTag = (tag: string = newTag) => {
    const tagToAdd = tag || newTag;
    if (tagToAdd && !tags.some(t => t.text.toLowerCase() === tagToAdd.toLowerCase())) {
      setTags([...tags, { id: crypto.randomUUID(), text: tagToAdd }]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };
  
  const handleSelectCommonTag = (tag: string) => {
    handleAddTag(tag);
  };
  
  const submitFeedback = async () => {
    if (!connected) {
      toast.error('Please connect your wallet to submit feedback');
      return;
    }
    
    if (rating < 1) {
      toast.error('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('save-feedback', {
        body: {
          image_url: imageUrl,
          prompt,
          rating,
          feedback_text: feedback,
          tags: tags.map(tag => tag.text)
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to submit feedback');
      }
      
      toast.success('Feedback submitted successfully');
      setFeedback('');
      setRating(3);
      setTags([]);
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback');
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-medium">How do you like this image?</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Poor</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Excellent</span>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Slider 
              value={[rating]} 
              min={1} 
              max={5} 
              step={1} 
              onValueChange={(val) => setRating(val[0])}
              className="flex-1"
            />
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star}
                  className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="feedback">Share your thoughts (optional)</Label>
          <Textarea 
            id="feedback" 
            placeholder="What did you like or dislike about this image?" 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Add tags</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                {tag.text}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveTag(tag.id)} 
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleAddTag()}
              disabled={!newTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {COMMON_TAGS.map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="px-2 py-1 cursor-pointer hover:bg-accent"
                onClick={() => handleSelectCommonTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        <Button 
          className="w-full flex items-center justify-center" 
          onClick={submitFeedback}
          disabled={isSubmitting}
        >
          <Send className="mr-2 h-4 w-4" />
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImageFeedback;
