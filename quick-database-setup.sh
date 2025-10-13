#!/bin/bash

echo "🗄️ SpearWin Database Setup"
echo "=========================="
echo ""

echo "📋 Choose your database setup option:"
echo "1. Use Supabase (Free cloud database) - RECOMMENDED"
echo "2. Use Railway (Free cloud database)"
echo "3. Use Neon (Free cloud database)"
echo "4. Set up local PostgreSQL"
echo "5. Use Docker PostgreSQL"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🌐 Setting up Supabase..."
        echo "1. Go to https://supabase.com"
        echo "2. Sign up for free"
        echo "3. Create a new project"
        echo "4. Go to Settings → Database"
        echo "5. Copy the connection string"
        echo "6. Update your .env file with the DATABASE_URL"
        ;;
    2)
        echo "🚂 Setting up Railway..."
        echo "1. Go to https://railway.app"
        echo "2. Sign up for free"
        echo "3. Create a new PostgreSQL database"
        echo "4. Copy the connection string"
        echo "5. Update your .env file with the DATABASE_URL"
        ;;
    3)
        echo "⚡ Setting up Neon..."
        echo "1. Go to https://neon.tech"
        echo "2. Sign up for free"
        echo "3. Create a new database"
        echo "4. Copy the connection string"
        echo "5. Update your .env file with the DATABASE_URL"
        ;;
    4)
        echo "🖥️ Setting up local PostgreSQL..."
        echo "Run these commands:"
        echo "sudo apt update"
        echo "sudo apt install postgresql postgresql-contrib"
        echo "sudo systemctl start postgresql"
        echo "sudo -u postgres psql"
        echo "CREATE DATABASE spearwin_db;"
        echo "CREATE USER spearwin_user WITH PASSWORD 'spearwin_password';"
        echo "GRANT ALL PRIVILEGES ON DATABASE spearwin_db TO spearwin_user;"
        ;;
    5)
        echo "🐳 Setting up Docker PostgreSQL..."
        echo "Run these commands:"
        echo "sudo apt install docker.io"
        echo "sudo systemctl start docker"
        echo "docker run --name spearwin-postgres -e POSTGRES_DB=spearwin_db -e POSTGRES_USER=spearwin_user -e POSTGRES_PASSWORD=spearwin_password -p 5432:5432 -d postgres:16"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🔧 After setting up your database:"
echo "1. Update your .env file with the correct DATABASE_URL"
echo "2. Run: npx prisma generate"
echo "3. Run: npx prisma db push"
echo "4. Run: npm run start:dev"
echo ""
echo "✅ Setup complete!"
