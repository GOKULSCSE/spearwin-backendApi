# 🗄️ Database Setup Guide

## Current Issue:
The application is trying to connect to a database that doesn't exist. Here are multiple solutions:

## 🚀 **Solution 1: Use a Free Cloud Database (Recommended)**

### **Option A: Supabase (Free Tier)**
1. Go to [supabase.com](https://supabase.com)
2. Sign up for free
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string
6. Update your `.env` file:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### **Option B: Railway (Free Tier)**
1. Go to [railway.app](https://railway.app)
2. Sign up for free
3. Create a new PostgreSQL database
4. Copy the connection string
5. Update your `.env` file with the provided URL

### **Option C: Neon (Free Tier)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new database
4. Copy the connection string
5. Update your `.env` file

## 🖥️ **Solution 2: Local PostgreSQL Setup**

### **Install PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Create Database:**
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE spearwin_db;
CREATE USER spearwin_user WITH PASSWORD 'spearwin_password';
GRANT ALL PRIVILEGES ON DATABASE spearwin_db TO spearwin_user;
\q
```

## 🐳 **Solution 3: Docker PostgreSQL**

### **Install Docker:**
```bash
# Install Docker
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
```

### **Run PostgreSQL Container:**
```bash
docker run --name spearwin-postgres \
  -e POSTGRES_DB=spearwin_db \
  -e POSTGRES_USER=spearwin_user \
  -e POSTGRES_PASSWORD=spearwin_password \
  -p 5432:5432 \
  -d postgres:16
```

## 🔧 **After Database Setup:**

1. **Generate Prisma Client:**
```bash
npx prisma generate
```

2. **Push Database Schema:**
```bash
npx prisma db push
```

3. **Start Application:**
```bash
npm run start:dev
```

## 📋 **Quick Test Commands:**

```bash
# Test database connection
npx prisma db pull

# View database schema
npx prisma studio
```

## 🎯 **Recommended Next Steps:**
1. Choose one of the cloud database options (easiest)
2. Update your `.env` file with the new DATABASE_URL
3. Run `npx prisma generate && npx prisma db push`
4. Start your application with `npm run start:dev`
