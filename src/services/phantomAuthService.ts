
import { supabase } from '@/integrations/supabase/client';

export interface PhantomAuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export const phantomAuthService = {
  /**
   * Аутентифицирует пользователя через Phantom кошелек
   * Создает пользователя в Supabase auth с публичным ключом как email
   */
  async authenticateWithPhantom(publicKey: string, signature: Uint8Array): Promise<PhantomAuthResult> {
    try {
      console.log('🔐 Authenticating with Phantom wallet:', publicKey);
      
      // Создаем "email" из публичного ключа для Supabase auth
      const walletEmail = `${publicKey}@phantom.wallet`;
      
      // Попытаемся войти с существующим аккаунтом
      let authResult = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: publicKey // Используем публичный ключ как пароль
      });

      // Если пользователь не существует, создаем новый аккаунт
      if (authResult.error && authResult.error.message.includes('Invalid login credentials')) {
        console.log('👤 Creating new user for wallet:', publicKey);
        
        authResult = await supabase.auth.signUp({
          email: walletEmail,
          password: publicKey,
          options: {
            data: {
              wallet_address: publicKey,
              wallet_type: 'phantom',
              signature: Array.from(signature).join(',') // Сохраняем подпись как строку
            }
          }
        });
      }

      if (authResult.error) {
        console.error('❌ Supabase auth error:', authResult.error);
        return {
          success: false,
          error: authResult.error.message
        };
      }

      console.log('✅ Successfully authenticated wallet user:', publicKey);
      return {
        success: true,
        user: authResult.data.user
      };

    } catch (error) {
      console.error('❌ Phantom auth service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  },

  /**
   * Выходит из аккаунта
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  /**
   * Получает текущего пользователя
   */
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
