
import React from 'react';
import ReactDOM from 'react-dom/client';
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
console.log('Screen size:', window.innerWidth, 'x', window.innerHeight);
console.log('User agent:', navigator.userAgent);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('Main rendering completed');
