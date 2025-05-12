
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import V1Customizer from '../components/editor/V1Customizer';
import AnimatedStars from '@/components/ui/animated-stars';
import ShowcaseSection from '@/components/showcase/ShowcaseSection';
import Footer from '@/components/layout/Footer';
import { useEffect } from 'react';

const Index = () => {
  // Add logging to help debug mobile rendering
  useEffect(() => {
    console.log('Index component mounted');
    
    // Log viewport dimensions to debug mobile view
    const logViewportSize = () => {
      console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    };
    
    logViewportSize();
    window.addEventListener('resize', logViewportSize);
    
    return () => window.removeEventListener('resize', logViewportSize);
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="relative">
        <AnimatedStars />
        <V1Customizer />
      </div>
      <ShowcaseSection />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
