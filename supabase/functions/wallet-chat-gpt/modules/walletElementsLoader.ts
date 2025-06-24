
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Fallback данные из локального реестра
const FALLBACK_WALLET_ELEMENTS = [
  { id: 'header-container', name: 'Header Container', category: 'Header', description: 'Main header section', selector: '.wallet-header', customizable: true },
  { id: 'balance-container', name: 'Balance Container', category: 'Balance', description: 'Main balance display area', selector: '.balance-container', customizable: true },
  { id: 'send-button', name: 'Send Button', category: 'Actions', description: 'Send crypto button', selector: '.send-btn', customizable: true },
  { id: 'receive-button', name: 'Receive Button', category: 'Actions', description: 'Receive crypto button', selector: '.receive-btn', customizable: true },
  { id: 'swap-button', name: 'Swap Button', category: 'Actions', description: 'Swap tokens button', selector: '.swap-btn', customizable: true },
  { id: 'buy-button', name: 'Buy Button', category: 'Actions', description: 'Buy crypto button', selector: '.buy-btn', customizable: true },
  { id: 'bottom-navigation', name: 'Bottom Navigation', category: 'Navigation', description: 'Bottom navigation bar', selector: '.bottom-nav', customizable: true },
  { id: 'assets-list', name: 'Assets List', category: 'Content', description: 'List of user assets/tokens', selector: '.assets-list', customizable: true },
  { id: 'transaction-history', name: 'Transaction History', category: 'Content', description: 'Recent transactions list', selector: '.transaction-history', customizable: true },
  { id: 'main-background', name: 'Main Background', category: 'Background', description: 'Main application background', selector: '.main-bg', customizable: true }
];

export interface WalletElementData {
  id: string;
  element_name: string;
  element_type: string;
  wallet_type: string;
  screen_type: string;
  position: any;
  properties: any;
  is_interactive: boolean;
  safe_zone?: any;
}

export interface WalletInstanceData {
  id: string;
  instance_name: string;
  wallet_type: string;
  structure_data: any;
  is_active: boolean;
}

export async function loadWalletElements(supabase: any, walletType: string = 'phantom'): Promise<{
  elements: WalletElementData[];
  instances: WalletInstanceData[];
  success: boolean;
  fallbackUsed: boolean;
}> {
  try {
    console.log(`🔍 Loading wallet elements for type: ${walletType}`);

    // Загружаем элементы из базы данных
    const { data: elements, error: elementsError } = await supabase
      .from('wallet_element_registry')
      .select('*')
      .eq('wallet_type', walletType);

    if (elementsError) {
      console.error('❌ Error loading wallet elements:', elementsError);
      return {
        elements: FALLBACK_WALLET_ELEMENTS as any,
        instances: [],
        success: false,
        fallbackUsed: true
      };
    }

    // Загружаем экземпляры кошельков
    const { data: instances, error: instancesError } = await supabase
      .from('wallet_instances')
      .select('*')
      .eq('wallet_type', walletType)
      .eq('is_active', true);

    if (instancesError) {
      console.warn('⚠️ Error loading wallet instances:', instancesError);
    }

    // Проверяем, есть ли данные
    if (!elements || elements.length === 0) {
      console.warn('⚠️ No elements found in database, using fallback');
      return {
        elements: FALLBACK_WALLET_ELEMENTS as any,
        instances: instances || [],
        success: true,
        fallbackUsed: true
      };
    }

    console.log(`✅ Loaded ${elements.length} wallet elements from database`);
    return {
      elements,
      instances: instances || [],
      success: true,
      fallbackUsed: false
    };

  } catch (error) {
    console.error('💥 Unexpected error loading wallet elements:', error);
    return {
      elements: FALLBACK_WALLET_ELEMENTS as any,
      instances: [],
      success: false,
      fallbackUsed: true
    };
  }
}

export function formatElementsForGPT(elements: WalletElementData[], instances: WalletInstanceData[]): string {
  const elementsByCategory = elements.reduce((acc, element) => {
    const category = element.properties?.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(element);
    return acc;
  }, {} as Record<string, WalletElementData[]>);

  let formatted = `WALLET STRUCTURE ANALYSIS:\n\n`;
  
  // Добавляем информацию об экземплярах
  if (instances.length > 0) {
    formatted += `WALLET INSTANCES:\n`;
    instances.forEach(instance => {
      formatted += `- ${instance.instance_name} (${instance.wallet_type})\n`;
      if (instance.structure_data?.features) {
        const features = Object.entries(instance.structure_data.features)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => key)
          .join(', ');
        formatted += `  Features: ${features}\n`;
      }
    });
    formatted += `\n`;
  }

  // Добавляем элементы по категориям
  formatted += `ELEMENTS BY CATEGORY:\n`;
  Object.entries(elementsByCategory).forEach(([category, categoryElements]) => {
    formatted += `\n${category.toUpperCase()} (${categoryElements.length} elements):\n`;
    categoryElements.forEach(element => {
      const selector = element.position?.selector || 'N/A';
      const description = element.properties?.description || 'No description';
      const customizable = element.properties?.customizable ? '✓' : '✗';
      const interactive = element.is_interactive ? '🖱️' : '📄';
      
      formatted += `  ${interactive} ${element.element_name} [${selector}] - ${description} (Customizable: ${customizable})\n`;
    });
  });

  formatted += `\nTOTAL ELEMENTS: ${elements.length}\n`;
  formatted += `INTERACTIVE ELEMENTS: ${elements.filter(e => e.is_interactive).length}\n`;
  formatted += `CUSTOMIZABLE ELEMENTS: ${elements.filter(e => e.properties?.customizable).length}\n`;

  return formatted;
}
