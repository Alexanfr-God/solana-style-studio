
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

export interface RectangleAnimation {
  type: 'rectangle';
  padding: string;
  speed: 'slow' | 'medium' | 'fast';
  direction: 'clockwise' | 'counterclockwise';
  cornerPause?: number;
}

export type PetAnimation = OrbitAnimation | RectangleAnimation;

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

export const calculateRectanglePoints = (
  containerBounds: DOMRect,
  paddingMultiplier: number = 0.2
): { x: number; y: number }[] => {
  const padding = Math.min(containerBounds.width, containerBounds.height) * paddingMultiplier;
  
  return [
    { x: containerBounds.width / 2, y: -padding }, // Центр сверху
    { x: containerBounds.width + padding, y: -padding }, // Правый верхний угол
    { x: containerBounds.width + padding, y: containerBounds.height + padding }, // Правый нижний угол
    { x: -padding, y: containerBounds.height + padding }, // Левый нижний угол
    { x: -padding, y: -padding }, // Левый верхний угол
  ];
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
    
    element.style.left = `${position.x - 25}px`;
    element.style.top = `${position.y - 25}px`;
    element.style.transform = 'none';
    
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

export const createRectangleAnimation = (
  element: HTMLElement,
  containerBounds: DOMRect,
  options: RectangleAnimation
) => {
  let animationId: number;
  let currentSegment = 0;
  let progress = 0;
  let isPaused = false;
  let pauseTimer = 0;
  
  const paddingMultiplier = parseFloat(options.padding.replace('%', '')) / 100;
  const points = calculateRectanglePoints(containerBounds, paddingMultiplier);
  
  const speedMultiplier = {
    slow: 0.004,
    medium: 0.008,
    fast: 0.015
  }[options.speed];
  
  const cornerPauseMs = options.cornerPause || 0;
  
  const animate = () => {
    if (isPaused) {
      pauseTimer += 16; // ~60fps
      if (pauseTimer >= cornerPauseMs) {
        isPaused = false;
        pauseTimer = 0;
      }
      animationId = requestAnimationFrame(animate);
      return;
    }
    
    const currentPoint = points[currentSegment];
    const nextPoint = points[(currentSegment + 1) % points.length];
    
    // Интерполяция между текущей и следующей точкой
    const x = currentPoint.x + (nextPoint.x - currentPoint.x) * progress;
    const y = currentPoint.y + (nextPoint.y - currentPoint.y) * progress;
    
    element.style.left = `${x - 25}px`;
    element.style.top = `${y - 25}px`;
    element.style.transform = 'none';
    
    // Обновляем прогресс
    progress += speedMultiplier;
    
    if (progress >= 1) {
      progress = 0;
      currentSegment = options.direction === 'clockwise' 
        ? (currentSegment + 1) % points.length
        : (currentSegment - 1 + points.length) % points.length;
      
      // Пауза в углу если настроена
      if (cornerPauseMs > 0) {
        isPaused = true;
      }
    }
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};
