
import React from 'react';
import { motion } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';

interface LiquidBodyProps {
  color: string;
  size: number;
  emotion: AiPetEmotion;
  zone: 'inside' | 'outside';
  isAnimating?: boolean;
}

const LiquidBody: React.FC<LiquidBodyProps> = ({ 
  color, 
  size, 
  emotion, 
  zone,
  isAnimating = false 
}) => {
  // Different blob shapes for different emotions
  const blobPaths = {
    idle: "M50,20 C70,15 85,30 80,50 C85,70 70,85 50,80 C30,85 15,70 20,50 C15,30 30,15 50,20 Z",
    excited: "M50,15 C75,10 90,25 85,50 C90,75 75,90 50,85 C25,90 10,75 15,50 C10,25 25,10 50,15 Z",
    sleepy: "M50,25 C65,20 80,35 75,50 C80,65 65,80 50,75 C35,80 20,65 25,50 C20,35 35,20 50,25 Z",
    happy: "M50,18 C72,12 88,28 82,50 C88,72 72,88 50,82 C28,88 12,72 18,50 C12,28 28,12 50,18 Z",
    suspicious: "M50,22 C68,18 82,32 78,50 C82,68 68,82 50,78 C32,82 18,68 22,50 C18,32 32,18 50,22 Z",
    sad: "M50,25 C65,22 78,38 75,52 C78,68 65,78 50,75 C35,78 22,68 25,52 C22,38 35,22 50,25 Z",
    wink: "M50,20 C70,16 84,30 80,50 C84,70 70,84 50,80 C30,84 16,70 20,50 C16,30 30,16 50,20 Z"
  };

  // Tentacle paths (bottom appendages)
  const tentaclePaths = [
    "M35,75 Q30,85 25,90 Q30,95 35,85",
    "M45,78 Q40,88 38,93 Q43,98 47,88", 
    "M55,78 Q60,88 62,93 Q57,98 53,88",
    "M65,75 Q70,85 75,90 Q70,95 65,85"
  ];

  // Animation variants for morphing
  const morphVariants = {
    idle: {
      d: blobPaths.idle,
      transition: { duration: 2, ease: "easeInOut" }
    },
    excited: {
      d: blobPaths.excited,
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    sleepy: {
      d: blobPaths.sleepy,
      transition: { duration: 3, ease: "easeInOut" }
    },
    happy: {
      d: blobPaths.happy,
      transition: { duration: 1.5, ease: "easeInOut" }
    },
    suspicious: {
      d: blobPaths.suspicious,
      transition: { duration: 1.2, ease: "easeInOut" }
    },
    sad: {
      d: blobPaths.sad,
      transition: { duration: 2.5, ease: "easeInOut" }
    },
    wink: {
      d: blobPaths.wink,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  // Pulsing animation for the blob
  const pulseVariants = {
    idle: {
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    excited: {
      scale: [1, 1.15, 0.95, 1.15, 1],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    },
    sleepy: {
      scale: [1, 0.95, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    happy: {
      scale: [1, 1.08, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    suspicious: {
      scale: [1, 1.03, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    sad: {
      scale: [1, 0.98, 1],
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
    },
    wink: {
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const glowIntensity = zone === 'outside' ? '20px' : '10px';

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      {/* Enhanced glow effect with neon outline */}
      <defs>
        <filter id={`neon-glow-${emotion}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feGaussianBlur stdDeviation="6" result="outerGlow"/>
          <feMerge> 
            <feMergeNode in="outerGlow"/>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id={`gradient-${emotion}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.7"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.95"/>
        </radialGradient>
      </defs>
      
      {/* Main blob */}
      <motion.g
        animate={pulseVariants[emotion]}
        style={{ transformOrigin: "50px 50px" }}
      >
        <motion.path
          d={blobPaths[emotion]}
          fill={`url(#gradient-${emotion})`}
          filter={`url(#neon-glow-${emotion})`}
          animate={morphVariants[emotion]}
          stroke={color}
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />
        
        {/* Inner highlight */}
        <motion.ellipse
          cx="45"
          cy="35"
          rx="8"
          ry="12"
          fill={color}
          opacity="0.3"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </motion.g>
      
      {/* Tentacles (лапки) */}
      {tentaclePaths.map((path, index) => (
        <motion.path
          key={index}
          d={path}
          fill={color}
          opacity="0.8"
          animate={{
            d: [
              path,
              path.replace(/Q\d+,\d+/g, (match) => {
                const [, x, y] = match.match(/Q(\d+),(\d+)/) || [];
                return `Q${parseInt(x) + Math.sin(Date.now() / 1000 + index) * 2},${parseInt(y) + Math.cos(Date.now() / 1000 + index) * 1}`;
              }),
              path
            ],
            transition: { 
              duration: 2 + index * 0.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }
          }}
        />
      ))}

      {/* Sparkle effects for excited state */}
      {emotion === 'excited' && (
        <g>
          {[...Array(8)].map((_, i) => (
            <motion.circle
              key={i}
              cx={25 + (i * 7)}
              cy={20 + (i % 3) * 15}
              r="1.5"
              fill="white"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                transition: {
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
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

export default LiquidBody;
