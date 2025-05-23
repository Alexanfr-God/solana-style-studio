
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
            <p className="mb-4"><strong>Wallet Coast Customs (WCC)</strong> is the world's first AI-powered platform that lets anyone customize the look of their Web3 wallet and turn it into a collectible NFT. We're creating a new layer of digital identity — your wallet shouldn't look like everyone else's. It should look like you.</p>
            
            <p className="mb-4"><h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🔥 Version v1 – Live and Working</h3>
            In v1, we launched a basic login screen customization tool for Phantom Wallet via Supabase Edge Function. Users upload an image, describe a desired vibe, and AI generates a personalized design.</p>
            
            <p className="mb-4">This first version is far from perfect — but it works, and it proves the concept. We're actively improving how the system interprets prompts and processes images to generate cleaner, more cohesive results.</p>
            
            <p className="mb-4"><h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🤖 Beyond Visuals: Structured AI Design</h3>
            We built our own custom GPT — <a href="https://chatgpt.com/g/g-6825f681e12c8191a9e193a6a2104b46-wallet-coast-customs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">Wallet Coast Customs GPT</a> — that not only generates visual skins but also outputs a complete UI structure in JSON:</p>
            
            <div className="pl-4 border-l-2 border-solana-purple/30 mb-4">
              <p className="mb-2">background, buttons, logo, text — every element layered as a PNG,</p>
              <p className="mb-2">ready to mint as an NFT and later apply as a skin to your wallet.</p>
            </div>
            
            <p className="mb-4">We've already received positive feedback from the OpenAI team, and we're awaiting early API access — ready to bring our GPT into the world of Web3 customization.</p>
            
            <p className="mb-4"><h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">⚙️ Tech Stack</h3></p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Supabase Edge Functions – server logic for theme generation and control</li>
              <li><a href="https://chatgpt.com/g/g-6825f681e12c8191a9e193a6a2104b46-wallet-coast-customs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">Custom GPT (Wallet Coast Customs)</a> – AI-generated UI layout in JSON</li>
              <li>OpenAI DALL·E API – visual style rendering</li>
              <li>Solana Smart Contract – our own contract for NFT minting, royalties, and collections</li>
              <li>Lovable – used as early-stage dev playground and UI builder</li>
            </ul>
            
            <p className="mb-4"><h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🚀 Coming Soon</h3></p>
            <div className="mb-4">
              <p className="mb-2"><strong>v2 – UI Style Editor</strong><br />
              After skin generation, our AI will extract fonts and color palettes. Users can manually fine-tune the interface — text, background, buttons, borders.</p>
            </div>
            
            <div className="mb-4">
              <p className="mb-2"><strong>v3 – Wallet Masks</strong><br />
              Visual add-ons that decorate the wallet exterior — memes, frames, characters, art. Wallets become expressive and iconic.</p>
            </div>
            
            <p className="mb-4">All styles are saved as NFTs and can belong to:</p>
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>exclusive drops</li>
              <li>curated collections</li>
              <li>or 1-of-1s</li>
            </ul>
            
            <div className="p-4 bg-gradient-to-r from-black/60 to-solana-purple/10 rounded-md mb-4">
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🌊 Our Mission</h3>
              <p className="mb-2">Wallet Coast Customs is not just customization.</p>
              
              <p className="mb-2">It's self-expression.<br />
              It's Web3 identity.<br />
              It's your personality in pixels.</p>
              
              <p>Your PFP is unique.<br />
              Your NFTs are a statement.<br />
              Now your wallet can be iconic too.</p>
            </div>
          </CardContent>
        </Card>
      </>
}, {
  id: 'roadmap',
  title: 'Roadmap',
  content: <>
        <h2 className="text-xl font-bold mb-4"></h2>
        
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q2 2025 — MVP Is Here</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>Launch of V1: AI-generated login screen skins for Phantom</li>
              <li>Developing our own custom Solana smart contract for native NFT minting with royalty control and unique wallet skin logic</li>
              <li>First 1-of-1 skins live for early testing & community feedback</li>
              <li>🎯 Participating in <strong>Solana Breakout Hackathon</strong> to showcase tech & secure visibility</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q3 2025 — Opening the Gates</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>Public beta goes live 🌍</li>
              <li>NFT royalties, revenue-sharing logic & wallet linking</li>
              <li>Community Gallery: display trending skins, collections, and limited drops</li>
              <li>🧠 <strong>Private fundraising round begins</strong> (angels + micro-funds)</li>
              <li>🛠️ Actively recruiting top-tier developers, AI engineers & Web3 visionaries to scale the core product</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q4 2025 — Ecosystem Expansion</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>Partner drops with meme coins, creators, and Solana-native brands</li>
              <li>Integration with marketplaces: Magic Eden, Tensor, and others</li>
              <li>Skin rarity, user profiles, creator leaderboards</li>
              <li>📣 <strong>Seed fundraising round</strong> (for scaling custom GPT, AI infra & BD hires)</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">2026 — Beyond Phantom</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>Full Phantom API integration for live wallet theming</li>
              <li>Animated wallets: motion-reactive styles powered by AI ✨</li>
              <li>Cross-wallet skin layers: Backpack, Solflare, and more</li>
              <li>Omnichain ownership via <strong>LayerZero integration</strong> 🌐</li>
            </ul>
          </div>
          
          <blockquote className="border-l-4 border-purple-500 pl-4 py-1 italic text-white/80">
            🚀 This isn't just a roadmap — it's the DNA of a protocol where wallets become culture.
          </blockquote>
        </div>
      </>
}, {
  id: 'mint',
  title: 'How Mint Works',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"></h3>
        
        <p className="mb-4">When a user finalizes their wallet skin design, it can be minted as a fully functional NFT with one click.</p>
        
        <p className="mb-4"><strong>Each NFT includes:</strong></p>
        
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>🖼️ Visual Layer (PNG):</strong> What users and marketplaces see — the static design preview.</li>
          <li><strong>🧬 Data Layer (JSON):</strong> Embedded inside the NFT — includes style metadata such as background color, text color, fonts, layout, and theme version (v1, v2, or v3).</li>
        </ul>
        
        <p className="mb-4">This dual-layer approach allows the skin to function like a dynamic theme:</p>
        
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li>On marketplaces, it behaves like a visual collectible.</li>
          <li>Inside supported wallets and apps, it <strong>unpacks into a living UI skin</strong> powered by the metadata.</li>
        </ul>
        
        <p className="mb-4">We are building the infrastructure to render these skins live inside wallet interfaces, unlocking utility far beyond static images.</p>
        
        <p className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          This isn't just art — it's <strong>programmable wallet fashion</strong>.
        </p>
      </>
}, {
  id: 'contract',
  title: 'Smart Contract (In Progress)',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"></h3>
        
        <p className="mb-4">Each wallet skin will be bound to a custom Solana smart contract — designed not just to store metadata, but to act as a programmable UI layer protocol for wallets.</p>
        
        <p className="mb-4"><strong>Core features (in development):</strong></p>
        
        <ul className="list-disc pl-5 mb-4 space-y-2">
          <li><strong>🧬 On-chain Style Registry:</strong> Each minted skin includes structured style data — such as color schemes, layout, version info, and visual assets — embedded in immutable NFT metadata.</li>
          <li><strong>👤 Creator Attribution & Royalties:</strong> Each skin will be linked to its creator, with customizable royalty logic for both single mints and collections.</li>
          <li><strong>🔁 Single & Multi-Mint Support:</strong> Whether it's a unique design (1/1) or a collection drop, the contract will handle mint supply, uniqueness tracking, and ownership records.</li>
          <li><strong>💼 Ownership Hook for Wallet UI:</strong> The smart contract will enable frontends and wallets to dynamically apply skins if the NFT is detected in the connected wallet.</li>
          <li><strong>🌉 Cross-Chain Expandability (Planned):</strong> Future versions may integrate with LayerZero to support skin migration and recognition across EVM and Solana-compatible wallets.</li>
        </ul>
        
        <p className="mb-4">This contract architecture transforms wallet skins from simple NFTs into a verifiable, interoperable UI protocol — redefining what wallet personalization can look like in Web3.</p>
      </>
}, {
  id: 'royalties',
  title: 'Royalties & Profit Split',
  content: <>
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400"></h3>
        
        <p className="mb-4">Every wallet skin minted through Wallet Coast Customs includes built-in royalty logic. Creators can choose between one-of-one drops or open editions, and earn a percentage on every secondary sale — automatically enforced on-chain. Each collection can define its royalty rate at the time of launch.</p>
        
        <p className="mb-4">The platform also applies a small service fee on each mint and resale, which funds product development, moderation, and infrastructure. All royalty and fee logic is encoded in the smart contract and publicly visible.</p>
        
        <p className="mb-4">In open edition drops (e.g., 10,000 mints), a dynamic minting page is generated with real-time stats: minted count, remaining supply, and a live preview of the wallet skin. These collections come with a unique link, making them easy to promote and track. In the future, verified collections will gain access to customizable landing pages, advanced analytics, and boost options.</p>
        
        <p className="mb-4">This system is designed to fairly reward creators, foster viral drops, and ensure the long-term sustainability of the platform.</p>
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
