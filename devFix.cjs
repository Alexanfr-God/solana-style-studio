
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting improved development server with timeout handling...');

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

console.log('Checking if dependencies are installed...');
// First try running a lightweight install to make sure essential deps are available
try {
  require('child_process').execSync('bun install --no-progress --no-summary', { 
    stdio: 'inherit',
    timeout: 120000 // 2 minute timeout for initial install
  });
  console.log('Essential dependencies are ready.');
} catch (err) {
  console.warn('Could not verify dependencies:', err.message);
  console.log('Continuing with available dependencies...');
}

const vitePath = findViteBinary();

if (vitePath) {
  console.log('Starting Vite development server...');
  
  // Use shell on Windows, direct execution on Unix
  const isWindows = process.platform === 'win32';
  const spawnOptions = {
    stdio: 'inherit',
    shell: isWindows,
    env: {
      ...process.env,
      // Set environment variables to optimize build
      VITE_OPTIMIZE_MEMORY: 'true',
      NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory limit
    }
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
    shell: true,
    env: {
      ...process.env,
      // Set environment variables to optimize build
      VITE_OPTIMIZE_MEMORY: 'true',
      NODE_OPTIONS: '--max-old-space-size=4096' // Increase memory limit
    }
  });
  
  child.on('error', (err) => {
    console.error('Failed to start Vite via npx:', err);
    process.exit(1);
  });
  
  child.on('close', (code) => {
    process.exit(code);
  });
}
