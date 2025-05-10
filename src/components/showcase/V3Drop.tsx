
import React, { useRef, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface V3DropProps {
  inView: boolean;
}

const V3Drop: React.FC<V3DropProps> = ({ inView }) => {
  const { ref, inView: elementInView } = useInView({
    triggerOnce: true,
    threshold: 0.2
  });
  
  const badgeRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!badgeRef.current || !elementInView) return;
    
    const badge = badgeRef.current;
    let shimmerPosition = -100;
    let animationId: number;
    
    const animateShimmer = () => {
      shimmerPosition += 0.8;
      if (shimmerPosition > 200) shimmerPosition = -100;
      
      if (badge) {
        badge.style.backgroundPosition = `${shimmerPosition}% 0`;
        animationId = requestAnimationFrame(animateShimmer);
      }
    };
    
    animationId = requestAnimationFrame(animateShimmer);
    return () => cancelAnimationFrame(animationId);
  }, [elementInView]);
  
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[500px]">
      <div className={`relative h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-xl transition-all duration-1000 transform ${inView && elementInView ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}>
        <img 
          src="/lovable-uploads/7098234e-0407-4d0f-a4e8-8fbadf4154cd.png" 
          alt="Character wallet" 
          className="h-full w-full object-cover object-center animate-float"
        />
      </div>
      
      <div className={`space-y-6 transition-all duration-1000 delay-300 ${inView && elementInView ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-500">
            V3 Drop: AI-Powered Skins as NFTs
          </h2>
          
          <div 
            ref={badgeRef}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white border border-purple-400/20 bg-[size:200%_100%] shadow-glow"
          >
            <Star className="w-3 h-3" />
            <span>NFT</span>
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-medium text-white/90 mb-4">
          Your wallet becomes an identity.
        </h3>
        
        <p className="text-white/70 max-w-lg">
          In the near future, you'll mint AI-generated custom wallet skins as NFTs. 
          Fully personalized. Fully tradable. Built with animated characters, interactive layouts, 
          and unique vibes — made by you.
        </p>
      </div>
    </div>
  );
};

export default V3Drop;
