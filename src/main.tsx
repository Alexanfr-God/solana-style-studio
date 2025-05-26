import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css'; // Tailwind and base styles
import './App.css'; // Neon background and golden buttons
import './polyfills'; // For Node.js globals like Buffer
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Add debugging logs
console.log('Main rendering started');
console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
console.log('User agent:', navigator.userAgent);

// Check for Phantom wallet installation
if (!window.solana || !window.solana.isPhantom) {
  console.warn('Phantom wallet is not installed!');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

console.log('Main rendering completed');