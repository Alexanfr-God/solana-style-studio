import React from 'react';

interface RibbonBadgeProps {
  chain: 'solana' | 'ethereum';
  network: 'devnet' | 'mainnet';
}

export const RibbonBadge: React.FC<RibbonBadgeProps> = ({ chain, network }) => {
  const gradients = {
    solana: 'from-purple-600 via-purple-500 to-teal-400',
    ethereum: 'from-blue-600 via-blue-400 to-gray-300'
  };
  
  const chainText = chain === 'solana' ? 'SOL' : 'ETH';
  const networkText = network.toUpperCase();
  
  return (
    <div className="absolute top-0 right-0 w-20 h-8 overflow-hidden pointer-events-none z-20">
      <div 
        className={`absolute -top-2 -right-8 w-32 h-8
          bg-gradient-to-r ${gradients[chain]}
          transform rotate-45 origin-center
          flex items-center justify-center
          text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase
          shadow-lg`}
      >
        {chainText} • {networkText}
      </div>
    </div>
  );
};
