
import React from 'react';
import { useMaskEditorStore } from '@/stores/maskEditorStore';

interface V3MaskOverlayProps {
  className?: string;
}

const V3MaskOverlay: React.FC<V3MaskOverlayProps> = ({ className }) => {
  const { selectedMask } = useMaskEditorStore();

  if (!selectedMask) return null;

  return (
    <div 
      className={`absolute top-0 left-0 w-full h-full pointer-events-none z-30 flex items-center justify-center ${className}`}
    >
      <div
        style={{
          position: 'absolute',
          width: '150%', // Expanded to allow mask to grow around the wallet
          height: '150%', // Expanded to allow mask to grow around the wallet
          backgroundImage: `url(${selectedMask.imageUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
    </div>
  );
};

export default V3MaskOverlay;
