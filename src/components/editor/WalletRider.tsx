
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StylingTip from './StylingTip';

const quotes = [
  "Yo dawg, I heard you like wallets, so I put styles in your wallet while you connect your wallet.",
  "We gonna turn your basic wallet into a masterpiece on the blockchain.",
  "No more boring logins – it's time for neon gradients and smooth UX!",
  "Your wallet's about to get so fresh, Solana will DM you.",
  "You bring the SOL, we bring the swag!"
];

const WalletRider = () => {
  const [currentQuote, setCurrentQuote] = useState(quotes[0]);
  const [showQuote, setShowQuote] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start fade out
      setShowQuote(false);
      
      setTimeout(() => {
        // Change quote and start fade in
        const currentIndex = quotes.indexOf(currentQuote);
        const nextIndex = (currentIndex + 1) % quotes.length;
        setCurrentQuote(quotes[nextIndex]);
        setShowQuote(true);
      }, 1000); // Wait for fade-out animation to complete
      
    }, 10000); // Change quote every 10 seconds

    return () => clearInterval(intervalId);
  }, [currentQuote]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-50"></div>
        <Avatar className="w-40 h-40 border-3 border-white/20">
          <AvatarImage alt="Wallet Rider" src="/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png" />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-500">WR</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <path d="M7 11v12h10V11"></path>
            <path d="M11 5h6l3 6H9.5a.5.5 0 0 1-.5-.5V9c0-2.2.7-4 3-4Z"></path>
          </svg>
        </div>
        
        {/* Speech Bubble - Fixed with z-index and position */}
        <div className="absolute top-0 left-full ml-4 w-64 z-50">
          <div
            className={`relative bg-black/80 text-white p-3 rounded-xl transition-opacity duration-1000 ${
              showQuote ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 
                  border-t-8 border-t-transparent 
                  border-r-8 border-r-black/80 
                  border-b-8 border-b-transparent">
            </div>
            <p className="text-md font-medium">{currentQuote}</p>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-4 text-white">Your Wallet Rider</h3>
      
      <div className="mt-4 max-w-md bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
        <p className="text-sm text-white text-center">Upload an image or use our AI to generate a unique style.</p>
      </div>
      
      <div className="mt-4">
        <StylingTip />
      </div>
    </div>
  );
};

export default WalletRider;
