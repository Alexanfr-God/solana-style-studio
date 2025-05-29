
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Minus } from 'lucide-react';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface LibraryEyesProps {
  emotion: AiPetEmotion;
  size?: number;
}

const LibraryEyes: React.FC<LibraryEyesProps> = ({ emotion, size = 100 }) => {
  const getEyeComponent = (emotion: AiPetEmotion, eyeSide: 'left' | 'right') => {
    const baseSize = size * 0.15;
    
    switch (emotion) {
      case 'sleepy':
        return <Minus size={baseSize} className="text-gray-600" />;
      case 'wink':
        return eyeSide === 'left' ? <Minus size={baseSize} className="text-gray-600" /> : <Eye size={baseSize} className="text-white" />;
      case 'excited':
        return <Eye size={baseSize * 1.2} className="text-white" />;
      case 'sad':
        return <Eye size={baseSize * 0.9} className="text-gray-400" />;
      default:
        return <Eye size={baseSize} className="text-white" />;
    }
  };

  const getAnimationProps = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'excited':
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 0.8, repeat: Infinity }
        };
      case 'sleepy':
        return {
          opacity: [0.8, 0.4, 0.8],
          transition: { duration: 3, repeat: Infinity }
        };
      case 'suspicious':
        return {
          x: [-1, 1, -1],
          transition: { duration: 2, repeat: Infinity }
        };
      default:
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 2, repeat: Infinity }
        };
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
      <div className="relative" style={{ width: size * 0.6, height: size * 0.4 }}>
        {/* Left Eye */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            left: '20%',
            top: '30%',
            width: size * 0.2,
            height: size * 0.2
          }}
          animate={getAnimationProps(emotion)}
        >
          {getEyeComponent(emotion, 'left')}
        </motion.div>
        
        {/* Right Eye */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{
            right: '20%',
            top: '30%',
            width: size * 0.2,
            height: size * 0.2
          }}
          animate={getAnimationProps(emotion)}
        >
          {getEyeComponent(emotion, 'right')}
        </motion.div>
      </div>
    </div>
  );
};

export default LibraryEyes;
