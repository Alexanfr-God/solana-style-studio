
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import V1Customizer from '../components/editor/V1Customizer';
import AnimatedStars from '@/components/ui/animated-stars';

const Index = () => {
  return (
    <>
      <AnimatedStars />
      <V1Customizer />
      <Toaster />
    </>
  );
};

export default Index;
