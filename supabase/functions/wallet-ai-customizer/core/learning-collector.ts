
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [LearningCollector::${component}] [${level}] ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

export class LearningCollector {
  private supabase: any;
  
  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    this.supabase = createClient(supabaseUrl!, supabaseKey!);
    log('Constructor', 'INFO', 'LearningCollector initialized');
  }
  
  async collectUserSession(data: {
    sessionId: string;
    walletId: string;
    customPrompt: string;
    imageInfo: {
      size: number;
      format: string;
    };
  }) {
    log('CollectSession', 'INFO', 'Collecting user session data', {
      sessionId: data.sessionId,
      walletId: data.walletId
    });
    
    const startTime = Date.now();
    
    try {
      const sessionData = {
        session_id: data.sessionId,
        wallet_id: data.walletId,
        custom_prompt: data.customPrompt,
        image_metadata: {
          size: data.imageInfo.size,
          format: data.imageInfo.format,
          uploadedAt: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        status: 'processing'
      };
      
      const { data: result, error } = await this.supabase
        .from('user_sessions')
        .insert(sessionData)
        .select()
        .single();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        log('CollectSession', 'ERROR', 'Failed to save session', {
          sessionId: data.sessionId,
          duration: `${duration}ms`,
          error: error.message
        });
        throw error;
      }
      
      log('CollectSession', 'INFO', 'Session data saved successfully', {
        sessionId: data.sessionId,
        duration: `${duration}ms`,
        recordId: result.id
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('CollectSession', 'ERROR', 'Session collection failed', {
        sessionId: data.sessionId,
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    }
  }
  
  async updateSessionResult(sessionId: string, result: any) {
    log('UpdateResult', 'INFO', 'Updating session with result', { sessionId });
    
    const startTime = Date.now();
    
    try {
      const updateData = {
        result_data: result,
        completed_at: new Date().toISOString(),
        status: result.success ? 'completed' : 'failed',
        processing_time: result.processingTime || null
      };
      
      const { data, error } = await this.supabase
        .from('user_sessions')
        .update(updateData)
        .eq('session_id', sessionId)
        .select()
        .single();
      
      const duration = Date.now() - startTime;
      
      if (error) {
        log('UpdateResult', 'ERROR', 'Failed to update session result', {
          sessionId,
          duration: `${duration}ms`,
          error: error.message
        });
        throw error;
      }
      
      log('UpdateResult', 'INFO', 'Session result updated successfully', {
        sessionId,
        duration: `${duration}ms`,
        success: result.success
      });
      
      return data;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('UpdateResult', 'ERROR', 'Result update failed', {
        sessionId,
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    }
  }
  
  async saveUserRating(sessionId: string, rating: number, feedback?: string) {
    log('SaveRating', 'INFO', 'Saving user rating', {
      sessionId,
      rating
    });
    
    const startTime = Date.now();
    
    try {
      // Save user feedback
      const feedbackData = {
        session_id: sessionId,
        rating: rating,
        feedback: feedback || null,
        rated_at: new Date().toISOString()
      };
      
      const { error: feedbackError } = await this.supabase
        .from('user_feedback')
        .insert(feedbackData);
      
      if (feedbackError) {
        throw feedbackError;
      }
      
      // Update session with rating
      const { error: sessionError } = await this.supabase
        .from('user_sessions')
        .update({ 
          user_rating: rating,
          feedback_provided: true 
        })
        .eq('session_id', sessionId);
      
      if (sessionError) {
        throw sessionError;
      }
      
      const duration = Date.now() - startTime;
      
      log('SaveRating', 'INFO', 'User rating saved successfully', {
        sessionId,
        rating,
        duration: `${duration}ms`
      });
      
      // Notify N8N about the rating for learning
      await this.notifyN8NAboutRating(sessionId, rating);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('SaveRating', 'ERROR', 'Failed to save rating', {
        sessionId,
        rating,
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    }
  }
  
  private async notifyN8NAboutRating(sessionId: string, rating: number) {
    log('NotifyN8N', 'INFO', 'Notifying N8N about user rating', {
      sessionId,
      rating
    });
    
    try {
      const n8nLearningUrl = Deno.env.get('N8N_LEARNING_WEBHOOK_URL');
      
      if (!n8nLearningUrl) {
        log('NotifyN8N', 'WARN', 'N8N learning webhook URL not configured');
        return;
      }
      
      const payload = {
        type: 'user_rating',
        sessionId,
        rating,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(n8nLearningUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        log('NotifyN8N', 'INFO', 'N8N notified successfully about rating');
      } else {
        log('NotifyN8N', 'WARN', 'Failed to notify N8N about rating', {
          status: response.status
        });
      }
      
    } catch (error) {
      log('NotifyN8N', 'ERROR', 'Error notifying N8N about rating', {
        error: error.message
      });
    }
  }
  
  async getSessionHistory(limit: number = 50) {
    log('GetHistory', 'INFO', `Fetching session history (limit: ${limit})`);
    
    try {
      const { data, error } = await this.supabase
        .from('user_sessions')
        .select(`
          session_id,
          wallet_id,
          custom_prompt,
          status,
          user_rating,
          created_at,
          completed_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        throw error;
      }
      
      log('GetHistory', 'INFO', 'Session history fetched successfully', {
        count: data.length
      });
      
      return data;
      
    } catch (error) {
      log('GetHistory', 'ERROR', 'Failed to fetch session history', {
        error: error.message
      });
      throw error;
    }
  }
  
  async getAnalytics() {
    log('GetAnalytics', 'INFO', 'Fetching learning analytics');
    
    try {
      // Get session statistics
      const { data: sessionStats, error: sessionError } = await this.supabase
        .from('user_sessions')
        .select('status, user_rating, wallet_id')
        .not('user_rating', 'is', null);
      
      if (sessionError) {
        throw sessionError;
      }
      
      // Calculate analytics
      const analytics = {
        totalRatedSessions: sessionStats.length,
        averageRating: sessionStats.length > 0 
          ? sessionStats.reduce((sum, s) => sum + s.user_rating, 0) / sessionStats.length 
          : 0,
        ratingDistribution: this.calculateRatingDistribution(sessionStats),
        popularWallets: this.calculateWalletPopularity(sessionStats),
        timestamp: new Date().toISOString()
      };
      
      log('GetAnalytics', 'INFO', 'Analytics calculated successfully', analytics);
      
      return analytics;
      
    } catch (error) {
      log('GetAnalytics', 'ERROR', 'Failed to fetch analytics', {
        error: error.message
      });
      throw error;
    }
  }
  
  private calculateRatingDistribution(sessions: any[]) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    sessions.forEach(session => {
      if (session.user_rating >= 1 && session.user_rating <= 5) {
        distribution[session.user_rating]++;
      }
    });
    return distribution;
  }
  
  private calculateWalletPopularity(sessions: any[]) {
    const walletCounts: { [key: string]: number } = {};
    sessions.forEach(session => {
      walletCounts[session.wallet_id] = (walletCounts[session.wallet_id] || 0) + 1;
    });
    
    return Object.entries(walletCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([walletId, count]) => ({ walletId, count }));
  }
}
