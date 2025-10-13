# Database Setup Instructions

## Option 1: Local PostgreSQL Setup

### 1. Install PostgreSQL (if not already installed)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start PostgreSQL service
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Create database and user
```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:
```sql
CREATE DATABASE spearwin_db;
CREATE USER spearwin_user WITH PASSWORD 'spearwin_password';
GRANT ALL PRIVILEGES ON DATABASE spearwin_db TO spearwin_user;
\q
```

### 4. Update .env file
Update your `.env` file with:
```
DATABASE_URL="postgresql://spearwin_user:spearwin_password@localhost:5432/spearwin_db?schema=public"
```

## Option 2: Docker PostgreSQL Setup

### 1. Run PostgreSQL in Docker
```bash
docker run --name spearwin-postgres \
  -e POSTGRES_DB=spearwin_db \
  -e POSTGRES_USER=spearwin_user \
  -e POSTGRES_PASSWORD=spearwin_password \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Update .env file
```
DATABASE_URL="postgresql://spearwin_user:spearwin_password@localhost:5432/spearwin_db?schema=public"
```

## Option 3: Cloud Database (Recommended for Production)

### Use services like:
- **Supabase** (Free tier available)
- **Railway** (Free tier available)
- **Neon** (Free tier available)
- **AWS RDS**
- **Google Cloud SQL**

Update your `.env` file with the provided connection string.

## After Database Setup

1. Generate Prisma client:
```bash
npx prisma generate
```

2. Push database schema:
```bash
npx prisma db push
```

3. (Optional) Seed the database:
```bash
npx prisma db seed
```

4. Start the application:
```bash
npm run start:dev
```
