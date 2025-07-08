import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { useWalletTheme } from '@/hooks/useWalletTheme';
import { Eye, EyeOff, Lock, Unlock, Edit3, Bug } from 'lucide-react';
import WalletContainer from '@/components/wallet/WalletContainer';
import { useWalletElements, WalletElement } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';
import { AdvancedInteractiveElementSelector } from '@/components/wallet/editMode/AdvancedInteractiveElementSelector';
import { EditModeIndicator } from '@/components/wallet/editMode/EditModeIndicator';
import { EditModeDebugPanel } from '@/components/wallet/editMode/EditModeDebugPanel';

interface WalletPreviewContainerProps {
  onElementSelect?: (elementSelector: string) => void;
}

const WalletPreviewContainer: React.FC<WalletPreviewContainerProps> = ({
  onElementSelect
}) => {
  const {
    getStyleForComponent,
    selectedWallet,
    setSelectedWallet,
    isCustomizing,
    currentLayer,
    unlockWallet,
    setCurrentLayer,
    loginStyle,
    walletStyle
  } = useWalletCustomizationStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Load elements from Supabase
  const { elements, loading, error } = useWalletElements();

  useEffect(() => {
    if (elements.length > 0) {
      walletElementsMapper.updateElements(elements);
      console.log('🔄 Updated wallet elements mapper with', elements.length, 'elements');
    }
  }, [elements]);

  const handleEditModeToggle = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    if (newEditMode) {
      console.log('🎯 Advanced Edit Mode activated');
      console.log('🎯 Wallet container ref:', walletContainerRef.current);
    } else {
      console.log('🎯 Advanced Edit Mode deactivated');
      setSelectedElementId(null);
    }
  };

  const handleElementSelect = (element: WalletElement) => {
    setSelectedElementId(element.id);
    console.log('✅ Advanced Element selected in preview:', element.name, element.selector);
    
    // Auto-populate chat with element selector
    if (onElementSelect && element.selector) {
      const cleanSelector = element.selector.startsWith('.') 
        ? element.selector.substring(1) 
        : element.selector;
      onElementSelect(cleanSelector);
      console.log('📝 Auto-populated chat with selector:', cleanSelector);
    }
  };

  const handleEditModeExit = () => {
    setIsEditMode(false);
    setSelectedElementId(null);
    console.log('🚪 Advanced Edit Mode exited');
  };

  const globalStyle = getStyleForComponent('global');
  const headerStyle = getStyleForComponent('header');

  const handleUnlock = () => {
    unlockWallet();
  };

  const handleLock = () => {
    setCurrentLayer('login');
  };

  const { getComponentStyle } = useWalletTheme();
  const lockScreenStyle = getComponentStyle('lockScreen');

  const renderLoginScreen = () => (
    <div 
      className="relative p-6 flex flex-col justify-end unlock-screen-container" 
      data-element-id="unlock-screen-container"
      style={{
        backgroundColor: lockScreenStyle.backgroundColor || '#181818',
        backgroundImage: lockScreenStyle.backgroundImage,
        backgroundSize: lockScreenStyle.backgroundSize || 'cover',
        backgroundPosition: lockScreenStyle.backgroundPosition || 'center',
        backgroundRepeat: lockScreenStyle.backgroundRepeat || 'no-repeat',
        background: lockScreenStyle.backgroundImage 
          ? `url(${lockScreenStyle.backgroundImage.replace('url(', '').replace(')', '')}) ${lockScreenStyle.backgroundPosition || 'center'}/${lockScreenStyle.backgroundSize || 'cover'} ${lockScreenStyle.backgroundRepeat || 'no-repeat'}, ${lockScreenStyle.backgroundColor || '#181818'}`
          : lockScreenStyle.backgroundColor || '#181818',
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
              fontFamily: lockScreenStyle.titleStyle?.fontFamily || 'Inter',
              color: lockScreenStyle.titleStyle?.color || '#FFFFFF',
              fontSize: lockScreenStyle.titleStyle?.fontSize || '18px',
              fontWeight: lockScreenStyle.titleStyle?.fontWeight || '500'
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
                backgroundColor: lockScreenStyle.inputStyle?.backgroundColor || '#0f0f0f',
                color: lockScreenStyle.inputStyle?.textColor || '#FFFFFF',
                fontFamily: lockScreenStyle.titleStyle?.fontFamily || 'Inter',
                borderRadius: lockScreenStyle.inputStyle?.borderRadius || '12px',
                border: lockScreenStyle.inputStyle?.border || 'none'
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
                fontFamily: lockScreenStyle.secondaryText?.fontFamily || 'Inter',
                color: lockScreenStyle.secondaryText?.color || '#9CA3AF'
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
              backgroundColor: lockScreenStyle.primaryButton?.backgroundColor || '#a390f5',
              color: lockScreenStyle.primaryButton?.textColor || '#FFFFFF',
              fontFamily: lockScreenStyle.titleStyle?.fontFamily || 'Inter',
              borderRadius: lockScreenStyle.primaryButton?.borderRadius || '12px',
              fontWeight: lockScreenStyle.primaryButton?.fontWeight || '700',
              fontSize: lockScreenStyle.primaryButton?.fontSize || '14px'
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
            
            {/* Enhanced EDIT Button */}
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={handleEditModeToggle}
              className={`${
                isEditMode 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
              } transition-colors`}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {isEditMode ? 'Exit Advanced Edit' : 'ADVANCED EDIT'}
            </Button>

            {/* Debug Toggle Button */}
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
              >
                <Bug className="h-4 w-4 mr-1" />
                Debug
              </Button>
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
          
          {/* Enhanced Edit Mode Indicator */}
          <EditModeIndicator
            isActive={isEditMode}
            selectedElementName={elements.find(e => e.id === selectedElementId)?.name}
            elementsCount={elements.length}
            onExit={handleEditModeExit}
          />
          
          {/* Wallet Container - ИСПРАВЛЕНО для правильного позиционирования overlay */}
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
            {/* Overlay контейнер - позиционируем relative чтобы absolute overlay работал правильно */}
            {isEditMode && (
              <div 
                className="absolute inset-0 pointer-events-none z-50"
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 9998
                }}
              >
                <AdvancedInteractiveElementSelector
                  isActive={isEditMode}
                  onElementSelect={handleElementSelect}
                  onExit={handleEditModeExit}
                  containerRef={walletContainerRef}
                />
              </div>
            )}

            {currentLayer === 'login' ? (
              renderLoginScreen()
            ) : (
              <WalletContainer />
            )}
          </div>
        </div>

        {/* Enhanced Edit Mode Info */}
        {isEditMode && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-purple-300">
                  Advanced Edit Mode: Hover elements, use keyboard shortcuts
                </span>
              </div>
              <span className="text-xs text-purple-400">
                {elements.length} elements | ESC to exit | ↑↓ for history
              </span>
            </div>
            {selectedElementId && (
              <div className="mt-2 text-xs text-green-400">
                ✨ Selected: {elements.find(e => e.id === selectedElementId)?.name}
              </div>
            )}
          </div>
        )}

        {/* Debug Panel */}
        <EditModeDebugPanel
          isVisible={showDebugPanel}
          elements={elements}
          onToggle={() => setShowDebugPanel(!showDebugPanel)}
        />
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
