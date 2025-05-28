
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const WalletPreviewContainer = () => {
  const { walletStyle, selectedWallet, setSelectedWallet, isCustomizing } = useWalletCustomizationStore();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

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
          <p className="text-gray-400 text-sm">Design close to the real wallet - Real Size (722x1202px)</p>
        </div>
        
        {/* Centered wallet container with real dimensions */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
          <div 
            className={`
              relative rounded-2xl border border-white transition-all duration-1000
              ${isCustomizing ? 'scale-105 animate-pulse' : 'scale-100'}
            `}
            style={{ 
              width: '722px', // Real size width
              height: '1202px', // Real size height
              backgroundColor: walletStyle.backgroundColor || '#1a1a1a',
              backgroundImage: walletStyle.image ? `url(${walletStyle.image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Top Bar (Header) */}
            <div 
              className="w-full flex items-center justify-between px-8 py-6"
              style={{ 
                height: '116px', // Real size height
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
                    fontSize: '32px' // Real size font
                  }}
                >
                  phantom
                </span>
              </div>
              <HelpCircle className="h-10 w-10 text-white/70" />
            </div>
            
            {/* Transition Strip */}
            <div 
              className="w-full"
              style={{ 
                height: '2px', // Real size
                backgroundColor: '#111111'
              }}
            />
            
            {/* Main Section */}
            <div 
              className="flex-1 flex flex-col items-center justify-center p-12"
              style={{ 
                backgroundColor: '#181818',
                height: '1082px', // Real size height
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem'
              }}
            >
              {/* Phantom Logo Placeholder */}
              <div className="mb-16">
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold text-white"
                  style={{ 
                    backgroundColor: walletStyle.primaryColor || '#9945FF'
                  }}
                >
                  👻
                </div>
              </div>
              
              {/* Login Form */}
              <div className="w-full max-w-md space-y-12">
                {/* Password Title */}
                <h2 
                  className="text-center font-medium text-white"
                  style={{ 
                    fontFamily: walletStyle.font || 'Inter',
                    fontSize: '40px' // Real size font
                  }}
                >
                  Enter your password
                </h2>
                
                {/* Password Input */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-8 py-6 rounded-xl text-white placeholder-gray-400 border-none outline-none text-xl"
                    style={{ 
                      backgroundColor: '#0f0f0f',
                      fontFamily: walletStyle.font || 'Inter'
                    }}
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
                    </button>
                  )}
                </div>
                
                {/* Forgot Password Link */}
                <div className="text-center">
                  <button 
                    className="text-gray-400 hover:text-gray-300 text-lg"
                    style={{ fontFamily: walletStyle.font || 'Inter' }}
                  >
                    Forgot password?
                  </button>
                </div>
                
                {/* Unlock Button */}
                <button 
                  className="w-full py-6 font-bold text-white rounded-xl transition-colors hover:opacity-90 text-xl"
                  style={{ 
                    backgroundColor: walletStyle.primaryColor || '#a390f5',
                    fontFamily: walletStyle.font || 'Inter',
                    borderRadius: '12px'
                  }}
                >
                  Unlock
                </button>
              </div>
            </div>
            
            {/* Customization Indicator */}
            {isCustomizing && (
              <div className="absolute top-4 right-4 bg-green-500 text-white text-lg px-4 py-2 rounded animate-bounce">
                Applying Style...
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            Upload an image and click "Customize Wallet" to see the magic! ✨
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletPreviewContainer;
