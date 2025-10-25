
import React from 'react';
import { Link } from 'react-router-dom';
import MultichainWalletButton from '@/components/auth/MultichainWalletButton';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: DEVNET Badge + Brand Logo */}
          <div className="flex items-center gap-3">
            {/* DEVNET Indicator - Animated pulsating badge */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-md opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 rounded-full border border-orange-400/50 shadow-lg">
                <span className="text-white text-xs font-bold tracking-wider uppercase animate-pulse">
                  WE ARE IN DEVNET
                </span>
              </div>
            </div>
            
            {/* Brand Logo */}
            <Link 
              to="/" 
              className="text-white font-bold text-xl tracking-wider uppercase transition-all duration-300 hover:text-shadow-glow hover:scale-105"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Wallet Coast Customs
              </span>
            </Link>
          </div>
          
          {/* Right: Connect Wallet */}
          <div className="flex items-center">
            <MultichainWalletButton />
          </div>
        </div>
      </div>
      
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none"></div>
    </header>
  );
};

export default Header;
