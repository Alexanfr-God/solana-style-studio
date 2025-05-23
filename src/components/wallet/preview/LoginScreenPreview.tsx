
import React from 'react';
import { WalletStyle } from '@/stores/customizationStore';

interface LoginScreenPreviewProps {
  style: WalletStyle;
}

export const LoginScreenPreview = ({ style }: LoginScreenPreviewProps) => {
  return (
    <div 
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: '320px',
        height: '569px',
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
