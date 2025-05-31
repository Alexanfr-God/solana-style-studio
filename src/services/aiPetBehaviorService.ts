
import { supabase } from '@/integrations/supabase/client';

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

export const loadAiPetBehaviors = async (): Promise<AiPetBehavior[]> => {
  try {
    const { data, error } = await supabase
      .from('ai_pet_behaviors')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data.map(item => ({
      id: item.id,
      behaviorName: item.behavior_name,
      triggerConditions: item.trigger_conditions,
      animationData: item.animation_data,
      durationMs: item.duration_ms || 2000,
      isActive: item.is_active
    }));
  } catch (error) {
    console.error('Error loading AI Pet behaviors:', error);
    return [];
  }
};

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
    slow: 0.01,
    medium: 0.02,
    fast: 0.04
  }[options.speed];
  
  const animate = () => {
    const position = calculateOrbitPosition(containerBounds, angle, radiusMultiplier);
    
    element.style.transform = `translate(${position.x - 25}px, ${position.y - 25}px)`;
    
    angle += options.direction === 'clockwise' ? speedMultiplier : -speedMultiplier;
    if (angle > Math.PI * 2) angle = 0;
    if (angle < 0) angle = Math.PI * 2;
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  return () => cancelAnimationFrame(animationId);
};
