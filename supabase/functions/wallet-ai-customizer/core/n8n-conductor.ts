// Utility logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [N8NConductor::${component}] [${level}] ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

export class N8NConductor {
  private n8nWebhookUrl: string;
  private timeout = 120000; // 2 minutes
  
  constructor() {
    this.n8nWebhookUrl = 'https://wacocu.app.n8n.cloud/webhook/wallet-customizer';
    log('Constructor', 'INFO', 'N8NConductor initialized', { 
      hasWebhookUrl: !!this.n8nWebhookUrl 
    });
  }
  
  async triggerCustomization(payload: {
    sessionId: string;
    walletStructure: any;
    imageData: string;
    customPrompt: string;
    walletId: string;
  }) {
    log('TriggerCustomization', 'INFO', 'Starting N8N customization process', {
      sessionId: payload.sessionId,
      walletId: payload.walletId,
      hasImage: !!payload.imageData,
      promptLength: payload.customPrompt.length
    });
    
    const startTime = Date.now();
    
    try {
      // Prepare N8N payload
      const n8nPayload = {
        // Session info
        sessionId: payload.sessionId,
        timestamp: new Date().toISOString(),
        
        // Wallet data
        walletStructure: payload.walletStructure,
        walletId: payload.walletId,
        
        // User inputs
        imageData: payload.imageData,
        customPrompt: payload.customPrompt || 'Create a modern and professional wallet design',
        
        // Processing metadata
        processingMode: 'full_customization',
        learningEnabled: true,
        
        // Request metadata
        requestSource: 'edge_function',
        userAgent: 'wallet-ai-customizer/1.0'
      };
      
      log('TriggerCustomization', 'INFO', 'Sending payload to N8N', {
        sessionId: payload.sessionId,
        payloadSize: JSON.stringify(n8nPayload).length,
        webhookUrl: this.n8nWebhookUrl,
        imageDataSize: payload.imageData?.length || 0,
        walletElementsCount: payload.walletStructure?.metadata?.totalCustomizableElements || 0
      });

      console.log('🚀 SENDING TO N8N:', this.n8nWebhookUrl);
      console.log('📦 PAYLOAD PREVIEW:', {
        sessionId: n8nPayload.sessionId,
        walletType: n8nPayload.walletId, 
        hasImage: !!n8nPayload.imageData,
        imageSize: n8nPayload.imageData?.length || 0,
        prompt: n8nPayload.customPrompt
      });
      
      // Check webhook URL
      if (!this.n8nWebhookUrl) {
        log('TriggerCustomization', 'WARN', 'N8N webhook URL not configured, using mock response');
        return this.getMockResponse(payload.sessionId);
      }
      
      // Send to N8N
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': payload.sessionId
        },
        body: JSON.stringify(n8nPayload),
        signal: AbortSignal.timeout(this.timeout)
      });

      console.log('📡 N8N RESPONSE STATUS:', response.status);
      console.log('📡 N8N RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();

      console.log('📨 N8N RESPONSE DATA:', result);
      
      log('TriggerCustomization', 'INFO', 'N8N customization completed', {
        sessionId: payload.sessionId,
        duration: `${duration}ms`,
        success: result.success
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('TriggerCustomization', 'ERROR', 'N8N customization failed', {
        sessionId: payload.sessionId,
        duration: `${duration}ms`,
        error: error.message
      });
      
      // Return fallback response
      return this.getFallbackResponse(payload.sessionId, error.message);
    }
  }
  
  private getMockResponse(sessionId: string) {
    log('MockResponse', 'INFO', 'Generating mock customization response');
    
    return {
      success: true,
      sessionId,
      processingTime: 5000,
      result: {
        themeId: `theme_${sessionId.slice(-8)}`,
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
            },
            'receive-button': {
              backgroundColor: 'var(--secondary-color)',
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
        }
      },
      metadata: {
        processedAt: new Date().toISOString(),
        n8nWorkflowId: 'mock_workflow',
        aiAgentsUsed: ['image_analyzer', 'wallet_analyzer', 'style_generator']
      }
    };
  }
  
  private getFallbackResponse(sessionId: string, error: string) {
    log('FallbackResponse', 'WARN', 'Generating fallback response due to error');
    
    return {
      success: false,
      sessionId,
      error: 'N8N customization temporarily unavailable',
      details: error,
      fallbackResult: {
        themeId: `fallback_${sessionId.slice(-8)}`,
        generatedStyles: {
          variables: {
            '--primary-color': '#9945FF',
            '--background-color': '#131313',
            '--text-color': '#FFFFFF'
          },
          elements: {}
        }
      }
    };
  }
  
  async testConnection() {
    log('TestConnection', 'INFO', 'Testing N8N webhook connection');
    
    if (!this.n8nWebhookUrl) {
      return {
        connected: false,
        error: 'Webhook URL not configured'
      };
    }
    
    try {
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      return {
        connected: response.ok,
        status: response.status,
        statusText: response.statusText
      };
      
    } catch (error) {
      log('TestConnection', 'ERROR', 'Connection test failed', { error: error.message });
      return {
        connected: false,
        error: error.message
      };
    }
  }
}
