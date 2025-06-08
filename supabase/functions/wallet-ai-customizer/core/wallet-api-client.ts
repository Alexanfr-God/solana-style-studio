
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
      // FIXED: Using the correct API endpoint
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
        const errorText = await response.text();
        log('GetStructure', 'ERROR', `API request failed: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Wallet API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // ENHANCED: Detailed logging of received data
      log('GetStructure', 'INFO', 'Raw API response received', {
        walletId,
        duration: `${duration}ms`,
        responseSize: JSON.stringify(data).length,
        hasMetadata: !!data.metadata,
        hasScreens: !!data.screens,
        hasElements: !!data.elements
      });
      
      // ENHANCED: Detailed structure analysis
      if (data.screens && Array.isArray(data.screens)) {
        data.screens.forEach((screen: any, index: number) => {
          log('GetStructure', 'DEBUG', `Screen ${index} analysis`, {
            screenId: screen.screenId,
            elementCount: screen.elements ? Object.keys(screen.elements).length : 0,
            priority: screen.priority,
            hasNavigation: !!screen.navigation
          });
          
          if (screen.elements) {
            Object.entries(screen.elements).forEach(([elementId, element]: [string, any]) => {
              log('GetStructure', 'DEBUG', `Element analysis: ${elementId}`, {
                type: element.elementType,
                customizable: element.customizable,
                hasAiInstructions: !!element.aiInstructions,
                priority: element.aiInstructions?.priority,
                styleAgent: element.aiInstructions?.styleAgent
              });
            });
          }
        });
      }
      
      // ENHANCED: WalletPreviewContainer specific handling
      const processedData = this.processWalletStructure(data, walletId);
      
      log('GetStructure', 'INFO', 'Wallet structure processed successfully', {
        walletId,
        duration: `${duration}ms`,
        totalElements: processedData.metadata?.totalCustomizableElements || 0,
        totalScreens: processedData.metadata?.totalScreens || 0,
        customizableElements: this.countCustomizableElements(processedData)
      });
      
      return processedData;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      log('GetStructure', 'ERROR', 'Failed to fetch wallet structure', {
        walletId,
        duration: `${duration}ms`,
        error: error.message,
        stack: error.stack
      });
      
      // Return fallback structure with enhanced logging
      log('GetStructure', 'WARN', 'Falling back to default structure');
      return this.getFallbackStructure(walletId);
    }
  }
  
  // NEW: Process wallet structure for WalletPreviewContainer compatibility
  private processWalletStructure(data: any, walletId: string) {
    log('ProcessStructure', 'INFO', 'Processing wallet structure for compatibility');
    
    // Ensure structure matches expected format
    const processedData = {
      ...data,
      metadata: {
        ...data.metadata,
        walletType: walletId,
        processingTimestamp: new Date().toISOString()
      }
    };
    
    // Process screens for WalletPreviewContainer
    if (processedData.screens) {
      processedData.screens = processedData.screens.map((screen: any) => ({
        ...screen,
        // Ensure all required properties exist
        elements: screen.elements || {},
        navigation: screen.navigation || { type: 'tab' },
        state: screen.state || { isDefault: screen.screenId === 'home' }
      }));
    }
    
    log('ProcessStructure', 'DEBUG', 'Structure processing completed', {
      screenCount: processedData.screens?.length || 0,
      elementCount: this.countTotalElements(processedData)
    });
    
    return processedData;
  }
  
  // NEW: Count customizable elements
  private countCustomizableElements(structure: any): number {
    let count = 0;
    if (structure.screens) {
      structure.screens.forEach((screen: any) => {
        if (screen.elements) {
          Object.values(screen.elements).forEach((element: any) => {
            if (element.customizable) count++;
          });
        }
      });
    }
    return count;
  }
  
  // NEW: Count total elements
  private countTotalElements(structure: any): number {
    let count = 0;
    if (structure.screens) {
      structure.screens.forEach((screen: any) => {
        if (screen.elements) {
          count += Object.keys(screen.elements).length;
        }
      });
    }
    return count;
  }
  
  async validateWalletElements(structure: any) {
    log('ValidateElements', 'INFO', 'Validating wallet elements');
    
    try {
      const validation = {
        valid: true,
        totalElements: 0,
        customizableElements: 0,
        criticalElements: [],
        issues: [],
        warnings: []
      };
      
      if (!structure.screens || !Array.isArray(structure.screens)) {
        validation.valid = false;
        validation.issues.push('Missing or invalid screens array');
        log('ValidateElements', 'ERROR', 'Invalid structure: missing screens');
        return validation;
      }
      
      // Enhanced validation with detailed logging
      structure.screens.forEach((screen: any, screenIndex: number) => {
        log('ValidateElements', 'DEBUG', `Validating screen ${screenIndex}`, {
          screenId: screen.screenId,
          hasElements: !!screen.elements
        });
        
        if (screen.elements) {
          const elementCount = Object.keys(screen.elements).length;
          validation.totalElements += elementCount;
          
          Object.entries(screen.elements).forEach(([elementId, element]: [string, any]) => {
            if (element.customizable) {
              validation.customizableElements++;
            }
            if (element.aiInstructions?.priority === 'HIGH' || element.aiInstructions?.priority === 'CRITICAL') {
              validation.criticalElements.push(elementId);
            }
            
            // Additional validation checks
            if (!element.elementType) {
              validation.warnings.push(`Element ${elementId} missing elementType`);
            }
            if (!element.currentStyles) {
              validation.warnings.push(`Element ${elementId} missing currentStyles`);
            }
          });
        }
      });
      
      log('ValidateElements', 'INFO', 'Validation completed', {
        ...validation,
        criticalElementCount: validation.criticalElements.length,
        warningCount: validation.warnings.length
      });
      
      return validation;
      
    } catch (error) {
      log('ValidateElements', 'ERROR', 'Validation failed', { 
        error: error.message,
        stack: error.stack 
      });
      return {
        valid: false,
        error: error.message,
        totalElements: 0,
        customizableElements: 0,
        criticalElements: [],
        issues: [`Validation error: ${error.message}`]
      };
    }
  }
  
  // NEW: Get elements by priority
  getElementsByPriority(structure: any, priority: string) {
    const elements: string[] = [];
    
    if (structure.screens) {
      structure.screens.forEach((screen: any) => {
        if (screen.elements) {
          Object.entries(screen.elements).forEach(([elementId, element]: [string, any]) => {
            if (element.aiInstructions?.priority === priority) {
              elements.push(elementId);
            }
          });
        }
      });
    }
    
    log('GetElementsByPriority', 'DEBUG', `Found ${elements.length} elements with priority ${priority}`, {
      priority,
      elements
    });
    
    return elements;
  }
  
  // NEW: Get customizable elements by type
  getCustomizableElementsByType(structure: any, elementType: string) {
    const elements: string[] = [];
    
    if (structure.screens) {
      structure.screens.forEach((screen: any) => {
        if (screen.elements) {
          Object.entries(screen.elements).forEach(([elementId, element]: [string, any]) => {
            if (element.customizable && element.elementType === elementType) {
              elements.push(elementId);
            }
          });
        }
      });
    }
    
    log('GetCustomizableByType', 'DEBUG', `Found ${elements.length} customizable ${elementType} elements`, {
      elementType,
      elements
    });
    
    return elements;
  }
  
  private getFallbackStructure(walletId: string) {
    log('FallbackStructure', 'WARN', 'Using enhanced fallback wallet structure');
    
    return {
      metadata: {
        walletType: walletId,
        version: '1.0.0',
        totalScreens: 1,
        totalCustomizableElements: 5,
        lastUpdated: new Date().toISOString(),
        processingTimestamp: new Date().toISOString(),
        fallback: true
      },
      screens: [
        {
          screenId: 'home',
          description: 'Main wallet screen',
          priority: 'HIGH',
          navigation: { type: 'tab' },
          state: { isDefault: true },
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
