
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Twitter, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <footer 
      ref={ref}
      className="w-full bg-gradient-to-br from-black via-purple-950/90 to-black py-6 relative"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-purple-900/10 blur-xl -top-4 opacity-30 pointer-events-none"></div>
      
      <div 
        className={cn(
          "w-full max-w-screen-xl mx-auto px-3 md:px-4 transition-all duration-1000",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Desktop layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Left: Docs */}
          <div className="flex-1">
            <Link 
              to="/documentation" 
              className="text-white/80 hover:text-white transition-all hover:text-shadow-glow duration-300"
            >
              Docs
            </Link>
          </div>
          
          {/* Center: Brand */}
          <div className="flex-1 text-center">
            <p className="text-white font-bold tracking-wider uppercase text-lg">
              Wallet Coast Customs <span className="text-solana-purple">2025</span>
            </p>
          </div>
          
          {/* Right: Social Icons */}
          <div className="flex-1 flex justify-end gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
            >
              <Twitter className="w-5 h-5 hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
            <a 
              href="https://telegram.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
            >
              <Send className="w-5 h-5 hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
          </div>
        </div>
        
        {/* Mobile layout */}
        <div className="flex md:hidden flex-col items-center space-y-4 py-2">
          {/* Brand */}
          <p className="text-white font-bold tracking-wider uppercase text-base">
            Wallet Coast Customs <span className="text-solana-purple">2025</span>
          </p>
          
          {/* Docs */}
          <Link 
            to="/documentation" 
            className="text-white/80 hover:text-white transition-all hover:text-shadow-glow duration-300 py-2"
          >
            Docs
          </Link>
          
          {/* Social Icons */}
          <div className="flex justify-center gap-4 py-2">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
            >
              <Twitter className="w-5 h-5 hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
            <a 
              href="https://telegram.org" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300"
            >
              <Send className="w-5 h-5 hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
