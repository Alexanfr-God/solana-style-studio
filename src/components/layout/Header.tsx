
import React from 'react';
import { Link } from 'react-router-dom';
import ConnectWalletButton from '@/components/auth/ConnectWalletButton';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-screen-xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link 
            to="/" 
            className="text-white font-bold text-xl tracking-wider uppercase transition-all duration-300 hover:text-shadow-glow hover:scale-105"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Wallet Coast Customs
            </span>
          </Link>
          
          {/* Right: Connect Wallet */}
          <div className="flex items-center">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
      
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none"></div>
    </header>
  );
};

export default Header;
