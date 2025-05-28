
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface PhantomEyesProps {
  emotion: AiPetEmotion;
  size?: number;
}

const PhantomEyes: React.FC<PhantomEyesProps> = ({ emotion, size = 100 }) => {
  const getEyeState = (emotion: AiPetEmotion, eyeSide: 'left' | 'right') => {
    switch (emotion) {
      case 'idle':
        return 'open';
      case 'excited':
        return 'wide';
      case 'sleepy':
        return 'closed';
      case 'happy':
        return 'open';
      case 'suspicious':
        return eyeSide === 'left' ? 'squinting' : 'open';
      case 'sad':
        return 'droopy';
      case 'wink':
        return eyeSide === 'left' ? 'closed' : 'open';
      default:
        return 'open';
    }
  };

  const renderEye = (x: number, y: number, state: string) => {
    switch (state) {
      case 'open':
        return (
          <g>
            {/* Eye socket */}
            <motion.ellipse
              cx={x}
              cy={y}
              rx="4"
              ry="5"
              fill="rgba(0,0,0,0.8)"
              animate={{
                ry: [5, 5.5, 5],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            {/* Eye glow */}
            <motion.ellipse
              cx={x}
              cy={y}
              rx="2.5"
              ry="3"
              fill="white"
              opacity="0.9"
              animate={{
                opacity: [0.7, 1, 0.7],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </g>
        );
      case 'wide':
        return (
          <g>
            <motion.ellipse
              cx={x}
              cy={y}
              rx="5"
              ry="6"
              fill="rgba(0,0,0,0.8)"
              animate={{
                scale: [1, 1.2, 1],
                transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.ellipse
              cx={x}
              cy={y}
              rx="3"
              ry="4"
              fill="white"
              opacity="0.95"
              animate={{
                scale: [1, 1.3, 1],
                transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </g>
        );
      case 'closed':
        return (
          <motion.path
            d={`M${x - 4},${y} Q${x},${y - 2} ${x + 4},${y}`}
            stroke="rgba(0,0,0,0.6)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              opacity: [0.8, 0.6, 0.8],
              transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        );
      case 'squinting':
        return (
          <g>
            <motion.ellipse
              cx={x}
              cy={y}
              rx="3"
              ry="2"
              fill="rgba(0,0,0,0.8)"
            />
            <motion.ellipse
              cx={x}
              cy={y}
              rx="1.5"
              ry="1"
              fill="white"
              opacity="0.8"
            />
          </g>
        );
      case 'droopy':
        return (
          <g>
            <motion.ellipse
              cx={x}
              cy={y + 1}
              rx="3.5"
              ry="4"
              fill="rgba(0,0,0,0.8)"
              animate={{
                cy: [y + 1, y + 2, y + 1],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            />
            <motion.ellipse
              cx={x}
              cy={y + 1}
              rx="2"
              ry="2.5"
              fill="white"
              opacity="0.7"
              animate={{
                cy: [y + 1, y + 2, y + 1],
                transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          </g>
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
        {renderEye(35, 35, leftEyeState)}
        
        {/* Right Eye */}
        {renderEye(65, 35, rightEyeState)}
      </g>
    </svg>
  );
};

export default PhantomEyes;
