
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Footer from '@/components/layout/Footer';

// Define the documentation sections
const sections = [
  {
    id: 'about',
    title: 'About the Project',
    content: 'Wallet Coast Customs lets anyone create personalized skins for Phantom wallets, powered by AI and minted as NFTs. Skins can be one-of-ones or trending collections, with full resale functionality.'
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    content: (
      <>
        <p className="mb-2">Q2 2025 – MVP launch with custom minting</p>
        <p className="mb-2">Q3 2025 – Public beta with royalty splits & gallery</p>
        <p className="mb-2">Q4 2025 – Marketplace integrations and partner drops</p>
        <p>2026 – Full Phantom API integration (planned)</p>
      </>
    )
  },
  {
    id: 'mint',
    title: 'How Mint Works',
    content: 'Once you design a wallet skin, you can mint it as an NFT with one click. You own the token, and it can be traded or used as a verified skin in supported wallets.'
  },
  {
    id: 'contract',
    title: 'Smart Contract',
    content: 'Every skin is linked to a smart contract storing metadata, style values, and creator info. Supports both 1/1 and multi-mint logic with royalty split.'
  },
  {
    id: 'royalties',
    title: 'Royalties & Profit Split',
    content: 'Creators earn a % on every resale. The platform also earns a service fee. All logic is transparent and on-chain.'
  }
];

const DocSidebar = ({ activeSection, setActiveSection, className }: { 
  activeSection: string; 
  setActiveSection: (id: string) => void;
  className?: string;
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -20 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("w-full lg:w-64 shrink-0", className)}
    >
      <h2 className="text-xl font-bold mb-6 text-center lg:text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        WCC Documentation
      </h2>
      
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={cn(
              "w-full text-left py-3 px-4 rounded-lg transition-all duration-300",
              "hover:bg-white/10 hover:shadow-[0_0_10px_rgba(153,69,255,0.2)]",
              activeSection === section.id 
                ? "bg-white/5 shadow-[0_0_15px_rgba(153,69,255,0.3)] border border-purple-500/30" 
                : "border border-transparent"
            )}
          >
            <span className={cn(
              "transition-all duration-300",
              activeSection === section.id 
                ? "text-white text-shadow-glow" 
                : "text-white/70"
            )}>
              {section.title}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const DocContent = ({ activeSection }: { activeSection: string }) => {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const activeContent = sections.find(section => section.id === activeSection);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="flex-1 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-solana-purple to-solana-blue">
          {activeContent?.title}
        </h2>
        <div className="text-white/80 leading-relaxed">
          {activeContent?.content}
        </div>
      </div>
    </motion.div>
  );
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('about');
  const navigate = useNavigate();
  
  // Create a page entry animation effect
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-black via-purple-950/20 to-black"
    >
      {/* Ambient glow effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(153,69,255,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,241,149,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="mr-1 w-5 h-5" />
            Back to Home
          </Button>
          
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="lg:hidden text-white border-white/20 bg-black/30 backdrop-blur-sm"
              >
                Sections <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 border-white/10 w-[85%] max-w-[320px]">
              <DocSidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                className="w-full mt-8" 
              />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-8 pb-16">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <DocSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          
          {/* Content area */}
          <ScrollArea className="flex-1">
            <DocContent activeSection={activeSection} />
          </ScrollArea>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </motion.div>
  );
};

export default Documentation;
