
import { useEffect, useRef, useCallback } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { createOrbitAnimation, createRectangleAnimation, OrbitAnimation, RectangleAnimation, PetAnimation } from '@/services/aiPetBehaviorService';

// Конфигурация для прямоугольного движения
const DEFAULT_RECTANGLE_BEHAVIOR = {
  behaviorName: 'rectangle_circulation',
  animationData: {
    type: 'rectangle' as const,
    padding: '20%',
    speed: 'medium' as const,
    direction: 'clockwise' as const,
    cornerPause: 500
  } as RectangleAnimation
};

// Статичные данные для орбитального поведения с правильной типизацией
const DEFAULT_ORBIT_BEHAVIOR = {
  behaviorName: 'orbit_circulation',
  animationData: {
    type: 'orbit' as const,
    radius: '130%',
    speed: 'medium' as const,
    direction: 'clockwise' as const
  } as OrbitAnimation
};

export const useAiPetOrbit = (
  petElement: HTMLElement | null, 
  containerBounds: DOMRect | null,
  animationType: 'orbit' | 'rectangle' = 'rectangle'
) => {
  const { currentLayer, aiPet } = useWalletCustomizationStore();
  const animationCleanupRef = useRef<(() => void) | null>(null);

  const startAnimation = useCallback(() => {
    if (!petElement || !containerBounds) return;

    // Очищаем предыдущую анимацию
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
    }

    // Запускаем анимацию только когда питомец в зоне outside
    if (aiPet.zone === 'outside' && currentLayer !== 'login') {
      if (animationType === 'rectangle') {
        animationCleanupRef.current = createRectangleAnimation(
          petElement,
          containerBounds,
          DEFAULT_RECTANGLE_BEHAVIOR.animationData
        );
      } else {
        animationCleanupRef.current = createOrbitAnimation(
          petElement,
          containerBounds,
          DEFAULT_ORBIT_BEHAVIOR.animationData
        );
      }
    }
  }, [petElement, containerBounds, aiPet.zone, currentLayer, animationType]);

  const stopAnimation = useCallback(() => {
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
      animationCleanupRef.current = null;
    }
  }, []);

  // Запускаем/останавливаем анимацию при изменении условий
  useEffect(() => {
    if (currentLayer === 'login') {
      stopAnimation();
    } else {
      startAnimation();
    }

    return () => {
      stopAnimation();
    };
  }, [currentLayer, startAnimation, stopAnimation]);

  return {
    startAnimation,
    stopAnimation
  };
};
