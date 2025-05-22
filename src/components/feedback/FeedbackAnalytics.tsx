
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackAnalyticsProps {
  prompt?: string;
}

interface AnalyticsData {
  prompt: string;
  average_rating: number;
  feedback_count: number;
  feedback_texts: string[] | null;
}

const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ prompt }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let query = supabase.from('feedback_analytics').select('*');
        
        if (prompt) {
          query = query.eq('prompt', prompt);
        } else {
          query = query.order('feedback_count', { ascending: false }).limit(10);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        setAnalyticsData(data && data.length > 0 ? data[0] : null);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [prompt]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No feedback data available yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Analytics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Prompt</h3>
          <p className="text-sm text-muted-foreground">{analyticsData.prompt}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium mb-1">Average Rating</h3>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(analyticsData.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                />
              ))}
              <span className="ml-2 text-sm">
                {analyticsData.average_rating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1">Total Feedback</h3>
            <Badge variant="secondary">{analyticsData.feedback_count}</Badge>
          </div>
        </div>
        
        {analyticsData.feedback_texts && analyticsData.feedback_texts.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">User Comments</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analyticsData.feedback_texts.map((text, index) => (
                <div key={index} className="text-xs p-2 bg-muted rounded-md">
                  "{text}"
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackAnalytics;
