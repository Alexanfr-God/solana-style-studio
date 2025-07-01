import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Eye, EyeOff, Lock, Unlock, Edit3 } from 'lucide-react';
import WalletContainer from '@/components/wallet/WalletContainer';
import { useWalletElements, WalletElement } from '@/hooks/useWalletElements';
import { walletElementsMapper } from '@/services/walletElementsMappingService';
import { AdvancedInteractiveElementSelector } from '@/components/wallet/editMode/AdvancedInteractiveElementSelector';
import { EditModeIndicator } from '@/components/wallet/editMode/EditModeIndicator';

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
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Загружаем элементы из Supabase
  const { elements, loading, error } = useWalletElements();

  useEffect(() => {
    if (elements.length > 0) {
      walletElementsMapper.updateElements(elements);
      console.log('🔄 Updated wallet elements mapper with', elements.length, 'elements');
    }
  }, [elements]);

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      console.log('🎯 Advanced Edit Mode activated');
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

  const renderLoginScreen = () => (
    <div className="relative p-6 flex flex-col justify-end" style={{
      backgroundColor: loginStyle.backgroundColor || '#181818',
      backgroundImage: loginStyle.backgroundImage,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      background: loginStyle.backgroundImage 
        ? `url(${loginStyle.backgroundImage.replace('url(', '').replace(')', '')}) center/cover no-repeat, ${loginStyle.backgroundColor || '#181818'}`
        : loginStyle.backgroundColor || '#181818',
      height: '650px',
      borderBottomLeftRadius: '1rem',
      borderBottomRightRadius: '1rem'
    }}>

      {/* Login Form - Bottom Section */}
      <div className="w-full max-w-xs mx-auto mb-8">
        <div className="space-y-3">
          {/* Password Title */}
          <h2 className="text-center font-medium text-white text-lg" style={{
            fontFamily: loginStyle.fontFamily || 'Inter',
            color: loginStyle.textColor || '#FFFFFF'
          }}>
            Enter your password
          </h2>
          
          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-400 border-none outline-none text-sm"
              style={{
                backgroundColor: '#0f0f0f',
                fontFamily: loginStyle.fontFamily || 'Inter'
              }}
            />
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          
          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              className="text-gray-400 hover:text-gray-300 text-sm"
              style={{ fontFamily: loginStyle.fontFamily || 'Inter' }}
            >
              Forgot password?
            </button>
          </div>
          
          {/* Unlock Button */}
          <button
            className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90"
            style={{
              backgroundColor: loginStyle.accentColor || '#a390f5',
              fontFamily: loginStyle.fontFamily || 'Inter',
              borderRadius: '12px'
            }}
            onClick={handleUnlock}
          >
            Unlock
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
            {currentLayer === 'login' ? renderLoginScreen() : (
              <WalletContainer />
            )}
          </div>

          {/* Advanced Interactive Element Selector */}
          <AdvancedInteractiveElementSelector
            isActive={isEditMode}
            onElementSelect={handleElementSelect}
            onExit={handleEditModeExit}
            containerRef={walletContainerRef}
          />
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
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
