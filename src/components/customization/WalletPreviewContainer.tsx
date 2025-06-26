
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import WalletContainer from '@/components/wallet/WalletContainer';

const WalletPreviewContainer = () => {
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
  const walletContainerRef = useRef<HTMLDivElement>(null);

  // Get unified styles for all components
  const globalStyle = getStyleForComponent('global');
  const headerStyle = getStyleForComponent('header');

  const handleUnlock = () => {
    unlockWallet();
  };

  const handleLock = () => {
    setCurrentLayer('login');
  };

  const renderLoginScreen = () => (
    <div className="relative p-6 flex flex-col" style={{
      backgroundColor: loginStyle.backgroundColor || '#181818',
      backgroundImage: loginStyle.backgroundImage,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      background: loginStyle.backgroundImage 
        ? `url(${loginStyle.backgroundImage.replace('url(', '').replace(')', '')}) center/cover no-repeat, ${loginStyle.gradient || loginStyle.backgroundColor || '#181818'}`
        : loginStyle.gradient || loginStyle.backgroundColor || '#181818',
      height: '541px',
      borderBottomLeftRadius: '1rem',
      borderBottomRightRadius: '1rem'
    }}>
      {/* Phantom Ghost Icon - Centered in the main area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative transition-transform hover:scale-105" style={{ filter: 'drop-shadow(0 0 8px ' + (loginStyle.primaryColor || '#9945FF') + '50)' }}>
          <img 
            src="/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png" 
            alt="Phantom Glass Logo" 
            width="120" 
            height="120" 
            className="max-w-[120px] animate-pulse-slow"
            style={{
              filter: loginStyle.primaryColor ? `hue-rotate(${getHueRotate(loginStyle.primaryColor)}deg) saturate(1.2)` : 'none'
            }}
          />
          <div className="absolute inset-0 bg-transparent rounded-full animate-ping opacity-30" 
            style={{ border: `2px solid ${loginStyle.primaryColor || '#9945FF'}` }}
          />
        </div>
      </div>
      
      {/* Login Form - Compact and positioned at bottom */}
      <div className="space-y-3 mb-6">
        {/* Password Title */}
        <h2 className="text-center font-medium text-white text-lg" style={{
          fontFamily: loginStyle.fontFamily || 'Inter',
          color: loginStyle.textColor || '#FFFFFF'
        }}>
          Enter your password
        </h2>
        
        {/* Password Input */}
        <div className="relative max-w-xs mx-auto">
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
      </div>
      
      {/* Unlock Button - At the very bottom */}
      <div className="px-0">
        <button
          className="w-full py-3 font-bold text-white rounded-xl transition-colors hover:opacity-90"
          style={{
            backgroundColor: loginStyle.primaryColor || '#a390f5',
            fontFamily: loginStyle.fontFamily || 'Inter',
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
            className="relative w-80 h-[541px] mx-auto rounded-2xl overflow-hidden"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
