
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
    <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
      {/* Avatar and Speech Bubble Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-4xl">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-50"></div>
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-3 border-white/20 relative z-10">
            <AvatarImage alt="Wallet Rider" src="/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png" />
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-500">WR</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1.5 z-20">
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
        </div>
        
        {/* Speech Bubble - Now positioned relatively */}
        <div className="flex-1 max-w-md md:max-w-lg">
          <div
            className={`relative bg-black/80 text-white p-4 rounded-xl transition-opacity duration-1000 ${
              showQuote ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Speech bubble tail for desktop */}
            <div className="hidden md:block absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-0 h-0 
                  border-t-8 border-t-transparent 
                  border-r-8 border-r-black/80 
                  border-b-8 border-b-transparent">
            </div>
            {/* Speech bubble tail for mobile (bottom) */}
            <div className="block md:hidden absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 
                  border-l-8 border-l-transparent 
                  border-b-8 border-b-black/80 
                  border-r-8 border-r-transparent">
            </div>
            <p className="text-sm md:text-md font-medium">{currentQuote}</p>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mt-6 text-white">Your Wallet Rider</h3>
      
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
