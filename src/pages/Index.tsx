
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import V1Customizer from '../components/editor/V1Customizer';
import AnimatedStars from '@/components/ui/animated-stars';
import ShowcaseSection from '@/components/showcase/ShowcaseSection';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="w-full overflow-x-hidden">
      <AnimatedStars />
      <V1Customizer />
      <ShowcaseSection />
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
