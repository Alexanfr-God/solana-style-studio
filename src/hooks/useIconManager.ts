
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IconElement {
  id: string;
  name: string;
  selector: string;
  screen: string;
  category: string;
  asset_library_path: string;
  storage_file_name: string;
  icon_group?: string;
  is_customizable_icon: boolean;
}

export interface IconVariant {
  id: string;
  group_name: string;
  storage_file_name: string;
  storage_path: string;
  element_ids: string[];
}

export interface UserCustomIcon {
  id: string;
  user_id: string;
  element_id: string;
  original_storage_path: string;
  custom_storage_path: string;
  is_active: boolean;
}

export const useIconManager = () => {
  const [loading, setLoading] = useState(false);
  const [icons, setIcons] = useState<{ [category: string]: IconElement[] }>({});
  const [variants, setVariants] = useState<IconVariant[]>([]);
  const [userCustomIcons, setUserCustomIcons] = useState<UserCustomIcon[]>([]);
  const { toast } = useToast();

  // Загрузить иконки по категориям
  const loadIconsByCategory = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading icons by category...');

      const { data: iconsData, error } = await supabase
        .from('wallet_elements')
        .select('*')
        .eq('category', 'icon')
        .eq('is_customizable_icon', true)
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error loading icons:', error);
        throw error;
      }

      const categorizedIcons: { [category: string]: IconElement[] } = {
        'navigation': [],
        'actions': [],
        'sidebar': [],
        'search': [],
        'receive': [],
        'system': [],
        'dropdown': []
      };

      iconsData?.forEach((icon: IconElement) => {
        if (icon.screen === 'navigation') {
          categorizedIcons.navigation.push(icon);
        } else if (icon.screen === 'sidebar') {
          categorizedIcons.sidebar.push(icon);
        } else if (icon.screen === 'search') {
          categorizedIcons.search.push(icon);
        } else if (icon.screen === 'receive') {
          categorizedIcons.receive.push(icon);
        } else if (icon.id.includes('action')) {
          categorizedIcons.actions.push(icon);
        } else if (icon.id.includes('header') || icon.id.includes('swap')) {
          categorizedIcons.system.push(icon);
        } else if (icon.id.includes('dropdown')) {
          categorizedIcons.dropdown.push(icon);
        }
      });

      setIcons(categorizedIcons);
      console.log('✅ Icons loaded by category:', Object.keys(categorizedIcons).map(cat => `${cat}: ${categorizedIcons[cat].length}`));
    } catch (error) {
      console.error('❌ Error loading icons:', error);
      toast({
        title: "Ошибка загрузки иконок",
        description: "Не удалось загрузить список иконок",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Загрузить варианты иконок
  const loadIconVariants = useCallback(async () => {
    try {
      const { data: variantsData, error } = await supabase
        .from('icon_variants')
        .select('*')
        .order('group_name', { ascending: true });

      if (error) {
        console.error('❌ Error loading icon variants:', error);
        throw error;
      }

      setVariants(variantsData || []);
      console.log('✅ Icon variants loaded:', variantsData?.length || 0);
    } catch (error) {
      console.error('❌ Error loading icon variants:', error);
    }
  }, []);

  // Загрузить пользовательские иконки
  const loadUserCustomIcons = useCallback(async (userId: string) => {
    try {
      const { data: customIconsData, error } = await supabase
        .from('user_custom_icons')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('upload_timestamp', { ascending: false });

      if (error) {
        console.error('❌ Error loading user custom icons:', error);
        throw error;
      }

      setUserCustomIcons(customIconsData || []);
      console.log('✅ User custom icons loaded:', customIconsData?.length || 0);
    } catch (error) {
      console.error('❌ Error loading user custom icons:', error);
    }
  }, []);

  // Получить финальный путь к иконке
  const getFinalIconPath = useCallback(async (elementId: string, userId?: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .rpc('get_final_icon_path', {
          p_element_id: elementId,
          p_user_id: userId || null
        });

      if (error) {
        console.error('❌ Error getting final icon path:', error);
        return 'wallet-icons/default.svg';
      }

      return data || 'wallet-icons/default.svg';
    } catch (error) {
      console.error('❌ Error getting final icon path:', error);
      return 'wallet-icons/default.svg';
    }
  }, []);

  // Получить публичный URL иконки
  const getIconPublicUrl = useCallback((storagePath: string): string => {
    const { data } = supabase.storage
      .from('wallet-icons')
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }, []);

  // Заменить иконку через чат
  const replaceIconThroughChat = useCallback(async (
    message: string,
    iconFile: File,
    userId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Конвертируем файл в base64
      const fileBuffer = await iconFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));

      // Отправляем в Edge Function
      const { data, error } = await supabase.functions.invoke('wallet-chat-gpt', {
        body: {
          message,
          mode: 'chat',
          user_id: userId,
          file_data: base64,
          file_name: iconFile.name
        }
      });

      if (error) {
        console.error('❌ Error replacing icon through chat:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "Иконка обновлена",
          description: data.data.message,
          variant: "default"
        });
        
        // Обновляем локальные данные
        await loadUserCustomIcons(userId);
        return true;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Error replacing icon through chat:', error);
      toast({
        title: "Ошибка замены иконки",
        description: error.message || "Не удалось заменить иконку",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, loadUserCustomIcons]);

  // Получить информацию о Storage структуре
  const getStorageStructure = useCallback(() => {
    return {
      'navigation': ['home.svg', 'apps.svg', 'swap.svg', 'history.svg', 'search.svg'],
      'actions': ['send.svg', 'receive.svg', 'buy.svg', 'swap.svg'],
      'sidebar': ['close.svg', 'add.svg', 'edit.svg', 'settings.svg'],
      'search': ['magnify.svg', 'recent.svg', 'trending.svg'],
      'system': ['header-search.svg', 'header-menu.svg', 'swap-settings.svg', 'swap-arrow.svg'],
      'receive': [
        'qr-main.svg', 'copy.svg',
        'qr-sol.svg', 'qr-usdc.svg', 'qr-usdt.svg', 'qr-ray.svg', 'qr-jupiter.svg', 'qr-orca.svg',
        'copy-sol.svg', 'copy-usdc.svg', 'copy-usdt.svg', 'copy-ray.svg', 'copy-jupiter.svg', 'copy-orca.svg'
      ],
      'dropdown': ['copy-1.svg', 'copy-2.svg']
    };
  }, []);

  return {
    loading,
    icons,
    variants,
    userCustomIcons,
    loadIconsByCategory,
    loadIconVariants,
    loadUserCustomIcons,
    getFinalIconPath,
    getIconPublicUrl,
    replaceIconThroughChat,
    getStorageStructure
  };
};
