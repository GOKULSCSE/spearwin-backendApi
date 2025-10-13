#!/bin/bash

echo "🗄️ Setting up SpearWin Database..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   Try: sudo systemctl start postgresql"
    exit 1
fi

# Create database and user
echo "📝 Creating database and user..."
sudo -u postgres psql -c "CREATE DATABASE spearwin_db;" 2>/dev/null || echo "Database may already exist"
sudo -u postgres psql -c "CREATE USER spearwin_user WITH PASSWORD 'spearwin_password';" 2>/dev/null || echo "User may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE spearwin_db TO spearwin_user;" 2>/dev/null

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npx prisma generate' to generate Prisma client"
echo "2. Run 'npx prisma db push' to create database schema"
echo "3. Run 'npm run start:dev' to start the application"
