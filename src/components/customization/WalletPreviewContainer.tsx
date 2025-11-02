import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useThemeStore, THEME_STORE_INSTANCE_ID } from '@/state/themeStore';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import WalletContainer from '@/components/wallet/WalletContainer';
import { useWalletElements } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';
import { AdvancedInteractiveElementSelector } from '@/components/wallet/editMode/AdvancedInteractiveElementSelector';
import { EditModeIndicator } from '@/components/wallet/editMode/EditModeIndicator';
import { useSmartEdit } from '@/contexts/SmartEditContext';
import { applyThemeToDOM } from '@/services/runtimeMappingEngine';
import { ManualColorEditor } from './ManualColorEditor';
import { AiDomScannerButton } from '@/components/admin/AiDomScannerButton';
import { useWalletTheme } from '@/hooks/useWalletTheme';

interface WalletPreviewContainerProps {
  onElementSelect?: (elementSelector: string) => void;
}

const WalletPreviewContainer: React.FC<WalletPreviewContainerProps> = ({
  onElementSelect
}) => {
  // Diagnostic logging for store instances
  console.log('[WHO_USES_THEME_STORE] WalletPreviewContainer:', THEME_STORE_INSTANCE_ID);

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
  
  // Smart Edit Context for visual element selection
  const { 
    isEditMode, 
    setIsEditMode, 
    updateSelectedElement, 
    selectedElement 
  } = useSmartEdit();

  // Read theme from SoT without writing back
  const theme = useThemeStore(state => state.theme);
  const activeThemeId = useThemeStore(state => state.activeThemeId);
  const { getLockLayer } = useWalletTheme();
  const lockLayer = getLockLayer();

  console.log('[RENDER WalletPreviewContainer]', { 
    activeThemeId, 
    themeKeys: theme ? Object.keys(theme) : [],
    hasLockLayer: !!theme?.lockLayer,
    lockLayerKeys: theme?.lockLayer ? Object.keys(theme.lockLayer) : []
  });

  // Apply runtime mappings when theme or layer changes (no timers)
  useEffect(() => {
    if (!theme || Object.keys(theme).length === 0) return;
    
    console.log('[WalletPreview] Theme/Layer changed, applying runtime mappings:', {
      activeThemeId,
      currentLayer,
      hasLockLayer: !!theme.lockLayer
    });
    
    applyThemeToDOM(theme);
  }, [theme, activeThemeId, currentLayer]);

  // 🔍 ДИАГНОСТИКА: Что именно приходит в lockLayer?
  console.log('[LockLayer DEBUG] Using hook:', {
    passwordInputBg: lockLayer.passwordInput?.backgroundColor,
    unlockButtonBg: lockLayer.unlockButton?.backgroundColor,
    titleColor: lockLayer.title?.textColor,
    hasFallbacks: true
  });

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
    setCurrentLayer('lockLayer');
  };

  const renderLoginScreen = () => (
    <div 
      className="relative w-full h-full flex flex-col justify-end unlock-screen-container" 
      data-element-id="unlock-screen-container"
      style={{
        backgroundColor: lockLayer.backgroundColor,
        backgroundImage: lockLayer.backgroundImage ? `url(${lockLayer.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
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
              fontFamily: lockLayer.title?.fontFamily || 'Inter, system-ui, sans-serif',
              fontSize: lockLayer.title?.fontSize || '18px',
              fontWeight: lockLayer.title?.fontWeight || '600'
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
                fontFamily: lockLayer.passwordInput?.fontFamily || 'Inter, system-ui, sans-serif',
                borderRadius: lockLayer.passwordInput?.borderRadius || '12px',
                border: lockLayer.passwordInput?.border || 'none'
              }}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white login-show-password"
                data-element-id="login-show-password"
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
                fontFamily: lockLayer.forgotPassword?.fontFamily || 'Inter, system-ui, sans-serif',
                fontSize: lockLayer.forgotPassword?.fontSize || '14px'
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
              fontFamily: lockLayer.unlockButton?.fontFamily || 'Inter, system-ui, sans-serif',
              borderRadius: lockLayer.unlockButton?.borderRadius || '12px',
              fontWeight: lockLayer.unlockButton?.fontWeight || '700',
              fontSize: lockLayer.unlockButton?.fontSize || '16px'
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
            {import.meta.env.DEV && (
              <div className="text-xs text-white/40">
                Theme: {activeThemeId} | Data: {theme ? 'loaded' : 'empty'}
              </div>
            )}
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
            {currentLayer === 'lockLayer' ? (
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

          {/* AI Dom Scanner - появляется только в Edit Mode */}
          {isEditMode && (
            <div className="absolute top-4 left-4 z-20">
              <AiDomScannerButton screen={currentLayer} />
            </div>
          )}

          {/* Manual Color Editor - появляется только в Edit Mode */}
          {isEditMode && selectedElement && (
            <div className="absolute top-20 right-4 z-20">
              <ManualColorEditor />
            </div>
          )}
          
          {/* Wallet Container */}
          <div 
            ref={walletContainerRef}
            data-wallet-container
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
            {currentLayer === 'lockLayer' ? (
              renderLoginScreen()
            ) : (
              <WalletContainer />
            )}
            
            {/* Visual Element Selection System */}
            <AdvancedInteractiveElementSelector
              isActive={isEditMode}
              onElementSelect={(element) => {
                updateSelectedElement(element);
                console.log('✅ Element selected:', {
                  name: element.name,
                  type: element.type,
                  json_path: element.json_path,
                  screen: element.screen
                });
              }}
              onExit={() => setIsEditMode(false)}
              containerRef={walletContainerRef}
            />
          </div>
        </div>
        
        {/* Edit Mode Indicator */}
        <EditModeIndicator
          isActive={isEditMode}
          selectedElementName={selectedElement?.name}
          elementsCount={elements.length}
          onExit={() => setIsEditMode(false)}
        />
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
