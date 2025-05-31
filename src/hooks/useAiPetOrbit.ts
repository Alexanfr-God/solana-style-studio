import { useEffect, useRef, useCallback } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { createOrbitAnimation, OrbitAnimation } from '@/services/aiPetBehaviorService';

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

export const useAiPetOrbit = (petElement: HTMLElement | null, containerBounds: DOMRect | null) => {
  const { currentLayer, aiPet } = useWalletCustomizationStore();
  const animationCleanupRef = useRef<(() => void) | null>(null);

  const startOrbitAnimation = useCallback(() => {
    if (!petElement || !containerBounds) return;

    // Очищаем предыдущую анимацию
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
    }

    // Запускаем циркуляцию только когда питомец в зоне outside
    if (aiPet.zone === 'outside' && currentLayer !== 'login') {
      animationCleanupRef.current = createOrbitAnimation(
        petElement,
        containerBounds,
        DEFAULT_ORBIT_BEHAVIOR.animationData
      );
    }
  }, [petElement, containerBounds, aiPet.zone, currentLayer]);

  const stopOrbitAnimation = useCallback(() => {
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
      animationCleanupRef.current = null;
    }
  }, []);

  // Запускаем/останавливаем анимацию при изменении условий
  useEffect(() => {
    if (currentLayer === 'login') {
      stopOrbitAnimation();
    } else {
      startOrbitAnimation();
    }

    return () => {
      stopOrbitAnimation();
    };
  }, [currentLayer, startOrbitAnimation, stopOrbitAnimation]);

  return {
    startOrbitAnimation,
    stopOrbitAnimation
  };
};
