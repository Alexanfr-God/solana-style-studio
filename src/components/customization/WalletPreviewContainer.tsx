import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore, AiPetEmotion } from '@/stores/walletCustomizationStore';
import { Eye, EyeOff, HelpCircle, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import AiPet from '@/components/ui/AiPet';
import WalletContainer from '@/components/wallet/WalletContainer';

const WalletPreviewContainer = () => {
  const {
    walletStyle,
    selectedWallet,
    setSelectedWallet,
    isCustomizing,
    aiPet,
    setAiPetEmotion,
    setAiPetZone,
    setAiPetBodyType,
    setContainerBounds,
    containerBounds,
    triggerAiPetInteraction,
    updateAiPetEnergy,
    onAiPetHover,
    onAiPetClick,
    onAiPetDoubleClick,
    currentLayer,
    unlockWallet,
    setCurrentLayer
  } = useWalletCustomizationStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [animationType, setAnimationType] = useState<'orbit' | 'rectangle'>('rectangle');
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Set container bounds for AiPet floating behavior
  useEffect(() => {
    if (walletContainerRef.current) {
      const bounds = walletContainerRef.current.getBoundingClientRect();
      setContainerBounds(bounds);
    }
    const handleResize = () => {
      if (walletContainerRef.current) {
        const bounds = walletContainerRef.current.getBoundingClientRect();
        setContainerBounds(bounds);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setContainerBounds]);

  // Update AiPet energy periodically
  useEffect(() => {
    const interval = setInterval(() => {
      updateAiPetEnergy();
    }, 60000);

    return () => clearInterval(interval);
  }, [updateAiPetEnergy]);

  const handleUnlock = () => {
    unlockWallet();
  };

  const handleLock = () => {
    setCurrentLayer('login');
  };

  const renderLoginScreen = () => (
    <div className="relative p-6 flex flex-col" style={{
      backgroundColor: walletStyle.backgroundColor || '#181818',
      height: '541px',
      borderBottomLeftRadius: '1rem',
      borderBottomRightRadius: '1rem'
    }}>
      {/* Phantom Ghost Icon - Centered in the main area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 8px ' + (walletStyle.primaryColor || '#9945FF') + '50)' }}>
          <img 
            src="/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png" 
            alt="Phantom Ghost Logo" 
            width="120" 
            height="120" 
            className="max-w-[120px] animate-pulse-slow"
            style={{
              filter: walletStyle.primaryColor ? `hue-rotate(${getHueRotate(walletStyle.primaryColor)}deg) saturate(1.2)` : 'none'
            }}
          />
          <div className="absolute inset-0 bg-transparent rounded-full animate-ping opacity-30" 
            style={{ border: `2px solid ${walletStyle.primaryColor || '#9945FF'}` }}
          />
        </div>
      </div>
      
      {/* Login Form - Compact and positioned at bottom */}
      <div className="space-y-3 mb-6">
        {/* Password Title */}
        <h2 className="text-center font-medium text-white text-lg" style={{
          fontFamily: walletStyle.font || 'Inter'
        }}>
          Enter your password
        </h2>
        
        {/* Password Input */}
        <div className="relative max-w-xs mx-auto">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              triggerAiPetInteraction();
            }}
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-400 border-none outline-none text-sm"
            style={{
              backgroundColor: '#0f0f0f',
              fontFamily: walletStyle.font || 'Inter'
            }}
          />
          {password && (
            <button
              type="button"
              onClick={() => {
                setShowPassword(!showPassword);
                triggerAiPetInteraction();
              }}
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
            style={{ fontFamily: walletStyle.font || 'Inter' }}
            onClick={triggerAiPetInteraction}
          >
            Forgot password?
          </button>
        </div>
      </div>
      
      {/* Unlock Button - At the very bottom */}
      <div className="px-0">
        <button
          className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90"
          style={{
            backgroundColor: walletStyle.primaryColor || '#a390f5',
            fontFamily: walletStyle.font || 'Inter',
            borderRadius: '12px'
          }}
          onClick={handleUnlock}
        >
          Unlock
        </button>
      </div>
    </div>
  );

  // Helper function for hue rotation (needed for the ghost icon styling)
  const getHueRotate = (color: string): number => {
    let r = 0, g = 0, b = 0;
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        r = parseInt(match[0]);
        g = parseInt(match[1]);
        b = parseInt(match[2]);
      }
    }
    
    const baseHue = 280; // Purple hue for #9945FF (phantom's default)
    const targetHue = ((r * 0.3) + (g * 0.6) + (b * 0.1)) % 360;
    
    return targetHue - baseHue;
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full flex flex-col">
      <CardContent className="p-6 h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Wallet Preview</h3>
          
          {/* Wallet Selector */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedWallet === 'phantom' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('phantom')}
              className="text-xs"
            >
              Phantom
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

        {/* Body Type Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant={aiPet.bodyType === 'phantom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAiPetBodyType('phantom')}
            className="text-xs"
          >
            👻 Phantom
          </Button>
          <Button
            variant={aiPet.bodyType === 'lottie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAiPetBodyType('lottie')}
            className="text-xs"
          >
            🌊 Aiwa
          </Button>
        </div>

        {/* Animation Type Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant={animationType === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('rectangle')}
            className="text-xs"
          >
            ⏹️ Rectangle
          </Button>
          <Button
            variant={animationType === 'orbit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAnimationType('orbit')}
            className="text-xs"
          >
            ⭕ Orbit
          </Button>
        </div>
        
        {/* Wallet container with AI Pet orbital zone */}
        <div className="flex-1 flex items-center justify-center overflow-visible relative">
          {/* AI Pet в режиме outside - позиционируется относительно этого контейнера */}
          {aiPet.isVisible && aiPet.zone === 'outside' && containerBounds && (
            <div
              className="absolute pointer-events-none"
              style={{
                width: `${containerBounds.width * 1.6}px`,
                height: `${containerBounds.height * 1.6}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div
                className="absolute pointer-events-auto"
                style={{
                  width: '50px',
                  height: '50px'
                }}
              >
                <AiPet
                  emotion={aiPet.emotion}
                  zone={aiPet.zone}
                  bodyType={aiPet.bodyType}
                  color={walletStyle.primaryColor || '#9945FF'}
                  size={50}
                  onZoneChange={setAiPetZone}
                  onEmotionChange={setAiPetEmotion}
                  onHover={onAiPetHover}
                  onClick={onAiPetClick}
                  onDoubleClick={onAiPetDoubleClick}
                  containerBounds={containerBounds}
                />
              </div>
            </div>
          )}
          
          {/* LOCK/UNLOCK Button - External to wallet container */}
          <div className="absolute top-4 right-4 z-20">
            {currentLayer === 'login' ? (
              <Button
                size="sm"
                onClick={handleUnlock}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Unlock className="w-4 h-4 mr-1" />
                UNLOCK
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleLock}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Lock className="w-4 h-4 mr-1" />
                LOCK
              </Button>
            )}
          </div>
          
          {/* Wallet container */}
          <div
            ref={walletContainerRef}
            className={`
              relative rounded-2xl transition-all duration-1000 z-10
              ${isCustomizing ? 'scale-105 animate-pulse' : 'scale-100'}
            `}
            style={{
              width: '361px',
              height: '601px',
              backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
              backgroundImage: walletStyle.image ? `url(${walletStyle.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
              border: '1px solid white'
            }}
          >
            {/* Top Bar (Header) */}
            <div className="w-full flex items-center justify-between px-4 py-3" style={{
              height: '58px',
              backgroundColor: '#1a1a1a',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem'
            }}>
              <div className="flex-1 flex justify-center">
                <span className="font-bold text-white" style={{
                  fontFamily: walletStyle.font || 'Inter',
                  fontSize: '16px'
                }}>
                  phantom
                </span>
              </div>
              <HelpCircle className="h-5 w-5 text-white/70" />
            </div>
            
            {/* Transition Strip */}
            <div className="w-full" style={{
              height: '1px',
              backgroundColor: '#111111'
            }} />
            
            {/* Main Section */}
            {renderLoginScreen()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
