import { supabase } from '@/integrations/supabase/client';
import { frontendLogger } from './frontendLogger';

export interface UnifiedN8NPayload {
  // Session and User Context
  sessionId: string;
  userId?: string;
  timestamp: string;
  
  // Wallet Structure Data (from wallet_structure_analysis)
  walletStructure: {
    id: string;
    walletType: string;
    screenType: string;
    uiStructure: any;
    safeZones: any;
    colorPalette: any;
    typography: any;
    interactivity: any;
    functionalContext: any;
    generationContext: any;
  };
  
  // Image Analysis Data (from image_analysis_cache)
  imageAnalysis?: {
    id: string;
    imageUrl: string;
    analysisResult: any;
    dominantColors?: string[];
    styleElements?: any;
    moodProfile?: string;
  };
  
  // User Inputs
  customPrompt: string;
  imageData?: string;
  
  // Processing Configuration
  processingMode: 'full_customization' | 'style_only' | 'layout_only';
  learningEnabled: boolean;
  qualityTarget: 'fast' | 'balanced' | 'premium';
  
  // Metadata
  requestSource: string;
  clientVersion: string;
}

export interface UnifiedN8NResult {
  success: boolean;
  sessionId: string;
  customizationId?: string;
  processingTime: number;
  
  // Generated Content
  generatedStyles?: {
    variables: Record<string, string>;
    elements: Record<string, any>;
    layout?: any;
  };
  
  // AI Analysis
  aiAnalysis?: {
    confidence: number;
    dominantColors: string[];
    styleType: string;
    moodProfile: string;
    complexityScore?: number;
  };
  
  // Quality Metrics
  qualityScore?: number;
  validationResults?: {
    safeZoneCompliance: boolean;
    accessibilityScore: number;
    designConsistency: number;
  };
  
  // Learning Data
  learningData?: {
    userSatisfaction?: number;
    performanceMetrics: any;
    improvementSuggestions?: string[];
  };
  
  // Error Information
  error?: string;
  errorDetails?: any;
}

export class UnifiedN8NService {
  private static instance: UnifiedN8NService;
  private webhookUrl: string;
  private timeout = 240000; // 4 minutes
  
  constructor() {
    this.webhookUrl = 'https://wacocu.app.n8n.cloud/webhook/wallet-customizer-unified';
  }
  
  static getInstance(): UnifiedN8NService {
    if (!UnifiedN8NService.instance) {
      UnifiedN8NService.instance = new UnifiedN8NService();
    }
    return UnifiedN8NService.instance;
  }

  async executeCustomization(
    sessionId: string,
    imageUrl: string,
    customPrompt: string,
    walletId: string = 'phantom',
    userId?: string
  ): Promise<UnifiedN8NResult> {
    const startTime = Date.now();
    
    try {
      await frontendLogger.logUserInteraction(
        'generate',
        'unified_n8n_customization',
        `Starting unified customization for session: ${sessionId}`
      );

      console.log('🚀 Starting Unified N8N Customization Process');

      // 1. Get or create wallet structure analysis
      const walletStructure = await this.getOrCreateWalletStructure(walletId);
      
      // 2. Get or create image analysis
      const imageAnalysis = await this.getOrCreateImageAnalysis(imageUrl);
      
      // 3. Create customization record
      const customizationRecord = await this.createCustomizationRecord(
        sessionId, 
        userId, 
        walletStructure.id, 
        imageAnalysis?.id
      );

      // 4. Build comprehensive payload
      const payload = await this.buildUnifiedPayload(
        sessionId,
        userId,
        walletStructure,
        imageAnalysis,
        customPrompt,
        imageUrl
      );

      console.log('📦 Unified N8N Payload:', {
        sessionId: payload.sessionId,
        hasWalletStructure: !!payload.walletStructure,
        hasImageAnalysis: !!payload.imageAnalysis,
        payloadSize: JSON.stringify(payload).length
      });

      // 5. Send to N8N
      const n8nResult = await this.sendToN8N(payload);

      // 6. Update customization record with results
      await this.updateCustomizationRecord(
        customizationRecord.id,
        n8nResult,
        Date.now() - startTime
      );

      console.log('✅ Unified N8N Customization Completed');
      
      return n8nResult;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      await frontendLogger.logUserError(
        'UNIFIED_N8N_ERROR',
        error.message,
        'unified_n8n_customization'
      );

      console.error('💥 Unified N8N Customization Failed:', error);
      
      return {
        success: false,
        sessionId,
        processingTime,
        error: error.message,
        errorDetails: {
          timestamp: new Date().toISOString(),
          processingTime: `${processingTime}ms`
        }
      };
    }
  }

