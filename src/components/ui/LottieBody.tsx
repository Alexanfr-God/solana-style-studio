
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';

interface LottieBodyProps {
  emotion: AiPetEmotion;
  zone: AiPetZone;
  size: number;
  color?: string;
  isAnimating?: boolean;
}

const LottieBody: React.FC<LottieBodyProps> = ({
  emotion,
  zone,
  size,
  color = '#9945FF',
  isAnimating = false
}) => {
  // Mapping emotions to different animation speeds/states
  const getAnimationSpeed = (emotion: AiPetEmotion): number => {
    switch (emotion) {
      case 'excited': return 1.5;
      case 'sleepy': return 0.3;
      case 'happy': return 1.2;
      case 'suspicious': return 0.8;
      case 'sad': return 0.6;
      case 'wink': return 1.1;
      case 'idle':
      default: return 1;
    }
  };

  // Different floating animations based on emotion
  const floatVariants = {
    idle: {
      y: [0, -2, 0],
      scale: [1, 1.02, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    excited: {
      y: [0, -8, 2, -5, 0],
      scale: [1, 1.1, 0.95, 1.05, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    },
    sleepy: {
      y: [0, 1, 0],
      scale: [1, 0.98, 1],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    },
    happy: {
      y: [0, -4, 0],
      scale: [1, 1.06, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    suspicious: {
      y: [0, -1, 0],
      scale: [1, 1.01, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    sad: {
      y: [0, 3, 0],
      scale: [1, 0.96, 1],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    wink: {
      y: [0, -6, 0],
      scale: [1, 1.08, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const glowIntensity = zone === 'outside' ? 15 : 8;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: `drop-shadow(0 0 ${glowIntensity}px ${color}40)`
      }}
      animate={floatVariants[emotion]}
    >
      {/* Lottie Animation Container */}
      <div
        style={{
          width: size,
          height: size,
          filter: `hue-rotate(${getHueRotation(color)}deg) saturate(1.2)`
        }}
      >
        <DotLottieReact
          src="https://lottie.host/d0bcee95-e9d8-48b8-a9f3-e00d7911e63a/xyHOfUIIW2.lottie"
          loop
          autoplay
          speed={getAnimationSpeed(emotion)}
          style={{
            width: '100%',
            height: '100%'
          }}
        />
      </div>
      
      {/* Enhanced glow effect for different zones */}
      {zone === 'outside' && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            filter: 'blur(10px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      {/* Excitement particles */}
      {emotion === 'excited' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: color,
                left: `${20 + (i * 12)}%`,
                top: `${15 + (i % 2) * 20}%`
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Helper function to convert hex color to hue rotation
const getHueRotation = (color: string): number => {
  // Simple mapping for common colors to hue rotations
  const colorMap: { [key: string]: number } = {
    '#9945FF': 0,    // Purple (default)
    '#FF6B6B': 320,  // Red
    '#4ECDC4': 180,  // Cyan
    '#45B7D1': 200,  // Blue
    '#96CEB4': 120,  // Green
    '#FFEAA7': 60,   // Yellow
    '#DDA0DD': 20,   // Plum
  };
  
  return colorMap[color.toUpperCase()] || 0;
};

export default LottieBody;
