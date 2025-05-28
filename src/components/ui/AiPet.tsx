
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy';
export type AiPetZone = 'inside' | 'outside';

interface AiPetProps {
  emotion?: AiPetEmotion;
  zone?: AiPetZone;
  color?: string;
  size?: number;
  onZoneChange?: (zone: AiPetZone) => void;
  onEmotionChange?: (emotion: AiPetEmotion) => void;
}

const AiPet: React.FC<AiPetProps> = ({
  emotion = 'idle',
  zone = 'inside',
  color = '#9945FF',
  size = 64,
  onZoneChange,
  onEmotionChange
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const petRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Track mouse position for "looking" behavior
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (petRef.current) {
        const rect = petRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate rotation based on mouse position
  const getRotation = () => {
    if (!isHovered) return 0;
    const angle = Math.atan2(mousePosition.y, mousePosition.x) * (180 / Math.PI);
    return Math.max(-15, Math.min(15, angle / 6)); // Limit rotation
  };

  // Animation variants for different emotions
  const emotionVariants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.9, 1, 0.9],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    excited: {
      scale: [1, 1.1, 0.95, 1.1, 1],
      opacity: [1, 0.8, 1, 0.8, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    sleepy: {
      scale: [1, 0.95, 1],
      opacity: [0.7, 0.5, 0.7],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    happy: {
      scale: [1, 1.08, 1],
      opacity: [1, 0.9, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Click reaction animation
  const handleClick = async () => {
    await controls.start({
      scale: 1.2,
      transition: { duration: 0.1 }
    });
    await controls.start({
      scale: 1,
      transition: { duration: 0.2 }
    });
  };

  // Double click zone switching
  const handleDoubleClick = () => {
    const newZone = zone === 'inside' ? 'outside' : 'inside';
    onZoneChange?.(newZone);
  };

  return (
    <motion.div
      ref={petRef}
      className="relative cursor-pointer select-none"
      style={{
        width: size,
        height: size,
      }}
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.05 }}
    >
      {/* Main blob shape */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}aa, ${color})`,
          boxShadow: `0 0 20px ${color}40`,
        }}
        animate={emotionVariants[emotion]}
        style={{
          rotate: getRotation(),
        }}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}60, transparent)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Sparkle effect for excited state */}
        {emotion === 'excited' && (
          <>
            <motion.div
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ top: '20%', left: '30%' }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.div
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ top: '30%', right: '25%' }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: 0.3,
              }}
            />
          </>
        )}

        {/* Eyes for sleepy state */}
        {emotion === 'sleepy' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-2">
              <div className="w-1 h-0.5 bg-white rounded-full opacity-70" />
              <div className="w-1 h-0.5 bg-white rounded-full opacity-70" />
            </div>
          </div>
        )}

        {/* Happy face */}
        {emotion === 'happy' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">😊</div>
          </div>
        )}
      </motion.div>

      {/* Zone indicator */}
      {zone === 'outside' && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
};

export default AiPet;
