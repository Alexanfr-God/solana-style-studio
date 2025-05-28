
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface PhantomBodyProps {
  color: string;
  size: number;
  emotion: AiPetEmotion;
  zone: 'inside' | 'outside';
  isAnimating?: boolean;
}

const PhantomBody: React.FC<PhantomBodyProps> = ({ 
  color, 
  size, 
  emotion, 
  zone,
  isAnimating = false 
}) => {
  // Different Phantom shapes for different emotions
  const phantomPaths = {
    idle: "M50,15 C65,10 85,15 85,35 L85,65 C85,75 80,80 75,82 L70,85 C68,87 65,85 65,82 L65,78 C65,75 62,75 62,78 L62,82 C62,85 59,87 57,85 L52,82 C50,80 45,80 43,82 L38,85 C36,87 33,85 33,82 L33,78 C33,75 30,75 30,78 L30,82 C30,85 27,87 25,85 L20,82 C15,80 10,75 10,65 L10,35 C10,15 30,10 45,15 Z",
    excited: "M50,12 C68,8 88,12 88,32 L88,62 C88,72 83,77 78,79 L73,82 C71,84 68,82 68,79 L68,75 C68,72 65,72 65,75 L65,79 C65,82 62,84 60,82 L55,79 C53,77 47,77 45,79 L40,82 C38,84 35,82 35,79 L35,75 C35,72 32,72 32,75 L32,79 C32,82 29,84 27,82 L22,79 C17,77 12,72 12,62 L12,32 C12,12 32,8 50,12 Z",
    sleepy: "M50,18 C62,14 78,18 78,38 L78,68 C78,78 73,83 68,85 L63,88 C61,90 58,88 58,85 L58,81 C58,78 55,78 55,81 L55,85 C55,88 52,90 50,88 L45,85 C43,83 37,83 35,85 L30,88 C28,90 25,88 25,85 L25,81 C25,78 22,78 22,81 L22,85 C22,88 19,90 17,88 L12,85 C7,83 2,78 2,68 L2,38 C2,18 22,14 35,18 Z",
    happy: "M50,13 C67,9 87,13 87,33 L87,63 C87,73 82,78 77,80 L72,83 C70,85 67,83 67,80 L67,76 C67,73 64,73 64,76 L64,80 C64,83 61,85 59,83 L54,80 C52,78 46,78 44,80 L39,83 C37,85 34,83 34,80 L34,76 C34,73 31,73 31,76 L31,80 C31,83 28,85 26,83 L21,80 C16,78 11,73 11,63 L11,33 C11,13 31,9 46,13 Z",
    suspicious: "M50,16 C64,12 82,16 82,36 L82,66 C82,76 77,81 72,83 L67,86 C65,88 62,86 62,83 L62,79 C62,76 59,76 59,79 L59,83 C59,86 56,88 54,86 L49,83 C47,81 43,81 41,83 L36,86 C34,88 31,86 31,83 L31,79 C31,76 28,76 28,79 L28,83 C28,86 25,88 23,86 L18,83 C13,81 8,76 8,66 L8,36 C8,16 26,12 41,16 Z",
    sad: "M50,20 C60,16 75,20 75,40 L75,70 C75,80 70,85 65,87 L60,90 C58,92 55,90 55,87 L55,83 C55,80 52,80 52,83 L52,87 C52,90 49,92 47,90 L42,87 C40,85 36,85 34,87 L29,90 C27,92 24,90 24,87 L24,83 C24,80 21,80 21,83 L21,87 C21,90 18,92 16,90 L11,87 C6,85 1,80 1,70 L1,40 C1,20 19,16 32,20 Z",
    wink: "M50,14 C66,10 86,14 86,34 L86,64 C86,74 81,79 76,81 L71,84 C69,86 66,84 66,81 L66,77 C66,74 63,74 63,77 L63,81 C63,84 60,86 58,84 L53,81 C51,79 45,79 43,81 L38,84 C36,86 33,84 33,81 L33,77 C33,74 30,74 30,77 L30,81 C30,84 27,86 25,84 L20,81 C15,79 10,74 10,64 L10,34 C10,14 30,10 45,14 Z"
  };

  // Animation variants for morphing
  const morphVariants = {
    idle: {
      d: phantomPaths.idle,
      transition: { duration: 2, ease: "easeInOut" }
    },
    excited: {
      d: phantomPaths.excited,
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    sleepy: {
      d: phantomPaths.sleepy,
      transition: { duration: 3, ease: "easeInOut" }
    },
    happy: {
      d: phantomPaths.happy,
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    suspicious: {
      d: phantomPaths.suspicious,
      transition: { duration: 1.2, ease: "easeInOut" }
    },
    sad: {
      d: phantomPaths.sad,
      transition: { duration: 2.5, ease: "easeInOut" }
    },
    wink: {
      d: phantomPaths.wink,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  // Floating/pulsing animation for the phantom
  const floatVariants = {
    idle: {
      scale: [1, 1.03, 1],
      y: [0, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    excited: {
      scale: [1, 1.1, 0.95, 1.1, 1],
      y: [0, -5, 2, -3, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    },
    sleepy: {
      scale: [1, 0.98, 1],
      y: [0, 1, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    },
    happy: {
      scale: [1, 1.05, 1],
      y: [0, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    suspicious: {
      scale: [1, 1.02, 1],
      y: [0, -1, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    sad: {
      scale: [1, 0.97, 1],
      y: [0, 2, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    wink: {
      scale: [1, 1.08, 1],
      y: [0, -4, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const glowIntensity = zone === 'outside' ? '15px' : '8px';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      {/* Enhanced glow effect */}
      <defs>
        <filter id={`phantom-glow-${emotion}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feGaussianBlur stdDeviation="4" result="outerGlow"/>
          <feMerge> 
            <feMergeNode in="outerGlow"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id={`phantom-gradient-${emotion}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="60%" stopColor={color} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.95"/>
        </radialGradient>
      </defs>
      
      {/* Main phantom body */}
      <motion.g
        animate={floatVariants[emotion]}
        style={{ transformOrigin: "50px 50px" }}
      >
        <motion.path
          d={phantomPaths[emotion]}
          fill={`url(#phantom-gradient-${emotion})`}
          filter={`url(#phantom-glow-${emotion})`}
          animate={morphVariants[emotion]}
          stroke={color}
          strokeWidth="0.3"
          strokeOpacity="0.8"
        />
        
        {/* Inner highlight for depth */}
        <motion.ellipse
          cx="45"
          cy="30"
          rx="6"
          ry="10"
          fill={color}
          opacity="0.25"
          animate={{
            opacity: [0.2, 0.35, 0.2],
            transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </motion.g>
      
      {/* Ghostly trail effect for excited state */}
      {emotion === 'excited' && (
        <g>
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={i}
              cx={30 + (i * 8)}
              cy={25 + (i % 2) * 10}
              r="1"
              fill="white"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }
              }}
            />
          ))}
        </g>
      )}
    </svg>
  );
};

export default PhantomBody;
