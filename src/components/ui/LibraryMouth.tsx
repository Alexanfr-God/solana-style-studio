
import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Meh, Minus } from 'lucide-react';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface LibraryMouthProps {
  emotion: AiPetEmotion;
  size?: number;
}

const LibraryMouth: React.FC<LibraryMouthProps> = ({ emotion, size = 100 }) => {
  const getMouthComponent = (emotion: AiPetEmotion) => {
    const baseSize = size * 0.12;
    
    switch (emotion) {
      case 'happy':
      case 'excited':
      case 'wink':
        return <Smile size={baseSize} className="text-white" />;
      case 'sad':
        return <Frown size={baseSize} className="text-gray-400" />;
      case 'sleepy':
        return <Minus size={baseSize * 0.8} className="text-gray-500" />;
      case 'suspicious':
        return <Meh size={baseSize} className="text-gray-300" />;
      default:
        return <Meh size={baseSize * 0.9} className="text-gray-200" />;
    }
  };

  const getAnimationProps = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'excited':
        return {
          scale: [1, 1.3, 1],
          transition: { duration: 0.8, repeat: Infinity }
        };
      case 'happy':
        return {
          scale: [1, 1.1, 1],
          transition: { duration: 2, repeat: Infinity }
        };
      case 'wink':
        return {
          rotate: [0, -5, 5, 0],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'suspicious':
        return {
          x: [-2, 2, -2],
          transition: { duration: 3, repeat: Infinity }
        };
      default:
        return {
          opacity: [0.8, 1, 0.8],
          transition: { duration: 3, repeat: Infinity }
        };
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
      <motion.div
        className="flex items-center justify-center"
        style={{
          marginTop: size * 0.15,
          width: size * 0.15,
          height: size * 0.15
        }}
        animate={getAnimationProps(emotion)}
      >
        {getMouthComponent(emotion)}
      </motion.div>
    </div>
  );
};

export default LibraryMouth;
