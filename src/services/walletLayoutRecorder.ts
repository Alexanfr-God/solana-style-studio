import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface WalletElement {
  type: 'logo' | 'text' | 'input' | 'button' | 'link' | 'container' | 'icon';
  name: string;
  content?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  styles?: {
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
    fontFamily?: string;
    borderRadius?: string;
    border?: string;
    opacity?: number;
  };
  properties?: {
    placeholder?: string;
    mask?: boolean;
    icon?: string;
    clickable?: boolean;
    'data-shared-element-id'?: string;
    [key: string]: any;
  };
  metadata?: {
    context?: string;
    triggeredBy?: string;
    [key: string]: any;
  };
}

export interface WalletLayoutLayer {
  id?: string;
  layer_name: string;
  layer_order: number;
  elements: WalletElement[];
  metadata?: {
    purpose?: string;
    interactionType?: 'static' | 'clickable' | 'input';
    layoutType?: 'grid' | 'list' | 'single' | 'bottom-sheet';
    sharedElementId?: string;
    context?: string;
    triggeredBy?: string;
    animation?: string;
    stylingContext?: {
      primaryColor?: string;
      spacing?: string;
      layout?: string;
    };
  };
}

export interface WalletLayout {
  screen: 'login' | 'wallet' | 'dashboard' | 'receive' | 'apps' | 'swap' | 'history' | 'buy';
  walletType: 'phantom' | 'metamask' | 'solflare';
  dimensions: { width: number; height: number };
  elements: WalletElement[];
  layers?: WalletLayoutLayer[];
  safeZone?: { x: number; y: number; width: number; height: number };
  metadata?: {
    recorded_at: string;
    version: string;
    notes?: string;
  };
}

export type ScreenType = 'login' | 'wallet' | 'receive' | 'dashboard' | 'swap' | 'apps' | 'history' | 'buy';

export class WalletLayoutRecorder {
  // Enhanced layer classification for different screens
  static classifyElementIntoLayer(element: WalletElement, screenType: string = 'login'): { layerName: string; order: number; metadata?: any } {
    if (screenType === 'wallet' || screenType === 'home') {
      return this.classifyHomeScreenElement(element);
    }
    
    if (screenType === 'receive') {
      return this.classifyReceiveScreenElement(element);
    }

    if (screenType === 'apps') {
      return this.classifyAppsScreenElement(element);
    }

    if (screenType === 'swap') {
      return this.classifySwapScreenElement(element);
    }
    
    return this.classifyLoginScreenElement(element);
  }

  // New classification for swap screen
  static classifySwapScreenElement(element: WalletElement): { layerName: string; order: number; metadata?: any } {
    const { type, name, position } = element;
    
    // Header section (0-116px height)
    if (position.y >= 0 && position.y < 116) {
      return { 
        layerName: 'Swap Header', 
        order: 1,
        metadata: {
          purpose: 'Header section for swap screen',
          interactionType: 'static',
          layoutType: 'single',
          context: 'swap-flow'
        }
      };
    }
    
    // Swap interface section (116-600px)
    if (position.y >= 116 && position.y < 600) {
      if (name.includes('pay') || name.includes('Pay')) {
        return { 
          layerName: 'Swap Pay Section', 
          order: 2,
          metadata: {
            purpose: 'Token input section for paying',
            interactionType: 'input',
            layoutType: 'single',
            context: 'swap-flow'
          }
        };
      }
      
      if (name.includes('swap') && type === 'button') {
        return { 
          layerName: 'Swap Button', 
          order: 3,
          metadata: {
            purpose: 'Main swap action button',
            interactionType: 'clickable',
            layoutType: 'single',
            context: 'swap-flow'
          }
        };
      }
      
      if (name.includes('receive') || name.includes('Receive')) {
        return { 
          layerName: 'Swap Receive Section', 
          order: 4,
          metadata: {
            purpose: 'Token output section for receiving',
            interactionType: 'input',
            layoutType: 'single',
            context: 'swap-flow'
          }
        };
      }
      
      if (name.includes('action') && type === 'button') {
        return { 
          layerName: 'Swap Action Button', 
          order: 5,
          metadata: {
            purpose: 'Primary swap execution button',
            interactionType: 'clickable',
            layoutType: 'single',
            context: 'swap-flow'
          }
        };
      }
    }
    
    // Tokens section (600px and below, before bottom nav)
    if (position.y >= 600 && position.y < 1150) {
      if (name.includes('tokens') || name.includes('Tokens')) {
        return { 
          layerName: 'Tokens Header', 
          order: 6,
          metadata: {
            purpose: 'Tokens section header',
            interactionType: 'static',
            layoutType: 'single',
            context: 'swap-flow'
          }
        };
      }
      
      if (name.includes('filter')) {
        return { 
          layerName: 'Tokens Filters', 
          order: 7,
          metadata: {
            purpose: 'Token filtering controls',
            interactionType: 'clickable',
            layoutType: 'grid',
            context: 'swap-flow'
          }
        };
      }
      
      if (name.includes('token-item')) {
        return { 
          layerName: 'Tokens List', 
          order: 8,
          metadata: {
            purpose: 'Individual token items in list',
            interactionType: 'clickable',
            layoutType: 'list',
            context: 'swap-flow'
          }
        };
      }
    }
    
    // Bottom navigation (1150px and below)
    if (position.y >= 1150) {
      return { 
        layerName: 'Bottom Navigation', 
        order: 9,
        metadata: {
          purpose: 'Main app navigation tabs',
          interactionType: 'clickable',
          layoutType: 'grid',
          context: 'swap-flow'
        }
      };
    }
    
    // Default fallback
    return { 
      layerName: 'Swap Background', 
      order: 0,
      metadata: {
        purpose: 'Background or unclassified elements',
        interactionType: 'static',
        layoutType: 'single',
        context: 'swap-flow'
      }
    };
  }

