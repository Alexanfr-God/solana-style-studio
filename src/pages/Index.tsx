
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import V1Customizer from '../components/editor/V1Customizer';
import AnimatedStars from '@/components/ui/animated-stars';
import ShowcaseSection from '@/components/showcase/ShowcaseSection';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  // Add enhanced logging to help debug mobile rendering
  useEffect(() => {
    console.log('Index component mounted');
    setMounted(true);
    
    // Log viewport dimensions and device information to debug mobile view
    const logViewportInfo = () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        userAgent: navigator.userAgent
      };
      
      console.log('Viewport info:', viewport);
      console.log('Document height:', document.body.scrollHeight);
    };
    
    logViewportInfo();
    window.addEventListener('resize', logViewportInfo);
    
    // Check if elements are visible
    setTimeout(() => {
      const showcaseEl = document.querySelector('#showcase-section');
      const footerEl = document.querySelector('footer');
      console.log('Showcase section visible:', !!showcaseEl);
      console.log('Footer visible:', !!footerEl);
      
      if (showcaseEl) {
        console.log('Showcase position:', showcaseEl.getBoundingClientRect());
      }
      if (footerEl) {
        console.log('Footer position:', footerEl.getBoundingClientRect());
      }
    }, 1000);
    
    return () => window.removeEventListener('resize', logViewportInfo);
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* AnimatedStars background with fixed positioning */}
      <AnimatedStars />
      
      {/* Customizer Section */}
      <section className="w-full">
        <V1Customizer />
      </section>
      
      {/* Showcase Section - Add ID for debugging */}
      <section id="showcase-section" className="w-full">
        <ShowcaseSection />
      </section>
      
      {/* Footer */}
      <Footer />
      
      <Toaster />
      
      {/* Debug overlay for development - visible only in dev mode */}
      {process.env.NODE_ENV === 'development' && mounted && (
        <div className="fixed bottom-0 left-0 bg-black/80 text-white text-xs p-1 z-50">
          {window.innerWidth}x{window.innerHeight}
        </div>
      )}
    </div>
  );
};

export default Index;
