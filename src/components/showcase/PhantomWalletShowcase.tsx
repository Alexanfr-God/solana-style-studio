
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

const walletExamples = [
  {
    id: 'login',
    title: 'Login Screen',
    image: '/lovable-uploads/83b3ead4-12b4-4235-b98c-575705060876.png',
    description: 'Secure access to your wallet with an immersive cosmic login experience'
  },
  {
    id: 'home',
    title: 'Wallet Home',
    image: '/lovable-uploads/797e2778-90d6-4f13-a6e4-697fdb94ccfc.png',
    description: 'View your balance and quick actions on the beautifully designed home screen'
  },
  {
    id: 'assets',
    title: 'Assets Overview',
    image: '/lovable-uploads/01da0456-638b-464e-9f79-288450789fd9.png',
    description: 'Manage your tokens with intuitive interface and quick access to actions'
  },
  {
    id: 'collectibles',
    title: 'Collectibles',
    image: '/lovable-uploads/671d43ff-2940-47e1-9ac2-061ec5acbf15.png',
    description: 'Browse and manage your NFT collection with style'
  },
  {
    id: 'swap',
    title: 'Token Swap',
    image: '/lovable-uploads/97efec67-30dc-4698-a6a5-ce6b0723ca9f.png',
    description: 'Swap tokens seamlessly with a beautiful interface'
  },
  {
    id: 'settings',
    title: 'Settings',
    image: '/lovable-uploads/4b949b27-2217-4ee2-b933-0b28f4eec364.png',
    description: 'Manage your wallet settings with ease'
  },
  {
    id: 'swap-settings',
    title: 'Swap Settings',
    image: '/lovable-uploads/d9a24c42-cdef-484e-9f5e-f332bb949adc.png',
    description: 'Fine-tune your swap preferences'
  }
];

const PhantomWalletShowcase = () => {
  const scrollToEditor = () => {
    const editorElement = document.getElementById('editor-section');
    if (editorElement) {
      editorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="demo-wallets" className="w-full py-16 bg-gradient-to-br from-purple-950/30 via-black to-purple-950/20">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Customize your Phantom Wallet with AI
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto mb-6">
            Explore demo versions of fully customized wallet styles generated from just a single prompt or image.
          </p>
          <p className="text-sm text-white/60 max-w-2xl mx-auto">
            Each theme was generated with our V1 editor – starting from one login screen design, AI applies it to the entire wallet.
          </p>
        </div>

        {/* Mobile view - Stack cards vertically */}
        <div className="md:hidden space-y-6 mb-8">
          {walletExamples.slice(0, 4).map((example) => (
            <Card key={example.id} className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-3">
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-3">
                  <img 
                    src={example.image} 
                    alt={example.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-medium text-white mb-1">{example.title}</h3>
                <p className="text-xs text-white/60">{example.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop view - Carousel */}
        <div className="hidden md:block mb-12">
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {walletExamples.map((example) => (
                <CarouselItem key={example.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <Card className="bg-black/40 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 overflow-hidden h-full group">
                    <CardContent className="p-4">
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-3">
                        <img 
                          src={example.image} 
                          alt={example.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <h3 className="font-medium text-white mb-1">{example.title}</h3>
                      <p className="text-xs text-white/60">{example.description}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CarouselPrevious className="relative static lg:absolute border-white/20 bg-black/50 hover:bg-black/70 text-white" />
              <CarouselNext className="relative static lg:absolute border-white/20 bg-black/50 hover:bg-black/70 text-white" />
            </div>
          </Carousel>
        </div>

        <div className="flex flex-col items-center justify-center gap-6">
          <Button 
            onClick={scrollToEditor}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 h-auto text-lg"
          >
            Try Your Own
          </Button>
          
          <p className="text-sm text-white/50 max-w-xl text-center">
            ⚠️ These are demo previews. Not actual wallet skins (yet).
          </p>
        </div>
      </div>
    </section>
  );
};

export default PhantomWalletShowcase;
