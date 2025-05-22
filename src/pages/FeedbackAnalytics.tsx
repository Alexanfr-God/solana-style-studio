
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Star, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import AnimatedStars from '@/components/ui/animated-stars';
import Footer from '@/components/layout/Footer';

interface AnalyticsData {
  prompt: string;
  average_rating: number;
  feedback_count: number;
  feedback_texts: string[] | null;
}

const FeedbackAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredData, setFilteredData] = useState<AnalyticsData[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('feedback_analytics')
          .select('*')
          .order('feedback_count', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setAnalyticsData(data || []);
        setFilteredData(data || []);
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(analyticsData);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredData(
        analyticsData.filter(item => 
          item.prompt.toLowerCase().includes(query) || 
          (item.feedback_texts && item.feedback_texts.some(text => 
            text && text.toLowerCase().includes(query)
          ))
        )
      );
    }
  }, [searchQuery, analyticsData]);
  
  const handleViewDetails = (item: AnalyticsData) => {
    setSelectedItem(item);
  };
  
  const handleBackToList = () => {
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* AnimatedStars background with fixed positioning */}
      <AnimatedStars />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Image Generation Feedback Analytics
        </h1>
        
        {selectedItem ? (
          <div className="space-y-6">
            <Button variant="outline" onClick={handleBackToList}>
              ← Back to all feedback
            </Button>
            
            <Card>
              <CardHeader>
                <CardTitle>Detailed Feedback Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-md font-medium mb-2">Prompt</h3>
                  <p className="text-sm p-3 bg-muted rounded-md">{selectedItem.prompt}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-md font-medium mb-2">Rating</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            className={`h-5 w-5 ${star <= Math.round(selectedItem.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-medium">
                        {selectedItem.average_rating.toFixed(1)}
                      </span>
                      <Badge variant="outline">
                        {selectedItem.feedback_count} {selectedItem.feedback_count === 1 ? 'rating' : 'ratings'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedItem.feedback_texts && selectedItem.feedback_texts.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium mb-2">User Comments</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto p-1">
                      {selectedItem.feedback_texts.map((text, index) => (
                        text && (
                          <div key={index} className="p-3 bg-muted rounded-md">
                            <p className="text-sm">"{text}"</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search prompts or feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-lg"
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error: {error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No feedback data available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((item, index) => (
                  <Card 
                    key={index}
                    className="hover:bg-accent/5 cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(item)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="line-clamp-2 h-12 overflow-hidden">
                        <p className="text-sm font-medium">{item.prompt}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star}
                              className={`h-4 w-4 ${star <= Math.round(item.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                            />
                          ))}
                          <span className="ml-1 text-sm">
                            {item.average_rating.toFixed(1)}
                          </span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {item.feedback_count} {item.feedback_count === 1 ? 'rating' : 'ratings'}
                        </Badge>
                      </div>
                      
                      {item.feedback_texts && item.feedback_texts.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {item.feedback_texts.length} {item.feedback_texts.length === 1 ? 'comment' : 'comments'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
      
      <Toaster />
    </div>
  );
};

export default FeedbackAnalyticsPage;
