
import { supabase } from "@/integrations/supabase/client";

export interface FeedbackInput {
  imageUrl: string;
  prompt: string;
  rating: number;
  feedbackText?: string;
  tags?: string[];
}

export interface AnalyticsData {
  prompt: string;
  averageRating: number;
  feedbackCount: number;
  feedbackTexts: string[] | null;
}

export async function submitFeedback(feedback: FeedbackInput): Promise<{ success: boolean, id?: string, error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('save-feedback', {
      body: {
        image_url: feedback.imageUrl,
        prompt: feedback.prompt,
        rating: feedback.rating,
        feedback_text: feedback.feedbackText || null,
        tags: feedback.tags || []
      }
    });
    
    if (error) {
      throw new Error(error.message || 'Failed to submit feedback');
    }
    
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('Error submitting feedback:', err);
    return { success: false, error: err.message || 'Failed to submit feedback' };
  }
}

export async function getFeedbackAnalytics(prompt?: string): Promise<{ data?: AnalyticsData[], error?: string }> {
  try {
    let query = supabase.from('feedback_analytics').select('*');
    
    if (prompt) {
      query = query.eq('prompt', prompt);
    } else {
      query = query.order('feedback_count', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    const analyticsData = data?.map(item => ({
      prompt: item.prompt,
      averageRating: item.average_rating,
      feedbackCount: item.feedback_count,
      feedbackTexts: item.feedback_texts,
    })) || [];
    
    return { data: analyticsData };
  } catch (err: any) {
    console.error('Error fetching analytics:', err);
    return { error: err.message || 'Failed to load analytics data' };
  }
}

export async function refreshFeedbackAnalytics(): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase.rpc('refresh_feedback_analytics');
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (err: any) {
    console.error('Error refreshing analytics:', err);
    return { success: false, error: err.message || 'Failed to refresh analytics' };
  }
}