  // New classification for apps screen
  static classifyAppsScreenElement(element: WalletElement): { layerName: string; order: number; metadata?: any } {
    const { type, name, position } = element;
    
    // Header section (0-116px height)
    if (position.y >= 0 && position.y < 116) {
      return { 
        layerName: 'Apps Header', 
        order: 1,
        metadata: {
          purpose: 'Header section for apps screen',
          interactionType: 'static',
          layoutType: 'single',
          context: 'apps-flow'
        }
      };
    }
    
    // Content title and description (130-200px)
    if (position.y >= 130 && position.y < 200 && (type === 'text' || type === 'container')) {
      return { 
        layerName: 'Apps Content', 
        order: 2,
        metadata: {
          purpose: 'Main content area with collectibles title',
          interactionType: 'static',
          layoutType: 'single',
          context: 'apps-flow'
        }
      };
    }
    
    // Collectibles icons grid (200-400px)
    if (position.y >= 200 && position.y < 400 && type === 'icon') {
      return { 
        layerName: 'Collectibles Icons', 
        order: 3,
        metadata: {
          purpose: 'Grid of collectible NFT icons',
          interactionType: 'clickable',
          layoutType: 'grid',
          context: 'apps-flow',
          stylingContext: {
            layout: '4-column grid',
            spacing: 'gap-4'
          }
        }
      };
    }
    
    // Manage collectible list link (400px and below)
    if (position.y >= 400 && type === 'link') {
      return { 
        layerName: 'Action Link', 
        order: 4,
        metadata: {
          purpose: 'Management link for collectibles',
          interactionType: 'clickable',
          layoutType: 'single',
          context: 'apps-flow',
          animation: 'hover-underline'
        }
      };
    }
    
    // Bottom navigation (1150px and below)
    if (position.y >= 1150) {
      return { 
        layerName: 'Bottom Navigation', 
        order: 5,
        metadata: {
          purpose: 'Main app navigation tabs',
          interactionType: 'clickable',
          layoutType: 'grid',
          context: 'apps-flow',
          stylingContext: {
            layout: '5-column grid',
            spacing: 'grid-cols-5'
          }
        }
      };
    }
    
    // Default fallback
    return { 
      layerName: 'Apps Background', 
      order: 0,
      metadata: {
        purpose: 'Background or unclassified elements',
        interactionType: 'static',
        layoutType: 'single',
        context: 'apps-flow'
      }
    };
  }

