
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface PhantomMouthProps {
  emotion: AiPetEmotion;
  size?: number;
}

const PhantomMouth: React.FC<PhantomMouthProps> = ({ emotion, size = 100 }) => {
  const renderMouth = (emotion: AiPetEmotion) => {
    switch (emotion) {
      case 'idle':
        return (
          <motion.ellipse
            cx="50"
            cy="55"
            rx="2"
            ry="1.5"
            fill="rgba(0,0,0,0.6)"
            animate={{
              opacity: [0.6, 0.4, 0.6],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'happy':
        return (
          <motion.path 
            d="M 40 50 Q 50 60 60 50" 
            stroke="rgba(0,0,0,0.8)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            animate={{
              d: ["M 40 50 Q 50 60 60 50", "M 40 50 Q 50 62 60 50", "M 40 50 Q 50 60 60 50"],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'excited':
        return (
          <motion.ellipse
            cx="50"
            cy="55"
            rx="3"
            ry="4"
            fill="rgba(0,0,0,0.8)"
            animate={{
              ry: [4, 5, 4],
              rx: [3, 4, 3],
              transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'sleepy':
        return (
          <motion.line 
            x1="47" 
            y1="58" 
            x2="53" 
            y2="58" 
            stroke="rgba(0,0,0,0.4)" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            animate={{
              opacity: [0.4, 0.2, 0.4],
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'suspicious':
        return (
          <motion.path 
            d="M 45 55 Q 48 53 51 55 Q 54 57 57 55" 
            stroke="rgba(0,0,0,0.7)" 
            strokeWidth="1.8" 
            fill="none" 
            strokeLinecap="round" 
            animate={{
              d: [
                "M 45 55 Q 48 53 51 55 Q 54 57 57 55",
                "M 45 55 Q 48 52 51 55 Q 54 58 57 55",
                "M 45 55 Q 48 53 51 55 Q 54 57 57 55"
              ],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'sad':
        return (
          <motion.path 
            d="M 40 60 Q 50 52 60 60" 
            stroke="rgba(0,0,0,0.7)" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round" 
            animate={{
              d: ["M 40 60 Q 50 52 60 60", "M 40 60 Q 50 50 60 60", "M 40 60 Q 50 52 60 60"],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'wink':
        return (
          <motion.path 
            d="M 42 53 Q 50 58 58 52" 
            stroke="rgba(0,0,0,0.8)" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            animate={{
              d: ["M 42 53 Q 50 58 58 52", "M 42 53 Q 50 60 58 52", "M 42 53 Q 50 58 58 52"],
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

export default PhantomMouth;
