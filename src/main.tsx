
import React from 'react';
import ReactDOM from 'react-dom/client';

// Ensure React is available globally for debugging BEFORE anything else
if (typeof window !== 'undefined') {
  window.React = React;
}

import App from './App.tsx';
import { WalletContextProvider } from '@/context/WalletContextProvider';
import { initializeAppKit } from '@/lib/appkit';
// Make sure all CSS imports are in the correct order
import './styles/index.css'; // This already imports all other CSS files
import './App.css';
import './polyfills'; // Includes Buffer and process polyfills

// Add better debugging
console.log('Main rendering started');
console.log('React version:', React.version);
console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);

// Initialize AppKit before React rendering
async function initializeAndRender() {
  try {
    console.log('🔗 Initializing AppKit...');
    await initializeAppKit();
    console.log('✅ AppKit initialized, starting React render');
    
    // Create root and render
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <WalletContextProvider>
        <App />
      </WalletContextProvider>
    );
    
    // Register ThemeProbe listener AFTER React renders
    // This must happen after React is fully initialized
    setTimeout(async () => {
      try {
        const { registerThemeProbeListener } = await import('./agents/mcp/ThemeProbeListener');
        registerThemeProbeListener();
        console.log('✅ ThemeProbeListener registered');
      } catch (error) {
        console.warn('ThemeProbeListener registration failed:', error);
      }
    }, 100);
    
    console.log('🚀 Application initialized successfully!');
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
