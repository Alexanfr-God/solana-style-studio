
import React, { useEffect, useState } from 'react';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card } from '@/components/ui/card';

interface V1ExperienceProps {
  inView: boolean;
}

const V1Experience: React.FC<V1ExperienceProps> = ({ inView }) => {
  const [autoplaySpeed] = useState(3000);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const walletScreens = [
    '/lovable-uploads/dee86368-28b2-44f6-a28e-a13e40b49386.png',
    '/lovable-uploads/fc482f64-4257-45a3-8925-2e671d1b857c.png',
    '/lovable-uploads/7098234e-0407-4d0f-a4e8-8fbadf4154cd.png',
    '/lovable-uploads/a5f8972f-b18d-4f17-8799-eeb025813f3b.png',
  ];
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (inView) {
      interval = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % walletScreens.length);
      }, autoplaySpeed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inView, walletScreens.length, autoplaySpeed]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className={`space-y-6 transition-all duration-1000 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-500 mb-2">
            V1 Experience
          </h2>
          <h3 className="text-xl md:text-2xl font-medium text-white/90 mb-4">
            Minimal, Memetic, Instantly Customizable.
          </h3>
          <p className="text-white/70">
            For meme lovers and brand fans – instantly apply custom login screens. 
            Inspired by community creativity.
          </p>
        </div>
      </div>
      
      <div className={`transition-all duration-1000 delay-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="overflow-visible px-4 relative">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {walletScreens.map((screen, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-black/30 backdrop-blur-sm border border-white/10 overflow-hidden">
                    <div className="aspect-[9/16] relative overflow-hidden rounded-md">
                      <img 
                        src={screen} 
                        alt={`Wallet screen ${index + 1}`} 
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="absolute -left-12" />
              <CarouselNext className="absolute -right-12" />
            </div>
          </Carousel>
          
          <div className="flex justify-center mt-4 gap-2">
            {walletScreens.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-purple-500 w-6' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default V1Experience;
