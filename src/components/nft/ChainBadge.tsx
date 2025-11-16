import React from 'react';
import { cn } from '@/lib/utils';

interface ChainBadgeProps {
  chain: 'solana' | 'ethereum';
  network?: 'devnet' | 'mainnet';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ChainBadge: React.FC<ChainBadgeProps> = ({
  chain,
  network,
  size = 'md',
  animated = true,
  className
}) => {
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base'
  };

  const chainStyles = {
    solana: {
      gradient: 'from-purple-600 via-purple-500 to-green-400',
      text: 'SOL',
      glow: 'shadow-purple-500/50'
    },
    ethereum: {
      gradient: 'from-blue-600 via-blue-500 to-gray-400',
      text: 'ETH',
      glow: 'shadow-blue-500/50'
    }
  };

  const style = chainStyles[chain];

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-full font-bold',
        'bg-gradient-to-r backdrop-blur-sm',
        style.gradient,
        sizeClasses[size],
        animated && 'animate-pulse',
        'shadow-lg',
        style.glow,
        className
      )}
    >
      <span className="text-white drop-shadow-lg">
        {style.text}
      </span>
      {network && (
        <>
          <span className="text-white/60">•</span>
          <span className="text-white/90 text-xs font-normal">
            {network}
          </span>
        </>
      )}
    </div>
  );
};
