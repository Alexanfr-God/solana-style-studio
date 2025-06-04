
import { WalletStyleSet, AiPetEmotion } from '@/types/walletStyleSchema';

export interface AiPetStyleMapping {
  dominantColor: string;
  mood: string;
  recommendedEmotion: AiPetEmotion;
  interactionTriggers: string[];
}

export const analyzeStyleForAiPet = (styleSet: WalletStyleSet): AiPetStyleMapping => {
  const dominantColor = styleSet.buttons.backgroundColor || '#9945FF';
  const hasWarmColors = dominantColor.includes('FF') || dominantColor.includes('F5');
  const hasCoolColors = dominantColor.includes('00') || dominantColor.includes('0F');
  
  let mood = 'neutral';
  let recommendedEmotion: AiPetEmotion = 'idle';
  
  // Analyze color temperature and brightness
  if (hasWarmColors) {
    mood = 'energetic';
    recommendedEmotion = 'excited';
  } else if (hasCoolColors) {
    mood = 'calm';
    recommendedEmotion = 'sleepy';
  }
  
  // Analyze animation settings
  const hasAnimations = styleSet.buttons.animation?.transition;
  if (hasAnimations && hasAnimations.includes('ease')) {
    recommendedEmotion = 'happy';
  }
  
  // Analyze overall brightness
  const backgroundColor = styleSet.global.backgroundColor || '#181818';
  const isDark = backgroundColor.includes('18') || backgroundColor.includes('00');
  
  if (isDark && recommendedEmotion === 'idle') {
    recommendedEmotion = 'suspicious';
  }
  
  return {
    dominantColor,
    mood,
    recommendedEmotion,
    interactionTriggers: [
      'style-change',
      'hover-button',
      'click-action',
      'navigation-change'
    ]
  };
};

export const syncAiPetWithStyle = (styleSet: WalletStyleSet, setAiPetEmotion: (emotion: AiPetEmotion) => void) => {
  const mapping = analyzeStyleForAiPet(styleSet);
  
  // Set the emotion based on style analysis
  setAiPetEmotion(mapping.recommendedEmotion);
  
  // Return the mapping for additional integrations
  return mapping;
};
