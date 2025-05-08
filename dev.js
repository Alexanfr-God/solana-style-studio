
#!/usr/bin/env node

// Simple script to run vite from node_modules
const { spawn } = require('child_process');
const path = require('path');

// Path to node_modules/.bin/vite
const viteBin = path.resolve(__dirname, 'node_modules', '.bin', 'vite');

// Spawn vite process
const viteProcess = spawn(viteBin, process.argv.slice(2), { 
  stdio: 'inherit',
  shell: true 
});

viteProcess.on('error', (err) => {
  console.error('Failed to start vite:', err);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  process.exit(code);
});
