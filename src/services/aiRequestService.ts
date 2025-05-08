
import { supabase } from '@/integrations/supabase/client';

export interface AIRequest {
  id?: string;
  user_id?: string;
  image_url?: string | null;
  prompt?: string | null;
  layer_type?: 'login' | 'wallet' | null;
  status?: 'pending' | 'completed' | 'failed' | null;
  style_result?: Record<string, any> | null;
  created_at?: string | null;
}

export const aiRequestService = {
  /**
   * Create a new AI request
   */
  async createRequest(request: Omit<AIRequest, 'id' | 'created_at' | 'user_id'>): Promise<AIRequest | null> {
    const user = supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('ai_requests')
      .insert({
        ...request,
        status: request.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI request:', error);
      return null;
    }

    return data;
  },

  /**
   * Get all AI requests for the current user
   */
  async getUserRequests(): Promise<AIRequest[]> {
    const { data, error } = await supabase
      .from('ai_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI requests:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Update an existing AI request
   */
  async updateRequest(id: string, updates: Partial<AIRequest>): Promise<AIRequest | null> {
    const { data, error } = await supabase
      .from('ai_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AI request:', error);
      return null;
    }

    return data;
  }
};
