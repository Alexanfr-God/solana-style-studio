
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import V1Customizer from '../components/editor/V1Customizer';
import AnimatedStars from '@/components/ui/animated-stars';
import ShowcaseSection from '@/components/showcase/ShowcaseSection';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  // Add enhanced logging to help debug mobile rendering and showcase section
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
    
    // Enhanced element visibility check with more detailed reporting
    const checkElementsVisibility = () => {
      const showcaseEl = document.querySelector('#showcase-section');
      const elements = {
        showcaseSection: document.querySelector('#showcase-section'),
        carousel: document.querySelector('.embla'),
        carouselItems: document.querySelectorAll('.embla__slide'),
        navigationButtons: {
          prev: document.querySelector('.carousel-button:first-child'),
          next: document.querySelector('.carousel-button:last-child')
        },
        footer: document.querySelector('footer')
      };
      
      console.log('Element visibility check:', {
        showcaseSectionVisible: !!elements.showcaseSection,
        carouselVisible: !!elements.carousel,
        carouselItemsCount: elements.carouselItems?.length || 0,
        navigationButtonsVisible: {
          prev: !!elements.navigationButtons.prev,
          next: !!elements.navigationButtons.next
        },
        footerVisible: !!elements.footer
      });
      
      // Check dimensions where available
      if (elements.showcaseSection) {
        const rect = elements.showcaseSection.getBoundingClientRect();
        console.log('Showcase section dimensions:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          visibility: getComputedStyle(elements.showcaseSection).visibility,
          display: getComputedStyle(elements.showcaseSection).display
        });
      }
      
      if (elements.carousel) {
        const rect = elements.carousel.getBoundingClientRect();
        console.log('Carousel dimensions:', {
          width: rect.width,
          height: rect.height,
          visibility: getComputedStyle(elements.carousel).visibility,
          display: getComputedStyle(elements.carousel).display
        });
      }
    };
    
    // Check visibility immediately and after a delay to catch async loading
    checkElementsVisibility();
    const initialCheck = setTimeout(checkElementsVisibility, 500);
    const secondCheck = setTimeout(checkElementsVisibility, 2000);
    
    return () => {
      window.removeEventListener('resize', logViewportInfo);
      clearTimeout(initialCheck);
      clearTimeout(secondCheck);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* AnimatedStars background with fixed positioning */}
      <AnimatedStars />
      
      {/* Customizer Section */}
      <section className="w-full">
        <V1Customizer />
      </section>
      
      {/* Showcase Section with enhanced visibility attributes */}
      <section 
        id="showcase-section" 
        className="w-full relative z-10"
        data-testid="showcase-section"
      >
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
