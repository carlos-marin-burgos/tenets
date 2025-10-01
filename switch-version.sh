#!/bin/bash

# Script to switch between plugin versions for testing

if [ "$1" == "super" ]; then
    echo "🔄 Switching to super minimal version..."
    sed -i '' 's/code: "\.\/src\/code.*\.ts"/code: "\.\/src\/code-super-minimal\.ts"/' webpack.config.js
    npm run build
    echo "✅ Super minimal version built (135 bytes)"
    echo "📋 Should just show console logs and close immediately"
    
elif [ "$1" == "ultra" ]; then
    echo "🔄 Switching to ultra minimal version..."
    sed -i '' 's/code: "\.\/src\/code.*\.ts"/code: "\.\/src\/code-ultra-minimal\.ts"/' webpack.config.js
    npm run build
    echo "✅ Ultra minimal version built (~221 bytes)"
    echo "📋 Should show basic HTML dialog"
    
elif [ "$1" == "minimal" ]; then
    echo "🔄 Switching to minimal version..."
    sed -i '' 's/code: "\.\/src\/code.*\.ts"/code: "\.\/src\/code-minimal\.ts"/' webpack.config.js
    npm run build
    echo "✅ Minimal version built (584 bytes)"
    echo "📋 Test in Figma: Should show 'Minimal Test Plugin' with a test button"
    
elif [ "$1" == "full" ]; then
    echo "🔄 Switching to full version..."
    sed -i '' 's/code: "\.\/src\/code.*\.ts"/code: "\.\/src\/code\.ts"/' webpack.config.js
    sed -i '' 's/\/\/ ui: "\.\/src\/ui\.ts", \/\/ Not needed for minimal/ui: "\.\/src\/ui\.ts",/' webpack.config.js
    npm run build
    echo "✅ Full version built (~40KB)"
    echo "📋 Test in Figma: Should show the complete UI Tenets & Traps Analyzer"
    
else
    echo "Usage: ./switch-version.sh [super|ultra|minimal|full]"
    echo ""
    echo "Versions:"
    echo "  super   - 135 bytes, just logs and closes (for testing plugin loading)"
    echo "  ultra   - 221 bytes, basic HTML dialog"  
    echo "  minimal - 584 bytes, test button with interaction"
    echo "  full    - ~40KB, complete plugin functionality"
    echo ""
    echo "Current webpack config:"
    grep -A 3 "entry:" webpack.config.js
fi