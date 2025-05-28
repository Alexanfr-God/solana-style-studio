
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface MouthProps {
  emotion: AiPetEmotion;
  size?: number;
}

const Mouth: React.FC<MouthProps> = ({ emotion, size = 100 }) => {
  const renderMouth = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'idle':
        return (
          <motion.line 
            x1="45" 
            y1="58" 
            x2="55" 
            y2="58" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.7"
            animate={{
              opacity: [0.7, 0.5, 0.7],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'happy':
        return (
          <motion.path 
            d="M 42 55 Q 50 65 58 55" 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.9"
            animate={{
              d: ["M 42 55 Q 50 65 58 55", "M 42 55 Q 50 67 58 55", "M 42 55 Q 50 65 58 55"],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'excited':
        return (
          <motion.ellipse
            cx="50"
            cy="58"
            rx="4"
            ry="2"
            fill="white"
            opacity="0.8"
            animate={{
              ry: [2, 3, 2],
              transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'sleepy':
        return (
          <motion.line 
            x1="46" 
            y1="60" 
            x2="54" 
            y2="60" 
            stroke="white" 
            strokeWidth="1" 
            strokeLinecap="round" 
            opacity="0.5"
            animate={{
              opacity: [0.5, 0.3, 0.5],
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'suspicious':
        return (
          <motion.path 
            d="M 44 58 Q 48 56 52 58 Q 56 60 58 58" 
            stroke="white" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.8"
            animate={{
              d: [
                "M 44 58 Q 48 56 52 58 Q 56 60 58 58",
                "M 44 58 Q 48 55 52 58 Q 56 61 58 58",
                "M 44 58 Q 48 56 52 58 Q 56 60 58 58"
              ],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'sad':
        return (
          <motion.path 
            d="M 42 62 Q 50 55 58 62" 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.7"
            animate={{
              d: ["M 42 62 Q 50 55 58 62", "M 42 62 Q 50 53 58 62", "M 42 62 Q 50 55 58 62"],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'wink':
        return (
          <motion.path 
            d="M 44 58 Q 52 62 58 56" 
            stroke="white" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            opacity="0.8"
            animate={{
              d: ["M 44 58 Q 52 62 58 56", "M 44 58 Q 52 64 58 56", "M 44 58 Q 52 62 58 56"],
              transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 3 }}
    >
      <g>
        {renderMouth(emotion)}
      </g>
    </svg>
  );
};

export default Mouth;
