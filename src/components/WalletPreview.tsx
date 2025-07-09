
import React from 'react';
import { useCustomizationStore, WalletStyle, LayerType } from '../stores/customizationStore';
import { useWalletTheme } from '../hooks/useWalletTheme';
import { cn } from '../lib/utils';

// Render Login Screen UI - now using new lockLayer theme structure
const LoginScreen = ({ style }: { style: WalletStyle }) => {
  const { getLockLayer } = useWalletTheme();
  const lockLayerStyle = getLockLayer();
  
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: lockLayerStyle.backgroundColor,
        backgroundImage: lockLayerStyle.backgroundImage ? `url(${lockLayerStyle.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: lockLayerStyle.title?.textColor,
        fontFamily: lockLayerStyle.title?.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div className="flex justify-center p-6 pt-10">
        <div 
          className="h-14 w-14 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: lockLayerStyle.unlockButton?.backgroundColor,
            opacity: 0.2
          }}
        >
          <span 
            className="font-bold text-2xl"
            style={{ color: lockLayerStyle.title?.textColor }}
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
            fontSize: lockLayerStyle.title?.fontSize,
            fontWeight: lockLayerStyle.title?.fontWeight,
            color: lockLayerStyle.title?.textColor,
            fontFamily: lockLayerStyle.title?.fontFamily
          }}
        >
          Welcome to Solana
        </h2>
        <p 
          className="text-sm text-center mb-8"
          style={{
            color: lockLayerStyle.forgotPassword?.textColor,
            fontSize: lockLayerStyle.forgotPassword?.fontSize,
            fontFamily: lockLayerStyle.forgotPassword?.fontFamily
          }}
        >
          Log in to access your crypto wallet and assets.
        </p>
        
        {/* Input fields */}
        <div className="w-full max-w-xs space-y-4 mb-6">
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: lockLayerStyle.passwordInput?.backgroundColor,
              borderRadius: lockLayerStyle.passwordInput?.borderRadius,
              border: lockLayerStyle.passwordInput?.border
            }}
          >
            <span 
              style={{ 
                color: lockLayerStyle.passwordInput?.placeholderColor 
              }}
            >
              Email
            </span>
          </div>
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: lockLayerStyle.passwordInput?.backgroundColor,
              borderRadius: lockLayerStyle.passwordInput?.borderRadius,
              border: lockLayerStyle.passwordInput?.border
            }}
          >
            <span 
              style={{ 
                color: lockLayerStyle.passwordInput?.placeholderColor 
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
              backgroundColor: lockLayerStyle.unlockButton?.backgroundColor,
              color: lockLayerStyle.unlockButton?.textColor,
              borderRadius: lockLayerStyle.unlockButton?.borderRadius,
              fontWeight: lockLayerStyle.unlockButton?.fontWeight,
              fontSize: lockLayerStyle.unlockButton?.fontSize
            }}
          >
            Login
          </button>
          <div className="flex justify-center mt-4">
            <span 
              className="text-sm"
              style={{
                color: lockLayerStyle.forgotPassword?.textColor,
                fontSize: lockLayerStyle.forgotPassword?.fontSize
              }}
            >
              New user?{' '}
              <span style={{ color: lockLayerStyle.unlockButton?.backgroundColor }}>
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
            color: lockLayerStyle.forgotPassword?.textColor,
            fontSize: '12px'
          }}
        >
          v1.0.0
        </span>
      </div>
    </div>
  );
};

// Render Wallet Screen UI - using homeLayer theme structure
const WalletScreen = ({ style }: { style: WalletStyle }) => {
  const { getHomeLayer } = useWalletTheme();
  const homeLayerStyle = getHomeLayer();

  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden"
      style={{
        backgroundColor: homeLayerStyle.backgroundColor,
        backgroundImage: homeLayerStyle.backgroundImage ? `url(${homeLayerStyle.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: homeLayerStyle.assetName?.textColor,
        fontFamily: homeLayerStyle.header?.fontFamily,
        boxShadow: style.boxShadow,
      }}
    >
      {/* Header */}
      <div 
        className="p-6 flex justify-between items-center"
        style={{
          backgroundColor: homeLayerStyle.header?.backgroundColor,
          color: homeLayerStyle.header?.textColor
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="h-10 w-10 rounded-full bg-opacity-20" 
            style={{ backgroundColor: homeLayerStyle.mainButtons?.iconColor }}
          >
            <div className="flex h-full items-center justify-center">
              <span className="font-bold">S</span>
            </div>
          </div>
          <span 
            className="font-medium"
            style={{
              fontFamily: homeLayerStyle.header?.fontFamily,
              fontSize: homeLayerStyle.header?.fontSize,
              fontWeight: homeLayerStyle.header?.fontWeight
            }}
          >
            Wallet
          </span>
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
        <div 
          className="text-sm"
          style={{
            color: homeLayerStyle.totalBalanceLabel?.textColor,
            fontFamily: homeLayerStyle.totalBalanceLabel?.fontFamily,
            fontSize: homeLayerStyle.totalBalanceLabel?.fontSize
          }}
        >
          Total Balance
        </div>
        <div 
          className="text-3xl font-bold"
          style={{
            color: homeLayerStyle.totalBalanceValue?.textColor,
            fontFamily: homeLayerStyle.totalBalanceValue?.fontFamily,
            fontSize: homeLayerStyle.totalBalanceValue?.fontSize,
            fontWeight: homeLayerStyle.totalBalanceValue?.fontWeight
          }}
        >
          34.218 SOL
        </div>
        <div 
          className="text-sm" 
          style={{ 
            color: homeLayerStyle.totalBalanceChange?.positiveColor,
            fontFamily: homeLayerStyle.totalBalanceChange?.fontFamily,
            fontSize: homeLayerStyle.totalBalanceChange?.fontSize
          }}
        >
          $2,532.42 USD
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-around px-6 py-4">
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ 
              backgroundColor: homeLayerStyle.mainButtons?.backgroundColor,
              borderRadius: homeLayerStyle.mainButtons?.borderRadius
            }}
          >
            <span style={{ color: homeLayerStyle.mainButtons?.iconColor }}>↑</span>
          </div>
          <span 
            className="text-xs"
            style={{
              color: homeLayerStyle.mainButtons?.textColor,
              fontFamily: homeLayerStyle.mainButtons?.fontFamily,
              fontSize: homeLayerStyle.mainButtons?.fontSize
            }}
          >
            Send
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ 
              backgroundColor: homeLayerStyle.mainButtons?.backgroundColor,
              borderRadius: homeLayerStyle.mainButtons?.borderRadius
            }}
          >
            <span style={{ color: homeLayerStyle.mainButtons?.iconColor }}>↓</span>
          </div>
          <span 
            className="text-xs"
            style={{
              color: homeLayerStyle.mainButtons?.textColor,
              fontFamily: homeLayerStyle.mainButtons?.fontFamily,
              fontSize: homeLayerStyle.mainButtons?.fontSize
            }}
          >
            Receive
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div 
            className="h-12 w-12 rounded-full flex items-center justify-center mb-2"
            style={{ 
              backgroundColor: homeLayerStyle.mainButtons?.backgroundColor,
              borderRadius: homeLayerStyle.mainButtons?.borderRadius
            }}
          >
            <span style={{ color: homeLayerStyle.mainButtons?.iconColor }}>↔</span>
          </div>
          <span 
            className="text-xs"
            style={{
              color: homeLayerStyle.mainButtons?.textColor,
              fontFamily: homeLayerStyle.mainButtons?.fontFamily,
              fontSize: homeLayerStyle.mainButtons?.fontSize
            }}
          >
            Swap
          </span>
        </div>
      </div>
      
      {/* Assets List */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <span 
            className="font-medium"
            style={{
              color: homeLayerStyle.assetName?.textColor,
              fontFamily: homeLayerStyle.assetName?.fontFamily,
              fontWeight: homeLayerStyle.assetName?.fontWeight
            }}
          >
            Assets
          </span>
          <span 
            className="text-sm"
            style={{
              color: homeLayerStyle.seeAll?.textColor,
              fontFamily: homeLayerStyle.seeAll?.fontFamily,
              fontSize: homeLayerStyle.seeAll?.fontSize
            }}
          >
            See all
          </span>
        </div>
        
        {/* Asset Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: homeLayerStyle.assetCard?.backgroundColor,
            borderRadius: homeLayerStyle.assetCard?.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full mr-3 flex items-center justify-center"
              style={{ backgroundColor: homeLayerStyle.mainButtons?.iconColor }}
            >
              <span>S</span>
            </div>
            <div>
              <div 
                className="font-medium"
                style={{
                  color: homeLayerStyle.assetName?.textColor,
                  fontFamily: homeLayerStyle.assetName?.fontFamily,
                  fontWeight: homeLayerStyle.assetName?.fontWeight,
                  fontSize: homeLayerStyle.assetName?.fontSize
                }}
              >
                Solana
              </div>
              <div 
                className="text-xs"
                style={{
                  color: homeLayerStyle.assetName?.textColor,
                  opacity: 0.7
                }}
              >
                SOL
              </div>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="font-medium"
              style={{
                color: homeLayerStyle.assetValue?.textColor,
                fontFamily: homeLayerStyle.assetValue?.fontFamily,
                fontWeight: homeLayerStyle.assetValue?.fontWeight,
                fontSize: homeLayerStyle.assetValue?.fontSize
              }}
            >
              32.4
            </div>
            <div 
              className="text-xs"
              style={{
                color: homeLayerStyle.assetValue?.textColor,
                opacity: 0.7
              }}
            >
              $2,405.23
            </div>
          </div>
        </div>
        
        {/* Asset Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: homeLayerStyle.assetCard?.backgroundColor,
            borderRadius: homeLayerStyle.assetCard?.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div 
              className="h-10 w-10 rounded-full mr-3 flex items-center justify-center bg-orange-500"
            >
              <span>B</span>
            </div>
            <div>
              <div 
                className="font-medium"
                style={{
                  color: homeLayerStyle.assetName?.textColor,
                  fontFamily: homeLayerStyle.assetName?.fontFamily,
                  fontWeight: homeLayerStyle.assetName?.fontWeight,
                  fontSize: homeLayerStyle.assetName?.fontSize
                }}
              >
                Bitcoin
              </div>
              <div 
                className="text-xs"
                style={{
                  color: homeLayerStyle.assetName?.textColor,
                  opacity: 0.7
                }}
              >
                BTC
              </div>
            </div>
          </div>
          <div className="text-right">
            <div 
              className="font-medium"
              style={{
                color: homeLayerStyle.assetValue?.textColor,
                fontFamily: homeLayerStyle.assetValue?.fontFamily,
                fontWeight: homeLayerStyle.assetValue?.fontWeight,
                fontSize: homeLayerStyle.assetValue?.fontSize
              }}
            >
              0.023
            </div>
            <div 
              className="text-xs"
              style={{
                color: homeLayerStyle.assetValue?.textColor,
                opacity: 0.7
              }}
            >
              $127.19
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div 
        className="px-6 py-4 flex justify-around"
        style={{ 
          backgroundColor: homeLayerStyle.footer?.backgroundColor,
          color: homeLayerStyle.footer?.textColor
        }}
      >
        <div className="flex flex-col items-center">
          <div style={{ color: homeLayerStyle.footer?.activeIconColor }}>📊</div>
          <span 
            className="text-xs mt-1"
            style={{
              color: homeLayerStyle.footer?.activeTextColor,
              fontFamily: homeLayerStyle.footer?.fontFamily,
              fontSize: homeLayerStyle.footer?.fontSize
            }}
          >
            Home
          </span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div style={{ color: homeLayerStyle.footer?.iconColor }}>💱</div>
          <span 
            className="text-xs mt-1"
            style={{
              color: homeLayerStyle.footer?.textColor,
              fontFamily: homeLayerStyle.footer?.fontFamily,
              fontSize: homeLayerStyle.footer?.fontSize
            }}
          >
            Swap
          </span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div style={{ color: homeLayerStyle.footer?.iconColor }}>📈</div>
          <span 
            className="text-xs mt-1"
            style={{
              color: homeLayerStyle.footer?.textColor,
              fontFamily: homeLayerStyle.footer?.fontFamily,
              fontSize: homeLayerStyle.footer?.fontSize
            }}
          >
            Market
          </span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <div style={{ color: homeLayerStyle.footer?.iconColor }}>⚙️</div>
          <span 
            className="text-xs mt-1"
            style={{
              color: homeLayerStyle.footer?.textColor,
              fontFamily: homeLayerStyle.footer?.fontFamily,
              fontSize: homeLayerStyle.footer?.fontSize
            }}
          >
            Settings
          </span>
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
