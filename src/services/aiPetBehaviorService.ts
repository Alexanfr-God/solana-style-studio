
export interface AiPetBehavior {
  id: string;
  behaviorName: string;
  triggerConditions: any;
  animationData: any;
  durationMs: number;
  isActive: boolean;
}

export interface OrbitAnimation {
  type: 'orbit';
  radius: string;
  speed: 'slow' | 'medium' | 'fast';
  direction: 'clockwise' | 'counterclockwise';
}

export const calculateOrbitPosition = (
  containerBounds: DOMRect,
  angle: number,
  radiusMultiplier: number = 1.3
): { x: number; y: number } => {
  const centerX = containerBounds.width / 2;
  const centerY = containerBounds.height / 2;
  const radius = Math.min(containerBounds.width, containerBounds.height) / 2 * radiusMultiplier;
  
  return {
    x: centerX + Math.cos(angle) * radius,
    y: centerY + Math.sin(angle) * radius
  };
};

export const createOrbitAnimation = (
  element: HTMLElement,
  containerBounds: DOMRect,
  options: OrbitAnimation
) => {
  let angle = 0;
  let animationId: number;
  
  const radiusMultiplier = parseFloat(options.radius.replace('%', '')) / 100;
  const speedMultiplier = {
    slow: 0.008,
    medium: 0.015,
    fast: 0.025
  }[options.speed];
  
  const animate = () => {
    const position = calculateOrbitPosition(containerBounds, angle, radiusMultiplier);
    
    // Позиционируем относительно контейнера кошелька
    element.style.left = `${position.x - 25}px`;
    element.style.top = `${position.y - 25}px`;
    element.style.transform = 'none'; // Убираем transform, используем left/top
    
    angle += options.direction === 'clockwise' ? speedMultiplier : -speedMultiplier;
    if (angle > Math.PI * 2) angle = 0;
    if (angle < 0) angle = Math.PI * 2;
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};
