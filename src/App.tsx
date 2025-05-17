import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import './App.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const network = WalletAdapterNetwork.Devnet;
const wallets = [new PhantomWalletAdapter()];

const AppContent: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [quantity, setQuantity] = useState('');
  const [collectionName, setCollectionName] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const wallet = useWallet();

  const generateNFT = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate_nft', {
        body: { prompt },
      });
      if (error) throw error;
      setMetadata(data);
    } catch (error) {
      console.error('Error generating NFT:', error);
      alert('Failed to generate NFT.');
    } finally {
      setLoading(false);
    }
  };

  const mintSingleNFT = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl(network));
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
      const { nft } = await metaplex.nfts().create({
        uri: metadata.image,
        name: metadata.name,
        sellerFeeBasisPoints: 500,
      });
      alert(`Minted 1/1 NFT: ${nft.address.toBase58()}`);
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT.');
    } finally {
      setLoading(false);
    }
  };

  const mintCollection = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }
    setLoading(true);
    try {
      const connection = new Connection(clusterApiUrl(network));
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
      const qty = parseInt(quantity) || 1;
      const collection = await metaplex.nfts().create({
        uri: metadata.image,
        name: collectionName || `Collection for ${prompt}`,
        sellerFeeBasisPoints: 500,
        isCollection: true,
      });

      alert(`Minted Collection: ${collection.nft.address.toBase58()}`);
    } catch (error) {
      console.error('Error minting collection:', error);
      alert('Failed to mint collection.');
    } finally {
      setLoading(false);
      setShowCollectionForm(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Solana Style Studio</h1>
      <p>Customize and mint your wallet skin as an NFT!</p>
      <WalletMultiButton className="wallet-button" />
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt (e.g., 'neon dragon')"
        className="prompt-input"
        disabled={loading}
      />
      <button
        onClick={generateNFT}
        disabled={loading}
        className="golden-button"
      >
        {loading ? 'Generating...' : 'Generate NFT'}
      </button>

      {metadata && (
        <div className="metadata-container">
          <h2>Generated NFT</h2>
          <img src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} alt="NFT" className="nft-image" />
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
          <button
            onClick={mintSingleNFT}
            disabled={loading || !wallet.connected}
            className="golden-button"
          >
            {loading ? 'Minting...' : 'Mint 1/1'}
          </button>
          <button
            onClick={() => setShowCollectionForm(true)}
            disabled={loading || !wallet.connected}
            className="golden-button"
          >
            Mint Collection
          </button>
        </div>
      )}

      {showCollectionForm && (
        <div className="collection-form">
          <h2>Mint Collection</h2>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity (e.g., 100)"
            className="prompt-input"
          />
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Collection Name (optional)"
            className="prompt-input"
          />
          <button
            onClick={mintCollection}
            disabled={loading}
            className="golden-button"
          >
            {loading ? 'Minting...' : 'Confirm Mint'}
          </button>
          <button
            onClick={() => setShowCollectionForm(false)}
            className="golden-button cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <AppContent />
    </WalletModalProvider>
  </WalletProvider>
);

export default App;

console.log('App component rendering');