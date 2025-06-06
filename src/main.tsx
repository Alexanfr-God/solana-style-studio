
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// Make sure all CSS imports are in the correct order
import './styles/index.css'; // This already imports all other CSS files
import './App.css';
import { Buffer } from 'buffer';
import './polyfills';
import WalletStructureService from './services/walletStructureService';

// This fixes the 'Buffer is not defined' error
window.Buffer = Buffer;

// Add better debugging
console.log('Main rendering started');
console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
console.log('User agent:', navigator.userAgent);

// Initialize Wallet Structure for AI Agents
console.log('🚀 Initializing Wallet Structure for AI Agents...');
WalletStructureService.getWalletStructure()
  .then((structure) => {
    console.log('✅ Wallet Structure initialized successfully!');
    console.log(`📊 Total elements: ${structure.metadata.totalElements}`);
    console.log('🎯 Ready for AI customization!');
  })
  .catch((error) => {
    console.warn('⚠️ Wallet Structure initialization failed:', error);
    console.log('🔄 Structure will be loaded on-demand when needed');
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('Main rendering completed');
