
// Buffer and process polyfills for browser environment
import { Buffer as BufferPolyfill } from 'buffer';
import process from 'process';

if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = window.Buffer || BufferPolyfill;
  window.process = window.process || process;
}
