
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface EmojiEyesProps {
  emotion: AiPetEmotion;
  size?: number;
}

const EmojiEyes: React.FC<EmojiEyesProps> = ({ emotion, size = 100 }) => {
  const getEyeEmoji = (emotion: AiPetEmotion, eyeSide: 'left' | 'right') => {
    switch (emotion) {
      case 'sleepy':
        return '😴';
      case 'wink':
        return eyeSide === 'left' ? '😉' : '👁️';
      case 'excited':
        return '🤩';
      case 'suspicious':
        return '🤨';
      case 'sad':
        return '😢';
      case 'happy':
        return '😊';
      default:
        return '👁️';
    }
  };

  const getAnimationProps = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'excited':
        return {
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0],
          transition: { duration: 0.8, repeat: Infinity }
        };
      case 'sleepy':
        return {
          y: [0, 2, 0],
          opacity: [1, 0.6, 1],
          transition: { duration: 4, repeat: Infinity }
        };
      case 'wink':
        return {
          scale: [1, 1.1, 1],
          transition: { duration: 1.2, repeat: Infinity }
        };
      default:
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 3, repeat: Infinity }
        };
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
      <div className="relative" style={{ width: size * 0.6, height: size * 0.4 }}>
        {/* Left Eye */}
        <motion.div
          className="absolute flex items-center justify-center text-2xl"
          style={{
            left: '15%',
            top: '25%',
            fontSize: size * 0.15
          }}
          animate={getAnimationProps(emotion)}
        >
          {getEyeEmoji(emotion, 'left')}
        </motion.div>
        
        {/* Right Eye */}
        <motion.div
          className="absolute flex items-center justify-center text-2xl"
          style={{
            right: '15%',
            top: '25%',
            fontSize: size * 0.15
          }}
          animate={getAnimationProps(emotion)}
        >
          {getEyeEmoji(emotion, 'right')}
        </motion.div>
      </div>
    </div>
  );
};

export default EmojiEyes;
