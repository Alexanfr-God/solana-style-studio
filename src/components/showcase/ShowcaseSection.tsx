
import React from 'react';
import GlowingDivider from './GlowingDivider';
import V1Experience from './V1Experience';
import V3Drop from './V3Drop';
import { useInView } from 'react-intersection-observer';

const ShowcaseSection = () => {
  const { ref: sectionRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-gradient-to-br from-black via-purple-950/90 to-black py-16 min-h-[90vh] overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <GlowingDivider />
        
        <div className={`mb-24 transition-all duration-1000 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <V1Experience inView={inView} />
        </div>
        
        <div className={`mt-24 transition-all duration-1000 delay-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <V3Drop inView={inView} />
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
