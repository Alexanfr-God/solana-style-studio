
import React from 'react';
import ReactDOM from 'react-dom/client';

// Диагностика React дубликатов в dev режиме
if (import.meta.env.DEV) { 
  import("./utils/reactDiag").then(m => m.logReactIdentity("main")); 
}

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  window.React = React;
}

import App from './App.tsx';
import { WalletContextProvider } from '@/context/WalletContextProvider';
import { initializeAppKit } from '@/lib/appkit';
// Make sure all CSS imports are in the correct order
import './styles/index.css'; // This already imports all other CSS files
import './App.css';
import { Buffer } from 'buffer';
import './polyfills';

// This fixes the 'Buffer is not defined' error
window.Buffer = Buffer;

// Add better debugging
console.log('Main rendering started');
console.log('React version:', React.version);
console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
console.log('User agent:', navigator.userAgent);

// Initialize AppKit before React rendering
async function initializeAndRender() {
  try {
    console.log('🔗 Initializing AppKit...');
    await initializeAppKit();
    console.log('✅ AppKit initialized, starting React render');
    
    // Wrap App with WalletContextProvider for wallet state management
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <WalletContextProvider>
        <App />
      </WalletContextProvider>
    );
    
    console.log('🚀 Application initialized successfully!');
    console.log('🎯 Ready for wallet customization!');
  } catch (error) {
    console.error('❌ Failed to initialize AppKit:', error);
    
    // Show error state in UI
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        background: '#1a1a1a', 
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1>🔌 Wallet Connection Error</h1>
          <p>Failed to initialize wallet connection service.</p>
          <p style={{ opacity: 0.7, fontSize: '0.9em' }}>Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: '1rem', 
              padding: '0.5rem 1rem', 
              background: '#6366f1', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

// Start initialization
initializeAndRender();

console.log('Main rendering completed');