  private async getOrCreateWalletStructure(walletId: string) {
    console.log('📊 Getting wallet structure for:', walletId);
    
    // Try to get existing analysis
    const { data: existing } = await supabase
      .from('wallet_structure_analysis')
      .select('*')
      .eq('wallet_type', walletId)
      .eq('screen_type', 'home')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log('✅ Using existing wallet structure:', existing.id);
      return existing;
    }

    // Create new analysis by calling wallet-customization-structure
    console.log('🔄 Creating new wallet structure analysis');
    
    const { data: newStructure, error } = await supabase.functions.invoke(
      'wallet-customization-structure',
      { body: { walletType: walletId } }
    );

    if (error) {
      throw new Error(`Failed to analyze wallet structure: ${error.message}`);
    }

    // Store the analysis in database
    const { data: stored, error: storeError } = await supabase
      .from('wallet_structure_analysis')
      .insert({
        wallet_type: walletId,
        screen_type: 'home',
        ui_structure: newStructure.structure || {},
        safe_zones: newStructure.metadata?.safeZones || {},
        color_palette: {},
        typography: {},
        interactivity: newStructure.metadata || {},
        functional_context: { totalElements: newStructure.metadata?.totalCustomizableElements || 0 },
        generation_context: { source: 'auto_analysis', timestamp: new Date().toISOString() }
      })
      .select()
      .single();

    if (storeError) {
      console.warn('⚠️ Failed to store wallet structure:', storeError);
      // Continue with temporary structure
      return {
        id: 'temp_' + Date.now(),
        wallet_type: walletId,
        screen_type: 'home',
        ui_structure: newStructure.structure || {},
        safe_zones: newStructure.metadata?.safeZones || {},
        color_palette: {},
        typography: {},
        interactivity: newStructure.metadata || {},
        functional_context: { totalElements: newStructure.metadata?.totalCustomizableElements || 0 },
        generation_context: { source: 'auto_analysis', timestamp: new Date().toISOString() }
      };
    }

