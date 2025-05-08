
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StylingTip from './StylingTip';

const WalletStylist = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-50"></div>
        <Avatar className="w-24 h-24 border-2 border-white/20">
          <AvatarImage src="/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png" />
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-500">WS</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
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
      
      <h3 className="text-xl font-semibold mt-4 text-white">Your Wallet Stylist</h3>
      
      <div className="mt-4 max-w-md bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
        <p className="text-sm text-white text-center">Upload an image or use our AI to generate a unique style.</p>
      </div>
      
      <div className="mt-4">
        <StylingTip />
      </div>
    </div>
  );
};

export default WalletStylist;
