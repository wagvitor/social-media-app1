#!/bin/bash

# Social Media Automation Platform - Local Deployment Script
# This script helps you deploy the application on your local machine

echo "🚀 Starting local deployment setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. You'll need to install PostgreSQL or use Docker."
    echo "   Option 1: Install PostgreSQL locally"
    echo "   Option 2: Use Docker: docker run --name postgres-social -e POSTGRES_DB=social_media_db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Please edit the .env file with your database credentials before continuing."
    echo "   Default PostgreSQL connection: postgresql://admin:password@localhost:5432/social_media_db"
    read -p "Press Enter when you've configured your .env file..."
fi

# Push database schema
echo "🗄️  Setting up database schema..."
npm run db:push

# Seed database with sample data
echo "🌱 Seeding database with sample data..."
npx tsx scripts/seed-database.ts

# Build the application
echo "🔨 Building application..."
npm run build

echo ""
echo "✅ Local deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Development mode: npm run dev"
echo "   2. Production mode: npm run start"
echo "   3. Access your app at: http://localhost:5000"
echo ""
echo "👥 Default users after seeding:"
echo "   - Admin: sarah.chen"
echo "   - Editor: mike.rodriguez" 
echo "   - Viewer: emma.johnson"
echo ""
echo "🔧 Additional commands:"
echo "   - Database GUI: npm run db:studio"
echo "   - Re-seed data: npx tsx scripts/seed-database.ts"
echo ""
echo "🔒 This application runs locally only and is not accessible from the internet."