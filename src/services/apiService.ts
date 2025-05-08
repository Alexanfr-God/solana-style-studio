
import { LayerType, WalletStyle } from '../stores/customizationStore';

export async function generateStyle(prompt: string, image: string | null, layer: LayerType): Promise<WalletStyle> {
  try {
    // This is a mock implementation
    console.log(`Generating style for ${layer} with prompt: ${prompt}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock style based on the layer and prompt
        const mockStyle: WalletStyle = {
          backgroundColor: layer === 'login' ? '#1A103D' : '#0E1C36',
          backgroundImage: image ? `url(${image})` : undefined,
          accentColor: layer === 'login' ? '#9945FF' : '#14F195',
          textColor: '#FFFFFF',
          buttonColor: layer === 'login' ? '#9945FF' : '#14F195',
          buttonTextColor: '#FFFFFF',
          borderRadius: '12px',
          fontFamily: 'Inter, sans-serif',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
        };
        
        // Add some variation based on prompt words
        if (prompt.includes('rounded') || prompt.includes('soft')) {
          mockStyle.borderRadius = '24px';
        }
        
        if (prompt.includes('sharp') || prompt.includes('angular')) {
          mockStyle.borderRadius = '4px';
        }
        
        if (prompt.includes('dark') || prompt.includes('black')) {
          mockStyle.backgroundColor = '#0A0A0A';
        }
        
        if (prompt.includes('light') || prompt.includes('white')) {
          mockStyle.backgroundColor = '#F0F0F0';
          mockStyle.textColor = '#121212';
        }
        
        if (prompt.includes('blue')) {
          mockStyle.accentColor = '#3B82F6';
          mockStyle.buttonColor = '#3B82F6';
        }
        
        if (prompt.includes('green')) {
          mockStyle.accentColor = '#10B981';
          mockStyle.buttonColor = '#10B981';
        }
        
        if (prompt.includes('red')) {
          mockStyle.accentColor = '#EF4444';
          mockStyle.buttonColor = '#EF4444';
        }
        
        resolve(mockStyle);
      }, 1500); // Simulate network delay
    });
  } catch (error) {
    console.error('Error generating style:', error);
    throw new Error('Failed to generate style');
  }
}