  // New classification for receive screen
  static classifyReceiveScreenElement(element: WalletElement): { layerName: string; order: number; metadata?: any } {
    const { type, name, position } = element;
    
    // Header section (0-70px height)
    if (position.y >= 0 && position.y < 70) {
      return { 
        layerName: 'Receive Header', 
        order: 1,
        metadata: {
          purpose: 'Back navigation and screen title',
          interactionType: 'clickable',
          layoutType: 'single',
          triggeredBy: 'receive-button',
          animation: 'slide-up'
        }
      };
    }
    
    // Content title and description (70-150px)
    if (position.y >= 70 && position.y < 150 && type === 'text') {
      return { 
        layerName: 'Receive Content Header', 
        order: 2,
        metadata: {
          purpose: 'Instructions and context for receive flow',
          interactionType: 'static',
          layoutType: 'single',
          context: 'receive-flow'
        }
      };
    }
    
    // Wallet list section (150-800px)
    if (position.y >= 150 && position.y < 800) {
      return { 
        layerName: 'Receive Wallet List', 
        order: 3,
        metadata: {
          purpose: 'Account selection for receiving crypto',
          interactionType: 'clickable',
          layoutType: 'bottom-sheet',
          sharedElementId: 'walletList',
          context: 'receive-flow',
          triggeredBy: 'receive-button',
          animation: 'slide-up'
        }
      };
    }
    
    // Instructions section (800px and below)
    if (position.y >= 800) {
      return { 
        layerName: 'Receive Instructions', 
        order: 4,
        metadata: {
          purpose: 'User guidance for receive process',
          interactionType: 'static',
          layoutType: 'single',
          context: 'receive-flow'
        }
      };
    }
    
    // Default fallback
    return { 
      layerName: 'Receive Background', 
      order: 0,
      metadata: {
        purpose: 'Background or unclassified elements',
        interactionType: 'static',
        layoutType: 'bottom-sheet',
        context: 'receive-flow'
      }
    };
  }

  // Specific classification for wallet home screen
  static classifyHomeScreenElement(element: WalletElement): { layerName: string; order: number; metadata?: any } {
    const { type, name, position } = element;
    
    // Header section (0-116px height based on WalletHomeLayer.tsx)
    if (position.y >= 0 && position.y < 116) {
      return { 
        layerName: 'Header', 
        order: 1,
        metadata: {
          purpose: 'Account navigation and search',
          interactionType: 'clickable',
          layoutType: 'single'
        }
      };
    }
    
    // Balance section (116-180px approximately)
    if (position.y >= 116 && position.y < 180) {
      return { 
        layerName: 'Balance Section', 
        order: 2,
        metadata: {
          purpose: 'Display total balance and performance',
          interactionType: 'static',
          layoutType: 'single'
        }
      };
    }
    
    // Action buttons section (180-280px approximately)
    if (position.y >= 180 && position.y < 280 && type === 'button') {
      return { 
        layerName: 'Action Buttons', 
        order: 3,
        metadata: {
          purpose: 'Primary wallet actions (Send, Receive, Swap, Buy)',
          interactionType: 'clickable',
          layoutType: 'grid',
          stylingContext: {
            layout: '4-column grid',
            spacing: 'gap-3'
          }
        }
      };
    }
    
    // Action button labels
    if (position.y >= 180 && position.y < 280 && type === 'text' && 
        (name.includes('Receive') || name.includes('Send') || name.includes('Swap') || name.includes('Buy'))) {
      return { 
        layerName: 'Action Buttons', 
        order: 3,
        metadata: {
          purpose: 'Action button labels',
          interactionType: 'static',
          layoutType: 'grid'
        }
      };
    }
    
    // Asset list section (280px and below, before bottom nav)
    if (position.y >= 280 && position.y < 1150) {
      // Asset list header
      if (type === 'text' && (name.includes('Assets') || name.includes('See all'))) {
        return { 
          layerName: 'Asset List Header', 
          order: 4,
          metadata: {
            purpose: 'Asset section header and controls',
            interactionType: 'clickable',
            layoutType: 'single'
          }
        };
      }
      
      // Individual asset items
      if (type === 'container' || (type === 'text' && (name.includes('Solana') || name.includes('Ethereum') || 
          name.includes('Sui') || name.includes('Polygon') || name.includes('Bitcoin')))) {
        return { 
          layerName: 'Asset List', 
          order: 5,
          metadata: {
            purpose: 'Individual cryptocurrency assets with balances',
            interactionType: 'clickable',
            layoutType: 'list',
            stylingContext: {
              layout: 'vertical list',
              spacing: 'space-y-2'
            }
          }
        };
      }
      
      // Manage token list button
      if ((type === 'button' || type === 'text') && name.includes('Manage Token List')) {
        return { 
          layerName: 'Asset List Controls', 
          order: 6,
          metadata: {
            purpose: 'Asset management controls',
            interactionType: 'clickable',
            layoutType: 'single'
          }
        };
      }
    }
    
    // Bottom navigation (1150px and below)
    if (position.y >= 1150) {
      return { 
        layerName: 'Bottom Navigation', 
        order: 7,
        metadata: {
          purpose: 'Main app navigation tabs',
          interactionType: 'clickable',
          layoutType: 'grid',
          stylingContext: {
            layout: '5-column grid',
            spacing: 'grid-cols-5'
          }
        }
      };
    }
    
    // Default fallback
    return { 
      layerName: 'Background', 
      order: 0,
      metadata: {
        purpose: 'Background or unclassified elements',
        interactionType: 'static',
        layoutType: 'single'
      }
    };
  }

