
import React from 'react';
import { useWalletCustomizationStore, WalletLayer } from '@/stores/walletCustomizationStore';

interface HeroDisplayProps {
  layer: WalletLayer;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'center' | 'top-right' | 'bottom-left' | 'floating';
}

const HeroDisplay: React.FC<HeroDisplayProps> = ({ 
  layer, 
  className = '',
  size = 'medium',
  position = 'center'
}) => {
  const { getHeroForLayer, walletStyle } = useWalletCustomizationStore();
  const heroUrl = getHeroForLayer(layer);

  if (!heroUrl) {
    return null;
  }

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const positionClasses = {
    center: 'mx-auto',
    'top-right': 'absolute top-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    floating: 'float-right mr-4 mb-2'
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden relative`}
        style={{
          boxShadow: `0 0 20px ${walletStyle.primaryColor}40`,
          border: `2px solid ${walletStyle.primaryColor}60`
        }}
      >
        <img 
          src={heroUrl} 
          alt={`Hero character for ${layer} layer`}
          className="w-full h-full object-cover object-center"
        />
        
        {/* Glowing border effect */}
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            border: `1px solid ${walletStyle.primaryColor}80`,
            boxShadow: `inset 0 0 10px ${walletStyle.primaryColor}20`
          }}
        />
      </div>
    </div>
  );
};

export default HeroDisplay;
