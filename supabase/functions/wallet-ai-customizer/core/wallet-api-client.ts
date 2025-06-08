// Utility logging
function log(component: string, level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [WalletAPI::${component}] [${level}] ${message}`, 
    data ? JSON.stringify(data, null, 2) : '');
}

export class WalletAPIClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = Deno.env.get('SUPABASE_URL') || '';
    log('Constructor', 'INFO', 'WalletAPIClient initialized', { baseUrl: this.baseUrl });
  }
  
  async getWalletStructure(walletId: string) {
    log('GetStructure', 'INFO', `Fetching wallet structure for: ${walletId}`);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/functions/v1/wallet-customization-structure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({ walletType: walletId })
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`Wallet API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      log('GetStructure', 'INFO', 'Wallet structure fetched successfully', {
        walletId,
        duration: `${duration}ms`,
        totalElements: data.metadata?.totalCustomizableElements || 0,
        totalScreens: data.metadata?.totalScreens || 0
      });
      
      return data;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('GetStructure', 'ERROR', 'Failed to fetch wallet structure', {
        walletId,
        duration: `${duration}ms`,
        error: error.message
      });
      
      // Return fallback structure
      return this.getFallbackStructure(walletId);
    }
  }
  
  async validateWalletElements(structure: any) {
    log('ValidateElements', 'INFO', 'Validating wallet elements');
    
    try {
      const validation = {
        valid: true,
        totalElements: 0,
        customizableElements: 0,
        criticalElements: [],
        issues: []
      };
      
      if (!structure.screens || !Array.isArray(structure.screens)) {
        validation.valid = false;
        validation.issues.push('Missing or invalid screens array');
        return validation;
      }
      
      // Count elements
      structure.screens.forEach((screen: any) => {
        if (screen.elements) {
          const elementCount = Object.keys(screen.elements).length;
          validation.totalElements += elementCount;
          
          Object.entries(screen.elements).forEach(([elementId, element]: [string, any]) => {
            if (element.customizable) {
              validation.customizableElements++;
            }
            if (element.aiInstructions?.priority === 'HIGH') {
              validation.criticalElements.push(elementId);
            }
          });
        }
      });
      
      log('ValidateElements', 'INFO', 'Validation completed', validation);
      return validation;
      
    } catch (error) {
      log('ValidateElements', 'ERROR', 'Validation failed', { error: error.message });
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  private getFallbackStructure(walletId: string) {
    log('FallbackStructure', 'WARN', 'Using fallback wallet structure');
    
    return {
      metadata: {
        walletType: walletId,
        version: '1.0.0',
        totalScreens: 1,
        totalCustomizableElements: 5,
        lastUpdated: new Date().toISOString()
      },
      screens: [
        {
          screenId: 'home',
          description: 'Main wallet screen',
          priority: 'HIGH',
          elements: {
            'balance-display': {
              elementType: 'text',
              currentStyles: {
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: 'bold'
              },
              customizable: true,
              aiInstructions: {
                styleAgent: 'balance-text',
                priority: 'HIGH'
              }
            },
            'send-button': {
              elementType: 'button',
              currentStyles: {
                backgroundColor: '#9945FF',
                borderRadius: '8px',
                padding: '12px 24px'
              },
              customizable: true,
              aiInstructions: {
                styleAgent: 'action-button',
                priority: 'HIGH'
              }
            },
            'receive-button': {
              elementType: 'button',
              currentStyles: {
                backgroundColor: '#6B73FF',
                borderRadius: '8px',
                padding: '12px 24px'
              },
              customizable: true,
              aiInstructions: {
                styleAgent: 'action-button',
                priority: 'HIGH'
              }
            },
            'background-container': {
              elementType: 'container',
              currentStyles: {
                backgroundColor: '#131313',
                borderRadius: '12px'
              },
              customizable: true,
              aiInstructions: {
                styleAgent: 'background',
                priority: 'MEDIUM'
              }
            },
            'navigation-menu': {
              elementType: 'navigation',
              currentStyles: {
                backgroundColor: '#1C1C1C',
                borderTop: '1px solid #333'
              },
              customizable: true,
              aiInstructions: {
                styleAgent: 'navigation',
                priority: 'MEDIUM'
              }
            }
          }
        }
      ],
      elements: []
    };
  }
}
