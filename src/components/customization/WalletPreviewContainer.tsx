
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore, AiPetEmotion } from '@/stores/walletCustomizationStore';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import AiPet from '@/components/ui/AiPet';

const WalletPreviewContainer = () => {
  const { 
    walletStyle, 
    selectedWallet, 
    setSelectedWallet, 
    isCustomizing,
    aiPet,
    setAiPetEmotion,
    setAiPetZone,
    setContainerBounds,
    containerBounds,
    triggerAiPetInteraction,
    updateAiPetEnergy,
    onAiPetHover,
    onAiPetClick,
    onAiPetDoubleClick
  } = useWalletCustomizationStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [debugMode, setDebugMode] = useState(false);
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
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [updateAiPetEnergy]);

  return (
    <Card className="bg-black/30 backdrop-blur-md border-white/10 h-full">
      <CardContent className="p-6 h-full flex flex-col">
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
            <Button
              variant={selectedWallet === 'solflare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWallet('solflare')}
              className="text-xs"
              disabled
            >
              Solflare
            </Button>
          </div>
        </div>

        {/* Design close to the real wallet text */}
        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">Design close to the real wallet</p>
        </div>
        
        {/* Centered wallet container */}
        <div className="flex-1 flex items-center justify-center overflow-auto relative">
          <div 
            ref={walletContainerRef}
            className={`
              relative rounded-2xl border border-white transition-all duration-1000
              ${isCustomizing ? 'scale-105 animate-pulse' : 'scale-100'}
            `}
            style={{ 
              width: '361px',
              height: '601px',
              backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
              backgroundImage: walletStyle.image ? `url(${walletStyle.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top Bar (Header) */}
            <div 
              className="w-full flex items-center justify-between px-4 py-3"
              style={{ 
                height: '58px',
                backgroundColor: '#1a1a1a',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem'
              }}
            >
              <div className="flex-1 flex justify-center">
                <span 
                  className="font-bold text-white"
                  style={{ 
                    fontFamily: walletStyle.font || 'Inter',
                    fontSize: '16px'
                  }}
                >
                  phantom
                </span>
              </div>
              <HelpCircle className="h-5 w-5 text-white/70" />
            </div>
            
            {/* Transition Strip */}
            <div 
              className="w-full"
              style={{ 
                height: '1px',
                backgroundColor: '#111111'
              }}
            />
            
            {/* Main Section - Updated layout for repositioned button */}
            <div 
              className="relative p-6"
              style={{ 
                backgroundColor: '#181818',
                height: '541px',
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem'
              }}
            >
              {/* AiPet - Centered in available space above button */}
              {aiPet.isVisible && aiPet.zone === 'inside' && (
                <div className="flex justify-center mt-8 mb-8">
                  <AiPet
                    emotion={aiPet.emotion}
                    zone={aiPet.zone}
                    color={walletStyle.primaryColor || '#9945FF'}
                    size={96}
                    onZoneChange={setAiPetZone}
                    onEmotionChange={setAiPetEmotion}
                    onHover={onAiPetHover}
                    onClick={onAiPetClick}
                    onDoubleClick={onAiPetDoubleClick}
                    containerBounds={containerBounds}
                  />
                </div>
              )}
              
              {/* Login Form - Centered */}
              <div className="flex justify-center">
                <div className="w-full max-w-xs space-y-6">
                  {/* Password Title */}
                  <h2 
                    className="text-center font-medium text-white"
                    style={{ 
                      fontFamily: walletStyle.font || 'Inter',
                      fontSize: '20px'
                    }}
                  >
                    Enter your password
                  </h2>
                  
                  {/* Password Input */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        triggerAiPetInteraction();
                      }}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-400 border-none outline-none"
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
              </div>

              {/* White line at bottom */}
              <div 
                className="absolute left-6 right-6"
                style={{ 
                  bottom: '85px',
                  height: '1px',
                  backgroundColor: 'white',
                  opacity: 0.2
                }}
              />
              
              {/* Unlock Button - Positioned at bottom */}
              <div 
                className="absolute left-6 right-6"
                style={{ bottom: '25px' }}
              >
                <button 
                  className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90"
                  style={{ 
                    backgroundColor: walletStyle.primaryColor || '#a390f5',
                    fontFamily: walletStyle.font || 'Inter',
                    borderRadius: '12px'
                  }}
                  onClick={triggerAiPetInteraction}
                >
                  Unlock
                </button>
              </div>
            </div>
            
            {/* Customization Indicator */}
            {isCustomizing && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded animate-bounce">
                Applying Style...
              </div>
            )}
          </div>
        </div>

        {/* AiPet in outside zone - Render outside wallet container with increased size */}
        {aiPet.isVisible && aiPet.zone === 'outside' && containerBounds && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative w-full h-full pointer-events-auto">
              <AiPet
                emotion={aiPet.emotion}
                zone={aiPet.zone}
                color={walletStyle.primaryColor || '#9945FF'}
                size={120}
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
        
        {/* Debug UI */}
        {debugMode && (
          <div className="absolute bottom-4 left-4 bg-black/80 p-4 rounded-lg text-white text-xs">
            <h4 className="font-bold mb-2">AiPet Debug</h4>
            <div className="space-y-2">
              <div>Emotion: {aiPet.emotion}</div>
              <div>Zone: {aiPet.zone}</div>
              <div>Energy: {aiPet.energy}%</div>
              <div className="space-x-1">
                {(['idle', 'happy', 'excited', 'sleepy', 'suspicious', 'sad', 'wink'] as AiPetEmotion[]).map(emotion => (
                  <button
                    key={emotion}
                    onClick={() => setAiPetEmotion(emotion)}
                    className="bg-purple-600 px-2 py-1 rounded text-xs hover:bg-purple-700"
                  >
                    {emotion}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAiPetZone(aiPet.zone === 'inside' ? 'outside' : 'inside')}
                className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
              >
                Toggle Zone
              </button>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Upload an image and click "Customize Wallet" to see the magic! ✨
          </p>
          <p className="text-purple-400/80 text-xs mt-1">
            Hover → suspicious • Click → wink • Double-click → zone switch
          </p>
          <p className="text-blue-400/80 text-xs mt-1">
            Energy: {aiPet.energy}% • Emotion: {aiPet.emotion} • Last interaction: {Math.floor((Date.now() - aiPet.lastInteraction) / 1000)}s ago
          </p>
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs text-gray-500 hover:text-gray-300 mt-1"
          >
            {debugMode ? 'Hide' : 'Show'} Debug UI
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
