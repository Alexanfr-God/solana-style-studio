
import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import LiquidBody from './LiquidBody';
import Eyes from './Eyes';
import Mouth from './Mouth';

export type AiPetEmotion = 'idle' | 'excited' | 'sleepy' | 'happy' | 'suspicious' | 'sad' | 'wink';
export type AiPetZone = 'inside' | 'outside';

interface AiPetProps {
  emotion?: AiPetEmotion;
  zone?: AiPetZone;
  color?: string;
  size?: number;
  onZoneChange?: (zone: AiPetZone) => void;
  onEmotionChange?: (emotion: AiPetEmotion) => void;
  onHover?: () => void;
  onClick?: () => void;
  onDoubleClick?: () => void;
  containerBounds?: DOMRect;
}

const AiPet: React.FC<AiPetProps> = ({
  emotion = 'idle',
  zone = 'inside',
  color = '#9945FF',
  size = 64,
  onZoneChange,
  onEmotionChange,
  onHover,
  onClick,
  onDoubleClick,
  containerBounds
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const petRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const floatControls = useAnimation();

  // Track mouse position for following behavior
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (petRef.current && zone === 'inside') {
        const rect = petRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: e.clientX - centerX,
          y: e.clientY - centerY
        });
      }
    };

    if (zone === 'inside') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [zone]);

  // Floating behavior for outside zone
  useEffect(() => {
    if (zone === 'outside' && containerBounds) {
      const floatAnimation = async () => {
        const boundary = 30; // pixels beyond container
        const centerX = containerBounds.width / 2;
        const centerY = containerBounds.height / 2;
        const radius = Math.min(containerBounds.width, containerBounds.height) / 2 + boundary;
        
        // Create floating path around container
        const points = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          points.push({ x, y });
        }
        
        // Animate through points
        for (const point of points) {
          await floatControls.start({
            x: point.x - size / 2,
            y: point.y - size / 2,
            transition: { duration: 2, ease: "easeInOut" }
          });
        }
        
        // Repeat the animation
        floatAnimation();
      };
      
      floatAnimation();
    }
  }, [zone, containerBounds, floatControls, size]);

  // Calculate rotation based on mouse position (inside zone only)
  const getRotation = () => {
    if (!isHovered || zone === 'outside') return 0;
    const angle = Math.atan2(mousePosition.y, mousePosition.x) * (180 / Math.PI);
    return Math.max(-15, Math.min(15, angle / 6));
  };

  // Click reaction animation
  const handleClick = async () => {
    setIsAnimating(true);
    onClick?.();
    await controls.start({
      scale: 1.2,
      transition: { duration: 0.1 }
    });
    await controls.start({
      scale: 1,
      transition: { duration: 0.2 }
    });
    setIsAnimating(false);
  };

  // Zone switching with teleport effect
  const handleDoubleClick = async () => {
    const newZone = zone === 'inside' ? 'outside' : 'inside';
    
    // Teleport animation
    setIsAnimating(true);
    await controls.start({
      scale: 0,
      rotate: 360,
      transition: { duration: 0.3 }
    });
    
    onZoneChange?.(newZone);
    onDoubleClick?.();
    
    await controls.start({
      scale: 1,
      rotate: 0,
      transition: { duration: 0.3 }
    });
    setIsAnimating(false);
  };

  // Handle hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Drag behavior for outside zone
  const handleDrag = (event: any, info: any) => {
    if (zone === 'outside' && containerBounds) {
      const boundary = 30;
      const newX = Math.max(-boundary, Math.min(containerBounds.width + boundary - size, info.point.x - size / 2));
      const newY = Math.max(-boundary, Math.min(containerBounds.height + boundary - size, info.point.y - size / 2));
      setPosition({ x: newX, y: newY });
    }
  };

  return (
    <motion.div
      ref={petRef}
      className="relative cursor-pointer select-none"
      style={{
        width: size,
        height: size,
        rotate: getRotation(),
        ...(zone === 'outside' && { 
          position: 'absolute',
          x: position.x,
          y: position.y,
          zIndex: 1000
        })
      }}
      animate={zone === 'outside' ? floatControls : controls}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      drag={zone === 'outside'}
      onDrag={handleDrag}
      dragMomentum={false}
      whileHover={{ scale: 1.05 }}
    >
      {/* Liquid Body */}
      <LiquidBody 
        color={color}
        size={size}
        emotion={emotion}
        zone={zone}
        isAnimating={isAnimating}
      />
      
      {/* Eyes */}
      <Eyes emotion={emotion} size={size} />
      
      {/* Mouth */}
      <Mouth emotion={emotion} size={size} />
      
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
      
      {/* Interaction hint */}
      {isHovered && (
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/70 whitespace-nowrap"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          {zone === 'inside' ? 'Double-click to release' : 'Drag me around!'}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AiPet;
