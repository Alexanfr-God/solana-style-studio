
import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useThemeStore } from '@/state/themeStore';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import WalletContainer from '@/components/wallet/WalletContainer';
import { useWalletElements } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';

interface WalletPreviewContainerProps {
  onElementSelect?: (elementSelector: string) => void;
}

const WalletPreviewContainer: React.FC<WalletPreviewContainerProps> = ({
  onElementSelect
}) => {
  const {
    selectedWallet,
    setSelectedWallet,
    isCustomizing,
    currentLayer,
    unlockWallet,
    setCurrentLayer
  } = useWalletCustomizationStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Read theme from SoT without writing back
  const theme = useThemeStore(state => state.theme);

  // Derive preview data from theme using useMemo (no side effects)
  const previewData = useMemo(() => {
    const lockLayerStyle = theme.lockLayer || {};
    
    return {
      lockLayer: {
        backgroundColor: lockLayerStyle.backgroundColor || '#181818',
        backgroundImage: lockLayerStyle.backgroundImage,
        title: {
          fontFamily: lockLayerStyle.title?.fontFamily || 'Inter',
          textColor: lockLayerStyle.title?.textColor || '#FFFFFF',
          fontSize: lockLayerStyle.title?.fontSize || '28px',
          fontWeight: lockLayerStyle.title?.fontWeight || 'bold'
        },
        passwordInput: {
          backgroundColor: lockLayerStyle.passwordInput?.backgroundColor || 'rgba(30,30,30,0.8)',
          textColor: lockLayerStyle.passwordInput?.textColor || '#FFFFFF',
          fontFamily: lockLayerStyle.passwordInput?.fontFamily || 'Inter',
          borderRadius: lockLayerStyle.passwordInput?.borderRadius || '12px',
          border: lockLayerStyle.passwordInput?.border || 'none',
          iconEyeColor: lockLayerStyle.passwordInput?.iconEyeColor || '#aaa'
        },
        forgotPassword: {
          fontFamily: lockLayerStyle.forgotPassword?.fontFamily || 'Inter',
          textColor: lockLayerStyle.forgotPassword?.textColor || '#aaa',
          fontSize: lockLayerStyle.forgotPassword?.fontSize || '15px'
        },
        unlockButton: {
          backgroundColor: lockLayerStyle.unlockButton?.backgroundColor || '#13e163',
          textColor: lockLayerStyle.unlockButton?.textColor || '#FFFFFF',
          fontFamily: lockLayerStyle.unlockButton?.fontFamily || 'Inter',
          borderRadius: lockLayerStyle.unlockButton?.borderRadius || '14px',
          fontWeight: lockLayerStyle.unlockButton?.fontWeight || '600',
          fontSize: lockLayerStyle.unlockButton?.fontSize || '19px'
        }
      }
    };
  }, [theme]);

  // Load elements from Supabase (no side effects)
  const { elements, loading, error } = useWalletElements();

  // Update elements mapper when elements change (no circular deps)
  useMemo(() => {
    if (elements.length > 0) {
      walletElementsMapper.updateElements(elements);
      console.log('🔄 Updated wallet elements mapper with', elements.length, 'elements');
    }
  }, [elements]);

  const handleUnlock = () => {
    unlockWallet();
  };

  const handleLock = () => {
    setCurrentLayer('login');
  };

  const renderLoginScreen = () => (
    <div 
      className="relative p-6 flex flex-col justify-end unlock-screen-container" 
      data-element-id="unlock-screen-container"
      style={{
        backgroundColor: previewData.lockLayer.backgroundColor,
        backgroundImage: previewData.lockLayer.backgroundImage ? `url(${previewData.lockLayer.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '650px',
        borderBottomLeftRadius: '1rem',
        borderBottomRightRadius: '1rem'
      }}
    >
      {/* Login Form - Bottom Section */}
      <div 
        className="w-full max-w-xs mx-auto mb-8 unlock-form-wrapper"
        data-element-id="unlock-form-wrapper"
      >
        <div 
          className="space-y-3 unlock-form-container"
          data-element-id="unlock-form-container"
        >
          {/* Password Title */}
          <h2 
            className="text-center font-medium text-white text-lg login-password-title" 
            data-element-id="login-password-title"
            style={{
              fontFamily: previewData.lockLayer.title.fontFamily,
              color: previewData.lockLayer.title.textColor,
              fontSize: previewData.lockLayer.title.fontSize,
              fontWeight: previewData.lockLayer.title.fontWeight
            }}
          >
            <span 
              className="unlock-password-title-text"
              data-element-id="unlock-password-title-text"
            >
              Enter your password
            </span>
          </h2>
          
          {/* Password Input */}
          <div 
            className="relative unlock-password-field-container"
            data-element-id="unlock-password-field-container"
          >
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-400 border-none outline-none text-sm login-password-input"
              data-element-id="login-password-input"
              style={{
                backgroundColor: previewData.lockLayer.passwordInput.backgroundColor,
                color: previewData.lockLayer.passwordInput.textColor,
                fontFamily: previewData.lockLayer.passwordInput.fontFamily,
                borderRadius: previewData.lockLayer.passwordInput.borderRadius,
                border: previewData.lockLayer.passwordInput.border
              }}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white login-show-password"
                data-element-id="login-show-password"
                style={{
                  color: previewData.lockLayer.passwordInput.iconEyeColor
                }}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 unlock-password-toggle-icon" data-element-id="unlock-password-toggle-icon" />
                ) : (
                  <Eye className="h-4 w-4 unlock-password-toggle-icon" data-element-id="unlock-password-toggle-icon" />
                )}
              </button>
            )}
          </div>
          
          {/* Forgot Password Link */}
          <div 
            className="text-center unlock-forgot-container"
            data-element-id="unlock-forgot-container"
          >
            <button
              className="text-gray-400 hover:text-gray-300 text-sm login-forgot-password"
              data-element-id="login-forgot-password"
              style={{ 
                fontFamily: previewData.lockLayer.forgotPassword.fontFamily,
                color: previewData.lockLayer.forgotPassword.textColor,
                fontSize: previewData.lockLayer.forgotPassword.fontSize
              }}
            >
              <span 
                className="unlock-forgot-text"
                data-element-id="unlock-forgot-text"
              >
                Forgot password?
              </span>
            </button>
          </div>
          
          {/* Unlock Button */}
          <button
            className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90 login-unlock-button"
            data-element-id="login-unlock-button"
            style={{
              backgroundColor: previewData.lockLayer.unlockButton.backgroundColor,
              color: previewData.lockLayer.unlockButton.textColor,
              fontFamily: previewData.lockLayer.unlockButton.fontFamily,
              borderRadius: previewData.lockLayer.unlockButton.borderRadius,
              fontWeight: previewData.lockLayer.unlockButton.fontWeight,
              fontSize: previewData.lockLayer.unlockButton.fontSize
            }}
            onClick={handleUnlock}
          >
            <span 
              className="unlock-button-text"
              data-element-id="unlock-button-text"
            >
              Unlock
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-white">Loading wallet elements...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-red-400">Error loading wallet elements: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">Wallet Preview</h3>
          </div>
          
          {/* Wallet Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedWallet === 'phantom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('phantom')}
              className="text-xs"
            >
              WCC
            </Button>
            <Button
              variant={selectedWallet === 'metamask' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('metamask')}
              className="text-xs"
              disabled
            >
              MetaMask
            </Button>
          </div>
        </div>
        
        {/* Wallet container */}
        <div className="flex-1 flex items-center justify-center overflow-visible relative">
          {/* LOCK/UNLOCK Button - External to wallet container */}
          <div className="absolute top-4 right-4 z-20">
            {currentLayer === 'login' ? (
              <Button
                size="sm"
                onClick={handleUnlock}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Unlock className="h-4 w-4 mr-1" />
                Unlock
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLock}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Lock className="h-4 w-4 mr-1" />
                Lock
              </Button>
            )}
          </div>
          
          {/* Wallet Container */}
          <div 
            ref={walletContainerRef}
            className="relative w-96 h-[650px] mx-auto rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: isCustomizing 
                ? '0 0 30px rgba(153, 69, 255, 0.4), inset 0 0 20px rgba(153, 69, 255, 0.1)' 
                : '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            {currentLayer === 'login' ? (
              renderLoginScreen()
            ) : (
              <WalletContainer />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
