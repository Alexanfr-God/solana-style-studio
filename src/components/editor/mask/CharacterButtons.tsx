import React from 'react';
import { Button } from '@/components/ui/button';
import { useMaskEditorStore } from '@/stores/maskEditorStore';
import { toast } from 'sonner';

const CharacterButtons = () => {
  const { setExternalMask } = useMaskEditorStore();

  const characters = [
    {
      name: 'DOGE',
      icon: '🐕',
      color: 'from-yellow-500 to-orange-500',
      pngPath: '/lovable-uploads/c953a08b-6f7f-4cb4-bbf9-8872f02468ca.png'
    },
    {
      name: 'PEPE',
      icon: '🐸',
      color: 'from-green-500 to-emerald-500',
      pngPath: '/lovable-uploads/d4ec5dbf-9943-46d4-abcb-33fdbd4616c1.png'
    },
    {
      name: 'TRUMP',
      icon: '🇺🇸',
      color: 'from-red-500 to-blue-500',
      pngPath: '/lovable-uploads/4fce14b3-1a45-4f0a-b599-4f439227e037.png'
    },
    {
      name: 'CAT',
      icon: '🐱',
      color: 'from-purple-500 to-pink-500',
      pngPath: '/lovable-uploads/78d15f07-7430-48a3-bfcd-159efeb38a9e.png'
    }
  ];

  const handleCharacterSelect = (character: typeof characters[0]) => {
    console.log(`🎭 Selecting character: ${character.name}`);
    console.log(`📁 PNG Path: ${character.pngPath}`);
    
    // Устанавливаем внешнюю маску
    setExternalMask(character.pngPath);
    
    toast.success(`${character.name} character selected! 🎉`, {
      description: `Applied ${character.name} mask to wallet preview`
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white">Quick Character Select</h3>
      <p className="text-xs text-white/70 mb-4">
        Choose a pre-made character or create your own below
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {characters.map((character) => (
          <Button
            key={character.name}
            variant="outline"
            onClick={() => handleCharacterSelect(character)}
            className={`
              relative overflow-hidden border-white/20 text-white hover:text-white
              bg-gradient-to-r ${character.color} hover:opacity-90
              transition-all duration-200 transform hover:scale-105
              h-16 flex flex-col items-center justify-center
            `}
          >
            <div className="text-2xl mb-1">{character.icon}</div>
            <div className="text-xs font-bold">{character.name}</div>
            
            {/* Градиентный эффект при наведении */}
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-white/50 text-center mt-2">
        💡 Each character has a unique style optimized for wallet decoration
      </div>
    </div>
  );
};

export default CharacterButtons;
