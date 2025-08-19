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

export class IconManager {
  private supabaseClient: any;

  constructor(supabaseClient: any) {
    this.supabaseClient = supabaseClient;
  }

  // Проверка флагов в начале каждого метода
  private checkIconLibEnabled(): boolean {
    return Deno.env.get('ICON_LIB_ENABLED') === 'true';
  }

  private createFeatureDisabledResponse() {
    return {
      success: false,
      error: 'Icon library functionality is disabled',
      code: 'FEATURE_DISABLED'
    };
  }

  // Получить все иконки по категориям
  async getIconsByCategory(): Promise<{ [category: string]: IconElement[] }> {
    if (!this.checkIconLibEnabled()) {
      console.log('🚫 Icon library disabled - returning empty categories');
      return {};
    }

    try {
      console.log('🔍 Fetching icons by category...');
      
      const { data: icons, error } = await this.supabaseClient
        .from('wallet_elements')
        .select('*')
        .eq('category', 'icon')
        .eq('is_customizable_icon', true)
        .order('screen', { ascending: true });

      if (error) {
        console.error('❌ Error fetching icons:', error);
        throw error;
      }

      const categories: { [category: string]: IconElement[] } = {
        'navigation': [],
        'actions': [],
        'sidebar': [],
        'search': [],
        'receive': [],
        'system': [],
        'dropdown': []
      };

      icons?.forEach((icon: IconElement) => {
        if (icon.screen === 'navigation') {
          categories.navigation.push(icon);
        } else if (icon.screen === 'sidebar') {
          categories.sidebar.push(icon);
        } else if (icon.screen === 'search') {
          categories.search.push(icon);
        } else if (icon.screen === 'receive') {
          categories.receive.push(icon);
        } else if (icon.id.includes('action')) {
          categories.actions.push(icon);
        } else if (icon.id.includes('header') || icon.id.includes('swap')) {
          categories.system.push(icon);
        } else if (icon.id.includes('dropdown')) {
          categories.dropdown.push(icon);
        }
      });

      console.log('✅ Icons grouped by category:', Object.keys(categories).map(cat => `${cat}: ${categories[cat].length}`));
      return categories;
    } catch (error) {
      console.error('❌ Error in getIconsByCategory:', error);
      throw error;
    }
  }