    console.log('✅ Created new wallet structure:', stored.id);
    return stored;
  }

  private async getOrCreateImageAnalysis(imageUrl: string) {
    if (!imageUrl) return null;

    console.log('🖼️ Getting image analysis for:', imageUrl.substring(0, 50));
    
    // Try to get existing analysis
    const { data: existing } = await supabase
      .from('image_analysis_cache')
      .select('*')
      .eq('image_url', imageUrl)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      console.log('✅ Using cached image analysis:', existing.id);
      return existing;
    }

    // Create new analysis by calling analyze-wallet-image
    console.log('🔄 Creating new image analysis');
    
    try {
      const { data: analysis, error } = await supabase.functions.invoke(
        'analyze-wallet-image',
        { body: { imageUrl } }
      );

      if (error) {
        console.warn('⚠️ Image analysis failed:', error);
        return null;
      }

      // Store the analysis in database
      const { data: stored, error: storeError } = await supabase
        .from('image_analysis_cache')
        .insert({
          image_url: imageUrl,
          analysis_result: analysis || {},
          analysis_duration_ms: 1000 // placeholder
        })
        .select()
        .single();

      if (storeError) {
        console.warn('⚠️ Failed to store image analysis:', storeError);
        return null;
      }

      console.log('✅ Created new image analysis:', stored.id);
      return stored;

    } catch (error) {
      console.warn('⚠️ Image analysis error:', error);
      return null;
    }
  }

  private async createCustomizationRecord(
    sessionId: string,
    userId?: string,
    walletStructureId?: string,
    imageAnalysisId?: string
  ) {
    const { data, error } = await supabase
      .from('customization_results')
      .insert({
        session_id: sessionId,
        user_id: userId,
        wallet_structure_id: walletStructureId,
        image_analysis_id: imageAnalysisId,
        status: 'processing',
        customization_data: {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create customization record: ${error.message}`);
    }

    console.log('📝 Created customization record:', data.id);
    return data;
  }

  private async buildUnifiedPayload(
    sessionId: string,
    userId: string | undefined,
    walletStructure: any,
    imageAnalysis: any,
    customPrompt: string,
    imageUrl: string
  ): Promise<UnifiedN8NPayload> {
    return {
      // Session and User Context
      sessionId,
      userId,
      timestamp: new Date().toISOString(),
      
      // Wallet Structure Data
      walletStructure: {
        id: walletStructure.id,
        walletType: walletStructure.wallet_type,
        screenType: walletStructure.screen_type,
        uiStructure: walletStructure.ui_structure,
        safeZones: walletStructure.safe_zones,
        colorPalette: walletStructure.color_palette,
        typography: walletStructure.typography,
        interactivity: walletStructure.interactivity,
        functionalContext: walletStructure.functional_context,
        generationContext: walletStructure.generation_context
      },
      
      // Image Analysis Data
      imageAnalysis: imageAnalysis ? {
        id: imageAnalysis.id,
        imageUrl: imageAnalysis.image_url,
        analysisResult: imageAnalysis.analysis_result,
        dominantColors: imageAnalysis.analysis_result?.colors?.dominant,
        styleElements: imageAnalysis.analysis_result?.style,
        moodProfile: imageAnalysis.analysis_result?.mood
      } : undefined,
      
      // User Inputs
      customPrompt: customPrompt || 'Create a modern and professional wallet design',
      imageData: imageUrl,
      
      // Processing Configuration
      processingMode: 'full_customization',
      learningEnabled: true,
      qualityTarget: 'balanced',
      
      // Metadata
      requestSource: 'unified_service',
      clientVersion: '3.0'
    };
  }

  private async sendToN8N(payload: UnifiedN8NPayload): Promise<UnifiedN8NResult> {
    console.log('📡 Sending unified payload to N8N');
    
    if (!this.webhookUrl) {
      return this.getMockResult(payload.sessionId);
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': payload.sessionId,
          'X-Client-Version': payload.clientVersion
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📨 N8N Response received');
      
      return {
        success: true,
        sessionId: payload.sessionId,
        processingTime: 0, // Will be set later
        ...result
      };

    } catch (error) {
      console.error('❌ N8N webhook failed:', error);
      return this.getMockResult(payload.sessionId, error.message);
    }
  }

  private async updateCustomizationRecord(
    customizationId: string,
    result: UnifiedN8NResult,
    processingTimeMs: number
  ) {
    try {
      const { error } = await supabase
        .from('customization_results')
        .update({
          status: result.success ? 'completed' : 'failed',
          customization_data: result.generatedStyles || {},
          n8n_result: JSON.parse(JSON.stringify(result)),
          processing_time_ms: processingTimeMs,
          quality_score: result.qualityScore,
          error_details: result.error ? { error: result.error, details: result.errorDetails } : null
        })
        .eq('id', customizationId);

      if (error) {
        console.warn('⚠️ Failed to update customization record:', error);
      } else {
        console.log('✅ Updated customization record:', customizationId);
      }
    } catch (error) {
      console.warn('⚠️ Error updating customization record:', error);
    }
  }

  private getMockResult(sessionId: string, error?: string): UnifiedN8NResult {
    if (error) {
      return {
        success: false,
        sessionId,
        processingTime: 0,
        error: 'N8N service temporarily unavailable',
        errorDetails: { originalError: error }
      };
    }

    return {
      success: true,
      sessionId,
      processingTime: 5000,
      generatedStyles: {
        variables: {
          '--primary-color': '#9945FF',
          '--secondary-color': '#6B73FF',
          '--background-color': '#131313',
          '--surface-color': '#1C1C1C',
          '--text-color': '#FFFFFF',
          '--accent-color': '#00D4FF'
        },
        elements: {
          'balance-display': {
            color: 'var(--text-color)',
            fontSize: '28px',
            fontWeight: 'bold'
          },
          'send-button': {
            backgroundColor: 'var(--primary-color)',
            borderRadius: '12px',
            padding: '14px 28px'
          }
        }
      },
      aiAnalysis: {
        confidence: 0.85,
        dominantColors: ['#9945FF', '#6B73FF', '#00D4FF'],
        styleType: 'modern',
        moodProfile: 'professional'
      },
      qualityScore: 0.85
    };
  }

  async getCustomizationHistory(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('customization_results')
      .select(`
        *,
        wallet_structure_analysis(wallet_type, screen_type),
        image_analysis_cache(image_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Failed to get customization history:', error);
      return [];
    }

    return data || [];
  }

  async getAnalytics() {
    const { data, error } = await supabase
      .from('customization_results')
      .select('status, quality_score, processing_time_ms, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Failed to get analytics:', error);
      return null;
    }

    const analytics = {
      totalCustomizations: data.length,
      successRate: data.filter(r => r.status === 'completed').length / data.length,
      averageQuality: data.reduce((acc, r) => acc + (r.quality_score || 0), 0) / data.length,
      averageProcessingTime: data.reduce((acc, r) => acc + (r.processing_time_ms || 0), 0) / data.length,
      recentTrends: data.slice(0, 20)
    };

    return analytics;
  }
}

// Export singleton instance
export const unifiedN8NService = UnifiedN8NService.getInstance();