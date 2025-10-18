#!/bin/bash

echo "🚀 Setting up SpearWin Backend with FCM..."

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Firebase Admin SDK
echo "🔥 Installing Firebase Admin SDK..."
npm install firebase-admin

# Install TypeScript types
echo "📝 Installing TypeScript types..."
npm install --save-dev @types/node

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Pushing database schema..."
npx prisma db push

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy .env.template to .env and configure your variables"
echo "2. Set up your Firebase project and add credentials to .env"
echo "3. Run 'npm run start:dev' to start the development server"
echo ""
echo "🔧 For FCM setup, see FCM_SETUP.md"