  // Original classification for login screen
  static classifyLoginScreenElement(element: WalletElement): { layerName: string; order: number; metadata?: any } {
    const { type, name, position } = element;
    
    // Header elements (top 20% of screen)
    if (position.y < 120) {
      return { 
        layerName: 'Header', 
        order: 1,
        metadata: {
          purpose: 'App branding and navigation',
          interactionType: 'static',
          layoutType: 'single'
        }
      };
    }
    
    // Main content area
    if (type === 'logo' || name.includes('logo')) {
      return { 
        layerName: 'Branding', 
        order: 2,
        metadata: {
          purpose: 'App logo and visual identity',
          interactionType: 'static',
          layoutType: 'single'
        }
      };
    }
    
    if (type === 'text' && (name.includes('title') || name.includes('heading') || name.includes('password'))) {
      return { 
        layerName: 'Content Text', 
        order: 3,
        metadata: {
          purpose: 'Instructional text and headings',
          interactionType: 'static',
          layoutType: 'single'
        }
      };
    }
    
    if (type === 'input') {
      return { 
        layerName: 'Input Fields', 
        order: 4,
        metadata: {
          purpose: 'User input areas',
          interactionType: 'input',
          layoutType: 'single'
        }
      };
    }
    
    if (type === 'button') {
      return { 
        layerName: 'Action Buttons', 
        order: 5,
        metadata: {
          purpose: 'Primary actions',
          interactionType: 'clickable',
          layoutType: 'single'
        }
      };
    }
    
    if (type === 'link') {
      return { 
        layerName: 'Navigation Links', 
        order: 6,
        metadata: {
          purpose: 'Secondary navigation',
          interactionType: 'clickable',
          layoutType: 'single'
        }
      };
    }
    
    if (type === 'icon') {
      return { 
        layerName: 'Icons', 
        order: 7,
        metadata: {
          purpose: 'Visual indicators and icons',
          interactionType: 'static',
          layoutType: 'single'
        }
      };
    }
    
    // Default container layer
    return { 
      layerName: 'Background', 
      order: 0,
      metadata: {
        purpose: 'Background containers and structure',
        interactionType: 'static',
        layoutType: 'single'
      }
    };
  }

  static segmentElementsIntoLayers(elements: WalletElement[], screenType: string = 'login'): WalletLayoutLayer[] {
    const layerMap = new Map<string, WalletLayoutLayer>();
    
    elements.forEach(element => {
      const { layerName, order, metadata } = this.classifyElementIntoLayer(element, screenType);
      
      if (!layerMap.has(layerName)) {
        layerMap.set(layerName, {
          layer_name: layerName,
          layer_order: order,
          elements: [],
          metadata
        });
      }
      
      layerMap.get(layerName)!.elements.push(element);
    });
    
    // Sort layers by order
    return Array.from(layerMap.values()).sort((a, b) => a.layer_order - b.layer_order);
  }

