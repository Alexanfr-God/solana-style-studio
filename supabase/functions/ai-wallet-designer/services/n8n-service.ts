
export class N8NService {
  private webhookUrl: string;
  private apiKey: string;

  constructor() {
    this.webhookUrl = Deno.env.get('N8N_WEBHOOK_URL') || '';
    this.apiKey = Deno.env.get('N8N_API_KEY') || '';
    console.log('🔗 N8NService initialized');
  }

  async triggerWorkflow(workflowName: string, data: any): Promise<any> {
    console.log('🚀 Triggering N8N workflow:', workflowName);
    
    if (!this.webhookUrl) {
      console.warn('⚠️ N8N webhook URL not configured');
      return { success: false, error: 'N8N not configured' };
    }

    try {
      const response = await fetch(`${this.webhookUrl}/${workflowName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          source: 'ai-wallet-designer',
          data
        })
      });

      if (!response.ok) {
        throw new Error(`N8N workflow failed: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('❌ N8N service error:', error);
      return { success: false, error: error.message };
    }
  }

  async notifyDesignGenerated(designData: any): Promise<void> {
    await this.triggerWorkflow('design-generated', {
      type: 'design_notification',
      designId: designData.themeId,
      walletType: designData.walletType,
      timestamp: new Date().toISOString()
    });
  }

  async logAnalysisComplete(analysisData: any): Promise<void> {
    await this.triggerWorkflow('analysis-complete', {
      type: 'analysis_log',
      analysisId: analysisData.analysisId,
      confidence: analysisData.confidence,
      timestamp: new Date().toISOString()
    });
  }
}

export const n8nService = new N8NService();
