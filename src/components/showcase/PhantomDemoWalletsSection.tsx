
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

// Demo wallet examples with images from public folder
const demoWallets = [
  {
    id: 1,
    name: 'Login Screen',
    image: '/v1_examples/login.png',
    description: 'Login interface with AI-generated style'
  },
  {
    id: 2,
    name: 'Home View',
    image: '/v1_examples/home.png',
    description: 'Main wallet dashboard with balances'
  },
  {
    id: 3,
    name: 'Swap View',
    image: '/v1_examples/swap.png',
    description: 'Token swap interface'
  },
  {
    id: 4,
    name: 'Collectibles',
    image: '/v1_examples/collectibles.png',
    description: 'NFT collection view'
  },
  {
    id: 5,
    name: 'Settings',
    image: '/v1_examples/settings.png',
    description: 'Wallet settings and preferences'
  }
];

const PhantomDemoWalletsSection = () => {
  const handleScrollToEditor = () => {
    const editorSection = document.getElementById('editor-section');
    if (editorSection) {
      editorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-16 md:py-24 px-4 bg-gradient-to-b from-purple-900/20 to-black/20 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Customize your Phantom Wallet with AI
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Explore demo versions of fully customized wallet styles generated from just a single prompt or image.
          </p>
          <p className="text-base text-white/60 mt-2 max-w-2xl mx-auto">
            Each theme was generated with our V1 editor – starting from one login screen design, AI applies it to the entire wallet.
          </p>
        </div>
        
        {/* Wallet Examples Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoWallets.map((wallet) => (
            <div 
              key={wallet.id} 
              className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="aspect-[9/16] overflow-hidden relative">
                <img 
                  src={wallet.image || `/placeholder.svg`} 
                  alt={wallet.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-medium">{wallet.name}</h3>
                    <p className="text-white/70 text-sm">{wallet.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Try Your Own Button */}
        <div className="flex justify-center mb-8">
          <Button 
            onClick={handleScrollToEditor}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full font-medium shadow-lg shadow-purple-500/30 flex items-center gap-2 h-auto"
          >
            Try Your Own
            <ChevronUp className="ml-1 h-5 w-5" />
          </Button>
        </div>
        
        {/* Disclaimer Note */}
        <div className="text-center">
          <p className="text-sm text-white/40">
            ⚠️ These are demo previews. Not actual wallet skins (yet).
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhantomDemoWalletsSection;
