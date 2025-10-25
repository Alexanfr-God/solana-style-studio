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
        <h2 className="text-xl font-bold mb-4"></h2>
        
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q2 2025 — MVP Launched</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>✅ First live demo version: AI-generated login screens via Supabase + DALL·E</li>
              <li>✅ Development of custom Solana smart contract (wallet skins, royalties, collections)</li>
              <li>✅ Custom GPT built: generates full UI structure (JSON + layered PNGs)</li>
              <li>✅ V2 demo released: AI-driven UI style generation (fonts, buttons, animations, backgrounds)</li>
              <li>✅ V3 mask architecture implemented: Safe Zone logic and Replicate SDXL rendering</li>
              <li>✅ Participated in Solana Breakout Hackathon to validate vision and technology</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q3 2025 — Product Growth & Development</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🎨 Public release of Style Editor (v2): hybrid AI + manual interface customization</li>
              <li>🎭 Completion of Wallet Mask system (v3): preview and fallback logic</li>
              <li>🤖 AI Companion development begins: emotions, voice interaction, behavioral response</li>
              <li>💬 Gathering feedback from closed group testing (focus groups & early community)</li>
              <li>👥 Expanding the core team: frontend, backend, and AI developers</li>
              <li>💸 Actively pursuing grants and strategic investment opportunities</li>
              <li>🔌 Starting integration with Web3 marketplaces (no names disclosed)</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Q4 2025 — Scaling & Customization</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🎁 Partnered drops and visual collaborations with Web3 projects and communities</li>
              <li>💎 Skin rarity levels, collectible layers, creator profiles</li>
              <li>🧠 Expansion of AI infrastructure: custom model development and style control logic</li>
              <li>🌐 Early testing of omnichain skin ownership via LayerZero</li>
              <li>🔒 AI Companion prototypes early security behaviors: detect anomalies, protect users</li>
            </ul>
          </div>
          
          <div>
            <p className="mb-2 text-lg font-semibold">🔹 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">2026 — From Product to Protocol</span></p>
            <ul className="list-disc pl-5 mb-2 space-y-1">
              <li>🔗 Potential direct integrations with major Web3 wallets</li>
              <li>🐾 AI Companion becomes persistent layer: emotional, behavioral, voice-enabled</li>
              <li>🎞️ Animated skins: motion-reactive styles responding to user interaction</li>
              <li>👛 Cross-wallet theming: apply one skin across multiple wallets</li>
              <li>🌍 Omnichain skins: unified visual identity across ecosystems</li>
              <li>🛡️ Real-time AI Guardian: behavioral analysis and protective logic during wallet usage</li>
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
        <Card className="bg-black/40 border-white/5 shadow-lg">
          <CardContent className="p-6 max-h-[70vh] overflow-y-auto scrollbar-custom">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🎨 How Minting Will Work</h3>
            
            <p className="mb-4">When a user finalizes their wallet design in the WCC editor, they'll be able to mint it as a fully functional NFT — unique, dynamic, and ready for use in the Web3 space.</p>
            
            <p className="mb-4">Each wallet skin NFT includes two key layers:</p>
            
            <p className="mb-4"><strong>🖼️ Visual Layer (PNG)</strong></p>
            <p className="mb-4">This is the skin's artwork — the cover image displayed on marketplaces, collections, and galleries. It shows exactly how the wallet interface will look.</p>
            
            <p className="mb-4"><strong>🧬 Data Layer (JSON)</strong></p>
            <p className="mb-4">Embedded inside the NFT is a structured data file that defines the entire skin:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Background and text colors</li>
              <li>Fonts and button styles</li>
              <li>Element positioning</li>
              <li>Mask design (v3) or full UI structure (v2)</li>
              <li>Animations, icons, and theme logic</li>
              <li>Theme version (v2 or v3 only)</li>
            </ul>
            
            <p className="mb-4">This JSON layer isn't just metadata — it's a blueprint for rendering a live, functional wallet interface.</p>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🛠️ Minting Options</h3>
            <p className="mb-4">Users will be able to choose between:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li><strong>🔹 1-of-1 unique skin</strong> — a one-of-a-kind wallet experience</li>
              <li><strong>🔹 Mass minting (e.g., 10,000 editions)</strong> — ideal for community drops, collabs, and meme-based projects</li>
            </ul>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🌐 Custom Collection Pages</h3>
            <p className="mb-4">For large-scale mints, WCC will automatically generate a public mint page, where anyone can browse and mint a skin from the collection.</p>
            
            <p className="mb-4">Users can even set a custom domain for their drop, such as:</p>
            <code className="block bg-black/30 p-2 rounded mb-4">wocacu/collection/solana.app</code>
            
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">🚀 What's Next</h3>
            <p className="mb-4">Our goal is to build the infrastructure where these NFTs aren't just collectibles —
            they become live wallet themes, fully usable inside supported Web3 wallets.</p>
            
            <p className="mb-4">On marketplaces, they act as visual assets.<br />
            Inside wallets, they unlock identity, emotion, and true personalization.</p>
            
            <p className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              This isn't just art.<br />
              This is <strong>programmable wallet fashion</strong>.
            </p>
          </CardContent>
        </Card>
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
