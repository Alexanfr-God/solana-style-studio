
// Buffer polyfill for browser environment
import { Buffer as BufferPolyfill } from 'buffer';

if (typeof window !== 'undefined') {
  window.global = window;
  window.Buffer = window.Buffer || BufferPolyfill;
}
