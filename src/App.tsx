import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import * as anchor from '@coral-xyz/anchor';
import './App.css';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (!supabase) {
  console.error('Supabase not initialized: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const network = WalletAdapterNetwork.Devnet;
const wallets = [new PhantomWalletAdapter()];
const PROGRAM_ID = new PublicKey('58woYBJaJTsdLkGtQeAmSzFFLsjKh135fbCxyT8V4BL6');
const BATCH_SIZE = 5;

// Generate prompt-based labels
const generateLabel = (prompt: string, index?: number) => {
  if (index !== undefined) {
    return `${prompt} #${index + 1}`;
  }
  return prompt;
};

// Generate thematic collection names
const generateCollectionName = (prompt: string) => {
  const adjectives = ['Epic', 'Mystic', 'Radiant', 'Cosmic', 'Vibrant'];
  const themes = ['of the Night', 'in the Wild', 'from the Future', 'of Legends'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  return `${adjective} ${prompt} ${theme} Collection`.trim();
};

const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadFromLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const AppContent: React.FC = () => {
  const { wallet, connected, publicKey } = useWallet();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWalletConnection = async () => {
    try {
      if (connected) {
        await wallet?.adapter.disconnect();
      } else {
        await wallet?.adapter.connect();
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  const [prompt, setPrompt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [collectionNfts, setCollectionNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showCollectionPopup, setShowCollectionPopup] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [generatedNfts, setGeneratedNfts] = useState(loadFromLocalStorage('generatedNfts'));
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [mintingNfts, setMintingNfts] = useState(new Set<string>());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveToLocalStorage('generatedNfts', generatedNfts);
  }, [generatedNfts]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const text = container.querySelector('p');
    if (!text) return;

    const textRect = text.getBoundingClientRect();
    const particleCount = 15;
    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      const left = textRect.left + Math.random() * textRect.width;
      const top = textRect.bottom - 10 + Math.random() * 20;
      particle.style.left = `${left - textRect.left}px`;
      particle.style.top = `${top - textRect.top}px`;

      const size = 3 + Math.random() * 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      const color = `hsl(200, 100%, ${50 + Math.random() * 30}%)`;
      particle.style.background = color;
      particle.style.boxShadow = `0 0 5px ${color}`;

      const delay = Math.random() * 2;
      const duration = 1 + Math.random() * 2;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;

      const drift = Math.random() * 20 - 10;
      particle.style.setProperty('--drift', `${drift}px`);

      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach(p => p.remove());
    };
  }, []);

  useEffect(() => {
    const checkPhantom = async () => {
      // @ts-ignore
      const isPhantom = window.solana && window.solana.isPhantom;
      if (!isPhantom) {
        alert('Please install Phantom wallet to use this app');
      }
    };
    checkPhantom();
  }, []);

  const generateRandomLabel = (prompt: string, index?: number) => {
    const adjectives = ['Mystic', 'Cosmic', 'Cyber', 'Quantum', 'Neo'];
    const suffixes = ['Master', 'Lord', 'King', 'Queen', 'Guardian'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return index !== undefined
      ? `${adj} ${prompt} ${suffix} #${index + 1}`
      : `${adj} ${prompt} ${suffix}`;
  };

  const generateNFT = async () => {
    if (!prompt || !supabase) {
      alert('Please enter a prompt and ensure Supabase is configured!');
      return;
    }
    setLoading(true);
    try {
      console.log('Generating NFT with prompt:', prompt);
      const { data, error } = await supabase.functions.invoke('generate_nft', {
        body: { prompt }
      });

      if (error) throw error;

      const newNft = {
        image: data.image,
        label: generateRandomLabel(prompt),
        name: `${prompt} NFT`,
        collection: generateCollectionName(prompt)
      };

      setMetadata(newNft);
      setGeneratedNfts(prev => [...prev, newNft]);

    } catch (error) {
      console.error('Error generating NFT:', error);
      alert('Failed to generate NFT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCollection = async () => {
    if (!prompt || !quantity || !supabase) {
      alert('Please enter a prompt, quantity, and ensure Supabase is configured!');
      return;
    }
    setLoading(true);
    try {
      console.log('Calling Supabase generate_nft with prompt:', prompt);
      const { data, error } = await supabase.functions.invoke('generate_nft', {
        body: { prompt },
      });
      console.log('Supabase data:', data);
      if (error) throw error;
      const generatedCollectionName = collectionName || generateCollectionName(prompt);
      const newNfts = Array.from({ length: parseInt(quantity) }, (_, index) => ({
        name: `${prompt} - ${generateLabel(prompt, index)}`,
        uri: data.uri || data.image, // Use uri if available, fallback to image
        label: generateLabel(prompt, index),
        isMinting: false,
        collection: generatedCollectionName,
      }));
      setCollectionNfts(newNfts);
      setShowCollectionPopup(true);
      setShowCollectionForm(false);
    } catch (error) {
      console.error('Error generating collection:', error);
      alert('Failed to generate collection. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const initializeMintCounter = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert('Please connect your wallet!');
      return;
    }
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl(network));
      const provider = new anchor.AnchorProvider(connection, wallet as any, {});
      anchor.setProvider(provider);
      const program = new anchor.Program(
        await anchor.Program.fetchIdl(PROGRAM_ID, provider),
        PROGRAM_ID,
        provider
      );
      const [mintCounterPda] = await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("mint-counter")],
        PROGRAM_ID
      );
      await program.methods
        .initialize(new anchor.BN(100))
        .accounts({
          mint_counter: mintCounterPda,
          authority: wallet.publicKey,
          system_program: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      alert('Mint counter initialized');
    } catch (error) {
      console.error('Error initializing mint counter:', error);
      alert('Failed to initialize mint counter.');
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      return false;
    }
    const connection = new Connection(clusterApiUrl(network));
    const balance = await connection.getBalance(wallet.publicKey);
    return balance >= 2000000000; // 2 SOL in lamports
  };

  const mintSingleNFT = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet));

      console.log('Starting NFT mint...');
      console.log('Metadata:', metadata);

      const { nft } = await metaplex.nfts().create({
        uri: metadata.image,
        name: metadata.name,
        sellerFeeBasisPoints: 500,
        tokenOwner: publicKey,
      });

      console.log('NFT created:', nft);
      alert(`Successfully minted NFT! Address: ${nft.address.toBase58()}`);

      // Add to generated NFTs
      setGeneratedNfts(prev => [...prev, {
        ...metadata,
        address: nft.address.toBase58()
      }]);

    } catch (error) {
      console.error('Minting error:', error);
      alert(`Failed to mint NFT: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const MINT_RATE_LIMIT = 10; // NFTs per batch
  const MINT_DELAY = 1000; // 1 second between batches

  const mintCollection = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl('devnet'));
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // Mint NFTs in batches
      for (let i = 0; i < collectionNfts.length; i += MINT_RATE_LIMIT) {
        const batch = collectionNfts.slice(i, i + MINT_RATE_LIMIT);
        const mintPromises = batch.map(async (nft) => {
          try {
            setMintingNfts(prev => new Set([...prev, nft.label]));
            const { nft: mintedNft } = await metaplex.nfts().create({
              uri: nft.uri,
              name: nft.label,
              sellerFeeBasisPoints: 500
            });
            return { ...nft, address: mintedNft.address.toBase58() };
          } finally {
            setMintingNfts(prev => {
              const newSet = new Set(prev);
              newSet.delete(nft.label);
              return newSet;
            });
          }
        });

        const mintedBatch = await Promise.all(mintPromises);
        setGeneratedNfts(prev => [...prev, ...mintedBatch]);

        if (i + MINT_RATE_LIMIT < collectionNfts.length) {
          await new Promise(resolve => setTimeout(resolve, MINT_DELAY));
        }
      }

      alert('Collection minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      alert('Failed to mint collection: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-8 min-h-screen overflow-y-auto cool-scrollbar">
      <div className="fixed top-0 right-0 m-6 flex gap-4 z-50">
        <button
          className="golden-button px-4 py-2"
          onClick={() => setShowInventory(true)}
        >
          Inventory
        </button>
        <div className="relative">
          <button
            className="golden-button px-4 py-2"
            onClick={handleWalletConnection}
          >
            {connected ? 'Change Wallet' : 'Connect Wallet'}
          </button>

          {connected && publicKey && (
            <div className="wallet-info">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
                <div className="wallet-avatar">
                  <img
                    src="/phantom-icon.png"
                    alt="Phantom"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">Phantom</span>
                  <span className="text-gray-400 text-sm">Connected</span>
                </div>
              </div>

              <div className="wallet-address-container">
                <span className="wallet-address">
                  {publicKey.toString().slice(0, 4)}...
                  {publicKey.toString().slice(-4)}
                </span>
                <button
                  className="copy-button"
                  onClick={() => copyToClipboard(publicKey.toString())}
                  title="Copy address"
                >
                  {copied ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="success-alert">
          <div className="phantom-logo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#AB46D2">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8z" />
            </svg>
          </div>
          <span>Successfully Connected with Phantom Wallet!</span>
        </div>
      )}

      {/* Title with animation */}
      <h1 className="title-animate">Solana Style Studio</h1>

      {/* Description with Blue Flames Animation */}
      <div className="text-container" ref={containerRef}>
        <p className="text-lg mb-8 text-cyan-300 animate-blue-flames">Customize and mint your wallet skin as an NFT!</p>
      </div>

      {/* Prompt Section */}
      <div className="golden-border mb-8 w-full max-w-lg">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt (e.g., 'neon dragon')"
          className="w-full p-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
          disabled={loading}
        />
      </div>
      <div className="flex gap-8 mb-8">
        <button className="golden-button px-6 py-2" onClick={generateNFT} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Single NFT'}
        </button>
        <button className="golden-button px-6 py-2" onClick={() => setShowCollectionForm(true)} disabled={loading}>
          {loading ? 'Preparing...' : 'Generate Collection'}
        </button>
        <button className="golden-button px-6 py-2" onClick={initializeMintCounter} disabled={loading}>
          {loading ? 'Initializing...' : 'Initialize NFT Counter'}
        </button>
      </div>

      {/* Single NFT Display */}
      {metadata && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Generated NFT</h2>
          <div className={`golden-border mb-4 ${mintingNfts.has(metadata.label) ? 'minting' : ''}`}>
            <img
              src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={metadata.label}
              className="w-32 h-32 rounded-lg cursor-pointer"
              onClick={() => setSelectedNft(metadata)}
            />
            <p className="text-white mt-2">{metadata.label}</p>
          </div>
          <button className="golden-button px-6 py-2" onClick={mintSingleNFT} disabled={loading || !wallet.connected}>
            {loading ? 'Minting...' : 'Mint 1/1'}
          </button>
        </div>
      )}

      {/* Collection Form */}
      {showCollectionForm && (
        <div className="golden-border mt-8 p-4 w-full max-w-lg">
          <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">Generate Collection</h3>
          <div className="flex items-center mb-4 justify-center">
            <button
              className="golden-button px-4 py-3 mr-2"
              onClick={() => setQuantity((prev) => String(Math.max(0, parseInt(prev || '0') - 1)))}
              disabled={loading}
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity (e.g., 10)"
              className="w-32 p-3 bg-gray-800 text-white placeholder-gray-400 rounded-lg text-center"
              disabled={loading}
            />
            <button
              className="golden-button px-4 py-3 ml-2"
              onClick={() => setQuantity((prev) => String(parseInt(prev || '0') + 1))}
              disabled={loading}
            >
              +
            </button>
          </div>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Collection Name (optional)"
            className="w-full p-3 mb-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg"
            disabled={loading}
          />
          <div className="flex justify-center gap-4">
            <button className="golden-button px-6 py-2" onClick={generateCollection} disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
            <button className="golden-button cancel px-6 py-2" onClick={() => setShowCollectionForm(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collection Popup */}
      {showCollectionPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto cool-scrollbar">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">{collectionNfts[0]?.collection || 'Generated Collection'}</h2>
            <div className="grid grid-cols-3 gap-6">
              {collectionNfts.map((nft, index) => (
                <div
                  key={index}
                  className={`golden-border p-2 cursor-pointer ${nft.isMinting ? 'minting' : ''}`}
                  onClick={() => setSelectedNft(nft)}
                >
                  <img
                    src={nft.uri.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt={nft.label}
                    className="w-full h-32 object-cover rounded"
                  />
                  <p className="text-center mt-2 text-white">{nft.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button className="golden-button px-6 py-2" onClick={mintCollection} disabled={loading}>
                {loading ? 'Minting...' : 'Mint Collection'}
              </button>
              <button className="golden-button px-6 py-2" onClick={() => setShowCollectionPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Popup */}
      {showInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto cool-scrollbar">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Inventory</h2>
            {[...new Set(generatedNfts.map((nft: any) => nft.collection))].map((collection, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-2xl font-semibold text-yellow-400 mb-4">{collection}</h3>
                <div className="grid grid-cols-3 gap-6">
                  {generatedNfts
                    .filter((nft: any) => nft.collection === collection)
                    .map((nft: any, idx: number) => (
                      <div
                        key={idx}
                        className={`golden-border p-2 cursor-pointer ${mintingNfts.has(nft.label) ? 'minting' : ''}`}
                        onClick={() => setSelectedNft(nft)}
                      >
                        <img
                          src={nft.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                          alt={nft.label}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-center mt-2 text-white">{nft.label}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            <div className="mt-6 flex justify-end">
              <button className="golden-button px-6 py-2" onClick={() => setShowInventory(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {selectedNft && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedNft(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedNft.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={selectedNft.label}
              className="max-w-full max-h-[80vh] rounded"
            />
            <p className="text-center mt-4 text-white text-xl">{selectedNft.label}</p>
            <button
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setSelectedNft(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <AppContent />
      </WalletModalProvider>
    </WalletProvider>
  );
};

export default App;