
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';

interface WalletScreenProps {
  style: WalletStyle;
  isIndexPage?: boolean;
}

export const LoginScreen = ({ style }: WalletScreenProps) => {
  // Base container styles for consistency
  const containerStyle = {
    width: '320px',
    height: '569px',
    backgroundColor: style.backgroundColor || '#131313',
    backgroundImage: style.backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: style.textColor || '#FFFFFF',
    fontFamily: style.fontFamily,
    borderRadius: '16px',
    boxShadow: style.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  };

  return (
    <div 
      className="wallet-login-screen relative"
      style={containerStyle}
      data-wallet-type="login"
    >
      <div className="relative p-6 flex flex-col justify-end h-full">
        <div className="w-full max-w-xs mx-auto mb-8">
          <div className="space-y-3">
            <h2 
              className="text-center font-medium text-lg"
              style={{ 
                fontFamily: style.fontFamily,
                color: style.textColor 
              }}
            >
              Enter your password
            </h2>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2.5 rounded-xl border-none outline-none text-sm"
                style={{
                  backgroundColor: 'rgba(30,30,30,0.8)',
                  color: style.textColor,
                  fontFamily: style.fontFamily,
                  borderRadius: '12px'
                }}
              />
            </div>
            
            <div className="text-center">
              <button
                className="hover:opacity-80 text-sm"
                style={{ 
                  fontFamily: style.fontFamily,
                  color: '#aaa' 
                }}
              >
                Forgot password?
              </button>
            </div>
            
            <button
              className="w-full py-3 font-bold rounded-xl transition-colors hover:opacity-90"
              style={{
                backgroundColor: style.buttonColor || style.accentColor,
                color: style.buttonTextColor || style.textColor,
                fontFamily: style.fontFamily,
                borderRadius: style.borderRadius || '14px'
              }}
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WalletScreen = ({ style, isIndexPage = false }: WalletScreenProps) => {
  // Base container styles for consistency
  const containerStyle = {
    width: '320px',
    height: '569px',
    backgroundColor: style.backgroundColor || '#131313',
    backgroundImage: style.backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: style.textColor || '#FFFFFF',
    fontFamily: style.fontFamily,
    borderRadius: '16px',
    boxShadow: style.boxShadow || '0px 4px 20px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  };

  return (
    <div 
      className="wallet-main-screen relative"
      style={containerStyle}
      data-wallet-type="wallet"
    >
      <div className="relative p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: style.accentColor || '#9333ea' }}
            />
            <span 
              className="font-medium"
              style={{ 
                fontFamily: style.fontFamily,
                color: style.textColor 
              }}
            >
              Wallet
            </span>
          </div>
          <button
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            ⚙️
          </button>
        </div>

        {/* Balance */}
        <div className="text-center mb-6">
          <div 
            className="text-2xl font-bold mb-1"
            style={{ 
              fontFamily: style.fontFamily,
              color: style.textColor 
            }}
          >
            $1,234.56
          </div>
          <div 
            className="text-sm opacity-70"
            style={{ 
              fontFamily: style.fontFamily,
              color: style.textColor 
            }}
          >
            +2.5% today
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {['Send', 'Receive', 'Buy'].map((action) => (
            <button
              key={action}
              className="py-3 px-4 rounded-xl font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: style.buttonColor || style.accentColor,
                color: style.buttonTextColor || style.textColor,
                fontFamily: style.fontFamily
              }}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Assets */}
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold mb-3"
            style={{ 
              fontFamily: style.fontFamily,
              color: style.textColor 
            }}
          >
            Assets
          </h3>
          <div className="space-y-2">
            {[
              { name: 'Bitcoin', symbol: 'BTC', amount: '0.0123', value: '$456.78' },
              { name: 'Ethereum', symbol: 'ETH', amount: '1.234', value: '$567.89' },
              { name: 'Solana', symbol: 'SOL', amount: '12.34', value: '$210.00' }
            ].map((asset) => (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: style.accentColor || '#9333ea' }}
                  >
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <div 
                      className="font-medium"
                      style={{ 
                        fontFamily: style.fontFamily,
                        color: style.textColor 
                      }}
                    >
                      {asset.name}
                    </div>
                    <div 
                      className="text-sm opacity-70"
                      style={{ 
                        fontFamily: style.fontFamily,
                        color: style.textColor 
                      }}
                    >
                      {asset.amount} {asset.symbol}
                    </div>
                  </div>
                </div>
                <div 
                  className="font-medium"
                  style={{ 
                    fontFamily: style.fontFamily,
                    color: style.textColor 
                  }}
                >
                  {asset.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
