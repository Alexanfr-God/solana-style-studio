
import React from 'react';
import { Button } from '@/components/ui/button';

const EditorHeader = () => {
  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        Wallet Coast Customs ✨
      </h1>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-white border-white/20 bg-black/30 backdrop-blur-sm"
        >
          <span className="flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="128" height="128" rx="24" fill="url(#paint0_linear_6_33)"/>
              <path d="M110.584 64.9142H99.142C99.142 41.8335 80.214 23 57 23V34.214C73.786 34.214 87.857 48.2502 87.857 64.9142H76.415C76.415 64.9142 92.513 81.2282 92.8708 81.5619C93.8476 82.5057 95.4417 82.49 96.4348 81.5619L110.584 64.9142Z" fill="white"/>
              <path d="M57 105.829V94.6147C40.214 94.6147 26.143 80.5785 26.143 63.9144H37.585C37.585 63.9144 21.487 47.6005 21.1292 47.2667C20.1524 46.323 18.5583 46.3387 17.5652 47.2667L3.41602 63.9144H14.858C14.858 87.0941 33.786 105.829 57 105.829Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear_6_33" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9945FF"/>
                  <stop offset="1" stopColor="#14F195"/>
                </linearGradient>
              </defs>
            </svg>
            Phantom V1
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </span>
        </Button>
      </div>
    </header>
  );
};

export default EditorHeader;
