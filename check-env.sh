#!/bin/bash

# Pre-deployment Environment Check Script
# This script verifies all required environment variables are set

echo "🔍 Checking Backend Environment Variables..."
echo "=============================================="

# Backend required variables
BACKEND_VARS=(
  "DATABASE_URL"
  "JWT_SECRET"
  "FRONTEND_URL"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_KEY"
)

cd backend

if [ ! -f .env ]; then
  echo "❌ ERROR: backend/.env file not found!"
  echo "💡 Copy .env.example to .env and fill in your values"
  exit 1
fi

# Source the .env file
set -a
source .env
set +a

MISSING_VARS=0

for var in "${BACKEND_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    MISSING_VARS=$((MISSING_VARS + 1))
  else
    echo "✅ Found: $var"
  fi
done

echo ""
echo "🔍 Checking Frontend Environment Variables..."
echo "=============================================="

cd ../frontend

if [ ! -f .env ]; then
  echo "⚠️  WARNING: frontend/.env file not found!"
  echo "💡 Copy .env.example to .env and set VITE_API_URL"
  echo "   For development: http://localhost:3000"
  echo "   For production: https://your-backend.onrender.com"
else
  set -a
  source .env
  set +a
  
  if [ -z "$VITE_API_URL" ]; then
    echo "❌ Missing: VITE_API_URL"
    MISSING_VARS=$((MISSING_VARS + 1))
  else
    echo "✅ Found: VITE_API_URL = $VITE_API_URL"
  fi
fi

echo ""
echo "=============================================="

if [ $MISSING_VARS -eq 0 ]; then
  echo "✅ All environment variables are set!"
  echo "🚀 Ready for deployment!"
  exit 0
else
  echo "❌ $MISSING_VARS environment variable(s) missing!"
  echo "📖 Check .env.example files for required variables"
  exit 1
fi
