
import React from 'react';

interface EnhancedWalletScanAnimationProps {
  isActive: boolean;
  progress?: number;
  isSuccess?: boolean;
  children: React.ReactNode;
}

export const EnhancedWalletScanAnimation: React.FC<EnhancedWalletScanAnimationProps> = ({ 
  isActive, 
  progress = 0,
  isSuccess = false,
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
          
          {/* Enhanced Corner Indicators */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-400 animate-pulse"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-400 animate-pulse"></div>
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-400 animate-pulse"></div>
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-400 animate-pulse"></div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-black/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Status Text */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-400 font-medium">
                {progress > 0 ? `Применение стилей... ${progress}%` : 'AI анализирует кошелек...'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Animation */}
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600/90 px-4 py-2 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-300 rounded-full"></div>
              <span className="text-sm text-green-100 font-medium">Стили применены!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedWalletScanAnimation;
