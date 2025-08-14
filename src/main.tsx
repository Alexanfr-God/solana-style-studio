
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

// Removed WalletStructureService initialization as it's no longer needed
console.log('🚀 Application initialized successfully!');
console.log('🎯 Ready for wallet customization!');

// Temporarily remove StrictMode to debug render loops
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

console.log('Main rendering completed');