  static async recordCurrentLayout(walletId: string, screen: string, walletType: string = 'phantom'): Promise<WalletLayout> {
    console.log('🎯 Starting wallet layout recording...');
    
    // Handle swap screen layout
    if (screen === 'swap') {
      const swapLayout: WalletLayout = {
        screen: 'swap',
        walletType: walletType as 'phantom',
        dimensions: { width: 722, height: 1202 },
        elements: [
          {
            type: 'container',
            name: 'swap-header',
            content: '',
            position: { x: 0, y: 0 },
            size: { width: 722, height: 116 },
            styles: {
              backgroundColor: '#181818',
              borderRadius: '0'
            },
            metadata: {
              context: 'swap-flow'
            }
          },
          {
            type: 'container',
            name: 'you-pay-section',
            content: '',
            position: { x: 16, y: 130 },
            size: { width: 690, height: 120 },
            styles: {
              backgroundColor: '#ffffff0d',
              borderRadius: '12px',
              border: '1px solid #ffffff1a'
            },
            metadata: {
              context: 'swap-flow'
            }
          },
          {
            type: 'button',
            name: 'swap-tokens-button',
            content: 'Swap',
            position: { x: 356, y: 270 },
            size: { width: 40, height: 40 },
            styles: {
              backgroundColor: '#ffffff1a',
              borderRadius: '50%'
            },
            properties: {
              clickable: true
            }
          },
          {
            type: 'container',
            name: 'you-receive-section',
            content: '',
            position: { x: 16, y: 330 },
            size: { width: 690, height: 120 },
            styles: {
              backgroundColor: '#ffffff0d',
              borderRadius: '12px',
              border: '1px solid #ffffff1a'
            },
            metadata: {
              context: 'swap-flow'
            }
          },
          {
            type: 'button',
            name: 'swap-action-button',
            content: 'Swap',
            position: { x: 16, y: 470 },
            size: { width: 690, height: 48 },
            styles: {
              backgroundColor: '#9945FF',
              borderRadius: '12px'
            },
            properties: {
              clickable: true
            }
          },
          {
            type: 'text',
            name: 'tokens-title',
            content: 'Tokens',
            position: { x: 16, y: 540 },
            size: { width: 100, height: 28 },
            styles: {
              color: '#ffffff',
              fontSize: '20px',
              fontFamily: 'Inter'
            }
          }
        ],
        safeZone: { x: 16, y: 130, width: 690, height: 400 },
        metadata: {
          recorded_at: new Date().toISOString(),
          version: '2.0.0',
          notes: 'Swap layer with token exchange interface and token list'
        }
      };

      swapLayout.layers = this.segmentElementsIntoLayers(swapLayout.elements, 'swap');
      return swapLayout;
    }
    
    // Handle apps screen layout
    if (screen === 'apps') {
      const appsLayout: WalletLayout = {
        screen: 'apps',
        walletType: walletType as 'phantom',
        dimensions: { width: 722, height: 1202 },
        elements: [
          {
            type: 'container',
            name: 'apps-header',
            content: '',
            position: { x: 0, y: 0 },
            size: { width: 722, height: 116 },
            styles: {
              backgroundColor: '#181818',
              borderRadius: '0'
            },
            metadata: {
              context: 'apps-flow'
            }
          },
          {
            type: 'container',
            name: 'apps-content',
            content: '',
            position: { x: 16, y: 130 },
            size: { width: 690, height: 600 },
            styles: {
              backgroundColor: '#ffffff0d',
              borderRadius: '12px',
              border: '1px solid #ffffff1a'
            },
            metadata: {
              context: 'apps-flow'
            }
          },
          {
            type: 'text',
            name: 'collectibles-title',
            content: 'Collectibles',
            position: { x: 32, y: 160 },
            size: { width: 200, height: 32 },
            styles: {
              color: '#ffffff',
              fontSize: '24px',
              fontFamily: 'Inter'
            }
          },
          {
            type: 'icon',
            name: 'nft-icon-1',
            content: 'Art NFT',
            position: { x: 80, y: 220 },
            size: { width: 120, height: 120 },
            styles: {
              backgroundColor: '#FF6B6B',
              borderRadius: '12px'
            },
            properties: {
              clickable: true,
              'data-shared-element-id': 'nft-icon-1'
            }
          },
          {
            type: 'icon',
            name: 'nft-icon-2',
            content: 'Pixel Art',
            position: { x: 250, y: 220 },
            size: { width: 120, height: 120 },
            styles: {
              backgroundColor: '#4ECDC4',
              borderRadius: '12px'
            },
            properties: {
              clickable: true,
              'data-shared-element-id': 'nft-icon-2'
            }
          },
          {
            type: 'icon',
            name: 'nft-icon-3',
            content: 'Digital Art',
            position: { x: 420, y: 220 },
            size: { width: 120, height: 120 },
            styles: {
              backgroundColor: '#45B7D1',
              borderRadius: '12px'
            },
            properties: {
              clickable: true,
              'data-shared-element-id': 'nft-icon-3'
            }
          },
          {
            type: 'icon',
            name: 'nft-icon-4',
            content: 'Game Item',
            position: { x: 590, y: 220 },
            size: { width: 120, height: 120 },
            styles: {
              backgroundColor: '#96CEB4',
              borderRadius: '12px'
            },
            properties: {
              clickable: true,
              'data-shared-element-id': 'nft-icon-4'
            }
          },
          {
            type: 'link',
            name: 'manage-collectible-list',
            content: 'Manage collectible list',
            position: { x: 300, y: 400 },
            size: { width: 200, height: 24 },
            styles: {
              color: '#9945FF',
              fontSize: '14px',
              fontFamily: 'Inter'
            },
            properties: {
              clickable: true,
              'data-shared-element-id': 'manage-collectible-list'
            },
            metadata: {
              animation: 'hover-underline'
            }
          }
        ],
        safeZone: { x: 16, y: 130, width: 690, height: 600 },
        metadata: {
          recorded_at: new Date().toISOString(),
          version: '2.0.0',
          notes: 'Apps layer with collectibles grid and management link'
        }
      };

      appsLayout.layers = this.segmentElementsIntoLayers(appsLayout.elements, 'apps');
      return appsLayout;
    }
    
    // Handle receive screen layout
    if (screen === 'receive') {
      const receiveLayout: WalletLayout = {
        screen: 'receive',
        walletType: walletType as 'phantom',
        dimensions: { width: 722, height: 1202 },
        elements: [
          {
            type: 'container',
            name: 'receive-header',
            content: '',
            position: { x: 0, y: 0 },
            size: { width: 722, height: 70 },
            styles: {
              backgroundColor: '#181818',
              borderRadius: '0'
            },
            metadata: {
              context: 'receive-flow',
              triggeredBy: 'receive-button'
            }
          },
          {
            type: 'button',
            name: 'back-button',
            content: 'Back',
            position: { x: 16, y: 16 },
            size: { width: 80, height: 40 },
            styles: {
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'Inter'
            },
            properties: {
              clickable: true
            }
          },
          {
            type: 'text',
            name: 'receive-title',
            content: 'Receive Crypto',
            position: { x: 300, y: 25 },
            size: { width: 120, height: 24 },
            styles: {
              color: '#ffffff',
              fontSize: '18px',
              fontFamily: 'Inter'
            }
          },
          {
            type: 'icon',
            name: 'qr-code-button',
            content: 'QR',
            position: { x: 670, y: 20 },
            size: { width: 32, height: 32 },
            styles: {
              color: '#ffffff'
            },
            properties: {
              clickable: true
            }
          },
          {
            type: 'text',
            name: 'select-account-title',
            content: 'Select Account',
            position: { x: 16, y: 90 },
            size: { width: 120, height: 20 },
            styles: {
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Inter'
            }
          },
          {
            type: 'text',
            name: 'select-account-description',
            content: 'Choose which account you want to receive crypto into',
            position: { x: 16, y: 115 },
            size: { width: 400, height: 16 },
            styles: {
              color: '#9ca3af',
              fontSize: '12px',
              fontFamily: 'Inter'
            }
          },
          {
            type: 'container',
            name: 'wallet-list-container',
            content: '',
            position: { x: 16, y: 150 },
            size: { width: 690, height: 600 },
            styles: {
              backgroundColor: '#ffffff0d',
              borderRadius: '12px',
              border: '1px solid #ffffff1a'
            },
            properties: {
              'data-shared-element-id': 'walletList'
            },
            metadata: {
              sharedElementId: 'walletList',
              context: 'receive-flow',
              layoutType: 'bottom-sheet',
              triggeredBy: 'receive-button',
              animation: 'slide-up'
            }
          },
          {
            type: 'container',
            name: 'instructions-container',
            content: '',
            position: { x: 16, y: 800 },
            size: { width: 690, height: 150 },
            styles: {
              backgroundColor: '#3b82f60d',
              borderRadius: '8px',
              border: '1px solid #3b82f64d'
            }
          }
        ],
        safeZone: { x: 16, y: 70, width: 690, height: 700 },
        metadata: {
          recorded_at: new Date().toISOString(),
          version: '2.0.0',
          notes: 'Receive layer with bottom-sheet layout and shared wallet list'
        }
      };

      receiveLayout.layers = this.segmentElementsIntoLayers(receiveLayout.elements, 'receive');
      return receiveLayout;
    }
    
    // Define the current Phantom login screen layout based on the actual implementation
    const phantomLoginLayout: WalletLayout = {
      screen: screen as 'login',
      walletType: walletType as 'phantom',
      dimensions: { width: 722, height: 1202 },
      elements: [
        {
          type: 'container',
          name: 'header-bar',
          content: '',
          position: { x: 0, y: 0 },
          size: { width: 722, height: 116 },
          styles: {
            backgroundColor: '#1a1a1a',
            borderRadius: '16px 16px 0 0'
          }
        },
        {
          type: 'text',
          name: 'app-title',
          content: 'phantom',
          position: { x: 300, y: 40 },
          size: { width: 120, height: 36 },
          styles: {
            color: '#ffffff',
            fontSize: '32px',
            fontFamily: 'Inter'
          }
        },
        {
          type: 'icon',
          name: 'help-icon',
          content: 'help',
          position: { x: 650, y: 40 },
          size: { width: 40, height: 40 },
          styles: {
            color: '#ffffff70'
          }
        },
        {
          type: 'container',
          name: 'main-section',
          content: '',
          position: { x: 0, y: 118 },
          size: { width: 722, height: 1084 },
          styles: {
            backgroundColor: '#181818',
            borderRadius: '0 0 16px 16px'
          }
        },
        {
          type: 'logo',
          name: 'phantom-logo',
          content: '👻',
          position: { x: 297, y: 280 },
          size: { width: 128, height: 128 },
          styles: {
            backgroundColor: '#9945FF',
            borderRadius: '50%',
            fontSize: '48px'
          }
        },
        {
          type: 'text',
          name: 'password-title',
          content: 'Enter your password',
          position: { x: 261, y: 480 },
          size: { width: 200, height: 40 },
          styles: {
            color: '#ffffff',
            fontSize: '40px',
            fontFamily: 'Inter'
          }
        },
        {
          type: 'input',
          name: 'password-input',
          content: '',
          position: { x: 161, y: 560 },
          size: { width: 400, height: 60 },
          styles: {
            backgroundColor: '#0f0f0f',
            color: '#ffffff',
            borderRadius: '24px',
            fontSize: '16px',
            fontFamily: 'Inter'
          },
          properties: {
            placeholder: 'Password',
            mask: true,
            icon: 'eye'
          }
        },
        {
          type: 'link',
          name: 'forgot-password',
          content: 'Forgot password?',
          position: { x: 286, y: 660 },
          size: { width: 150, height: 28 },
          styles: {
            color: '#9ca3af',
            fontSize: '28px',
            fontFamily: 'Inter'
          },
          properties: {
            clickable: true
          }
        },
        {
          type: 'button',
          name: 'unlock-button',
          content: 'Unlock',
          position: { x: 161, y: 740 },
          size: { width: 400, height: 60 },
          styles: {
            backgroundColor: '#a390f5',
            color: '#ffffff',
            borderRadius: '24px',
            fontSize: '16px',
            fontFamily: 'Inter'
          },
          properties: {
            clickable: true
          }
        }
      ],
      safeZone: { x: 161, y: 260, width: 400, height: 500 },
      metadata: {
        recorded_at: new Date().toISOString(),
        version: '2.0.0',
        notes: 'Enhanced Phantom login screen recording with improved layer classification'
      }
    };

    // Segment elements into layers with improved classification
    phantomLoginLayout.layers = this.segmentElementsIntoLayers(phantomLoginLayout.elements, screen);
    
    return phantomLoginLayout;
  }