  // Получить группы дублирующихся иконок
  async getIconVariants(): Promise<IconVariant[]> {
    if (!this.checkIconLibEnabled()) {
      console.log('🚫 Icon library disabled - returning empty variants');
      return [];
    }

    try {
      const { data: variants, error } = await this.supabaseClient
        .from('icon_variants')
        .select('*')
        .order('group_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching icon variants:', error);
        throw error;
      }

      console.log('✅ Icon variants fetched:', variants?.length || 0);
      return variants || [];
    } catch (error) {
      console.error('❌ Error in getIconVariants:', error);
      throw error;
    }
  }

  // Получить финальный путь к иконке (пользовательская или дефолтная)
  async getFinalIconPath(elementId: string, userId?: string): Promise<string> {
    if (!this.checkIconLibEnabled()) {
      return 'wallet-icons/default.svg';
    }

    try {
      const { data, error } = await this.supabaseClient
        .rpc('get_final_icon_path', {
          p_element_id: elementId,
          p_user_id: userId || null
        });

      if (error) {
        console.error('❌ Error getting final icon path:', error);
        throw error;
      }

      return data || 'wallet-icons/default.svg';
    } catch (error) {
      console.error('❌ Error in getFinalIconPath:', error);
      return 'wallet-icons/default.svg';
    }
  }

  // Загрузить иконку из Storage
  async getIconFromStorage(storagePath: string): Promise<{ url: string; data?: Uint8Array }> {
    if (!this.checkIconLibEnabled()) {
      throw new Error('Icon library functionality is disabled');
    }

    try {
      console.log('📁 Fetching icon from storage:', storagePath);
      
      const { data: publicUrl } = this.supabaseClient.storage
        .from('wallet-icons')
        .getPublicUrl(storagePath);

      if (publicUrl?.publicUrl) {
        console.log('✅ Icon URL generated:', publicUrl.publicUrl);
        return { url: publicUrl.publicUrl };
      }

      // Если публичный URL не работает, попробуем скачать напрямую
      const { data: fileData, error } = await this.supabaseClient.storage
        .from('wallet-icons')
        .download(storagePath);

      if (error) {
        console.error('❌ Error downloading icon:', error);
        throw error;
      }

      console.log('✅ Icon downloaded directly');
      return { url: '', data: new Uint8Array(await fileData.arrayBuffer()) };
    } catch (error) {
      console.error('❌ Error in getIconFromStorage:', error);
      throw error;
    }
  }

  // Заменить иконку пользователем
  async replaceUserIcon(userId: string, elementId: string, iconFile: File): Promise<UserCustomIcon> {
    if (!this.checkIconLibEnabled()) {
      throw new Error('Icon library functionality is disabled');
    }

    try {
      console.log('🔄 Replacing user icon:', { userId, elementId });
      
      // Генерируем уникальное имя файла
      const fileExt = iconFile.name.split('.').pop();
      const fileName = `${userId}/${elementId}-${Date.now()}.${fileExt}`;
      const customPath = `custom-icons/${fileName}`;

      // Загружаем файл в Storage
      const { data: uploadData, error: uploadError } = await this.supabaseClient.storage
        .from('wallet-icons')
        .upload(customPath, iconFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Error uploading icon:', uploadError);
        throw uploadError;
      }

      // Получаем оригинальный путь
      const { data: originalElement, error: elementError } = await this.supabaseClient
        .from('wallet_elements')
        .select('asset_library_path, storage_file_name')
        .eq('id', elementId)
        .single();

      if (elementError) {
        console.error('❌ Error fetching original element:', elementError);
        throw elementError;
      }

      const originalPath = `${originalElement.asset_library_path}${originalElement.storage_file_name}`;

      // Деактивируем предыдущие пользовательские иконки
      await this.supabaseClient
        .from('user_custom_icons')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('element_id', elementId);

      // Создаем новую запись
      const { data: customIcon, error: insertError } = await this.supabaseClient
        .from('user_custom_icons')
        .insert({
          user_id: userId,
          element_id: elementId,
          original_storage_path: originalPath,
          custom_storage_path: customPath,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error inserting custom icon:', insertError);
        throw insertError;
      }

      console.log('✅ User icon replaced successfully');
      return customIcon;
    } catch (error) {
      console.error('❌ Error in replaceUserIcon:', error);
      throw error;
    }
  }

  // Групповая замена иконок
  async batchReplaceIcons(userId: string, iconGroup: string, iconFile: File): Promise<UserCustomIcon[]> {
    if (!this.checkIconLibEnabled()) {
      throw new Error('Icon library functionality is disabled');
    }

    try {
      console.log('🔄 Batch replacing icons for group:', iconGroup);
      
      // Получаем все элементы в группе
      const { data: variant, error: variantError } = await this.supabaseClient
        .from('icon_variants')
        .select('element_ids')
        .eq('group_name', iconGroup)
        .single();

      if (variantError) {
        console.error('❌ Error fetching icon variant:', variantError);
        throw variantError;
      }

      const elementIds = variant.element_ids;
      const results: UserCustomIcon[] = [];

      // Заменяем каждую иконку в группе
      for (const elementId of elementIds) {
        try {
          const result = await this.replaceUserIcon(userId, elementId, iconFile);
          results.push(result);
        } catch (error) {
          console.error(`❌ Error replacing icon ${elementId}:`, error);
        }
      }

      console.log('✅ Batch icon replacement completed:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Error in batchReplaceIcons:', error);
      throw error;
    }
  }

  // Получить пользовательские иконки
  async getUserCustomIcons(userId: string): Promise<UserCustomIcon[]> {
    if (!this.checkIconLibEnabled()) {
      console.log('🚫 Icon library disabled - returning empty user icons');
      return [];
    }

    try {
      const { data: customIcons, error } = await this.supabaseClient
        .from('user_custom_icons')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('upload_timestamp', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user custom icons:', error);
        throw error;
      }

      console.log('✅ User custom icons fetched:', customIcons?.length || 0);
      return customIcons || [];
    } catch (error) {
      console.error('❌ Error in getUserCustomIcons:', error);
      throw error;
    }
  }

  // Обработать операцию с иконками (главный обработчик)
  async handleIconOperation(params: any): Promise<any> {
    if (!this.checkIconLibEnabled()) {
      console.log('🚫 Icon operation blocked - feature disabled');
      return this.createFeatureDisabledResponse();
    }

    const { message, user_id, file_data, file_name } = params;
    
    try {
      console.log('🎯 Handling icon operation:', { message: message?.slice(0, 50), user_id });
      
      // Здесь можно добавить обработку различных операций с иконками
      return {
        success: true,
        data: {
          message: 'Icon operation processed successfully',
          user_id,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Error in handleIconOperation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Получить Storage структуру для документации
  getStorageStructure(): { [folder: string]: string[] } {
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
  }
}
