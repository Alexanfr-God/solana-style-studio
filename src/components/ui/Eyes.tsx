
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface EyesProps {
  emotion: AiPetEmotion;
  size?: number;
}

const Eyes: React.FC<EyesProps> = ({ emotion, size = 100 }) => {
  const getEyeState = (emotion: AiPetEmotion, eyeSide: 'left' | 'right') => {
    switch (emotion) {
      case 'idle':
        return 'neutral';
      case 'excited':
        return 'round';
      case 'sleepy':
        return 'closed';
      case 'happy':
        return 'round';
      case 'suspicious':
        return eyeSide === 'left' ? 'squinting' : 'neutral';
      case 'sad':
        return 'lowered';
      case 'wink':
        return eyeSide === 'left' ? 'closed' : 'neutral';
      default:
        return 'neutral';
    }
  };

  const renderEye = (x: number, y: number, state: string) => {
    switch (state) {
      case 'neutral':
        return (
          <motion.circle 
            cx={x} 
            cy={y} 
            r="2" 
            fill="white" 
            opacity="0.9"
            animate={{
              r: [2, 2.2, 2],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'round':
        return (
          <motion.circle 
            cx={x} 
            cy={y} 
            r="2.5" 
            fill="white" 
            opacity="0.9"
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'closed':
        return (
          <motion.line 
            x1={x - 2} 
            y1={y} 
            x2={x + 2} 
            y2={y} 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.8"
            animate={{
              opacity: [0.8, 0.6, 0.8],
              transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'squinting':
        return (
          <motion.path
            d={`M${x - 2},${y - 1} L${x + 2},${y} L${x - 2},${y + 1}`}
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        );
      case 'lowered':
        return (
          <motion.circle 
            cx={x} 
            cy={y + 1} 
            r="1.5" 
            fill="white" 
            opacity="0.7"
            animate={{
              cy: [y + 1, y + 1.5, y + 1],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      default:
        return null;
    }
  };

  const leftEyeState = getEyeState(emotion, 'left');
  const rightEyeState = getEyeState(emotion, 'right');

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 2 }}
    >
      <g>
        {/* Left Eye */}
        {renderEye(38, 42, leftEyeState)}
        
        {/* Right Eye */}
        {renderEye(62, 42, rightEyeState)}
      </g>
    </svg>
  );
};

export default Eyes;
