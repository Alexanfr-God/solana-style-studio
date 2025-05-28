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
  };
}

export interface WalletLayoutLayer {
  id?: string;
  layer_name: string;
  layer_order: number;
  elements: WalletElement[];
}

export interface WalletLayout {
  screen: 'login' | 'wallet' | 'dashboard';
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

export class WalletLayoutRecorder {
  // Layer classification logic
  static classifyElementIntoLayer(element: WalletElement): { layerName: string; order: number } {
    const { type, name, position } = element;
    
    // Header elements (top 20% of screen)
    if (position.y < 120) {
      return { layerName: 'Header', order: 1 };
    }
    
    // Main content area
    if (type === 'logo' || name.includes('logo')) {
      return { layerName: 'Branding', order: 2 };
    }
    
    if (type === 'text' && (name.includes('title') || name.includes('heading'))) {
      return { layerName: 'Content Text', order: 3 };
    }
    
    if (type === 'input') {
      return { layerName: 'Input Fields', order: 4 };
    }
    
    if (type === 'button') {
      return { layerName: 'Action Buttons', order: 5 };
    }
    
    if (type === 'link') {
      return { layerName: 'Navigation Links', order: 6 };
    }
    
    if (type === 'icon') {
      return { layerName: 'Icons', order: 7 };
    }
    
    // Default container layer
    return { layerName: 'Background', order: 0 };
  }

  static segmentElementsIntoLayers(elements: WalletElement[]): WalletLayoutLayer[] {
    const layerMap = new Map<string, WalletLayoutLayer>();
    
    elements.forEach(element => {
      const { layerName, order } = this.classifyElementIntoLayer(element);
      
      if (!layerMap.has(layerName)) {
        layerMap.set(layerName, {
          layer_name: layerName,
          layer_order: order,
          elements: []
        });
      }
      
      layerMap.get(layerName)!.elements.push(element);
    });
    
    // Sort layers by order
    return Array.from(layerMap.values()).sort((a, b) => a.layer_order - b.layer_order);
  }

  static async recordCurrentLayout(walletId: string, screen: string, walletType: string = 'phantom'): Promise<WalletLayout> {
    console.log('🎯 Starting wallet layout recording...');
    
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
        version: '1.0.0',
        notes: 'Initial Phantom login screen recording with layer support'
      }
    };

    // Segment elements into layers
    phantomLoginLayout.layers = this.segmentElementsIntoLayers(phantomLoginLayout.elements);
    
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
          elements: layer.elements as any
        }));

        const { error: layersError } = await supabase
          .from('wallet_layout_layers')
          .insert(layerInserts);

        if (layersError) {
          console.error('❌ Layers save error:', layersError);
          // Continue anyway - main layout was saved
        } else {
          console.log('✅ Layers saved successfully');
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

      // Get the layers
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
          elements: layer.elements as WalletElement[]
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
        elements: data.elements as WalletElement[]
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
        elements: layer.elements as WalletElement[]
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
