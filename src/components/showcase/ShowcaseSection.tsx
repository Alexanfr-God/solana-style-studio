
import React, { useEffect } from 'react';
import GlowingDivider from './GlowingDivider';
import V1Experience from './V1Experience';
import V3Drop from './V3Drop';
import { useInView } from 'react-intersection-observer';

const ShowcaseSection = () => {
  // Set a lower threshold to trigger earlier on mobile
  const { ref: sectionRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.05,
    rootMargin: '50px 0px'
  });
  
  // Add debug logs
  useEffect(() => {
    console.log('ShowcaseSection mounted');
    console.log('ShowcaseSection inView:', inView);
    
    // Debug visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          console.log('ShowcaseSection visibility:', entry.isIntersecting, 'ratio:', entry.intersectionRatio);
        });
      },
      { threshold: [0, 0.1, 0.5, 1.0] }
    );
    
    const element = document.getElementById('showcase-section');
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [inView]);

  return (
    <section 
      ref={sectionRef} 
      className="w-full bg-gradient-to-br from-black via-purple-950/90 to-black py-8 md:py-16"
    >
      <div className="max-w-screen-xl mx-auto px-3 md:px-4">
        <GlowingDivider />
        
        {/* Always render content first, then animate it when in view */}
        <div className={`mb-12 md:mb-24 transition-all duration-1000 delay-300 opacity-100 ${inView ? 'translate-y-0' : 'translate-y-10'}`}>
          <V1Experience inView={inView} />
        </div>
        
        <div className={`mt-12 md:mt-24 transition-all duration-1000 delay-700 opacity-100 ${inView ? 'translate-y-0' : 'translate-y-10'}`}>
          <V3Drop inView={inView} />
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
