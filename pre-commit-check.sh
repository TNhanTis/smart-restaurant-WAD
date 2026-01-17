#!/bin/bash

# Pre-commit safety check
# This script checks for sensitive files before committing

echo "🔒 Pre-commit Safety Check..."
echo "=============================="

# Check for .env files
ENV_FILES=$(git diff --cached --name-only | grep -E "\.env$|\.env\.local|\.env\.production" || true)

if [ ! -z "$ENV_FILES" ]; then
  echo "❌ ERROR: Attempting to commit sensitive .env files:"
  echo "$ENV_FILES"
  echo ""
  echo "💡 These files contain sensitive data and should NOT be committed!"
  echo "   Use .env.example instead for documentation."
  echo ""
  echo "To fix:"
  echo "  git reset HEAD $ENV_FILES"
  exit 1
fi

# Check for node_modules
NODE_MODULES=$(git diff --cached --name-only | grep "node_modules" || true)

if [ ! -z "$NODE_MODULES" ]; then
  echo "⚠️  WARNING: Attempting to commit node_modules:"
  echo "$NODE_MODULES"
  echo ""
  echo "💡 This is usually not desired."
  echo ""
  echo "To fix:"
  echo "  git reset HEAD <file>"
  exit 1
fi

# Check for dist folders
DIST_FILES=$(git diff --cached --name-only | grep -E "dist/|build/" || true)

if [ ! -z "$DIST_FILES" ]; then
  echo "⚠️  WARNING: Attempting to commit build output:"
  echo "$DIST_FILES"
  echo ""
  echo "💡 Build output is usually generated and shouldn't be committed."
fi

echo "✅ All safety checks passed!"
echo "🚀 Safe to commit!"
exit 0