  static async saveLayoutToDatabase(walletId: string, layout: WalletLayout): Promise<string | null> {
    try {
      console.log('💾 Saving layout to database...');
      
      // Save the main layout
      const { data: layoutData, error: layoutError } = await supabase
        .from('wallet_layouts')
        .insert({
          wallet_id: walletId,
          screen: layout.screen,
          wallet_type: layout.walletType,
          layout_data: layout as any,
          dimensions: layout.dimensions as any
        })
        .select('id')
        .single();

      if (layoutError) {
        console.error('❌ Database save error:', layoutError);
        return null;
      }

      const layoutId = layoutData.id;
      
      // Save the layers if they exist
      if (layout.layers && layout.layers.length > 0) {
        const layerInserts = layout.layers.map(layer => ({
          wallet_layout_id: layoutId,
          layer_name: layer.layer_name,
          layer_order: layer.layer_order,
          elements: layer.elements as any,
          metadata: layer.metadata as any
        }));

        const { error: layersError } = await supabase
          .from('wallet_layout_layers')
          .insert(layerInserts);

        if (layersError) {
          console.error('❌ Layers save error:', layersError);
          // Continue anyway - main layout was saved
        } else {
          console.log('✅ Enhanced layers saved successfully');
        }
      }

      console.log('✅ Layout saved successfully:', layoutId);
      return layoutId;
    } catch (error) {
      console.error('💥 Save layout error:', error);
      return null;
    }
  }

