#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECKPOINT_DIR="$SCRIPT_DIR/checkpoints"

mkdir -p "$CHECKPOINT_DIR"

echo "========================================="
echo "Downloading SAM2.1 Checkpoints"
echo "========================================="

# SAM2.1 tiny (fastest, ~40MB, 38.9M params)
TINY_URL="https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_tiny.pt"
TINY_FILE="$CHECKPOINT_DIR/sam2.1_hiera_tiny.pt"

if [ -f "$TINY_FILE" ]; then
    echo "✓ sam2.1_hiera_tiny.pt already exists"
else
    echo "Downloading sam2.1_hiera_tiny.pt..."
    curl -L -o "$TINY_FILE" "$TINY_URL"
    echo "✓ Downloaded sam2.1_hiera_tiny.pt"
fi

# Verify file
if [ -f "$TINY_FILE" ]; then
    SIZE=$(ls -lh "$TINY_FILE" | awk '{print $5}')
    echo ""
    echo "Checkpoint: $TINY_FILE"
    echo "Size: $SIZE"
fi

echo ""
echo "========================================="
echo "Optional: Larger models for better quality"
echo "========================================="
echo ""
echo "# Small (80MB, 46M params):"
echo "curl -L -o $CHECKPOINT_DIR/sam2.1_hiera_small.pt \\"
echo "  https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_small.pt"
echo ""
echo "# Base+ (160MB, 80.8M params):"
echo "curl -L -o $CHECKPOINT_DIR/sam2.1_hiera_base_plus.pt \\"
echo "  https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_base_plus.pt"
echo ""
echo "# Large (900MB, 224.4M params):"
echo "curl -L -o $CHECKPOINT_DIR/sam2.1_hiera_large.pt \\"
echo "  https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_large.pt"
