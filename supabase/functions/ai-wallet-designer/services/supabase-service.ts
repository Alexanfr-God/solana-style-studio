
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🗄️ SupabaseService initialized');
  }

  async saveAnalysis(type: string, analysis: any): Promise<string> {
    console.log(`💾 Saving ${type} analysis`);
    
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

      if (error) throw error;
      
      console.log(`✅ ${type} analysis saved:`, data.id);
      return data.id;
    } catch (error) {
      console.error(`❌ Error saving ${type} analysis:`, error);
      throw error;
    }
  }

  async saveCustomization(customization: any): Promise<string> {
    console.log('🎨 Saving customization result');
    
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

      if (error) throw error;
      
      console.log('✅ Customization saved:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error saving customization:', error);
      throw error;
    }
  }

  async saveFullResult(result: any): Promise<string> {
    console.log('📦 Saving full analysis result');
    
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

      if (error) throw error;
      
      console.log('✅ Full result saved:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error saving full result:', error);
      throw error;
    }
  }

  async getAnalysisHistory(limit: number = 50): Promise<any[]> {
    console.log(`📚 Fetching analysis history (limit: ${limit})`);
    
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis_results')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      console.log(`✅ Retrieved ${data.length} analysis records`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching analysis history:', error);
      throw error;
    }
  }

  async saveFeedback(sessionId: string, feedback: any): Promise<void> {
    console.log('💬 Saving user feedback');
    
    try {
      const { error } = await this.supabase
        .from('user_feedback')
        .insert({
          session_id: sessionId,
          feedback_data: feedback,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      console.log('✅ Feedback saved for session:', sessionId);
    } catch (error) {
      console.error('❌ Error saving feedback:', error);
      throw error;
    }
  }

  async createUserSession(userId?: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    console.log('🎫 Creating user session:', sessionId);
    
    try {
      const { error } = await this.supabase
        .from('user_sessions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      console.log('✅ User session created:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('❌ Error creating session:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('ai_analysis_results')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
