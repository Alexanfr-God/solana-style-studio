
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import './App.css';
import { Buffer } from 'buffer';
import './polyfills';

// This fixes the 'Buffer is not defined' error
window.Buffer = Buffer;

// Add console log for debugging
console.log('Main rendering started');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

console.log('Main rendering completed');
