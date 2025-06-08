
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export class SupabaseService {
  private supabase: any;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    console.log('💾 SupabaseService initialized');
  }

  async saveAnalysis(type: string, analysisData: any): Promise<any> {
    console.log('💾 Saving analysis to database:', type);
    
    try {
      const { data, error } = await this.supabase
        .from('ai_requests')
        .insert({
          id: crypto.randomUUID(),
          user_id: analysisData.userId || null,
          prompt: `${type}_analysis`,
          status: 'completed',
          style_result: analysisData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error saving analysis:', error);
      throw error;
    }
  }

  async saveCustomization(customizationData: any): Promise<any> {
    console.log('💾 Saving customization result');
    
    try {
      const { data, error } = await this.supabase
        .from('style_library')
        .insert({
          id: crypto.randomUUID(),
          style_name: `AI Generated - ${new Date().toLocaleDateString()}`,
          description: 'AI-generated wallet customization',
          style_data: customizationData.generatedCSS,
          ai_analysis: customizationData.applicationResult,
          created_by: 'ai-wallet-designer',
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error saving customization:', error);
      throw error;
    }
  }

  async saveFullResult(resultData: any): Promise<any> {
    console.log('💾 Saving full analysis result');
    
    try {
      // Save to ai_mask_results table for comprehensive results
      const { data, error } = await this.supabase
        .from('ai_mask_results')
        .insert({
          id: crypto.randomUUID(),
          prompt: JSON.stringify(resultData.request),
          style: resultData.customization.generatedCSS?.variables?.['--primary-color'] || 'default',
          color_palette: Object.values(resultData.imageAnalysis?.colorPalette?.dominant || []),
          layout: resultData.walletAnalysis?.result || {},
          reference_image_url: resultData.request.imageUrl,
          safe_zone: { enabled: true },
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error saving full result:', error);
      throw error;
    }
  }

  async saveLearningData(learningData: any): Promise<any> {
    console.log('📚 Saving learning data');
    
    try {
      const { data, error } = await this.supabase
        .from('system_logs')
        .insert({
          id: crypto.randomUUID(),
          session_id: crypto.randomUUID(),
          user_id: learningData.userId || null,
          level: 'info',
          module: 'ai-wallet-designer',
          action: 'learning_interaction',
          data: learningData,
          performance: {
            processingTime: learningData.processingTime
          },
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error saving learning data:', error);
      throw error;
    }
  }

  async saveAnalysisPatterns(patterns: any): Promise<any> {
    console.log('📊 Saving analysis patterns');
    
    try {
      const { data, error } = await this.supabase
        .from('system_logs')
        .insert({
          id: crypto.randomUUID(),
          session_id: crypto.randomUUID(),
          level: 'info',
          module: 'ai-wallet-designer',
          action: 'learning_patterns',
          data: { patterns },
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error saving patterns:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
