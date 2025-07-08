
import React from 'react';
import { useCustomizationStore, WalletStyle, LayerType } from '../stores/customizationStore';
import { useWalletTheme } from '../hooks/useWalletTheme';
import { cn } from '../lib/utils';

// Render Login Screen UI - now using theme system
const LoginScreen = ({ style }: { style: WalletStyle }) => {
  const { getComponentStyle } = useWalletTheme();
  const lockScreenStyle = getComponentStyle('lockScreen');
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: lockScreenStyle.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: lockScreenStyle.textColor,
        fontFamily: lockScreenStyle.titleStyle.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="flex justify-center p-6 pt-10">
        <div 
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: lockScreenStyle.accentColor,
            opacity: lockScreenStyle.logoBackground.opacity
          }}
        >
          <span 
            className="font-bold text-2xl"
            style={{ color: lockScreenStyle.textColor }}
          >
            S
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 
          className="text-2xl font-bold mb-2"
          style={{
            fontSize: lockScreenStyle.titleStyle.fontSize,
            fontWeight: lockScreenStyle.titleStyle.fontWeight,
            color: lockScreenStyle.titleStyle.color,
            fontFamily: lockScreenStyle.titleStyle.fontFamily
          }}
        >
          Welcome to Solana
        </h2>
        <p 
          className="text-sm text-center mb-8"
          style={{
            color: lockScreenStyle.secondaryText.color,
            fontSize: lockScreenStyle.secondaryText.fontSize,
            fontFamily: lockScreenStyle.secondaryText.fontFamily
          }}
        >
          Log in to access your crypto wallet and assets.
        </p>
        
        {/* Input fields */}
        <div className="w-full max-w-xs space-y-4 mb-6">
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: lockScreenStyle.inputStyle.backgroundColor,
              borderRadius: lockScreenStyle.inputStyle.borderRadius,
              border: lockScreenStyle.inputStyle.border,
              padding: lockScreenStyle.inputStyle.padding
            }}
          >
            <span 
              style={{ 
                color: lockScreenStyle.inputStyle.placeholderColor 
              }}
            >
              Email
            </span>
          </div>
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: lockScreenStyle.inputStyle.backgroundColor,
              borderRadius: lockScreenStyle.inputStyle.borderRadius,
              border: lockScreenStyle.inputStyle.border,
              padding: lockScreenStyle.inputStyle.padding
            }}
          >
            <span 
              style={{ 
                color: lockScreenStyle.inputStyle.placeholderColor 
              }}
            >
              Password
            </span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <button 
            className="w-full h-12 font-medium"
            style={{ 
              backgroundColor: lockScreenStyle.primaryButton.backgroundColor,
              color: lockScreenStyle.primaryButton.textColor,
              borderRadius: lockScreenStyle.primaryButton.borderRadius,
              fontWeight: lockScreenStyle.primaryButton.fontWeight,
              fontSize: lockScreenStyle.primaryButton.fontSize,
              padding: lockScreenStyle.primaryButton.padding
            }}
          >
            Login
          </button>
          <div className="flex justify-center mt-4">
            <span 
              className="text-sm"
              style={{
                color: lockScreenStyle.secondaryText.color,
                fontSize: lockScreenStyle.secondaryText.fontSize
              }}
            >
              New user?{' '}
              <span style={{ color: lockScreenStyle.accentColor }}>
                Create account
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 text-center">
        <span 
          className="text-xs"
          style={{
            color: lockScreenStyle.footerText.color,
            fontSize: lockScreenStyle.footerText.fontSize
          }}
        >
          v1.0.0
        </span>
      </div>
    </div>
  );
};

// Render Wallet Screen UI
const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: style.textColor,
        fontFamily: style.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div 
            className="h-10 w-10 rounded-full bg-opacity-20" 
            style={{ backgroundColor: style.accentColor }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="font-bold">S</span>
            </div>
          </div>
          <span className="font-medium">Wallet</span>
        </div>
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span>👤</span>
        </div>
      </div>
      
      {/* Balance */}
      <div className="px-6 py-4">
        <div className="text-sm opacity-70">Total Balance</div>
        <div className="text-3xl font-bold">34.218 SOL</div>
        <div className="text-sm" style={{ color: style.accentColor }}>$2,532.42 USD</div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-around px-6 py-4">
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↑</span>
          </div>
          <span className="text-xs">Send</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↓</span>
          </div>
          <span className="text-xs">Receive</span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: style.buttonColor }}
          >
            <span style={{ color: style.buttonTextColor }}>↔</span>
          </div>
          <span className="text-xs">Swap</span>
        </div>
      </div>
      
      {/* Assets List */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Assets</span>
          <span className="text-sm opacity-70">See all</span>
        </div>
        
        {/* Asset Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full mr-3 flex items-center justify-center"
              style={{ backgroundColor: style.accentColor }}
            >
              <span>S</span>
            </div>
            <div>
              <div className="font-medium">Solana</div>
              <div className="text-xs opacity-70">SOL</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">32.4</div>
            <div className="text-xs opacity-70">$2,405.23</div>
          </div>
        </div>
        
        {/* Asset Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full mr-3 flex items-center justify-center bg-orange-500"
            >
              <span>B</span>
            </div>
            <div>
              <div className="font-medium">Bitcoin</div>
              <div className="text-xs opacity-70">BTC</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">0.023</div>
            <div className="text-xs opacity-70">$127.19</div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div 
        className="px-6 py-4 flex justify-around"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      >
        <div className="flex flex-col items-center">
          <div style={{ color: style.accentColor }}>📊</div>
          <span className="text-xs mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div>💱</div>
          <span className="text-xs mt-1">Swap</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div>📈</div>
          <span className="text-xs mt-1">Market</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div>⚙️</div>
          <span className="text-xs mt-1">Settings</span>
        </div>
      </div>
    </div>
  );
};

const WalletPreview = () => {
  const { activeLayer, loginStyle, walletStyle } = useCustomizationStore();
  const currentStyle = activeLayer === 'login' ? loginStyle : walletStyle;

  return (
    <div className="flex items-center justify-center p-4 bg-black/10 backdrop-blur-sm rounded-lg">
      {activeLayer === 'login' ? (
        <LoginScreen style={currentStyle} />
      ) : (
        <WalletScreen style={currentStyle} />
      )}
    </div>
  );
};

export default WalletPreview;
