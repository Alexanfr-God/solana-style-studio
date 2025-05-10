
import React, { useEffect, useRef } from 'react';

const GlowingDivider = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 2;
    
    // Particles array
    const particles: Array<{x: number, speed: number, opacity: number}> = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        speed: 0.5 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.8
      });
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background for the line
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(153, 69, 255, 0.3)');
      gradient.addColorStop(0.5, 'rgba(153, 69, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(153, 69, 255, 0.3)');
      
      // Draw base line
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Animate particles
      particles.forEach(particle => {
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fillRect(particle.x, 0, 3, 2);
        
        // Move particle
        particle.x += particle.speed;
        
        // Reset if off screen
        if (particle.x > canvas.width) {
          particle.x = 0;
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="w-full my-8 relative">
      <canvas ref={canvasRef} className="w-full h-[2px]" />
      <div className="absolute inset-0 pointer-events-none blur-sm bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
    </div>
  );
};

export default GlowingDivider;
