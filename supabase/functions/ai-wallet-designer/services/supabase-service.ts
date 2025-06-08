
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Utility function for structured logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [SupabaseService::${component}] [${level}] ${message}`;
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
}

export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    log('Constructor', 'INFO', 'SupabaseService initialized', { url: supabaseUrl });
  }

  async saveAnalysis(type: string, analysis: any): Promise<string> {
    log('SaveAnalysis', 'INFO', `Saving ${type} analysis`, { 
      analysisId: analysis.analysisId,
      confidence: analysis.confidence 
    });
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis_results')
        .insert({
          analysis_type: type,
          analysis_data: analysis,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      const duration = Date.now() - startTime;

      if (error) {
        log('SaveAnalysis', 'ERROR', `Failed to save ${type} analysis`, { 
          duration: `${duration}ms`,
          error: error.message 
        });
        throw error;
      }
      
      log('SaveAnalysis', 'INFO', `${type} analysis saved successfully`, { 
        duration: `${duration}ms`,
        recordId: data.id,
        analysisId: analysis.analysisId
      });
      
      return data.id;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('SaveAnalysis', 'ERROR', `Database error saving ${type} analysis`, { 
        duration: `${duration}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  async saveCustomization(customization: any): Promise<string> {
    log('SaveCustomization', 'INFO', 'Saving customization result', { 
      themeId: customization.themeId,
      success: customization.success 
    });
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('customization_results')
        .insert({
          customization_data: customization,
          theme_id: customization.themeId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      const duration = Date.now() - startTime;

      if (error) {
        log('SaveCustomization', 'ERROR', 'Failed to save customization', { 
          duration: `${duration}ms`,
          error: error.message 
        });
        throw error;
      }
      
      log('SaveCustomization', 'INFO', 'Customization saved successfully', { 
        duration: `${duration}ms`,
        recordId: data.id,
        themeId: customization.themeId
      });
      
      return data.id;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('SaveCustomization', 'ERROR', 'Database error saving customization', { 
        duration: `${duration}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  async saveFullResult(result: any): Promise<string> {
    log('SaveFullResult', 'INFO', 'Saving full analysis result', { 
      hasWalletAnalysis: !!result.walletAnalysis,
      hasImageAnalysis: !!result.imageAnalysis,
      hasCustomization: !!result.customization
    });
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('full_analysis_results')
        .insert({
          wallet_analysis: result.walletAnalysis,
          image_analysis: result.imageAnalysis,
          customization: result.customization,
          request_data: result.request,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      const duration = Date.now() - startTime;

      if (error) {
        log('SaveFullResult', 'ERROR', 'Failed to save full result', { 
          duration: `${duration}ms`,
          error: error.message 
        });
        throw error;
      }
      
      log('SaveFullResult', 'INFO', 'Full result saved successfully', { 
        duration: `${duration}ms`,
        recordId: data.id
      });
      
      return data.id;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('SaveFullResult', 'ERROR', 'Database error saving full result', { 
        duration: `${duration}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  async getAnalysisHistory(limit: number = 50): Promise<any[]> {
    log('GetHistory', 'INFO', `Fetching analysis history`, { limit });
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      const duration = Date.now() - startTime;

      if (error) {
        log('GetHistory', 'ERROR', 'Failed to fetch analysis history', { 
          duration: `${duration}ms`,
          error: error.message 
        });
        throw error;
      }
      
      log('GetHistory', 'INFO', 'Analysis history fetched successfully', { 
        duration: `${duration}ms`,
        recordCount: data.length
      });
      
      return data;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('GetHistory', 'ERROR', 'Database error fetching history', { 
        duration: `${duration}ms`,
        error: error.message 
      });
      throw error;
    }
  }

  async saveFeedback(sessionId: string, feedback: any): Promise<void> {
    log('SaveFeedback', 'INFO', 'Saving user feedback', { sessionId });
    
    const startTime = Date.now();
    
    try {
      const { error } = await this.supabase
        .from('user_feedback')
        .insert({
          session_id: sessionId,
          feedback_data: feedback,
          created_at: new Date().toISOString()
        });

      const duration = Date.now() - startTime;

      if (error) {
        log('SaveFeedback', 'ERROR', 'Failed to save feedback', { 
          duration: `${duration}ms`,
          sessionId,
          error: error.message 
        });
        throw error;
      }
      
      log('SaveFeedback', 'INFO', 'Feedback saved successfully', { 
        duration: `${duration}ms`,
        sessionId
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('SaveFeedback', 'ERROR', 'Database error saving feedback', { 
        duration: `${duration}ms`,
        sessionId,
        error: error.message 
      });
      throw error;
    }
  }

  async createUserSession(userId?: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    log('CreateSession', 'INFO', 'Creating user session', { sessionId, userId });
    
    const startTime = Date.now();
    
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      const duration = Date.now() - startTime;

      if (error) {
        log('CreateSession', 'ERROR', 'Failed to create session', { 
          duration: `${duration}ms`,
          sessionId,
          error: error.message 
        });
        throw error;
      }
      
      log('CreateSession', 'INFO', 'User session created successfully', { 
        duration: `${duration}ms`,
        sessionId
      });
      
      return sessionId;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('CreateSession', 'ERROR', 'Database error creating session', { 
        duration: `${duration}ms`,
        sessionId,
        error: error.message 
      });
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    log('TestConnection', 'INFO', 'Testing database connection');
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis_results')
        .select('count')
        .limit(1);

      const duration = Date.now() - startTime;
      const isConnected = !error;

      log('TestConnection', isConnected ? 'INFO' : 'ERROR', `Database connection test result: ${isConnected}`, { 
        duration: `${duration}ms`,
        error: error?.message
      });

      return isConnected;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('TestConnection', 'ERROR', 'Database connection test failed', { 
        duration: `${duration}ms`,
        error: error.message 
      });
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
