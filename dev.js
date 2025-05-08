
#!/usr/bin/env node

// Simple script to run vite from node_modules
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check for vite in different possible paths
const possibleVitePaths = [
  path.resolve(__dirname, 'node_modules', '.bin', 'vite'),
  path.resolve(__dirname, 'node_modules', 'vite', 'bin', 'vite.js')
];

let viteBin;
for (const path of possibleVitePaths) {
  if (fs.existsSync(path)) {
    viteBin = path;
    break;
  }
}

if (!viteBin) {
  console.error('Could not find vite binary. Make sure vite is installed.');
  process.exit(1);
}

// Make the file executable
try {
  fs.chmodSync(viteBin, '755');
} catch (error) {
  console.warn(`Could not make ${viteBin} executable: ${error.message}`);
}

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