  static async getLayoutFromDatabase(walletId: string, screen: string): Promise<WalletLayout | null> {
    try {
      // Get the main layout
      const { data: layoutData, error: layoutError } = await supabase
        .from('wallet_layouts')
        .select('*')
        .eq('wallet_id', walletId)
        .eq('screen', screen)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (layoutError) {
        console.error('❌ Database fetch error:', layoutError);
        return null;
      }

      if (!layoutData) {
        return null;
      }

      const layout = layoutData.layout_data as unknown as WalletLayout;

      // Get the layers with enhanced metadata
      const { data: layersData, error: layersError } = await supabase
        .from('wallet_layout_layers')
        .select('*')
        .eq('wallet_layout_id', layoutData.id)
        .order('layer_order', { ascending: true });

      if (!layersError && layersData) {
        layout.layers = layersData.map(layer => ({
          id: layer.id,
          layer_name: layer.layer_name,
          layer_order: layer.layer_order,
          elements: layer.elements as unknown as WalletElement[],
          metadata: layer.metadata as unknown as WalletLayoutLayer["metadata"]
        }));
      }

      return layout;
    } catch (error) {
      console.error('💥 Fetch layout error:', error);
      return null;
    }
  }

  static async exportLayerToJSON(layoutId: string, layerName: string): Promise<WalletLayoutLayer | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_layout_layers')
        .select('*')
        .eq('wallet_layout_id', layoutId)
        .eq('layer_name', layerName)
        .single();

