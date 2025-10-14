#!/bin/bash

# Load environment variables and start the application
export DATABASE_URL="postgresql://spearwin_user:spearwin_password@localhost:5432/spearwin_db?schema=public"
export JWT_SECRET="spearwin-super-secret-jwt-key-2024-change-in-production"
export JWT_EXPIRES_IN="15m"
export JWT_REFRESH_EXPIRES_IN="7d"
export BCRYPT_ROUNDS="10"
export NODE_ENV="development"
export PORT="3000"

echo "🚀 Starting SpearWin Backend with environment variables..."
npm run start:dev
