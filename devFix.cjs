
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Locate the Vite binary path
const findViteBinary = () => {
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules', '.bin', 'vite'),
    path.resolve(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js'),
    // For Unix/Linux/Mac
    '/usr/local/bin/vite',
    // For Windows (which would need .cmd extension)
    path.resolve(process.cwd(), 'node_modules', '.bin', 'vite.cmd')
  ];

  for (const binPath of possiblePaths) {
    if (fs.existsSync(binPath)) {
      console.log(`Found Vite binary at: ${binPath}`);
      return binPath;
    }
  }
  
  return null;
};

const vitePath = findViteBinary();

if (vitePath) {
  console.log('Starting Vite development server...');
  
  // Use shell on Windows, direct execution on Unix
  const isWindows = process.platform === 'win32';
  const spawnOptions = {
    stdio: 'inherit',
    shell: isWindows
  };
  
  const child = spawn(vitePath, process.argv.slice(2), spawnOptions);
  
  child.on('error', (err) => {
    console.error('Failed to start Vite:', err);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    console.log(`Vite process exited with code ${code}`);
    process.exit(code);
  });
} else {
  console.error('Could not find Vite binary. Please ensure Vite is installed.');
  console.log('Trying to run via npx as fallback...');
  
  // Try running via npx as a fallback
  const child = spawn('npx', ['vite', ...process.argv.slice(2)], { 
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (err) => {
    console.error('Failed to start Vite via npx:', err);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    process.exit(code);
  });
}