      if (error || !data) {
        console.error('❌ Layer export error:', error);
        return null;
      }

      return {
        id: data.id,
        layer_name: data.layer_name,
        layer_order: data.layer_order,
        elements: data.elements as unknown as WalletElement[],
        metadata: data.metadata as unknown as WalletLayoutLayer["metadata"]
      };
    } catch (error) {
      console.error('💥 Export layer error:', error);
      return null;
    }
  }

  static async exportAllLayersToJSON(layoutId: string): Promise<WalletLayoutLayer[] | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_layout_layers')
        .select('*')
        .eq('wallet_layout_id', layoutId)
        .order('layer_order', { ascending: true });

      if (error) {
        console.error('❌ All layers export error:', error);
        return null;
      }

      return data.map(layer => ({
        id: layer.id,
        layer_name: layer.layer_name,
        layer_order: layer.layer_order,
        elements: layer.elements as unknown as WalletElement[],
        metadata: layer.metadata as unknown as WalletLayoutLayer["metadata"]
      }));
    } catch (error) {
      console.error('💥 Export all layers error:', error);
      return null;
    }
  }

  static async recordAndSaveLayout(walletId: string, screen: string, walletType: string = 'phantom'): Promise<string | null> {
    const layout = await this.recordCurrentLayout(walletId, screen, walletType);
    const layoutId = await this.saveLayoutToDatabase(walletId, layout);
    return layoutId;
  }

  static generateElementId(element: WalletElement): string {
    return `${element.type}-${element.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  static findElementByPosition(layout: WalletLayout, x: number, y: number): WalletElement | null {
    return layout.elements.find(element => {
      const { position, size } = element;
      return x >= position.x && x <= position.x + size.width &&
             y >= position.y && y <= position.y + size.height;
    }) || null;
  }
}
