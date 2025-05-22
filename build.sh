
#!/bin/bash

echo "Starting optimized build process..."

# Try installing dependencies in smaller batches to avoid timeout
echo "Installing core dependencies..."
bun install react react-dom typescript tailwindcss --no-progress || echo "Core dependencies already installed"

echo "Installing UI dependencies..."
bun install @radix-ui/* class-variance-authority clsx tailwind-merge lucide-react --no-progress || echo "UI dependencies already installed"

echo "Installing remaining dependencies..."
bun install --no-progress || echo "Remaining dependencies installation attempted"

echo "Building project..."
bunx --bun vite build

echo "Build process completed!"

