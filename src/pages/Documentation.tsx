import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/layout/Footer';

// Define the documentation sections
const sections = [{
  id: 'about',
  title: 'About the Project',
  content: <>
        <Card className="bg-black/40 border-white/5 shadow-lg">
          <CardContent className="p-6 max-h-[70vh] overflow-y-auto scrollbar-custom">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🌴 About Wallet Coast Customs</h3>
            
            <p className="mb-4">Wallet Coast Customs (WCC) is a startup reimagining how Web3 wallets should look, feel, and express individuality.</p>
            
            <p className="mb-4">We're building the first AI-powered customization platform for Web3 wallet extensions —
            a place where design becomes an NFT theme, and every wallet becomes a reflection of its owner's personality.</p>
            
            <p className="mb-4">WCC isn't just another "skin."
            It's a step into a new era where users control not only their tokens,
            but also the visual identity of their digital self.</p>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🎨 Today</h3>
            
            <p className="mb-4">The system is currently being trained on the WCC Demo Wallet.
            Here, users can upload an image — and AI Vision extracts its color palette,
            replaces the corresponding values in the JSON theme,
            and instantly applies the result to the wallet interface.</p>
            
            <p className="mb-4">Users can manually fine-tune details, save their theme,
            and even mint it as an NFT — preserving their visual style on-chain.</p>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🚀 Why It Matters</h3>
            
            <p className="mb-4">We believe customization is the next level of ownership in Web3.
            If NFTs let people own digital art,
            then wallet themes let them own their interface.</p>
            
            <p className="mb-4">Every screen, background, and color becomes part of your on-chain identity.
            WCC makes that possible.</p>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🧩 How It Works</h3>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li><strong>AI Vision</strong> analyzes uploaded images and generates color palettes</li>
              <li><strong>GPT Theme Engine</strong> updates the JSON theme across all interface layers</li>
              <li><strong>Manual Editor</strong> lets users fine-tune colors, backgrounds, and typography</li>
              <li><strong>Mint System</strong> saves each finished theme as an NFT</li>
            </ul>
            
            <p className="mb-4">All changes happen in real time, directly inside the wallet interface.</p>
            
            <div className="p-4 bg-gradient-to-r from-black/60 to-solana-purple/10 rounded-md mb-4">
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🌊 Our Mission</h3>
              <p className="mb-2">Wallet Coast Customs is a laboratory of Web3 customization —
              transforming wallet interfaces into personal spaces
              where AI helps users create, express, and truly own their style.</p>
            </div>
          </CardContent>
        </Card>
      </>
}, {
  id: 'roadmap',
  title: 'Roadmap',
  content: <>
        <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🚗 WCC Roadmap — 2025–2026</h2>
        
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q4 2025 — Stabilization & Real Mint Integration</span></p>
            <p className="mb-2 italic text-white/70">current phase: "AI-Driven Demo → NFT Theme Flow"</p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>✅ Full NFT theme minting — users sign and pay for their own transactions</li>
              <li>✅ Minted Gallery launched — filterable cards with themes, owners, and "Apply Theme" button</li>
              <li>⚙️ Manual Editor improvements — AI recognizes more JSON elements (colors, backgrounds, text, buttons)</li>
              <li>🧠 AI palette extraction and replacement from uploaded images</li>
              <li>🎨 Development of AI Poster Generator — automatic theme posters and visual previews</li>
            </ul>
            <p className="mt-3 font-semibold">→ Goal by December 2025:</p>
            <p className="mb-2">Deliver a stable build where users can upload an image → AI extracts and applies a palette → the theme is minted as an NFT → and instantly applied to the interface.
            Also launch AI-generated theme posters and previews.</p>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q1 2026 — Transition to Real Extension Layer</span></p>
            <p className="mb-2 italic text-white/70">"from demo wallet → to real browser extension environment"</p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🚀 Move customization logic into a real browser extension</li>
              <li>🔌 Integrate the Theme Engine as a standalone runtime JSON patch module</li>
              <li>💾 Configure IPFS + Supabase Storage for user theme libraries</li>
              <li>🧩 Expand JSON structure: fonts, borders, icons, hover states</li>
              <li>🎨 Finalize "Apply Theme" with visual feedback and animation</li>
              <li>🧠 Start model training on edit history — AI learns to suggest design patterns</li>
            </ul>
            <p className="mt-3 font-semibold">→ Goal by March 2026:</p>
            <p className="mb-2">Build a functional browser extension prototype with AI-assisted theme application and adaptive design learning.</p>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q2 2026 — Multi-Interface Integration & Marketplace</span></p>
            <p className="mb-2 italic text-white/70">"turning customization into an ecosystem"</p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🌐 Support multiple wallet interfaces and layouts</li>
              <li>🪙 Create a simple NFT Theme Marketplace — users can sell or exchange their custom themes</li>
              <li>🎭 Introduce User Profiles (on-chain portfolios showcasing owned and created themes)</li>
              <li>💬 Collect user feedback to improve AI theme suggestions and color mapping</li>
            </ul>
            <p className="mt-3 font-semibold">→ Goal by June 2026:</p>
            <p className="mb-2">Launch a public demo featuring multi-interface customization and an open NFT theme marketplace.</p>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q3–Q4 2026 — Scale & Standardization</span></p>
            <p className="mb-2 italic text-white/70">"from project → to protocol"</p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🧩 Develop the WCC Theme Protocol — an open standard for Web3 interface customization</li>
              <li>🌍 Partner with Web3 projects (wallets, NFT marketplaces, DAOs)</li>
              <li>🎨 Cross-platform themes (desktop, mobile, browser)</li>
              <li>💡 Begin testing the AI Layout Generator for automatic interface composition</li>
              <li>📦 Publish documentation and SDK for integrating WCC into external products</li>
            </ul>
            <p className="mt-3 font-semibold">→ Goal by end of 2026:</p>
            <p className="mb-2">Position WCC as the standard for Web3 interface customization — a foundation layer for personalized wallet experiences.</p>
          </div>
          
          <div className="mt-6 p-4 bg-black/40 border border-white/10 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">⏱️ Progress Timeline</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 font-semibold text-white/90 pb-2 border-b border-white/20">
                <span>Stage</span>
                <span>Target Date</span>
                <span>Status</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-white/80">
                <span>Stable build (AI Palette + Mint + Posters)</span>
                <span>December 2025</span>
                <span>🔥 Achievable</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-white/80">
                <span>Real browser extension prototype</span>
                <span>March–April 2026</span>
                <span>⚙️ Realistic</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-white/80">
                <span>Multi-interface + Marketplace</span>
                <span>Summer 2026</span>
                <span>🌊 Early public release</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-white/80">
                <span>Customization Protocol (standardization)</span>
                <span>End of 2026</span>
                <span>🧠 Vision milestone</span>
              </div>
            </div>
          </div>
        </div>
      </>
}, {
  id: 'mint',
  title: 'How Mint Works',
  content: <>
        <Card className="bg-black/40 border-white/5 shadow-lg">
          <CardContent className="p-6 max-h-[70vh] overflow-y-auto scrollbar-custom">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🎨 How Minting Works Now</h3>
            
            <p className="mb-4">Users can now mint their wallet designs as fully functional NFTs on Solana Devnet — each theme is unique, on-chain, and immediately applicable to the wallet interface.</p>
            
            <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">📦 What Gets Minted</h3>
            
            <p className="mb-4">Each wallet theme NFT contains two essential components:</p>
            
            <p className="mb-2"><strong>🖼️ Visual Preview (PNG)</strong></p>
            <p className="mb-4">A rendered snapshot of the wallet interface with the applied theme — this is what users see in NFT galleries and marketplaces.</p>
            
            <p className="mb-2"><strong>🧬 Theme Data (JSON via IPFS)</strong></p>
            <p className="mb-4">The complete theme configuration stored on IPFS, including:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Color palettes (backgrounds, text, accents)</li>
              <li>Typography settings (fonts, sizes, weights)</li>
              <li>UI element styles (buttons, cards, borders)</li>
              <li>Layer configurations (home, login, wallet screens)</li>
              <li>Background images and masks</li>
              <li>Animation and effect settings</li>
              <li>Theme version identifier (v2/v3 architecture)</li>
            </ul>
            
            <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">⚙️ Current Mint Flow</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">1.</span>
                <div>
                  <p className="font-semibold">User customizes their wallet theme</p>
                  <p className="text-sm text-white/70">Using AI palette extraction, manual color editor, or preset themes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">2.</span>
                <div>
                  <p className="font-semibold">Theme is uploaded to IPFS</p>
                  <p className="text-sm text-white/70">Complete JSON structure stored immutably on decentralized storage</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">3.</span>
                <div>
                  <p className="font-semibold">User connects wallet and signs transaction</p>
                  <p className="text-sm text-white/70">Phantom/Solflare wallet integration for seamless minting</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">4.</span>
                <div>
                  <p className="font-semibold">NFT is minted on Solana</p>
                  <p className="text-sm text-white/70">Metaplex standard with embedded IPFS links to theme data</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">5.</span>
                <div>
                  <p className="font-semibold">Theme appears in Minted Gallery</p>
                  <p className="text-sm text-white/70">Users can browse, filter, and apply any minted theme instantly</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🔄 Apply Theme Feature</h3>
            <p className="mb-4">Any minted theme NFT can be applied to the wallet with one click:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li><strong>Smart loading:</strong> Theme data is fetched from IPFS with caching for faster subsequent loads</li>
              <li><strong>Validation:</strong> Theme structure is checked for compatibility before application</li>
              <li><strong>Live preview:</strong> Changes apply instantly to the wallet interface</li>
              <li><strong>Fallback support:</strong> Older NFT formats (v1) are automatically detected and handled</li>
            </ul>
            
            <h3 className="text-lg font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🎯 Current Status</h3>
            <p className="mb-4">The minting system is <strong>live on Devnet</strong> and fully functional. Users can:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>✅ Create and customize wallet themes</li>
              <li>✅ Mint themes as Solana NFTs</li>
              <li>✅ Browse minted themes in the gallery</li>
              <li>✅ Apply any theme instantly</li>
              <li>✅ View theme metadata and ownership</li>
            </ul>
            
            <p className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              This isn't just art.<br />
              This is <strong>programmable wallet identity</strong> — live and on-chain.
            </p>
          </CardContent>
        </Card>
      </>
}, {
  id: 'royalties',
  title: 'Royalties & Profit Split',
  content: <>
        <p className="mb-4">At Wallet Coast Customs, we believe customization should reward everyone who makes it possible — the creator, the platform, and even the wallet that brings it to life.</p>
        
        <p className="mb-4">Every minted wallet theme is designed to include multi-tier royalties, where revenue is fairly shared between all key contributors:</p>
        
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>Creators</strong> earn ongoing royalties from every resale of their custom skins.</li>
          <li><strong>WCC Platform</strong> receives a small service fee to fund product development, moderation, and AI infrastructure.</li>
          <li><strong>Integrated wallets</strong> receive a partner fee — a percentage that supports the ecosystem hosting and displaying the themes.</li>
        </ul>
        
        <p className="mb-4">This model transforms customization into a collaborative economy, not just a marketplace. Each participant benefits from the success of the others, encouraging innovation, design quality, and open integration.</p>
        
        <p className="mb-4">As the system evolves, creators will be able to:</p>
        
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>Set their own royalty percentage</li>
          <li>Launch one-of-one or open-edition drops</li>
          <li>Track real-time mint stats, resales, and collector analytics</li>
          <li>Share verified links for easier promotion and community building</li>
        </ul>
        
        <p className="mb-4">All fee and royalty logic will be transparent and encoded on-chain once the marketplace and wallet integration layers go live.</p>
        
        <p className="mb-4">WCC's goal is simple: build an ecosystem where every layer of creativity — from design to delivery — is rewarded.</p>
      </>
}, {
  id: 'architecture',
  title: 'Architecture & Tech Stack',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Architecture & Tech Stack</h3>
        
        <p className="mb-4">Content for this section is coming soon...</p>
      </>
}, {
  id: 'ai-model',
  title: 'AI Model & Prompting Strategy',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI Model & Prompting Strategy</h3>
        
        <p className="mb-4">Content for this section is coming soon...</p>
      </>
}, {
  id: 'monetization',
  title: 'Monetization Strategy',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Monetization Strategy</h3>
        
        <p className="mb-4">Content for this section is coming soon...</p>
      </>
}, {
  id: 'community',
  title: 'Community & Growth Plan',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Community & Growth Plan</h3>
        
        <p className="mb-4">Content for this section is coming soon...</p>
      </>
}, {
  id: 'security',
  title: 'Security & Ownership',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Security & Ownership</h3>
        
        <p className="mb-4">Content for this section is coming soon...</p>
      </>
}];

