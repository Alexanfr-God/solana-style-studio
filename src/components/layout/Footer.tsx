
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Github, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.01,
    rootMargin: '100px 0px',
  });

  return (
    <footer 
      ref={ref}
      className="w-full bg-gradient-to-br from-black via-purple-950/90 to-black py-6 relative border-t border-white/10"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-purple-900/10 blur-xl -top-4 opacity-30 pointer-events-none"></div>
      
      <div 
        className={cn(
          "w-full max-w-screen-xl mx-auto px-3 md:px-4 transition-all duration-1000",
          "opacity-100"
        )}
      >
        {/* Desktop layout */}
        <div className="hidden md:flex justify-between items-center">
          {/* Left: Docs + Social Icons */}
          <div className="flex-1 flex items-center gap-6">
            <Link 
              to="/docs" 
              className="text-white/80 hover:text-white transition-all hover:text-shadow-glow duration-300 relative group"
            >
              <span>Docs</span>
              <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
            
            <div className="flex gap-4">
              <a 
                href="https://github.com/Alexanfr-God/solana-style-studio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
              >
                <Github className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
              </a>
              <a 
                href="" 
                className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
              >
                <Send className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
              </a>
              <a 
                href="https://x.com/wacocuapp" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
              >
                <X className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
              </a>
            </div>
          </div>
          
          {/* Center: Brand */}
          <div className="flex-1 text-center">
            <p className="text-white font-bold tracking-wider uppercase text-lg">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Wallet Coast Customs
              </span>
              <span className="text-purple-400 ml-2">2025</span>
            </p>
          </div>
          
          {/* Right: Empty space */}
          <div className="flex-1"></div>
        </div>
        
        {/* Mobile layout */}
        <div className="flex md:hidden flex-col items-center space-y-4 py-2">
          {/* Brand */}
          <p className="text-white font-bold tracking-wider uppercase text-base">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Wallet Coast Customs
            </span>
            <span className="text-purple-400 ml-2">2025</span>
          </p>
          
          {/* Docs */}
          <Link 
            to="/docs" 
            className="text-white/80 hover:text-white transition-all hover:text-shadow-glow duration-300 py-2 relative group"
          >
            <span>Docs</span>
            <span className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Link>
          
          {/* Social Icons */}
          <div className="flex justify-center gap-4 py-2">
            <a 
              href="https://github.com/Alexanfr-God/solana-style-studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
            >
              <Github className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
            <a 
              href="" 
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
            >
              <Send className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
            <a 
              href="https://x.com/wacocuapp" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white/80 hover:text-white hover:scale-110 transition-all duration-300 group"
            >
              <X className="w-5 h-5 group-hover:shadow-[0_0_10px_rgba(153,69,255,0.7)]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
