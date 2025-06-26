
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
      {/* Logo Section - Top Center */}
      <div className="flex justify-center items-center pt-4 pb-2">
        <dotlottie-player 
          src="https://lottie.host/d0bcee95-e9d8-48b8-a9f3-e00d7911e63a/xyHOfUIIW2.lottie" 
          background="transparent" 
          speed="1" 
          style={{ width: '100px', height: '100px' }}
          loop 
          autoplay
        />
      </div>

      {/* Login Form - Below Logo */}
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-3 w-full max-w-xs">
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
    </div>
  );

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
