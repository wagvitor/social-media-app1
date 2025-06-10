# Local Deployment Guide

## Quick Start

To deploy this social media automation platform on your local machine:

1. **Download or clone the project** to your local machine
2. **Run the deployment script**: `./deploy-local.sh`
3. **Start the application**: `npm run dev`
4. **Access at**: `http://localhost:5000`

## Manual Setup

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database

### Step-by-Step Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 3. Set up database
npm run db:push
npx tsx scripts/seed-database.ts

# 4. Start the application
npm run dev
```

## Database Setup Options

### Option A: Local PostgreSQL
```bash
# Install PostgreSQL and create database
createdb social_media_db

# Update .env file
DATABASE_URL=postgresql://username:password@localhost:5432/social_media_db
```

### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL container
docker run --name postgres-social \
  -e POSTGRES_DB=social_media_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update .env file
DATABASE_URL=postgresql://admin:password@localhost:5432/social_media_db
```

## Default Login Credentials

After running the seed script, use these accounts:

- **Admin User**: sarah.chen
- **Editor User**: mike.rodriguez  
- **Member User**: emma.johnson

## Available Commands

- `npm run dev` - Development mode with hot reload
- `npm run build` - Build for production
- `npm run start` - Production mode
- `npm run db:studio` - Database management interface

## Security Notes

- This application runs locally on your machine only
- By default, it's accessible only at `localhost:5000`
- No external internet access unless you configure port forwarding
- All data is stored locally in your PostgreSQL database

## Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists

**Port Conflicts:**
- Change PORT in .env file to use different port
- Default is 5000

**Permission Issues:**
- Make deploy script executable: `chmod +x deploy-local.sh`

## Features Included

- Multi-language interface (English, Spanish, French, German, Japanese, Portuguese)
- Social media platform integration (Twitter, Facebook, LinkedIn, Instagram, TikTok, Pinterest)
- Content scheduling and management
- Team collaboration tools
- Analytics dashboard
- Template library
- Persistent data storage