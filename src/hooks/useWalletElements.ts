
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WalletElement {
  id: string;
  name: string;
  selector: string;
  screen: string;
  type: string;
  description: string;
  customizable: boolean;
  position?: string;
  parent_element?: string;
}

export const useWalletElements = () => {
  const [elements, setElements] = useState<WalletElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWalletElements = async () => {
      try {
        console.log('🔄 Loading wallet elements from Supabase...');
        
        const { data, error } = await supabase
          .from('wallet_elements')
          .select('*')
          .eq('customizable', true)
          .order('screen', { ascending: true });

        if (error) {
          console.error('❌ Error loading wallet elements:', error);
          setError(error.message);
          return;
        }

        console.log('✅ Loaded wallet elements:', data);
        setElements(data || []);
      } catch (err) {
        console.error('❌ Exception loading wallet elements:', err);
        setError('Failed to load wallet elements');
      } finally {
        setLoading(false);
      }
    };

    loadWalletElements();
  }, []);

  return { elements, loading, error };
};
