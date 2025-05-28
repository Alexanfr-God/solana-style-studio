
import React from 'react';
import { motion } from 'framer-motion';

interface LiquidBlobProps {
  color: string;
  size: number;
  emotion: 'idle' | 'excited' | 'sleepy' | 'happy';
  isAnimating?: boolean;
}

const LiquidBlob: React.FC<LiquidBlobProps> = ({ color, size, emotion, isAnimating = false }) => {
  // Different blob shapes for different emotions
  const blobPaths = {
    idle: "M50,20 C70,15 85,30 80,50 C85,70 70,85 50,80 C30,85 15,70 20,50 C15,30 30,15 50,20 Z",
    excited: "M50,15 C75,10 90,25 85,50 C90,75 75,90 50,85 C25,90 10,75 15,50 C10,25 25,10 50,15 Z",
    sleepy: "M50,25 C65,20 80,35 75,50 C80,65 65,80 50,75 C35,80 20,65 25,50 C20,35 35,20 50,25 Z",
    happy: "M50,18 C72,12 88,28 82,50 C88,72 72,88 50,82 C28,88 12,72 18,50 C12,28 28,12 50,18 Z"
  };

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
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="overflow-visible">
      {/* Glow effect */}
      <defs>
        <filter id={`glow-${emotion}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id={`gradient-${emotion}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.9"/>
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
          filter={`url(#glow-${emotion})`}
          animate={morphVariants[emotion]}
          style={{
            dropShadow: `0 0 20px ${color}40`
          }}
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
      
      {/* Face elements */}
      {emotion === 'sleepy' && (
        <g>
          <motion.line x1="35" y1="45" x2="40" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
          <motion.line x1="60" y1="45" x2="65" y2="45" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
        </g>
      )}
      
      {emotion === 'happy' && (
        <g>
          <motion.circle cx="40" cy="42" r="2" fill="white" opacity="0.9"/>
          <motion.circle cx="60" cy="42" r="2" fill="white" opacity="0.9"/>
          <motion.path d="M 42 55 Q 50 62 58 55" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9"/>
        </g>
      )}
      
      {(emotion === 'idle' || emotion === 'excited') && (
        <g>
          <motion.circle 
            cx="40" 
            cy="45" 
            r="1.5" 
            fill="white" 
            opacity="0.7"
            animate={emotion === 'excited' ? {
              scale: [1, 1.3, 1],
              transition: { duration: 0.8, repeat: Infinity }
            } : {}}
          />
          <motion.circle 
            cx="60" 
            cy="45" 
            r="1.5" 
            fill="white" 
            opacity="0.7"
            animate={emotion === 'excited' ? {
              scale: [1, 1.3, 1],
              transition: { duration: 0.8, repeat: Infinity, delay: 0.1 }
            } : {}}
          />
        </g>
      )}
      
      {/* Sparkle effects for excited state */}
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
                opacity: [0, 1, 0],
                transition: {
                  duration: 1,
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

export default LiquidBlob;
