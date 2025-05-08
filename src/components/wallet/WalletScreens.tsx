
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';

export const LoginScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[280px]"
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
      <div className="flex justify-center p-6 pt-10">
        <div 
          className="h-14 w-14 rounded-full bg-opacity-20" 
          style={{ backgroundColor: style.accentColor }}
        >
          <div className="flex h-full items-center justify-center">
            <span className="font-bold text-2xl">S</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Solana</h2>
        <p className="text-sm opacity-80 text-center mb-8">Log in to access your crypto wallet and assets.</p>
        
        {/* Input fields */}
        <div className="w-full max-w-xs space-y-4 mb-6">
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: style.borderRadius,
            }}
          >
            <span className="opacity-60">Email</span>
          </div>
          <div 
            className="h-12 rounded-lg px-4 flex items-center"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: style.borderRadius,
            }}
          >
            <span className="opacity-60">Password</span>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="w-full max-w-xs space-y-3">
          <button 
            className="w-full h-12 font-medium"
            style={{ 
              backgroundColor: style.buttonColor,
              color: style.buttonTextColor,
              borderRadius: style.borderRadius,
            }}
          >
            Login
          </button>
          <div className="flex justify-center mt-4">
            <span className="text-sm opacity-70">New user? <span style={{ color: style.accentColor }}>Create account</span></span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-6 text-center">
        <span className="text-xs opacity-50">v1.0.0</span>
      </div>
    </div>
  );
};

export const WalletScreen = ({ style }: { style: WalletStyle }) => {
  return (
    <div 
      className="wallet-preview flex flex-col rounded-2xl overflow-hidden w-full max-w-[280px]"
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
          <span className="font-medium">Solana Wallet</span>
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
        <div className="text-3xl font-bold">12.45 SOL</div>
        <div className="text-sm" style={{ color: style.accentColor }}>$236.55 USD</div>
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
          <span className="font-medium">Recent Transactions</span>
          <span className="text-sm opacity-70">See all</span>
        </div>
        
        {/* Transaction Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Received SOL</div>
              <div className="text-xs opacity-70">2 hours ago</div>
            </div>
          </div>
          <div className="text-right text-green-400">
            +2.4 SOL
          </div>
        </div>
        
        {/* Transaction Item */}
        <div 
          className="mb-3 p-4 flex justify-between items-center"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: style.borderRadius,
          }}
        >
          <div className="flex items-center">
            <div className="mr-3">
              <div className="font-medium">Sent to @friend</div>
              <div className="text-xs opacity-70">1 day ago</div>
            </div>
          </div>
          <div className="text-right">
            -0.5 SOL
          </div>
        </div>
      </div>
    </div>
  );
};
