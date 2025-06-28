
import React from 'react';

interface WalletScanAnimationProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const WalletScanAnimation: React.FC<WalletScanAnimationProps> = ({ 
  isActive, 
  children 
}) => {
  return (
    <div className="relative">
      {children}
      
      {/* Scanning Overlay */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* Scanning Line */}
          <div className="absolute inset-0">
            <div className="scanning-line absolute w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80 animate-scan-vertical"></div>
          </div>
          
          {/* Grid Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 animate-pulse"></div>
          
          {/* Corner Indicators */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-400 animate-pulse"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-400 animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-400 animate-pulse"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-400 animate-pulse"></div>
          
          {/* Status Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 px-3 py-1 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-400 font-medium">AI Analyzing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletScanAnimation;
