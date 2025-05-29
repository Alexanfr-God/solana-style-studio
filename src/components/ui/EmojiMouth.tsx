
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface EmojiMouthProps {
  emotion: AiPetEmotion;
  size?: number;
}

const EmojiMouth: React.FC<EmojiMouthProps> = ({ emotion, size = 100 }) => {
  const getMouthEmoji = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🤩';
      case 'sad':
        return '😢';
      case 'sleepy':
        return '😴';
      case 'suspicious':
        return '🤔';
      case 'wink':
        return '😉';
      default:
        return '😐';
    }
  };

  const getAnimationProps = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'excited':
        return {
          scale: [1, 1.4, 1],
          y: [0, -3, 0],
          transition: { duration: 0.6, repeat: Infinity }
        };
      case 'happy':
        return {
          scale: [1, 1.2, 1],
          transition: { duration: 2, repeat: Infinity }
        };
      case 'wink':
        return {
          rotate: [0, -10, 10, 0],
          scale: [1, 1.1, 1],
          transition: { duration: 1.5, repeat: Infinity }
        };
      case 'suspicious':
        return {
          x: [-2, 2, -2],
          rotate: [0, 5, -5, 0],
          transition: { duration: 3, repeat: Infinity }
        };
      default:
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 4, repeat: Infinity }
        };
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
      <motion.div
        className="flex items-center justify-center"
        style={{
          marginTop: size * 0.15,
          fontSize: size * 0.12
        }}
        animate={getAnimationProps(emotion)}
      >
        {getMouthEmoji(emotion)}
      </motion.div>
    </div>
  );
};

export default EmojiMouth;
