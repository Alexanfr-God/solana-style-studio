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
import { WalletPreviewModeSelector } from './WalletPreviewModeSelector';

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

  console.log('[RENDER WalletPreviewContainer]', { 
    activeThemeId, 
    themeKeys: theme ? Object.keys(theme) : [],
    hasLockLayer: !!theme?.lockLayer,
    lockLayerKeys: theme?.lockLayer ? Object.keys(theme.lockLayer) : []
  });

  // Default lockLayer styles (matching removed CSS fallback values)
  const DEFAULT_LOCK_LAYER_STYLES = {
    backgroundColor: 'rgba(19, 19, 19, 0.95)',
    backgroundImage: undefined,
    title: {
      fontFamily: 'Inter, sans-serif',
      textColor: '#FFFFFF',
      fontSize: '28px',
      fontWeight: 'bold'
    },
    passwordInput: {
      backgroundColor: 'rgba(75, 85, 99, 0.8)',
      textColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '12px',
      border: 'none',
      placeholderColor: '#9CA3AF'
    },
    forgotPassword: {
      fontFamily: 'Inter, sans-serif',
      textColor: '#9CA3AF',
      fontSize: '15px'
    },
    unlockButton: {
      backgroundColor: '#6B7280',
      textColor: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '14px',
      fontWeight: '600',
      fontSize: '19px'
    },
    showPassword: {
      textColor: '#9CA3AF'
    }
  };

  // FIXED: Better theme validation and fallback handling
  const previewData = useMemo(() => {
    console.log('[WPC] previewData recalculated for theme:', theme?.name);
    
    // Validate theme structure
    if (!theme || typeof theme !== 'object') {
      console.warn('[WPC] ⚠️ Invalid theme, using defaults');
      return {
        lockLayer: DEFAULT_LOCK_LAYER_STYLES
      };
    }
    
    const lockLayer = theme.lockLayer || {};
    console.log('[WPC] lockLayer structure:', lockLayer);
    
    const result = {
      lockLayer: {
        backgroundColor: lockLayer.backgroundColor || DEFAULT_LOCK_LAYER_STYLES.backgroundColor,
        backgroundImage: lockLayer.backgroundImage || DEFAULT_LOCK_LAYER_STYLES.backgroundImage,
        title: {
          fontFamily: lockLayer.title?.fontFamily || DEFAULT_LOCK_LAYER_STYLES.title.fontFamily,
          textColor: lockLayer.title?.textColor || DEFAULT_LOCK_LAYER_STYLES.title.textColor,
          fontSize: lockLayer.title?.fontSize || DEFAULT_LOCK_LAYER_STYLES.title.fontSize,
          fontWeight: lockLayer.title?.fontWeight || DEFAULT_LOCK_LAYER_STYLES.title.fontWeight
        },
        passwordInput: {
          backgroundColor: lockLayer.passwordInput?.backgroundColor || DEFAULT_LOCK_LAYER_STYLES.passwordInput.backgroundColor,
          textColor: lockLayer.passwordInput?.textColor || DEFAULT_LOCK_LAYER_STYLES.passwordInput.textColor,
          fontFamily: lockLayer.passwordInput?.fontFamily || DEFAULT_LOCK_LAYER_STYLES.passwordInput.fontFamily,
          borderRadius: lockLayer.passwordInput?.borderRadius || DEFAULT_LOCK_LAYER_STYLES.passwordInput.borderRadius,
          border: lockLayer.passwordInput?.border || DEFAULT_LOCK_LAYER_STYLES.passwordInput.border,
          placeholderColor: lockLayer.passwordInput?.placeholderColor || DEFAULT_LOCK_LAYER_STYLES.passwordInput.placeholderColor
        },
        forgotPassword: {
          fontFamily: lockLayer.forgotPassword?.fontFamily || DEFAULT_LOCK_LAYER_STYLES.forgotPassword.fontFamily,
          textColor: lockLayer.forgotPassword?.textColor || DEFAULT_LOCK_LAYER_STYLES.forgotPassword.textColor,
          fontSize: lockLayer.forgotPassword?.fontSize || DEFAULT_LOCK_LAYER_STYLES.forgotPassword.fontSize
        },
        unlockButton: {
          backgroundColor: lockLayer.unlockButton?.backgroundColor || DEFAULT_LOCK_LAYER_STYLES.unlockButton.backgroundColor,
          textColor: lockLayer.unlockButton?.textColor || DEFAULT_LOCK_LAYER_STYLES.unlockButton.textColor,
          fontFamily: lockLayer.unlockButton?.fontFamily || DEFAULT_LOCK_LAYER_STYLES.unlockButton.fontFamily,
          borderRadius: lockLayer.unlockButton?.borderRadius || DEFAULT_LOCK_LAYER_STYLES.unlockButton.borderRadius,
          fontWeight: lockLayer.unlockButton?.fontWeight || DEFAULT_LOCK_LAYER_STYLES.unlockButton.fontWeight,
          fontSize: lockLayer.unlockButton?.fontSize || DEFAULT_LOCK_LAYER_STYLES.unlockButton.fontSize
        },
        showPassword: {
          textColor: lockLayer.showPassword?.textColor || DEFAULT_LOCK_LAYER_STYLES.showPassword.textColor
        }
      }
    };
    
    console.log('🔄 [WPC useMemo] Result passwordInput.backgroundColor:', result.lockLayer.passwordInput.backgroundColor);
    console.log('🔄 [WPC useMemo] Result unlockButton.backgroundColor:', result.lockLayer.unlockButton.backgroundColor);
    console.log('🔄 [WPC useMemo] Result lockLayer.backgroundColor:', result.lockLayer.backgroundColor);
    console.log('🔄 [WPC useMemo] ==================== END RECALCULATION ====================');
    
    return result;
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
    console.log('🔓 [WPC] handleUnlock CALLED');
    console.log('🔓 [WPC] Current layer BEFORE:', currentLayer);
    console.log('🔓 [WPC] showAccountSidebar BEFORE:', useWalletCustomizationStore.getState().showAccountSidebar);
    
    unlockWallet();
    
    console.log('🔓 [WPC] Current layer AFTER:', useWalletCustomizationStore.getState().currentLayer);
    console.log('🔓 [WPC] showAccountSidebar AFTER:', useWalletCustomizationStore.getState().showAccountSidebar);
  };

  const handleLock = () => {
    setCurrentLayer('lockLayer');
  };

  const renderLoginScreen = () => (
    <div 
      className="relative w-full h-full flex flex-col justify-end unlock-screen-container" 
      data-element-id="unlock-screen-container"
      style={{
        backgroundColor: previewData.lockLayer.backgroundColor,
        backgroundImage: previewData.lockLayer.backgroundImage 
          ? `url(${previewData.lockLayer.backgroundImage})` 
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
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
            className="text-center font-medium text-lg login-password-title" 
            data-element-id="login-password-title"
            style={{
              color: previewData.lockLayer.title.textColor,
              fontFamily: previewData.lockLayer.title.fontFamily,
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
              className="w-full px-4 py-2.5 border-none outline-none text-sm login-password-input"
              data-element-id="login-password-input"
              style={{
                backgroundColor: previewData.lockLayer.passwordInput.backgroundColor,
                color: previewData.lockLayer.passwordInput.textColor,
                fontFamily: previewData.lockLayer.passwordInput.fontFamily,
                borderRadius: previewData.lockLayer.passwordInput.borderRadius
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
              className="hover:opacity-80 text-sm login-forgot-password"
              data-element-id="login-forgot-password"
              style={{
                color: previewData.lockLayer.forgotPassword.textColor,
                fontFamily: previewData.lockLayer.forgotPassword.fontFamily,
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
            className="w-full py-3 transition-colors hover:opacity-90 login-unlock-button"
            data-element-id="login-unlock-button"
            onClick={handleUnlock}
            style={{
              backgroundColor: previewData.lockLayer.unlockButton.backgroundColor,
              color: previewData.lockLayer.unlockButton.textColor,
              fontFamily: previewData.lockLayer.unlockButton.fontFamily,
              fontSize: previewData.lockLayer.unlockButton.fontSize,
              fontWeight: previewData.lockLayer.unlockButton.fontWeight,
              borderRadius: previewData.lockLayer.unlockButton.borderRadius
            }}
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
          
          {/* Wallet Preview Mode Selector */}
          <WalletPreviewModeSelector />
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
