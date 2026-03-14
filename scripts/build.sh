#!/bin/bash
# Gods' Arena - Build Script
# Usage: ./scripts/build.sh [--dev] [--optimize]

set -e

echo "🎮 Gods' Arena - Build Script"
echo "=============================="
echo ""

# Parse arguments
DEV=false
OPTIMIZE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dev)
      DEV=true
      shift
      ;;
    --optimize)
      OPTIMIZE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Navigate to project root
cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install

if [ "$OPTIMIZE" = true ]; then
  echo ""
  echo "🖼️  Optimizing assets..."
  python3 scripts/asset_optimizer.py --input public/images --output public/build/images --quality 75 --max-size 512
fi

echo ""
echo "🔨 Building..."

if [ "$DEV" = true ]; then
  echo "   Mode: Development"
  npm run dev
else
  echo "   Mode: Production"
  npm run build
  
  echo ""
  echo "📂 Build output:"
  ls -la .next/
  
  echo ""
  echo "✅ Build complete!"
  echo "   Run 'npm run start' to serve"
fi