const DocSidebar = ({
  activeSection,
  setActiveSection,
  className
}: {
  activeSection: string;
  setActiveSection: (id: string) => void;
  className?: string;
}) => {
  const {
    ref,
    inView
  } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  return <motion.div ref={ref} initial={{
    opacity: 0,
    x: -20
  }} animate={{
    opacity: inView ? 1 : 0,
    x: inView ? 0 : -20
  }} transition={{
    duration: 0.5,
    delay: 0.2
  }} className={cn("w-full lg:w-64 shrink-0", className)}>
      <h2 className="text-xl font-bold mb-6 text-center lg:text-left text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        WCC Documentation
      </h2>
      
      
      <div className="space-y-1">
        {sections.map(section => <button key={section.id} onClick={() => setActiveSection(section.id)} className={cn("w-full text-left py-3 px-4 rounded-lg transition-all duration-300", "hover:bg-white/10 hover:shadow-[0_0_10px_rgba(153,69,255,0.2)]", activeSection === section.id ? "bg-white/5 shadow-[0_0_15px_rgba(153,69,255,0.3)] border border-purple-500/30" : "border border-transparent")}>
            <span className={cn("transition-all duration-300", activeSection === section.id ? "text-white text-shadow-glow" : "text-white/70")}>
              {section.title}
            </span>
          </button>)}
      </div>
    </motion.div>;
};
const DocContent = ({
  activeSection
}: {
  activeSection: string;
}) => {
  const {
    ref,
    inView
  } = useInView({
    triggerOnce: false,
    threshold: 0.1
  });
  const activeContent = sections.find(section => section.id === activeSection);
  return <motion.div ref={ref} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 20
  }} transition={{
    duration: 0.5
  }} className="flex-1 bg-black/30 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-solana-purple to-solana-blue">
          {activeContent?.title}
        </h2>
        <div className="text-white/80 leading-relaxed">
          {activeContent?.content}
        </div>
      </div>
    </motion.div>;
};
const Documentation = () => {
  const [activeSection, setActiveSection] = useState('about');
  const navigate = useNavigate();

  // Create a page entry animation effect
  const {
    ref,
    inView
  } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);
  return <motion.div ref={ref} initial={{
    opacity: 0
  }} animate={{
    opacity: inView ? 1 : 0
  }} transition={{
    duration: 0.7
  }} className="min-h-screen flex flex-col bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(153,69,255,0.15),transparent_50%)] pointer-events-none"></div>
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,241,149,0.1),transparent_50%)] pointer-events-none"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => navigate('/')} variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
            <ChevronLeft className="mr-1 w-5 h-5" />
            Back to Home
          </Button>
          
          {/* Mobile sidebar trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden text-white border-white/20 bg-black/30 backdrop-blur-sm">
                Sections <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 border-white/10 w-[85%] max-w-[320px]">
              <DocSidebar activeSection={activeSection} setActiveSection={setActiveSection} className="w-full mt-8" />
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
    </motion.div>;
};
export default Documentation;
