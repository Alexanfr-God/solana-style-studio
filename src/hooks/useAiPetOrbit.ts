
import { useEffect, useRef, useCallback } from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';
import { createOrbitAnimation, loadAiPetBehaviors } from '@/services/aiPetBehaviorService';

export const useAiPetOrbit = (petElement: HTMLElement | null, containerBounds: DOMRect | null) => {
  const { currentLayer, aiPet } = useWalletCustomizationStore();
  const animationCleanupRef = useRef<(() => void) | null>(null);
  const behaviorsRef = useRef<any[]>([]);

  const startOrbitAnimation = useCallback(() => {
    if (!petElement || !containerBounds) return;

    // Очищаем предыдущую анимацию
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
    }

    // Запускаем циркуляцию только когда питомец в зоне outside
    if (aiPet.zone === 'outside' && currentLayer !== 'login') {
      const orbitBehavior = behaviorsRef.current.find(
        b => b.behaviorName === 'orbit_circulation'
      );

      if (orbitBehavior) {
        animationCleanupRef.current = createOrbitAnimation(
          petElement,
          containerBounds,
          orbitBehavior.animationData
        );
      }
    }
  }, [petElement, containerBounds, aiPet.zone, currentLayer]);

  const stopOrbitAnimation = useCallback(() => {
    if (animationCleanupRef.current) {
      animationCleanupRef.current();
      animationCleanupRef.current = null;
    }
  }, []);

  // Загружаем поведения при монтировании
  useEffect(() => {
    const loadBehaviors = async () => {
      const behaviors = await loadAiPetBehaviors();
      behaviorsRef.current = behaviors;
    };
    loadBehaviors();
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
