#!/bin/bash
set -euo pipefail

# Step 2: Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
fi

# Step 3: Check if _dist exists
if [ ! -d "_dist" ]; then
  echo "_dist not found. Building project..."
  npm run build
fi

# Step 4: Run the app
node _dist/executables/git-checkout/index.js